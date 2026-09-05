// services/farmService.ts

export interface FarmSavePayload {
  // 농장 기본 정보
  location_str: string; // 예: "전라남도 화순군"
  area_pyeong: number; // 면적 (평)
  crop_name: string; // 작물 종류 (예: "고추")
  status_type: "growing" | "planned";
  plant_date?: string; // 식재일

  // 적산온도 계산 및 DB 저장용 날씨 데이터
  weather_data: {
    temp: number; // 현재/일평균 기온 (°C)
    humidity: number; // 습도 (%)
    rain: number; // 강수량 (mm)
    solHours: number; // 일조시간
  };
}

export interface FarmSaveResponse {
  success: boolean;
  farm_id: number;
  message: string;
}

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * 농장 정보 및 날씨 데이터를 DB에 저장하는 API 요청 함수
 */
export async function saveFarmToDB(payload: FarmSavePayload): Promise<FarmSaveResponse> {
  // const response = await fetch(`${API_BASE_URL}/api/farms`, {
  const response = await fetch("/api/farms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    // 백엔드에서 보낸 에러 상세 메시지 받아오기
    const errorDetail = await response.json().catch(() => null);
    console.error("❌ 백엔드 DB 저장 실패 상세 원인:", errorDetail);

    throw new Error(errorDetail?.message || `DB 저장 요청에 실패했습니다. (${response.status})`);
  }

  return response.json();
}
