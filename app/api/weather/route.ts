import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const nx = searchParams.get("nx") || "60";
    const ny = searchParams.get("ny") || "127";

    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const targetDate = dateParam
        ? dateParam.replace(/-/g, "")
        : new Date().toISOString().split("T")[0].replace(/-/g, "");
    
    const apiKey = process.env.KMA_API_KEY;

    // 1. API 키가 설정되지 않은 경우 안전하게 기본값 반환
    if (!apiKey) {
        console.warn("KMA_API_KEY 환경 변수가 없습니다. 기본 날씨 데이터를 반환합니다.");
        return NextResponse.json({
            weatherCondition: "맑음",
            tempMax: 25,
            tempMin: 15,
            tempAvg: 20,
        });
    }

    try {
        // 기상청 단기예보 조회서비스 (02시 발표 기준 데이터에 일 최고/최저 기온이 포함됨)
        const baseDate = targetDate;
        const baseTime = "0200";

        const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=300&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`기상청 API 서버 응답 실패: ${response.statusText}`);
        }

        const data = await response.json();
        const resultCode = data?.response?.header?.resultCode;

        if (resultCode !== "00") {
            throw new Error(`기상청 API 오류 코드: ${resultCode} - ${data?.response?.header?.msg}`);
        }

        const items = data?.response?.body?.items?.item;
        if (!items || !Array.isArray(items)) {
            throw new Error("기상청 예보 데이터가 존재하지 않습니다.");
        }

        let tempMax = 25;
        let tempMin = 15;
        let skyStatus = "맑음";

        // 데이터 순회하며 최고기온(TMX), 최저기온(TMN), 하늘상태(SKY) 추출
        items.forEach((item: any) => {
            if (item.category === "TMX") {
                tempMax = parseFloat(item.fcstValue);
            }
            if (item.category === "TMN") {
                tempMin = parseFloat(item.fcstValue);
            }
            // SKY: 1(맑음), 3(구름많음), 4(흐림)
            if (item.category === "SKY") {
                if (item.fcstValue === "3") skyStatus = "구름많음";
                else if (item.fcstValue === "4") skyStatus = "흐림";
            }
        });

        const tempAvg = Number(((tempMax + tempMin) / 2).toFixed(1));

        return NextResponse.json({
            weatherCondition: skyStatus,
            tempMax,
            tempMin,
            tempAvg,
        });
    } catch (error) {
        console.error("기상청 API 연동 오류:", error);

        // API 호출 실패 시 화면이 깨지지 않도록 기본값 반환
        return NextResponse.json({
            weatherCondition: "맑음",
            tempMax: 25,
            tempMin: 15,
            tempAvg: 20,
        });
    }
}