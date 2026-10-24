"use client";

import React, { useState, useEffect, useCallback } from "react";
import FarmCropTable from "@/components/FarmCropTable";
import { FarmCropItem } from "@/types/farm";
import { Sprout, MapPin, Calendar, Thermometer, Clock, BookOpen, Plus, Sparkles, TrendingUp, TrendingDown, Wallet, CheckCircle2, CloudSun, Droplets, Sun, Trash2, Save } from "lucide-react";
import { saveFarmToDB, FarmSavePayload } from "@/app/services/farmService";

// ==========================================
// 1. 상수 및 전국 시·도 데이터
// ==========================================
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

export const CROP_GDD_DATABASE: Record<string, { baseTemp: number; targetGdd: number }> = {
  벼: { baseTemp: 10.0, targetGdd: 2200 },
  옥수수: { baseTemp: 10.0, targetGdd: 1400 },
  감자: { baseTemp: 7.0, targetGdd: 1000 },
  고구마: { baseTemp: 15.0, targetGdd: 1800 },
  콩: { baseTemp: 10.0, targetGdd: 1300 },
  토마토: { baseTemp: 10.0, targetGdd: 1200 },
  고추: { baseTemp: 10.0, targetGdd: 1350 },
  딸기: { baseTemp: 5.0, targetGdd: 900 },
  오이: { baseTemp: 12.0, targetGdd: 1100 },
  상추: { baseTemp: 4.0, targetGdd: 600 },
  배추: { baseTemp: 5.0, targetGdd: 800 },
  양파: { baseTemp: 4.0, targetGdd: 1000 },
  마늘: { baseTemp: 4.0, targetGdd: 1100 },
  사과: { baseTemp: 7.0, targetGdd: 1500 },
  배: { baseTemp: 7.0, targetGdd: 1600 },
  복숭아: { baseTemp: 8.0, targetGdd: 1400 },
  포도: { baseTemp: 10.0, targetGdd: 1600 },
};

// ==========================================
// 2. 타입 정의
// ==========================================
type TabType = "DASHBOARD" | "DIARY";

export interface FertilizerSchedule {
  stage: string;
  date: string;
  type: string;
  amount: string;
  fertilizer_name?: string;
}

export interface AIReport {
  cropName: string;
  category: string;
  accuracy: number;
  accumulatedTemp: number;
  targetTemp: number;
  environmentCorrection: string;
  expectedHarvestDate: string;
  daysRemaining: number;
  shippingBuffer: string;
  expectedYield: number;
  fertilizerSchedule: FertilizerSchedule[];
}

export interface WeatherInfo {
  temp: number;
  humidity: number;
  rain: number;
  sky: string;
  solHours: number;
}

export interface ExtendedCropItem {
  id: string;
  statusType: "GROWING" | "PLANNED" | "growing" | "planned";
  name: string;
  area: string;
  plantDate: string;
  bloomDate?: string;
  facilityType?: string;
  location?: string;
  growthStage?: string;
  accumulatedTempText?: string;
  expectedHarvestText?: string;
  targetGdd?: number;
  baseTemp?: number;
  analysisResult?: string;
  aiReport?: AIReport;
}
// 백엔드 API 응답 객체 타입 정의 (any 대체)
interface BackendFarmResponse {
  id?: string;
  cropName?: string;
  name?: string;
  location?: string;
  areaSize?: number;
  area?: number;
  growthStatus?: string;
  growthStage?: string;
  plantDate?: string;
  bloomDate?: string;
  accumulatedTemp?: number;
  accumulated_temp?: number;
  targetTemp?: number;
  targetGdd?: number;
  aiReport?: Record<string, unknown>;
}
export interface DiaryEntry {
  id: string;
  date: string;
  weather: string;
  targetCrop: string;
  solarTermTask: string;
  taskDone: string[];
  expense: number;
  income: number;
}

