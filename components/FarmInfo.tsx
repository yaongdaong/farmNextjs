"use client";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { saveFarmToDB, FarmSavePayload } from "@/app/services/farmService";

// 전국 시·도 및 시·구·군 데이터 정의
const LOCATION_DATA: Record<string, string[]> = {
  서울특별시: ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  부산광역시: ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
  대구광역시: ["군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  인천광역시: ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
  광주광역시: ["광산구", "남구", "동구", "북구", "서구"],
  대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
  울산광역시: ["남구", "동구", "북구", "울주군", "중구"],
  세종특별자치시: ["세종시"],
  경기도: ["가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"],
  강원특별자치도: ["강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군"],
  충청북도: ["괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군", "청주시", "충주시"],
  충청남도: ["계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서천군", "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군"],
  전북특별자치도: ["고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군"],
  전라남도: ["강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
  경상북도: ["경산시", "경주시", "고령군", "구미시", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시"],
  경상남도: ["거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군"],
  제주특별자치도: ["서귀포시", "제주시"],
};

interface WeatherInfo {
  temp: number;
  humidity: number;
  rain: number;
  sky: string;
  solHours: number;
}

export interface CropItem {
  id: string;
  statusType: "growing" | "planned";
  name: string;
  area: string;
  plantDate: string;
  bloomDate: string;
  targetGdd?: number; // 목표 적산온도 (예: 1200)
  baseTemp?: number; // 발육 생육 기준온도 (예: 10.0)
  analysisResult?: string;
}

// FarmInfo 컴포넌트가 전달받을 Props 타입 정의
interface FarmInfoProps {
  totalArea: string;
  setTotalArea: Dispatch<SetStateAction<string>>;
  cropList: CropItem[];
  setCropList: Dispatch<SetStateAction<CropItem[]>>;
}

// 작물별 표준 매핑 데이터
export const CROP_GDD_DATABASE: Record<string, { baseTemp: number; targetGdd: number }> = {
  // 식량 작물
  벼: { baseTemp: 10.0, targetGdd: 2200 },
  옥수수: { baseTemp: 10.0, targetGdd: 1400 },
  감자: { baseTemp: 7.0, targetGdd: 1000 },
  고구마: { baseTemp: 15.0, targetGdd: 1800 },
  콩: { baseTemp: 10.0, targetGdd: 1300 },

  // 채소류 (과채류 / 엽채류)
  토마토: { baseTemp: 10.0, targetGdd: 1200 },
  고추: { baseTemp: 10.0, targetGdd: 1350 },
  딸기: { baseTemp: 5.0, targetGdd: 900 },
  오이: { baseTemp: 12.0, targetGdd: 1100 },
  상추: { baseTemp: 4.0, targetGdd: 600 },
  배추: { baseTemp: 5.0, targetGdd: 800 },
  양파: { baseTemp: 4.0, targetGdd: 1000 },
  마늘: { baseTemp: 4.0, targetGdd: 1100 },

  // 과수류
  사과: { baseTemp: 7.0, targetGdd: 1500 },
  배: { baseTemp: 7.0, targetGdd: 1600 },
  복숭아: { baseTemp: 8.0, targetGdd: 1400 },
  포도: { baseTemp: 10.0, targetGdd: 1600 },
};

export default function FarmInfo({ totalArea, setTotalArea, cropList, setCropList }: FarmInfoProps) {
  // 위치 및 기상 관련 상태
  const [sido, setSido] = useState("전라남도");
  const [sigungu, setSigungu] = useState("화순군");
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // 버튼 처리 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fullAddress = sigungu ? `${sido} ${sigungu}` : sido;

  // 위치 선택 시 자동 실시간 조회
  useEffect(() => {
    const fetchWeather = async () => {
      // 시/도나 시군구가 설정되지 않았으면 조회 안 함
      if (!sido || !sigungu) return;

      const locationStr = `${sido} ${sigungu}`;
      setIsWeatherLoading(true);

      try {
        const response = await fetch("http://localhost:8000/api/weather", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ location_str: locationStr }),
        });

        if (response.ok) {
          const data: WeatherInfo = await response.json();
          setWeatherInfo(data); // ✅ 단일 WeatherInfo 객체 저장
        }
      } catch (error) {
        console.error("날씨 데이터 로드 실패:", error);
      } finally {
        setIsWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [sido, sigungu]); // 👈 sido, sigungu가 변경될 때마다 자동 호출

  // 시/도 변경 핸들러
  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSido(e.target.value);
    setSigungu(""); // 시/도가 바뀌면 시구군은 빈칸("")으로 초기화
  };

  const handleAddCrop = () => {
    setCropList((prev) => [...prev, { id: `crop-${Date.now().toString()}`, statusType: "growing", name: "", area: "", plantDate: "", bloomDate: "", analysisResult: "" }]);
  };

  const handleRemoveCrop = (id: string) => {
    if (cropList.length === 1) {
      alert("최소 한 개의 작물 정보는 입력해야 합니다.");
      return;
    }
    setCropList((prev) => prev.filter((crop) => crop.id !== id));
  };

  const handleCropChange = <K extends keyof CropItem>(id: string, field: K, value: CropItem[K]) => {
    setCropList((prev) =>
      prev.map((crop) => {
        if (crop.id !== id) return crop;

        // 작물 이름(name)이 변경되었을 때 DB 사전 정보 매핑
        if (field === "name" && typeof value === "string") {
          const matched = CROP_GDD_DATABASE[value.trim()];
          return {
            ...crop,
            name: value,
            baseTemp: matched ? matched.baseTemp : (crop.baseTemp ?? 10.0), // 매칭 실패 시 기존값/기본값 사용
            targetGdd: matched ? matched.targetGdd : (crop.targetGdd ?? 1200.0),
          };
        }
        return { ...crop, [field]: value };
      }),
    );
  };

  // 식재 예정 시 빅데이터 기반 작물별 최적 식재 면적 추천 핸들러
  const handleRecommendArea = (id: string, cropName: string) => {
    if (!cropName) {
      alert("작물명을 먼저 입력해주세요. (예: 완숙 토마토)");
      return;
    }

    const total = parseFloat(totalArea) || 0;
    const otherAllocated = cropList.filter((crop) => crop.id !== id).reduce((sum, crop) => sum + (parseFloat(crop.area) || 0), 0);
    const remaining = total - otherAllocated;

    if (remaining <= 0) {
      alert("남은 밭 면적이 없습니다.");
      return;
    }

    // 빅데이터 모의 분석 연산 (전체 면적의 30% 수준 권장)
    const recommendedPercent = 30;
    const recommendedPyung = Math.min(Math.round(total * (recommendedPercent / 100)), remaining);

    const mockReport = `📊 [농림축산식품부/KAMIS 빅데이터 리포트]
• 분석 대상: ${sido} ${sigungu} 인근 ${cropName} 재배 동향
• 관측 결과: 올해 해당 지역 ${cropName} 식재 의향 면적이 전년 대비 15% 증가하여 출하 시기 도매가 하락 위험이 있습니다.
💡 [최적 면적 추천]: 밭 전체 면적(${total}평)의 ${recommendedPercent}%인 [${recommendedPyung}평]만 심고, 나머지 면적은 대체 작물로 분산 식재하는 것을 권장합니다.`;

    setCropList((prev) => prev.map((c) => (c.id === id ? { ...c, area: String(recommendedPyung), analysisResult: mockReport } : c)));
  };

  const allocatedArea = (cropList ?? []).reduce((sum, c) => sum + (parseFloat(c.area) || 0), 0);

  // 예측 리포트 출력 함수
  const handleAnalyzeAll = async () => {
    console.log("🚀 분석 버튼 클릭됨!");
    if (!sido || !sigungu) {
      alert("⚠️ 농장 재배 위치(시/도 및 시/구/군)를 모두 선택해 주세요.");
      return;
    }
    setIsAnalyzing(true);

    try {
      let latestWeather: WeatherInfo | null = null;
      const targetLocation = fullAddress || `${sido} ${sigungu}`;

      const updatedList = await Promise.all(
        cropList.map(async (crop) => {
          if (!crop.name) {
            return { ...crop, analysisResult: "⚠️ 작물 이름을 입력해 주세요." };
          }

          console.log(`🌐 FastAPI 통신 시도... (위치: ${targetLocation})`);
          // 2. Python FastAPI 호출
          const response = await fetch("http://localhost:8000/api/analyze-crop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              crop_name: crop.name,
              area_pyeong: parseFloat(crop.area || "0"),
              status_type: crop.statusType,
              plant_date: crop.plantDate || new Date().toISOString().split("T")[0],
              // location_str: fullAddress || `${sido} ${sigungu}`,
              location_str: targetLocation,
              target_gdd: Number(crop.targetGdd) || 1200.0,
              base_temp: Number(crop.baseTemp) || 10.0,
              recent_weather: [],
            }),
          });

          console.log(`📡 응답 상태 코드: ${response.status}`);
          // FarmInfo.tsx (수정 예시)
          if (!response.ok) {
            const errorText = await response.text();
            console.error("서버 에러 상태 코드:", response.status);
            console.error("서버 에러 본문:", errorText);
            throw new Error(`분석 서버 응답 에러 (${response.status}): ${errorText}`);
          }
          const data = await response.json();

          // 브라우저 콘솔에서 실제 날씨 응답 객체 구조 확인용
          console.log("✅ 백엔드 응답 데이터 성공적으로 수신:", data);

          // 가장 최근 응답받은 날씨 객체를 임시 저장
          if (data.weather) {
            latestWeather = data.weather;
          }
          // 3. 백엔드에서 계산해 준 정확한 수량 및 적산온도 리포트 적용
          return {
            ...crop,
            analysisResult: data.analysis_report,
          };
        }),
      );
      // 백엔드 기상청 API에서 받아온 실제 날씨 데이터를 상단 UI state에 반영
      if (latestWeather) {
        const w = latestWeather as WeatherInfo;
        console.log("☀️ 최종 날씨 정보로 UI 업데이트:", latestWeather);
        setWeatherInfo({
          temp: w.temp ?? 0,
          humidity: w.humidity ?? 65,
          rain: w.rain ?? 0,
          sky: w.sky || "맑음",
          solHours: w.solHours ?? 8.0,
        });
      } else {
        console.warn("⚠️ 백엔드 응답에 weather 객체가 없습니다.");
      }

      setCropList(updatedList);
    } catch (error) {
      console.error("💥 API 연동 예외 발생:", error);
      alert("분석 서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // DB 저장 처리 함수
  const handleSaveToDB = async () => {
    if (!sido || !sigungu) {
      alert("⚠️ 농장 재배 위치를 선택해 주세요.");
      return;
    }

    const primaryCrop = cropList[0];
    if (!primaryCrop || !primaryCrop.name) {
      alert("⚠️ 최소 한 개 이상의 작물 이름을 입력해야 DB 저장이 가능합니다.");
      return;
    }

    setIsSaving(true);

    const payload: FarmSavePayload = {
      location_str: fullAddress,
      area_pyeong: Number(primaryCrop.area) || Number(totalArea) || 0,
      crop_name: primaryCrop.name,
      status_type: primaryCrop.statusType,
      plant_date: primaryCrop.plantDate || new Date().toISOString().split("T")[0],
      weather_data: {
        temp: weatherInfo?.temp ?? 24.5,
        humidity: weatherInfo?.humidity ?? 68,
        rain: weatherInfo?.rain ?? 0.0,
        solHours: weatherInfo?.solHours ?? 8.5,
      },
    };

    try {
      const result = await saveFarmToDB(payload);
      alert(`성공적으로 DB에 저장되었습니다! (농장 ID: ${result.farm_id})`);
    } catch (error) {
      console.error("DB 저장 오류:", error);
      alert("DB 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-sans">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">🏡 나의 농장 정보 설정</h2>

      {/* 1. 기본 위치 및 날씨 블록 */}
      <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="block text-xs font-bold text-slate-500 mb-2">📍 농장 재배 위치 및 실시간 기상</label>

        <div className="flex gap-2 mb-3">
          <select value={sido} onChange={handleSidoChange} className="flex-1 p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-emerald-500 focus:outline-none">
            <option value="">-- 시/도 선택 --</option>
            {Object.keys(LOCATION_DATA).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select value={sigungu} onChange={(e) => setSigungu(e.target.value)} disabled={!sido} className="flex-1 p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400">
            <option value="">-- 시/구/군 선택 --</option>
            {sido &&
              LOCATION_DATA[sido]?.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
        </div>

        {sido && sigungu ? (
          <div className="text-xs text-slate-600 leading-relaxed">
            {/* 위치 및 날씨 정보 표시 영역 */}
            {isWeatherLoading ? (
              <p>⏳ 실시간 기상 정보를 불러오는 중입니다...</p>
            ) : weatherInfo ? (
              <p>
                ☀️ <span className="font-semibold text-emerald-600">{sigungu}</span>의 현재 기온은
                <span className="font-bold text-slate-700"> {weatherInfo.temp}°C</span>, 습도는
                <span className="font-bold text-slate-700"> {weatherInfo.humidity}%</span>, 강수량은
                <span className="font-bold text-slate-700"> {weatherInfo.rain}mm</span>입니다. 현재 하늘은 <span className="font-bold text-emerald-600">{weatherInfo.sky}</span> 상태입니다.
              </p>
            ) : (
              <p>위치를 선택하면 실시간 기상 정보가 출력됩니다.</p>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">💡 농장의 재배 위치를 상단에서 선택해 주세요.</div>
        )}
      </div>

      {/* 2. 총 밭 면적 설정 */}
      <div className="mb-6 grid grid-cols-2 gap-4 items-center bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/40">
        <div>
          <label className="block text-xs font-bold text-emerald-800 mb-1">📐 총 밭 면적</label>
          <div className="relative">
            <input type="number" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-emerald-500" />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400">평</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">📊 현재 작물 할당량</label>
          <div className="text-xs text-slate-600">
            <span className={`font-bold ${allocatedArea > parseFloat(totalArea) ? "text-red-500" : "text-slate-700"}`}>{allocatedArea}평</span> / {totalArea}평 입력됨
          </div>
        </div>
      </div>

      {/* 3. 동적 작물 추가 리스트 영역 */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-slate-700">🌾 재배 작물 상세 등록</label>
          <button type="button" onClick={handleAddCrop} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all">
            ➕ 작물 추가
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(cropList || []).map((crop, index) => {
            return (
              <div key={crop.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm">
                <button type="button" onClick={() => handleRemoveCrop(crop.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs">
                  ❌ 삭제
                </button>

                <div className="text-xs font-bold text-emerald-600 mb-3"># 작물 {index + 1}</div>

                {/* 라디오 버튼 */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input type="radio" name={`statusType-${crop.id}`} checked={crop.statusType === "growing"} onChange={() => handleCropChange(crop.id, "statusType", "growing")} className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                    🌱 식재 중
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input type="radio" name={`statusType-${crop.id}`} checked={crop.statusType === "planned"} onChange={() => handleCropChange(crop.id, "statusType", "planned")} className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                    📅 식재 예정
                  </label>
                </div>

                {/* 입력 인풋 그리드 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">작물명</label>
                    <input type="text" placeholder="예: 완숙 토마토" value={crop.name} onChange={(e) => handleCropChange(crop.id, "name", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">{crop.statusType === "growing" ? "심은 면적 (평)" : "심을 면적 (평)"}</label>
                    <div className="flex gap-1 items-start">
                      <input type="number" placeholder="면적 입력" value={crop.area} onChange={(e) => handleCropChange(crop.id, "area", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-emerald-500" />
                      {crop.statusType === "planned" && (
                        <button type="button" onClick={() => handleRecommendArea(crop.id, crop.name)} className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[10px] whitespace-nowrap h-[34px] transition-all">
                          💡 추천
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 식재 중일 때 생장 단계 및 병해충 예찰 알림 카드 */}
                {crop.statusType === "growing" && (
                  <div className="mt-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">📅 식재 시기 (밭에 심은 날짜)</label>
                      <input
                        type="date"
                        value={crop.plantDate}
                        onChange={(e) => {
                          const newPlantDate = e.target.value;
                          // 식재 시기가 기존 개화 시기보다 늦어지면 개화 시기를 초기화
                          if (crop.bloomDate && crop.bloomDate !== "unknown" && newPlantDate > crop.bloomDate) {
                            alert("식재 시기는 개화 시기보다 늦을 수 없습니다. 개화 시기를 다시 설정해 주세요.");
                            handleCropChange(crop.id, "bloomDate", "");
                          }
                          handleCropChange(crop.id, "plantDate", newPlantDate);
                        }}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-medium text-slate-600">🌸 개화 시기 (꽃이 핀 날짜)</label>
                        <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer select-none">
                          <input type="checkbox" checked={crop.bloomDate === "unknown"} onChange={(e) => handleCropChange(crop.id, "bloomDate", e.target.checked ? "unknown" : "")} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3 h-3" />
                          아직 안 핌 / 모름
                        </label>
                      </div>
                      <input
                        type="date"
                        value={crop.bloomDate === "unknown" ? "" : crop.bloomDate}
                        disabled={crop.bloomDate === "unknown" || !crop.plantDate}
                        min={crop.plantDate} // 식재 시기 이전 날짜는 달력에서 선택 불가능하도록 제한
                        onChange={(e) => {
                          const selectedBloomDate = e.target.value;
                          if (crop.plantDate && selectedBloomDate < crop.plantDate) {
                            alert("개화 시기는 식재 시기보다 빠를 수 없습니다.");
                            return;
                          }
                          handleCropChange(crop.id, "bloomDate", selectedBloomDate);
                        }}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                      />
                      {!crop.plantDate && <span className="text-[10px] text-slate-400 mt-1 block mt-1 block">* 식재 시기를 먼저 입력해야 개화 시기를 선택할 수 있습니다.</span>}
                    </div>

                    {/* 영농 일지 기반 병해충 예찰 및 방제 알림 */}
                    {(crop.plantDate || crop.bloomDate) && (weatherInfo?.humidity ?? 0) >= 80 && (
                      <div className="mt-1 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900 leading-relaxed">
                        <div className="font-bold flex items-center gap-1 text-rose-700 mb-0.5">⚠️ 병해충 실시간 예찰: [역병 발생 경고]</div>
                        현재 <span className="font-semibold">{crop.name || "작물"}</span>이(가) 주요 생육 단계에 진입했으며, 실시간 습도({weatherInfo?.humidity}%)가 높아 **곰팡이성 역병** 위험도가 {"'경고'"} 단계입니다. 영농 일지 작성 시 예방적 방제 일정을 등록하세요!
                      </div>
                    )}
                  </div>
                )}

                {/* 빅데이터 최적 면적 추천 결과 리포트 출력 창 */}
                {crop.analysisResult && <div className="mt-3 p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] leading-relaxed font-mono whitespace-pre-wrap border border-slate-800">{crop.analysisResult}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 액션 버튼 (분석 및 DB 저장) */}
      <div className="flex flex-col gap-2">
        <button type="button" onClick={handleAnalyzeAll} disabled={isAnalyzing} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-medium rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2">
          {isAnalyzing ? (
            <>
              <span className="animate-spin">🔄</span> 전 품목 기후 데이터 병렬 분석 중...
            </>
          ) : (
            "🎯 등록된 모든 작물 예측 리포트 출력"
          )}
        </button>

        <button type="button" onClick={handleSaveToDB} disabled={isSaving} className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-medium rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2">
          {isSaving ? "⏳ DB 저장 중..." : "💾 농장 및 기상 데이터 DB 저장"}
        </button>
      </div>
    </div>
  );
}
