"use client";

import React, { useState, useEffect, useCallback } from "react";
import FarmCropTable from "@/components/FarmCropTable";
import { Sprout, MapPin, Calendar, Thermometer, Clock, BookOpen, Plus, Sparkles, TrendingUp, TrendingDown, Wallet, CheckCircle2, CloudSun, Droplets, Sun, Trash2, Save, Building } from "lucide-react";
import { saveFarmToDB, FarmSavePayload } from "@/app/services/farmService";
import type { FarmCropItem } from "@/types/farm";
// ==========================================
// 1. 전국 시·도 데이터 및 작물 GDD DB
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

export const CROP_GDD_DATABASE: Record<string, { baseTemp: number; targetTemp: number; targetGdd: number }> = {
  // 🌾 곡류 및 서류
  벼: { baseTemp: 10.0, targetTemp: 22.0, targetGdd: 2200.0 },
  옥수수: { baseTemp: 10.0, targetTemp: 24.0, targetGdd: 1400.0 },
  콩: { baseTemp: 10.0, targetTemp: 23.0, targetGdd: 1300.0 },
  감자: { baseTemp: 6.0, targetTemp: 20.0, targetGdd: 1100.0 },
  고구마: { baseTemp: 12.0, targetTemp: 26.0, targetGdd: 1500.0 },

  // 🍅 과채류
  딸기: { baseTemp: 5.0, targetTemp: 20.0, targetGdd: 1200.0 },
  토마토: { baseTemp: 10.0, targetTemp: 23.0, targetGdd: 1500.0 },
  방울토마토: { baseTemp: 10.0, targetTemp: 22.0, targetGdd: 1450.0 },
  수박: { baseTemp: 13.0, targetTemp: 28.0, targetGdd: 1300.0 },
  참외: { baseTemp: 12.0, targetTemp: 27.0, targetGdd: 1250.0 },
  오이: { baseTemp: 11.0, targetTemp: 25.0, targetGdd: 1100.0 },
  고추: { baseTemp: 10.0, targetTemp: 25.0, targetGdd: 1350.0 },
  가지: { baseTemp: 12.0, targetTemp: 26.0, targetGdd: 1350.0 },
  호박: { baseTemp: 10.0, targetTemp: 24.0, targetGdd: 1200.0 },

  // 🥬 엽채류 및 기타
  배추: { baseTemp: 5.0, targetTemp: 18.0, targetGdd: 800.0 },
  양배추: { baseTemp: 5.0, targetTemp: 19.0, targetGdd: 1050.0 },
  케일: { baseTemp: 4.0, targetTemp: 18.0, targetGdd: 1000.0 },
  상추: { baseTemp: 4.0, targetTemp: 20.0, targetGdd: 600.0 },
  시금치: { baseTemp: 4.0, targetTemp: 16.0, targetGdd: 750.0 },
  대파: { baseTemp: 6.0, targetTemp: 21.0, targetGdd: 1400.0 },

  // 🥕 근채류 및 양념류
  무: { baseTemp: 5.0, targetTemp: 20.0, targetGdd: 900.0 },
  당근: { baseTemp: 7.0, targetTemp: 21.0, targetGdd: 1200.0 },
  양파: { baseTemp: 4.0, targetTemp: 20.0, targetGdd: 1000.0 },
  마늘: { baseTemp: 4.0, targetTemp: 18.0, targetGdd: 1100.0 },

  // 🍎 과수류
  사과: { baseTemp: 7.0, targetTemp: 21.0, targetGdd: 1500.0 },
  배: { baseTemp: 7.0, targetTemp: 22.0, targetGdd: 1600.0 },
  복숭아: { baseTemp: 8.0, targetTemp: 24.0, targetGdd: 1400.0 },
  포도: { baseTemp: 10.0, targetTemp: 25.0, targetGdd: 1600.0 },

  // ⚙️ 기본값 (리스트에 없는 작물 입력 시)
  default: { baseTemp: 10.0, targetTemp: 22.0, targetGdd: 1500.0 },
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

interface BackendFarmResponse {
  id?: string;
  name?: string;
  address?: string;
  areaSize?: number;
  actualArea?: number;
  totalArea?: number;
  growthStatus?: string;
  growthStage?: string;
  plantDate?: string;
  bloomDate?: string;
  accumulatedTemp?: number;
  accumulated_temp?: number;
  targetTemp?: number;
  targetGdd?: number;
  aiReport?: AIReport;
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
  // 1. 신규 작물 입력 폼 상태 정의
  const [newCropForm, setNewCropForm] = useState({
    cropName: "",
    areaSize: 0,
    statusType: "GROWING" as "GROWING" | "PLANNED",
    plantDate: "",
    bloomDate: "",
    targetGdd: 1000,
    facilityType: "",
  });

  // 2. 작물 등록 버튼 클릭 시 실행될 함수
  const handleRegisterCrop = () => {
    if (!newCropForm.cropName) {
      alert("작물명을 입력해주세요.");
      return;
    }

    const newItem: FarmCropItem = {
      id: crypto.randomUUID(),
      cropName: newCropForm.cropName,
      areaSize: newCropForm.areaSize,
      statusType: newCropForm.statusType,
      plantDate: newCropForm.plantDate,
      bloomDate: newCropForm.bloomDate,
      targetGdd: newCropForm.targetGdd,
      facilityType: newCropForm.facilityType,
      // 🌟 FarmCropItem 인터페이스에서 요구하는 추가 속성들 매핑
      location: typeof fullAddress !== "undefined" ? fullAddress : "",
      growthStatus: newCropForm.statusType,
      accumulatedTemp: 0.0,
    };

    // 기존 목록에 추가
    setCropList((prev) => [newItem, ...prev]);

    // 폼 초기화
    setNewCropForm({
      cropName: "",
      areaSize: 0,
      statusType: "GROWING",
      plantDate: "",
      bloomDate: "",
      targetGdd: 1000,
      facilityType: "",
    });

    alert("작물이 성공적으로 등록되었습니다!");
  };

  const [diaries] = useState<DiaryEntry[]>([
    {
      id: "d1",
      date: "2026-10-01",
      weather: "맑음",
      targetCrop: "딸기",
      solarTermTask: "한로 맞이 추비 시공",
      taskDone: ["양액 공급", "엽면시비"],
      expense: 150000,
      income: 0,
    },
    {
      id: "d2",
      date: "2026-10-04",
      weather: "구름조금",
      targetCrop: "딸기",
      solarTermTask: "생육 상태 점검",
      taskDone: ["측창 점검", "수확 수량 예측"],
      expense: 0,
      income: 850000,
    },
  ]);
  const [loading, setLoading] = useState(true);

  // 각 작물별 고급 설정 오픈 여부 상태 관리 (예: {"farm-1": true, "farm-2":false})
  const [advancedOpen, setAdvancedOpen] = useState<Record<string, boolean>>({});

  const targetAdvanced = (id: string) => {
    setAdvancedOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 로딩 및 저장 처리 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fullAddress = sigungu ? `${sido} ${sigungu}` : sido;

  // 손익 계산
  const totalIncome = diaries.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpense = diaries.reduce((sum, item) => sum + (item.expense || 0), 0);
  const netProfit = totalIncome - totalExpense;

  // 1) 통합 농장 데이터 조회
  // 1. 함수 이름을 원래 호출하던 'fetchIntegratedFarmData'로 명명합니다.
  const fetchIntegratedFarmData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/farm-list");

      if (response.ok) {
        const dbData: BackendFarmResponse[] = await response.json();
        if (dbData && dbData.length > 0) {
          const formattedData: FarmCropItem[] = dbData.map((item) => ({
            id: item.id || `farm-${Math.random()}`,
            cropName: item.name || "미지정 작물",
            location: item.address || "위치 정보 없음",
            areaSize: item.actualArea || 0,
            growthStatus: item.growthStatus || item.growthStage || "일지 미작성",
            plantDate: item.plantDate && item.plantDate.trim() !== "" ? item.plantDate : "-",
            bloomDate: item.bloomDate && item.bloomDate.trim() !== "" ? item.bloomDate : "-",
            accumulatedTemp: item.accumulatedTemp ?? item.accumulated_temp ?? 0,
            targetTemp: item.targetTemp ?? item.targetGdd ?? 1000,
            statusType: "GROWING",
            aiReport: item.aiReport,
          }));

          setCropList(formattedData);
        }
      }
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. useEffect 안에서는 함수를 따로 빼서 호출하는 대신, 내부에서 정의하고 즉시 실행합니다.
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (isMounted) {
        await fetchIntegratedFarmData();
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2) 위치 선택 변경 시 실시간 날씨 연동
  useEffect(() => {
    const fetchWeather = async () => {
      if (!sido || !sigungu) return;

      setIsWeatherLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location_str: `${sido} ${sigungu}` }),
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

  // 이벤트 핸들러
  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSido(e.target.value);
    setSigungu("");
  };

  const handleAddCrop = () => {
    setCropList((prev) => [
      ...prev,
      {
        id: `crop-${Date.now()}`,
        statusType: "GROWING",
        cropName: "",
        areaSize: 0,
        location: fullAddress,
        plantDate: new Date().toISOString().split("T")[0],
        growthStatus: "일지 미작성",
        isEditing: true,
        accumulatedTemp: 0,
        baseTemp: 10,
        targetGdd: 1200,
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

  const handleToggleEdit = (id: string | number) => {
    setCropList((prevList) => prevList.map((crop) => (crop.id === id ? { ...crop, isEditing: !crop.isEditing } : crop)));
  };

  const handleCropChange = <K extends keyof FarmCropItem>(id: string, field: K, value: FarmCropItem[K]) => {
    setCropList((prev) =>
      prev.map((crop) => {
        if (crop.id !== id) return crop;

        if (field === "cropName" && typeof value === "string") {
          const matched = CROP_GDD_DATABASE[value.trim()];
          return {
            ...crop,
            cropName: value,
            baseTemp: matched ? matched.baseTemp : (crop.baseTemp ?? 10.0),
            targetTemp: matched ? matched.targetTemp : (crop.targetTemp ?? 22.0),
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
    const otherAllocated = cropList.filter((crop) => crop.id !== id).reduce((sum, crop) => sum + (crop.areaSize || 0), 0);
    const remaining = total - otherAllocated;

    if (remaining <= 0) {
      alert("남은 밭 면적이 없습니다.");
      return;
    }

    const recommendedPercent = 30;
    const recommendedPyung = Math.min(Math.round(total * (recommendedPercent / 100)), remaining);
    const mockReport = `📊 [빅데이터 분석 리포트]\n• ${sido} ${sigungu} 인근 ${cropName} 재배 추천 면적: 전체의 ${recommendedPercent}% 수준 (${recommendedPyung}평)`;

    setCropList((prev) => prev.map((c) => (c.id === id ? { ...c, areaSize: recommendedPyung, analysisResult: mockReport } : c)));
  };

  // AI 분석 실행
  const handleAnalyzeAll = async () => {
    if (!sido || !sigungu) {
      alert("⚠️ 농장 재배 위치(시/도 및 시/구/군)를 선택해 주세요.");
      return;
    }
    setIsAnalyzing(true);

    try {
      let latestWeather: WeatherInfo | null = null;

      const updatedList = await Promise.all(
        cropList.map(async (crop) => {
          if (!crop.cropName) {
            return { ...crop, analysisResult: "⚠️ 작물 이름을 입력해 주세요." };
          }

          const response = await fetch("http://localhost:8000/api/analyze-crop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              crop_name: crop.cropName,
              area_pyeong: crop.areaSize || 0,
              status_type: (crop.statusType || "growing").toLowerCase(),
              plant_date: crop.plantDate || new Date().toISOString().split("T")[0],
              location_str: fullAddress,
              target_gdd: Number(crop.targetGdd) || 1200.0,
              base_temp: Number(crop.baseTemp) || 10.0,
              recent_weather: [],
            }),
          });

          if (!response.ok) {
            throw new Error(`분석 서버 오류 (${response.status})`);
          }
          const data = await response.json();

          if (data.weather) {
            latestWeather = data.weather;
          }

          const updatedAiReport: AIReport = {
            cropName: data.crop_name,
            category: data.crop_category,
            accuracy: data.accuracy_range,
            accumulatedTemp: data.accumulated_gdd,
            targetTemp: data.target_accumulated_temp,
            environmentCorrection: data.analysis_report,
            expectedHarvestDate: data.estimated_harvest_date,
            daysRemaining: data.days_remaining || 0,
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
            aiReport: updatedAiReport,
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
    if (!primaryCrop || !primaryCrop.cropName) {
      alert("⚠ 최소 한 개 이상의 작물 이름을 입력해야 DB 저장이 가능합니다.");
      return;
    }

    setIsSaving(true);

    const payload: FarmSavePayload = {
      location_str: fullAddress,
      area_pyeong: primaryCrop.areaSize || Number(totalArea) || 0,
      crop_name: primaryCrop.cropName,
      status_type: (primaryCrop.statusType || "growing").toLowerCase() as "growing" | "planned",
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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 헤더 네비게이션 */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-md shadow-emerald-200">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">스마트 영농 통합 관리 시스템</h1>
              <p className="text-xs font-medium text-slate-500">{userName} 농가 관리자 페이지</p>
            </div>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1">
            <button onClick={() => setActiveTab("DASHBOARD")} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${activeTab === "DASHBOARD" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
              <Building className="h-4 w-4" />
              대시보드
            </button>
            <button onClick={() => setActiveTab("DIARY")} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${activeTab === "DIARY" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
              <BookOpen className="h-4 w-4" />
              영농일지 & 장부
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* 상단 농장 위치 및 실시간 기상 요약 카드 */}
        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 농장 위치 지정 카드 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <MapPin className="h-5 w-5" />
                <h2>농장 소재지 설정</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">실시간 연동</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">시·도</label>
                <select value={sido} onChange={handleSidoChange} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                  {Object.keys(LOCATION_DATA).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">시·군·구</label>
                <select value={sigungu} onChange={(e) => setSigungu(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                  <option value="">선택</option>
                  {LOCATION_DATA[sido]?.map((sg) => (
                    <option key={sg} value={sg}>
                      {sg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">전체 경작 면적 (평)</label>
              <input type="number" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" placeholder="예: 1000" />
            </div>
          </div>

          {/* 실시간 날씨 정보 카드 */}
          <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CloudSun className="h-5 w-5 text-amber-500" />
                <h2>{fullAddress} 실시간 기상 관측</h2>
              </div>
              {isWeatherLoading && <span className="text-xs text-slate-400">날씨 불러오는 중...</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Thermometer className="mx-auto mb-1 h-5 w-5 text-rose-500" />
                <p className="text-xs text-slate-500">현재 기온</p>
                <p className="mt-1 text-lg font-extrabold text-slate-800">{weatherInfo ? `${weatherInfo.temp}℃` : "24.5℃"}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Droplets className="mx-auto mb-1 h-5 w-5 text-sky-500" />
                <p className="text-xs text-slate-500">상대 습도</p>
                <p className="mt-1 text-lg font-extrabold text-slate-800">{weatherInfo ? `${weatherInfo.humidity}%` : "68%"}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <Sun className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                <p className="text-xs text-slate-500">일조 시간</p>
                <p className="mt-1 text-lg font-extrabold text-slate-800">{weatherInfo ? `${weatherInfo.solHours}시간` : "8.5시간"}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <CloudSun className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                <p className="text-xs text-slate-500">강수량</p>
                <p className="mt-1 text-lg font-extrabold text-slate-800">{weatherInfo ? `${weatherInfo.rain}mm` : "0.0mm"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 탭 콘텐츠: 대시보드 */}
        {activeTab === "DASHBOARD" && (
          <div className="space-y-8">
            {/* 1. 🌟 상단 고정: 신규 작물 등록 폼 (버튼 누를 필요 없이 항상 상단에 노출) */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">재배 작물 등록</h2>
                  <p className="text-xs text-slate-500">새로운 재배 작물 정보를 입력하여 농가에 등록합니다.</p>
                </div>
              </div>

              {/* 입력 폼 영역 (state로 관리하는 신규 입력값 전용 객체 사용 권장, 예: newCropForm) */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
                  {/* 작물명 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">작물명</label>
                    <input type="text" value={newCropForm.cropName} onChange={(e) => setNewCropForm({ ...newCropForm, cropName: e.target.value })} placeholder="예: 케일, 딸기" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                  </div>

                  {/* 재배 면적 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">재배 면적 (평)</label>
                    <input type="number" value={newCropForm.areaSize || ""} onChange={(e) => setNewCropForm({ ...newCropForm, areaSize: Number(e.target.value) })} placeholder="예: 50" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                  </div>

                  {/* 재배 상태 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">재배 상태</label>
                    <select value={newCropForm.statusType || "GROWING"} onChange={(e) => setNewCropForm({ ...newCropForm, statusType: e.target.value as "GROWING" | "PLANNED" })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                      <option value="GROWING">재배 중</option>
                      <option value="PLANNED">재배 예정</option>
                    </select>
                  </div>

                  {/* 정식일 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">정식일</label>
                    <input type="date" value={newCropForm.plantDate || ""} onChange={(e) => setNewCropForm({ ...newCropForm, plantDate: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                  </div>

                  {/* 개화일 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">개화일</label>
                    <input type="date" value={newCropForm.bloomDate || ""} onChange={(e) => setNewCropForm({ ...newCropForm, bloomDate: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                  </div>

                  {/* 목표 GDD */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">목표 GDD (℃)</label>
                    <input type="number" value={newCropForm.targetGdd || 1000} onChange={(e) => setNewCropForm({ ...newCropForm, targetGdd: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                  </div>

                  {/* 시설 유형 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">시설 유형</label>
                    <select value={newCropForm.facilityType || ""} onChange={(e) => setNewCropForm({ ...newCropForm, facilityType: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                      <option value="">노지/선택안함</option>
                      <option value="비닐하우스">비닐하우스</option>
                      <option value="유리온실">유리온실</option>
                      <option value="스마트팜">스마트팜</option>
                    </select>
                  </div>

                  {/* 등록 버튼 */}
                  <div className="sm:col-span-2 flex items-end">
                    <button type="button" onClick={handleRegisterCrop} className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
                      작물 등록 및 저장
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. 🌟 농가 작물 현황 상세 테이블 (작물명 / 위치 / 평수 / 생육상태 / 정식일 / 개화일 / 현재 적산온도) */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">농가 작물 현황 상세 테이블</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-3">작물명</th>
                      <th className="px-4 py-3">위치</th>
                      <th className="px-4 py-3">평수</th>
                      <th className="px-4 py-3">생육상태</th>
                      <th className="px-4 py-3">정식일</th>
                      <th className="px-4 py-3">개화일</th>
                      <th className="px-4 py-3 text-right">현재 적산온도</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cropList.map((crop) => (
                      <tr key={crop.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{crop.cropName}</td>
                        <td className="px-4 py-3">{fullAddress}</td>
                        <td className="px-4 py-3">{crop.areaSize}평</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${crop.statusType === "GROWING" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{crop.statusType === "GROWING" ? "재배 중" : "재배 예정"}</span>
                        </td>
                        <td className="px-4 py-3">{crop.plantDate || "-"}</td>
                        <td className="px-4 py-3">{crop.bloomDate || "-"}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">{crop.accumulatedTemp || 0.0}℃</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. 🌟 하단 AI 생육 분석 및 맞춤 비료 리포트 */}
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">AI 생육 및 비료 맞춤 분석 리포트</h2>
                </div>
                <button onClick={handleAnalyzeAll} disabled={isAnalyzing} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50">
                  {isAnalyzing ? "분석 중..." : "AI 분석 실행"}
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                {/* 생육 상태 리포트 */}
                <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 font-bold text-emerald-800">🌱 [생육 상태 및 환경 보정 예측 리포트 - {sigungu || "김해시"}]</h3>
                  <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <li>
                      • <strong>작물/부류:</strong> 케일 (기타 | 예측 정확도: 85%)
                    </li>
                    <li>
                      • <strong>생육 진행률:</strong> 0.0% (누적 GDD: 0.0℃ / 목표: 1000.0℃)
                    </li>
                    <li>
                      • <strong>일조량/강우 환경 보정:</strong> +0일 숙기 지연 반영
                    </li>
                    <li>
                      • <strong>최종 예측 수확 확정일:</strong> 04월 24일 (약 186일 후)
                    </li>
                    <li>
                      • 🛡️ <strong>쇼핑몰 권장 발송 버퍼:</strong> 04월 23일 ~ 04월 26일
                    </li>
                    <li>
                      • <strong>예상 총 수확량:</strong> 약 400.0kg (50.0평 기준)
                    </li>
                  </ul>
                </div>

                {/* 맞춤 비료 스케줄 리포트 */}
                <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 font-bold text-emerald-800">💊 [케일 50.0평 맞춤 비료 Schedule]</h3>
                  <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <li>
                      • <strong>밑거름 (2026-10-08):</strong> 일반 복합비료 [50.0kg]
                    </li>
                    <li>
                      • <strong>1차 추비 (2026-11-21):</strong> 요소 비료 [2.0kg]
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 탭 콘텐츠: 영농일지 & 장부 */}
        {activeTab === "DIARY" && (
          <div className="space-y-8">
            {/* 영농 장부 요약 카트 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">총 수입</p>
                    <p className="text-xl font-bold text-slate-900">{totalIncome.toLocaleString()} 원</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">총 지출</p>
                    <p className="text-xl font-bold text-slate-900">{totalExpense.toLocaleString()} 원</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">순수익</p>
                    <p className={`text-xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{netProfit.toLocaleString()} 원</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 영농일지 목록 테이블 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">작업 일지 및 장부 기록</h2>
                  <p className="text-xs text-slate-500">최근 작성된 농작업 및 경영비용 내역입니다.</p>
                </div>
                <button onClick={() => alert("영농일지 작성 기능은 준비 중입니다.")} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
                  <Plus className="h-4 w-4" /> 일지 작성
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-3">작성일자</th>
                      <th className="px-4 py-3">날씨</th>
                      <th className="px-4 py-3">대상 작물</th>
                      <th className="px-4 py-3">절기 / 주요 작업</th>
                      <th className="px-4 py-3">완료 작업 항목</th>
                      <th className="px-4 py-3 text-right">지출</th>
                      <th className="px-4 py-3 text-right">수입</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {diaries.map((diary) => (
                      <tr key={diary.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{diary.date}</td>
                        <td className="px-4 py-3">{diary.weather}</td>
                        <td className="px-4 py-3">{diary.targetCrop}</td>
                        <td className="px-4 py-3">{diary.solarTermTask}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {diary.taskDone.map((task, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                {task}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-rose-600">{diary.expense > 0 ? `-${diary.expense.toLocaleString()}원` : "-"}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">{diary.income > 0 ? `+${diary.income.toLocaleString()}원` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