// ==========================================
// 3. 메인 통합 페이지 컴포넌트
// ==========================================
export default function FarmManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [userName] = useState("홍길동");

  // 농장 위치 및 날씨 상태
  const [sido, setSido] = useState("경상남도");
  const [sigungu, setSigungu] = useState("김해시");
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // 대시보드/농장 데이터 상태
  const [totalArea, setTotalArea] = useState("1000");
  const [cropList, setCropList] = useState<FarmCropItem[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 로딩 및 저장 처리 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fullAddress = sigungu ? `${sido} ${sigungu}` : sido;

  // 손익 계산
  const totalIncome = diaries.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpense = diaries.reduce((sum, item) => sum + (item.expense || 0), 0);
  const netProfit = totalIncome - totalExpense;

  // 1) useCallback으로 fetchIntegratedFarmData 메모이제이션
  // -> 이렇게 작성하면 컴포넌트 내 다른 이벤트(라인 431 등)에서도 호출 가능하며 무한 루프가 발생하지 않습니다.
  const fetchIntegratedFarmData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/farm-list");

if (response.ok) {
  const dbData = await response.json();
  if (dbData && dbData.length > 0) {
    // DB 응답 데이터를 FarmCropItem 형식에 맞게 바인딩
    const formattedData: FarmCropItem[] = dbData.map((item: BackendFarmResponse) => ({
      id: item.id || `farm-${Math.random()}`,
      cropName: item.cropName || item.name || "미지정 작물",
      location: item.location || "위치 정보 없음",
      areaSize: item.areaSize || item.area || 0,
      growthStatus: item.growthStatus || item.growthStage || "일지 미작성",
      plantDate: item.plantDate || "-",
      bloomDate: item.bloomDate || "-",
      accumulatedTemp: item.accumulatedTemp ?? item.accumulated_temp ?? 0,
      targetTemp: item.targetTemp ?? item.targetGdd ?? 1000,
    }));

    setCropList(formattedData);
    return;
  }
}

      // DB에 데이터가 없을 경우 더미데이터 fallback
      setCropList([
        {
          id: "f1",
          name: "딸기",
          area: "800",
          facilityType: "연동형 하우스 / 수경재배",
          location: "제1하우스 (김해)",
          plantDate: "2026-08-15",
          statusType: "GROWING",
          growthStage: "생육 2단계 (영양생장)",
          accumulatedTempText: "420.5℃ / 1200.0℃",
          expectedHarvestText: "11/20 (D-57) / 약 4,500kg",
          baseTemp: 5.0,
          targetGdd: 900,
          aiReport: {
            cropName: "딸기(설향)",
            category: "과채류",
            accuracy: 94.2,
            accumulatedTemp: 420.5,
            targetTemp: 1200,
            environmentCorrection: "야간 보온 단열재 차단율 +15% 권장",
            expectedHarvestDate: "2026-11-20",
            daysRemaining: 57,
            shippingBuffer: "11/18 ~ 11/22 내 출하 추천",
            expectedYield: 4500,
            fertilizerSchedule: [
              { stage: "영양생장기", date: "2026-10-01", type: "질소/가리 위주 관주", amount: "동당 0.5kg" },
              { stage: "개화/개과기", date: "2026-10-20", type: "인산/인산칼슘 관주", amount: "동당 0.8kg" },
            ],
          },
        },
      ]);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 없음 (초기 1회 생성)

  // 2) 초기 로드 시 실행
  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!ignore) {
        await fetchIntegratedFarmData();
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [fetchIntegratedFarmData]);
  // 2) 위치 선택 변경 시 실시간 날씨 연동
  useEffect(() => {
    const fetchWeather = async () => {
      if (!sido || !sigungu) return;

      const locationStr = `${sido} ${sigungu}`;
      setIsWeatherLoading(true);

      try {
        const response = await fetch("http://localhost:8000/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location_str: locationStr }),
        });

        if (response.ok) {
          const data: WeatherInfo = await response.json();
          setWeatherInfo(data);
        }
      } catch (error) {
        console.error("날씨 데이터 로드 실패:", error);
      } finally {
        setIsWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [sido, sigungu]);

  // 작물 관리 핸들러
  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSido(e.target.value);
    setSigungu("");
  };

  const handleAddCrop = () => {
    setCropList((prev) => [
      ...prev,
      {
        id: `crop-${Date.now().toString()}`,
        statusType: "GROWING",
        name: "",
        area: "",
        plantDate: new Date().toISOString().split("T")[0],
        analysisResult: "",
      },
    ]);
  };

  const handleRemoveCrop = (id: string) => {
    if (cropList.length === 1) {
      alert("최소 한 개의 작물 정보는 입력해야 합니다.");
      return;
    }
    setCropList((prev) => prev.filter((crop) => crop.id !== id));
  };

  const handleCropChange = <K extends keyof ExtendedCropItem>(id: string, field: K, value: ExtendedCropItem[K]) => {
    setCropList((prev) =>
      prev.map((crop) => {
        if (crop.id !== id) return crop;

        if (field === "name" && typeof value === "string") {
          const matched = CROP_GDD_DATABASE[value.trim()];
          return {
            ...crop,
            name: value,
            baseTemp: matched ? matched.baseTemp : (crop.baseTemp ?? 10.0),
            targetGdd: matched ? matched.targetGdd : (crop.targetGdd ?? 1200.0),
          };
        }
        return { ...crop, [field]: value };
      }),
    );
  };

  // 적정 면적 추천 핸들러
  const handleRecommendArea = (id: string, cropName: string) => {
    if (!cropName) {
      alert("작물명을 먼저 입력해주세요. (예: 토마토)");
      return;
    }

    const total = parseFloat(totalArea) || 0;
    const otherAllocated = cropList.filter((crop) => crop.id !== id).reduce((sum, crop) => sum + (parseFloat(crop.area) || 0), 0);
    const remaining = total - otherAllocated;

    if (remaining <= 0) {
      alert("남은 밭 면적이 없습니다.");
      return;
    }

    const recommendedPercent = 30;
    const recommendedPyung = Math.min(Math.round(total * (recommendedPercent / 100)), remaining);

    const mockReport = `📊 [빅데이터 분석 리포트]\n• ${sido} ${sigungu} 인근 ${cropName} 재배 추천 면적: 전체의 ${recommendedPercent}% 수준 (${recommendedPyung}평)`;

    setCropList((prev) => prev.map((c) => (c.id === id ? { ...c, area: String(recommendedPyung), analysisResult: mockReport } : c)));
  };

  // AI 분석 및 날씨 갱신
  const handleAnalyzeAll = async () => {
    if (!sido || !sigungu) {
      alert("⚠️ 농장 재배 위치(시/도 및 시/구/군)를 선택해 주세요.");
      return;
    }
    setIsAnalyzing(true);

    try {
      let latestWeather: WeatherInfo | null = null;
      const targetLocation = fullAddress;

      const updatedList = await Promise.all(
        cropList.map(async (crop) => {
          if (!crop.name) {
            return { ...crop, analysisResult: "⚠️ 작물 이름을 입력해 주세요." };
          }

          const response = await fetch("http://localhost:8000/api/analyze-crop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              crop_name: crop.name,
              area_pyeong: parseFloat(crop.area || "0"),
              status_type: crop.statusType.toLowerCase(),
              plant_date: crop.plantDate || new Date().toISOString().split("T")[0],
              location_str: targetLocation,
              target_gdd: Number(crop.targetGdd) || 1200.0,
              base_temp: Number(crop.baseTemp) || 10.0,
              recent_weather: [],
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`분석 서버 응답 에러 (${response.status}): ${errorText}`);
          }
          const data = await response.json();

          if (data.weather) {
            latestWeather = data.weather;
          }
          const updatedAiReport = {
            cropName: data.crop_name,
            category: data.crop_category,
            accuracy: data.accuracy_range,
            accumulatedTemp: data.accumulated_gdd,
            targetTemp: data.target_accumulated_temp,
            environmentCorrection: data.analysis_report,
            expectedHarvestDate: data.estimated_harvest_date,
            daysRemaining: 0, // 필요 시 계산 추가
            shippingBuffer: data.harvest_buffer_range,
            expectedYield: data.expected_yield_kg,
            fertilizerSchedule: (data.fertilizer_schedule || []).map((f: FertilizerSchedule) => ({
              stage: f.stage || "생육기",
              date: f.date || "",
              type: f.fertilizer_name || f.type || "관주 비료",
              amount: f.amount || "적정량",
            })),
          };
          return {
            ...crop,
            accumulatedTempText: `${data.accumulated_gdd}℃ / ${data.target_accumulated_temp}℃`,
            expectedHarvestText: `${data.estimated_harvest_date} / 약 ${data.expected_yield_kg}kg`,
            aiReport: updatedAiReport, // 💡 실제 AI 보고서 데이터로 교체!
            analysisResult: data.analysis_report,
          };
        }),
      );

      if (latestWeather) {
        setWeatherInfo(latestWeather);
      }

      setCropList(updatedList);
      alert("AI 생육 분석이 완료되었습니다!");
    } catch (error) {
      console.error("API 연동 예외 발생:", error);
      alert("분석 서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // DB 저장 처리
  const handleSaveToDB = async () => {
    if (!sido || !sigungu) {
      alert("⚠️ 농장 재배 위치를 선택해 주세요.");
      return;
    }

    const primaryCrop = cropList[0];
    if (!primaryCrop || !primaryCrop.name) {
      alert("⚠️️ 최소 한 개 이상의 작물 이름을 입력해야 DB 저장이 가능합니다.");
      return;
    }

    setIsSaving(true);

    const payload: FarmSavePayload = {
      location_str: fullAddress,
      area_pyeong: Number(primaryCrop.area) || Number(totalArea) || 0,
      crop_name: primaryCrop.name,
      status_type: primaryCrop.statusType.toLowerCase() as "growing" | "planned",
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
      await fetchIntegratedFarmData();
    } catch (error) {
      console.error("DB 저장 오류:", error);
      alert("DB 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="font-semibold text-emerald-800">농가 통합 관리 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* 상단 헤더 */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-600 p-2 text-white">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">스마트 영농 통합 관리 시스템</h1>
              <p className="text-xs text-slate-500">{userName} 농가주님의 스마트 맞춤 솔루션</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setActiveTab("DASHBOARD")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "DASHBOARD" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              대시보드 & 농장 설정
            </button>
            <button onClick={() => setActiveTab("DIARY")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "DIARY" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              영농일지 & 경영관리
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* 밭 & 작물 현황 테이블 컴포넌트 연결 */}
        <section>
          <FarmCropTable crops={cropList} isLoading={loading} onRefresh={fetchIntegratedFarmData} />
        </section>
        {/* 위치 & 실시간 날씨 위젯 */}
        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <span>농장 위치 설정 및 기상 현황</span>
            </div>

            <div className="flex items-center gap-3">
              <select value={sido} onChange={handleSidoChange} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {Object.keys(LOCATION_DATA).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select value={sigungu} onChange={(e) => setSigungu(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">시/구/군 선택</option>
                {LOCATION_DATA[sido]?.map((sg) => (
                  <option key={sg} value={sg}>
                    {sg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <Thermometer className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">현재 기온</p>
                <p className="text-lg font-bold text-slate-800">{isWeatherLoading ? "조회중..." : `${weatherInfo?.temp ?? "--"} ℃`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <Droplets className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500">습도 / 강수량</p>
                <p className="text-lg font-bold text-slate-800">{isWeatherLoading ? "조회중..." : `${weatherInfo?.humidity ?? "--"}% / ${weatherInfo?.rain ?? 0}mm`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <Sun className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-xs text-slate-500">일조시간</p>
                <p className="text-lg font-bold text-slate-800">{isWeatherLoading ? "조회중..." : `${weatherInfo?.solHours ?? "--"} 시간`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <CloudSun className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-500">기상 상태</p>
                <p className="text-lg font-bold text-slate-800">{isWeatherLoading ? "조회중..." : weatherInfo?.sky || "맑음"}</p>
              </div>
            </div>
          </div>
        </section>

        {activeTab === "DASHBOARD" ? (
          <div className="space-y-8">
            {/* 농장 및 작물 정보 입력 섹션 */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">농장 기본 정보 & 작물 등록</h2>
                  <p className="text-xs text-slate-500">재배 작물 정보를 입력하여 AI 생육 분석 및 적산온도를 관리하세요.</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleAddCrop} className="flex items-center gap-1 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">
                    <Plus className="h-4 w-4" /> 작물 추가
                  </button>
                  <button onClick={handleAnalyzeAll} disabled={isAnalyzing} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:bg-slate-300">
                    <Sparkles className="h-4 w-4" />
                    {isAnalyzing ? "AI 분석 진행 중..." : "전체 AI 생육 분석"}
                  </button>
                  <button onClick={handleSaveToDB} disabled={isSaving} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-300">
                    <Save className="h-4 w-4" />
                    {isSaving ? "저장 중..." : "DB 저장"}
                  </button>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-slate-50 p-4">
                <label className="mb-1 block text-xs font-bold text-slate-700">전체 농장 면적 (평)</label>
                <input type="number" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} placeholder="예: 1000" className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="space-y-4">
                {cropList.map((crop, idx) => (
                  <div key={crop.id} className="relative rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700">작물 #{idx + 1}</span>
                      <button onClick={() => handleRemoveCrop(crop.id)} className="text-slate-400 hover:text-red-500" title="작물 삭제">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">작물명</label>
                        <input type="text" value={crop.name} onChange={(e) => handleCropChange(crop.id, "name", e.target.value)} placeholder="예: 딸기, 토마토" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white" />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">재배 면적 (평)</label>
                        <div className="flex gap-1">
                          <input type="number" value={crop.area} onChange={(e) => handleCropChange(crop.id, "area", e.target.value)} placeholder="예: 500" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white" />
                          <button onClick={() => handleRecommendArea(crop.id, crop.name)} className="whitespace-nowrap rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
                            추천
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">재배 상태</label>
                        <select value={crop.statusType} onChange={(e) => handleCropChange(crop.id, "statusType", e.target.value as ExtendedCropItem["statusType"])} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white">
                          <option value="GROWING">재배 중</option>
                          <option value="PLANNED">식재 예정</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">정식일 / 예정일</label>
                        <input type="date" value={crop.plantDate} onChange={(e) => handleCropChange(crop.id, "plantDate", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white" />
                      </div>
                    </div>

                    {crop.analysisResult && <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900 whitespace-pre-line border border-emerald-200">{crop.analysisResult}</div>}
                  </div>
                ))}
              </div>
            </section>

            {/* AI 생육 리포트 및 현황 */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {cropList.map(
                (crop) =>
                  crop.aiReport && (
                    <div key={crop.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-emerald-600" />
                          <h3 className="font-bold text-slate-900">{crop.aiReport.cropName} AI 분석 리포트</h3>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">신뢰도 {crop.aiReport.accuracy}%</span>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                          <div>
                            <p className="text-xs text-slate-500">목표 / 누적 적산온도</p>
                            <p className="font-bold text-slate-800">
                              {crop.aiReport.accumulatedTemp}℃ / {crop.aiReport.targetTemp}℃
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">예상 수확일 (D-Day)</p>
                            <p className="font-bold text-emerald-600">
                              {crop.aiReport.expectedHarvestDate} (D-{crop.aiReport.daysRemaining})
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-500">환경 제어 권장사항</p>
                          <p className="text-slate-700">{crop.aiReport.environmentCorrection}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-500">권장 출하 타이밍</p>
                          <p className="text-slate-700">{crop.aiReport.shippingBuffer}</p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold text-slate-500">맞춤 처방 / 시비 일정</p>
                          <div className="space-y-2">
                            {crop.aiReport.fertilizerSchedule.map((f, i) => (
                              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                                <span className="font-medium text-slate-800">
                                  {f.stage} ({f.date})
                                </span>
                                <span className="text-emerald-700 font-semibold">
                                  {f.type} - {f.amount}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
              )}
            </section>
          </div>
        ) : (
          /* 영농일지 & 경영 관리 탭 */
          <div className="space-y-8">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">총 수입</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{totalIncome.toLocaleString()} 원</p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">총 지출</span>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-red-500">{totalExpense.toLocaleString()} 원</p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">순수익</span>
                  <Wallet className="h-4 w-4 text-blue-500" />
                </div>
                <p className={`mt-2 text-2xl font-bold ${netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>{netProfit.toLocaleString()} 원</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">영농일지 기록 목록</h2>
              <div className="space-y-4">
                {diaries.map((diary) => (
                  <div key={diary.id} className="rounded-xl border border-slate-200 p-4 hover:border-emerald-300">
                    <div className="mb-2 flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-800">{diary.date}</span>
                        <span className="text-xs text-slate-500">({diary.weather})</span>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{diary.targetCrop}</span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-700 mb-2">📌 {diary.solarTermTask}</p>

                    <div className="mb-3 space-y-1">
                      {diary.taskDone.map((task, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-4 text-xs font-medium border-t pt-2">
                      <span className="text-red-500">지출: {diary.expense.toLocaleString()}원</span>
                      <span className="text-emerald-600">수입: {diary.income.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
