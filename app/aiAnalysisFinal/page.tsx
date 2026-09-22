"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Sprout, Thermometer, TrendingUp, Scale, Bug, AlertTriangle, CheckCircle2, Clock, ChevronRight, RefreshCw, Sun, Layers, ArrowRight, Info, Award, Sliders, X, Building2, DollarSign, TrendingDown, BellRing, ShoppingCart, Zap, BarChart3, Check, Sparkles } from "lucide-react";

// ==========================================
// Types & Interfaces
// ==========================================
export type StageType = "BEFORE" | "GROWING" | "READY" | "SETTLEMENT";

export interface CropVariety {
  id: string;
  cropName: string;
  varietyName: string;
  category: string;
  icon: string;
  targetGDD: number;
  baseTemp: number;
  standardPlantDensity: number; // 주/m²
  standardFruitWeight: number; // g
  standardFruitPerPlant: number; // 개/주
  standardGradeA: number; // %
  unitPricePerKg: number; // KRW
  typicalDaysToHarvest: number;
  defaultPlantingDate: string;
  defaultFloweringDate: string;
  avgTempRecent: number;
  recent7DaysAvg: number;
  defaultArea: number; // 평
}

// ==========================================
// Initial Crop Preset Data
// ==========================================
const CROP_VARIETIES: CropVariety[] = [
  {
    id: "strawberry",
    cropName: "딸기",
    varietyName: "설향",
    category: "과채류",
    icon: "🍓",
    targetGDD: 680,
    baseTemp: 5,
    standardPlantDensity: 8,
    standardFruitWeight: 24,
    standardFruitPerPlant: 22,
    standardGradeA: 88,
    unitPricePerKg: 14500,
    typicalDaysToHarvest: 60,
    defaultPlantingDate: "2026-08-01",
    defaultFloweringDate: "2026-09-15",
    avgTempRecent: 17.2,
    recent7DaysAvg: 16.8,
    defaultArea: 1200,
  },
  {
    id: "cherry-tomato",
    cropName: "토마토",
    varietyName: "완숙 대추방울",
    category: "과채류",
    icon: "🍅",
    targetGDD: 1150,
    baseTemp: 10,
    standardPlantDensity: 3.5,
    standardFruitWeight: 18,
    standardFruitPerPlant: 65,
    standardGradeA: 90,
    unitPricePerKg: 8500,
    typicalDaysToHarvest: 75,
    defaultPlantingDate: "2026-07-15",
    defaultFloweringDate: "2026-08-20",
    avgTempRecent: 22.8,
    recent7DaysAvg: 23.5,
    defaultArea: 800,
  },
  {
    id: "pepper",
    cropName: "고추",
    varietyName: "PR청양",
    category: "조미채소",
    icon: "🌶️",
    targetGDD: 1300,
    baseTemp: 12,
    standardPlantDensity: 3.0,
    standardFruitWeight: 15,
    standardFruitPerPlant: 85,
    standardGradeA: 82,
    unitPricePerKg: 12000,
    typicalDaysToHarvest: 90,
    defaultPlantingDate: "2026-04-20",
    defaultFloweringDate: "2026-06-05",
    avgTempRecent: 24.5,
    recent7DaysAvg: 25.2,
    defaultArea: 600,
  },
  {
    id: "grape",
    cropName: "포도",
    varietyName: "샤인머스캣",
    category: "과수",
    icon: "🍇",
    targetGDD: 1650,
    baseTemp: 10,
    standardPlantDensity: 0.25,
    standardFruitWeight: 650,
    standardFruitPerPlant: 28,
    standardGradeA: 92,
    unitPricePerKg: 18000,
    typicalDaysToHarvest: 130,
    defaultPlantingDate: "2026-05-10",
    defaultFloweringDate: "2026-06-25",
    avgTempRecent: 21.0,
    recent7DaysAvg: 21.8,
    defaultArea: 1500,
  },
];

// ==========================================
// Sub-Components for 4 Stages
// ==========================================
function BeforeHarvestStageView({ calculations }: { calculations: any }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <Sprout className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">1단계: 재배 준비 및 정식 계획</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">권장 토양/양액 관리</span>
          <p className="text-sm font-bold text-slate-200 mt-2">정식 전 pH 6.0~6.5, EC 0.8~1.2 맞춰 포장 준비</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">예상 재배 묘목 수</span>
          <p className="text-sm font-bold text-emerald-400 mt-2">{calculations.totalPlants.toLocaleString()} 주 계산됨</p>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">초기 농자재 준비 항목</span>
          <p className="text-sm font-bold text-amber-400 mt-2">기비/양액 A·B제, 뿌리 활착제 확보 완료</p>
        </div>
      </div>
    </div>
  );
}

function GrowingStageView({ calculations, crop }: { calculations: any; crop: CropVariety }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">2단계: 생육 집중 및 AI 환경 진단</h3>
        </div>
        <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">생육 왕성기</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Work Tasks */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 권장 작업 가이드
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span>야간 최소 온도 {crop.baseTemp + 3}℃ 이상 유지 관리 (난방 및 측창 제어)</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span>적엽 및 적화 작업 1차 시행 (하부 노화엽 제거로 통풍 확보)</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span>수분 수화 벌통 입식 및 착과율 점검</span>
            </li>
          </ul>
        </div>

        {/* Pest Warnings */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bug className="w-4 h-4 text-amber-400" /> AI 병해충 주의보
          </h4>
          <div className="space-y-2.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">흰가루병 / 잿빛곰팡이병</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold">주의 Stage</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">주/야간 습도 차이로 발병 위험 증가. 야간 제습 및 환기 팬 가동 필요.</p>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400">설정된 피해 차감 비율</span>
              <span className="text-red-400 font-bold">-{calculations.pestDamageRate}% 적용 중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HarvestReadyStageView({ calculations, timing }: { calculations: any; timing: any }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">3단계: 수확 대기 및 사전 유통 준비</h3>
        </div>
        <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">D-{timing.daysRemaining}일 전</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">예상 첫 수확 시작일</span>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{timing.estHarvestDate}</p>
          <p className="text-xs text-slate-500 mt-1">GDD 목표치({timing.targetGDD}℃·일) 기준 산출</p>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">상품과 출하 가능 물량</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{calculations.estMarketableYieldKg.toLocaleString()} kg</p>
          <p className="text-xs text-slate-500 mt-1">상품과율 {calculations.gradeARate}% 반영</p>
        </div>
      </div>
    </div>
  );
}

function SettlementStageView({ calculations }: { calculations: any }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">4단계: 수확 및 정산 경영 리포트</h3>
        </div>
        <span className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">수확/정산</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">총 추정 매출</span>
          <p className="text-lg font-bold text-purple-300 mt-1">₩{calculations.estimatedGrossRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">투입 자재/운영 경비</span>
          <p className="text-lg font-bold text-red-400 mt-1">₩{calculations.totalInputCosts.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">최종 순마진액 (마진율)</span>
          <p className="text-lg font-bold text-emerald-400 mt-1">
            ₩{calculations.estimatedNetMargin.toLocaleString()} ({calculations.netMarginPercent}%)
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Dashboard Component
// ==========================================
export default function App() {
  const [selectedCropId, setSelectedCropId] = useState<string>("strawberry");
  const [activeStage, setActiveStage] = useState<StageType>("GROWING");
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [smsAutomationEnabled, setSmsAutomationEnabled] = useState<boolean>(true);

  // Facility & Cultivation Method
  const [facilityType, setFacilityType] = useState<"outdoor" | "vinyl" | "glass">("vinyl");
  const [cultivationMethod, setCultivationMethod] = useState<"soil" | "hydroponic" | "organic">("hydroponic");

  // Dates
  const [plantingDate, setPlantingDate] = useState<string>("");
  const [floweringDate, setFloweringDate] = useState<string>("");

  // Yield & Financial Parameters
  const [areaMode, setAreaMode] = useState<"pyeong" | "m2" | "plants">("pyeong");
  const [areaValue, setAreaValue] = useState<number>(300);
  const [plantCountInput, setPlantCountInput] = useState<number>(7900);
  const [fruitsPerPlant, setFruitsPerPlant] = useState<number>(22);
  const [avgFruitWeightG, setAvgFruitWeightG] = useState<number>(24);
  const [pestDamageRate, setPestDamageRate] = useState<number>(4);
  const [unitPrice, setUnitPrice] = useState<number>(14500);
  const [actualHarvestedKg, setActualHarvestedKg] = useState<number>(350);

  // Costs State
  const [fertilizerCost, setFertilizerCost] = useState<number>(1200000);
  const [pesticideCost, setPesticideCost] = useState<number>(450000);
  const [utilityCost, setUtilityCost] = useState<number>(950000);

  const activeCrop = useMemo(() => {
    return CROP_VARIETIES.find((c) => c.id === selectedCropId) || CROP_VARIETIES[0];
  }, [selectedCropId]);

  // Sync state when crop changes
  useEffect(() => {
    const crop = activeCrop;
    setPlantingDate(crop.defaultPlantingDate);
    setFloweringDate(crop.defaultFloweringDate);
    setUnitPrice(crop.unitPricePerKg);
    setFruitsPerPlant(crop.standardFruitPerPlant);
    setAvgFruitWeightG(crop.standardFruitWeight);
    setAreaValue(crop.defaultArea);

    if (crop.id === "strawberry") {
      setAreaMode("pyeong");
      setPlantCountInput(7900);
      setFertilizerCost(1200000);
      setPesticideCost(450000);
      setUtilityCost(950000);
      setActualHarvestedKg(350);
    } else if (crop.id === "cherry-tomato") {
      setAreaMode("pyeong");
      setPlantCountInput(3470);
      setFertilizerCost(980000);
      setPesticideCost(380000);
      setUtilityCost(720000);
      setActualHarvestedKg(210);
    } else if (crop.id === "pepper") {
      setAreaMode("pyeong");
      setPlantCountInput(2970);
      setFertilizerCost(850000);
      setPesticideCost(520000);
      setUtilityCost(450000);
      setActualHarvestedKg(120);
    } else if (crop.id === "grape") {
      setAreaMode("pyeong");
      setPlantCountInput(250);
      setFertilizerCost(1850000);
      setPesticideCost(650000);
      setUtilityCost(600000);
      setActualHarvestedKg(0);
    }
  }, [selectedCropId, activeCrop]);

  // GDD Timing Calculations
  const timingCalculations = useMemo(() => {
    if (!plantingDate) {
      return {
        daysElapsed: 0,
        currentGDD: 0,
        targetGDD: activeCrop.targetGDD,
        progressPercent: 0,
        estHarvestDate: "미정",
        daysRemaining: 0,
        dailyRate: 0,
        tempAdjustment: 0,
        currentStage: 1,
      };
    }

    const today = new Date();
    const pDate = new Date(plantingDate);

    let tempOffset = 0;
    if (facilityType === "vinyl") tempOffset = 2.5;
    if (facilityType === "glass") tempOffset = 4.0;

    const adjustedAvgTemp = activeCrop.avgTempRecent + tempOffset;
    const effectiveDailyTemp = Math.max(0, adjustedAvgTemp - activeCrop.baseTemp);

    const diffTime = Math.max(0, today.getTime() - pDate.getTime());
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const floweringBonus = floweringDate ? 1.08 : 1.0;

    let currentGDD = Math.round(daysElapsed * effectiveDailyTemp * floweringBonus);
    if (currentGDD < 0) currentGDD = 0;

    const progressPercent = Math.min(100, Math.round((currentGDD / activeCrop.targetGDD) * 100));

    const adjusted7DayAvg = activeCrop.recent7DaysAvg + tempOffset;
    const dailyGDDRate = Math.max(1, (adjusted7DayAvg - activeCrop.baseTemp) * floweringBonus);

    const remainingGDD = Math.max(0, activeCrop.targetGDD - currentGDD);
    const daysRemaining = Math.ceil(remainingGDD / dailyGDDRate);

    const projectedDate = new Date();
    projectedDate.setDate(today.getDate() + daysRemaining);
    const formattedEstDate = projectedDate.toISOString().split("T")[0];

    let currentStage = 1;
    if (progressPercent >= 20 && progressPercent < 75) currentStage = 2;
    else if (progressPercent >= 75 && progressPercent < 95) currentStage = 3;
    else if (progressPercent >= 95) currentStage = 4;

    return {
      daysElapsed,
      currentGDD,
      targetGDD: activeCrop.targetGDD,
      progressPercent,
      estHarvestDate: formattedEstDate,
      daysRemaining,
      dailyRate: Number(dailyGDDRate.toFixed(1)),
      tempAdjustment: tempOffset,
      currentStage,
    };
  }, [plantingDate, floweringDate, facilityType, activeCrop]);

  // Yield & Financial Calculations
  const yieldCalculations = useMemo(() => {
    let totalPlants = 0;
    if (areaMode === "pyeong") {
      const m2 = areaValue * 3.305785;
      totalPlants = Math.round(m2 * activeCrop.standardPlantDensity);
    } else if (areaMode === "m2") {
      totalPlants = Math.round(areaValue * activeCrop.standardPlantDensity);
    } else {
      totalPlants = Number(plantCountInput) || 0;
    }

    let methodMultiplier = 1.0;
    if (cultivationMethod === "hydroponic") methodMultiplier = 1.1;
    if (cultivationMethod === "organic") methodMultiplier = 0.9;

    const grossPerPlantGrams = (Number(fruitsPerPlant) || 0) * (Number(avgFruitWeightG) || 0);
    const grossTotalKg = (totalPlants * grossPerPlantGrams * methodMultiplier) / 1000;

    const damageMultiplier = 1 - (Number(pestDamageRate) || 0) / 100;
    const estTotalYieldKg = Math.round(grossTotalKg * Math.max(0, damageMultiplier));

    const gradeARate = Math.max(50, activeCrop.standardGradeA - Math.round((Number(pestDamageRate) || 0) * 0.6));
    const estMarketableYieldKg = Math.round(estTotalYieldKg * (gradeARate / 100));

    const remainingYieldKg = Math.max(0, estTotalYieldKg - (Number(actualHarvestedKg) || 0));

    const minYield = Math.round(estTotalYieldKg * 0.9);
    const maxYield = Math.round(estTotalYieldKg * 1.1);

    const estimatedGrossRevenue = Math.round(estMarketableYieldKg * unitPrice);
    const totalInputCosts = fertilizerCost + pesticideCost + utilityCost;
    const estimatedNetMargin = estimatedGrossRevenue - totalInputCosts;
    const netMarginPercent = estimatedGrossRevenue > 0 ? Math.round((estimatedNetMargin / estimatedGrossRevenue) * 100) : 0;

    return {
      totalPlants,
      estTotalYieldKg,
      gradeARate,
      estMarketableYieldKg,
      remainingYieldKg,
      minYield,
      maxYield,
      estimatedGrossRevenue,
      totalInputCosts,
      estimatedNetMargin,
      netMarginPercent,
      pestDamageRate,
    };
  }, [areaMode, areaValue, plantCountInput, fruitsPerPlant, avgFruitWeightG, pestDamageRate, cultivationMethod, actualHarvestedKg, unitPrice, fertilizerCost, pesticideCost, utilityCost, activeCrop]);

  // Monthly Distribution Data
  const monthlyHarvestData = useMemo(() => {
    const totalKg = yieldCalculations.estTotalYieldKg;
    if (selectedCropId === "strawberry") {
      return [
        { month: "11월", ratio: 15, kg: Math.round(totalKg * 0.15) },
        { month: "12월", ratio: 30, kg: Math.round(totalKg * 0.3) },
        { month: "1월", ratio: 25, kg: Math.round(totalKg * 0.25) },
        { month: "2월", ratio: 20, kg: Math.round(totalKg * 0.2) },
        { month: "3월", ratio: 10, kg: Math.round(totalKg * 0.1) },
      ];
    } else if (selectedCropId === "cherry-tomato") {
      return [
        { month: "5월", ratio: 15, kg: Math.round(totalKg * 0.15) },
        { month: "6월", ratio: 35, kg: Math.round(totalKg * 0.35) },
        { month: "7월", ratio: 30, kg: Math.round(totalKg * 0.3) },
        { month: "8월", ratio: 20, kg: Math.round(totalKg * 0.2) },
      ];
    } else {
      return [
        { month: "1차 출하", ratio: 20, kg: Math.round(totalKg * 0.2) },
        { month: "2차 출하", ratio: 45, kg: Math.round(totalKg * 0.45) },
        { month: "3차 출하", ratio: 25, kg: Math.round(totalKg * 0.25) },
        { month: "4차 출하", ratio: 10, kg: Math.round(totalKg * 0.1) },
      ];
    }
  }, [selectedCropId, yieldCalculations.estTotalYieldKg]);

  const stages: { id: StageType; label: string; stageNum: number }[] = [
    { id: "BEFORE", label: "1단계: 재배 준비", stageNum: 1 },
    { id: "GROWING", label: "2단계: 생육 집중", stageNum: 2 },
    { id: "READY", label: "3단계: 수확 대기", stageNum: 3 },
    { id: "SETTLEMENT", label: "4단계: 수확/정산", stageNum: 4 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 sm:p-6 lg:p-8 antialiased selection:bg-emerald-500/30">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">🌱</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> AI Smart Farm Analytics
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    GDD 실시간 연산
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">스마트팜 AI 진단 및 수확·수익 통합 예측 리포트</h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">생육 단계별 데이터 분석 기반 예측 및 통합 작업 시뮬레이션을 제공합니다.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setIsSimulatorOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/20 transition-all transform active:scale-95">
                <Sliders className="w-4 h-4" />
                <span>예측 조건 보정 / 시뮬레이션</span>
              </button>
            </div>
          </div>

          {/* Crop Selector Chips */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" /> 분석 대상 작물:
            </span>
            {CROP_VARIETIES.map((crop) => {
              const isSelected = crop.id === selectedCropId;
              return (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${isSelected ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30 font-bold" : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-800"}`}
                >
                  <span className="text-base">{crop.icon}</span>
                  <span>{crop.cropName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"}`}>{crop.varietyName}</span>
                  <span className="text-[10px] text-slate-500">({crop.defaultArea}평)</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Selected Crop Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeCrop.icon}</span>
            <div>
              <h2 className="text-base font-bold text-emerald-300">
                [{activeCrop.cropName} - {activeCrop.varietyName}] 생육 및 AI 리포트
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                재배 규모: <strong className="text-slate-200">{areaValue} 평</strong> ({yieldCalculations.totalPlants.toLocaleString()} 주) | 정식일: <strong className="text-slate-200">{plantingDate}</strong> | 시설: <strong className="text-slate-200">{facilityType === "vinyl" ? "비닐하우스" : facilityType === "glass" ? "유리온실" : "노지"}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">목표 GDD: {activeCrop.targetGDD}℃·일</span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">기준단가: ₩{unitPrice.toLocaleString()}/kg</span>
          </div>
        </div>

        {/* 4-Stage Lifecycle Progress Tracker */}
        <section className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">생육 단계별 Tracker & active Tab</span>
            </div>
            <span className="text-xs text-slate-400">
              현재 AI 추정 단계: <strong className="text-emerald-400">{timingCalculations.currentStage}단계</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stages.map((s) => {
              const isActive = activeStage === s.id;
              const isCurrentAiStage = timingCalculations.currentStage === s.stageNum;
              return (
                <button key={s.id} onClick={() => setActiveStage(s.id)} className={`p-3 rounded-xl border text-left transition-all relative ${isActive ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/40 shadow-md" : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{s.label}</span>
                    {isCurrentAiStage && <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-500/30">AI 추정</span>}
                  </div>
                  <p className="text-[10px] text-slate-500">클릭하여 세부 분석 확인</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Stage Detailed View Component */}
        <section>
          {activeStage === "BEFORE" && <BeforeHarvestStageView calculations={yieldCalculations} />}
          {activeStage === "GROWING" && <GrowingStageView calculations={yieldCalculations} crop={activeCrop} />}
          {activeStage === "READY" && <HarvestReadyStageView calculations={yieldCalculations} timing={timingCalculations} />}
          {activeStage === "SETTLEMENT" && <SettlementStageView calculations={yieldCalculations} />}
        </section>

        {/* Key Metrics Grid (4 Main Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Harvest Target & D-Day */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <div>
              <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
                <span>예상 수확일 (Target)</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white mt-1">{timingCalculations.estHarvestDate}</p>
              <p className="text-xs text-amber-300/80 mt-1 font-semibold">
                D-{timingCalculations.daysRemaining}일 남음 <span className="text-slate-400 font-normal">({timingCalculations.daysElapsed}일차)</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-400">GDD 달성률</span>
                <span className="text-amber-400 font-bold">{timingCalculations.progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${timingCalculations.progressPercent}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
                <span>
                  누적 {timingCalculations.currentGDD} / {timingCalculations.targetGDD} ℃·일
                </span>
                <span>+{timingCalculations.dailyRate}℃/일</span>
              </p>
            </div>
          </div>

          {/* Card 2: Expected Total Yield */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <div>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
                <span>예상 총수확량</span>
                <Scale className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white mt-1">
                {yieldCalculations.estTotalYieldKg.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg</span>
              </p>
              <p className="text-xs text-emerald-300/80 mt-1">
                상품과율 <strong className="font-bold">{yieldCalculations.gradeARate}%</strong> 적용: {yieldCalculations.estMarketableYieldKg.toLocaleString()} kg
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>신뢰 범위 (±10%)</span>
                <span className="text-emerald-400 font-semibold">
                  {yieldCalculations.minYield.toLocaleString()} ~ {yieldCalculations.maxYield.toLocaleString()} kg
                </span>
              </div>
              <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-[10%] right-[10%] bg-emerald-500/40 rounded-full"></div>
                <div className="absolute inset-y-0 left-[50%] w-1 bg-emerald-400"></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 truncate">{cultivationMethod === "hydroponic" ? "양액재배 가중치 (+10%) 반영" : cultivationMethod === "organic" ? "유기농 가중치 (-10%) 반영" : "토양재배 기준"}</p>
            </div>
          </div>

          {/* Card 3: Revenue & Net Margin */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <div>
              <div className="flex items-center justify-between text-xs text-purple-400 font-medium mb-1">
                <span>예상 총매출액</span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white mt-1">₩{yieldCalculations.estimatedGrossRevenue.toLocaleString()}</p>
              <p className="text-xs text-purple-300/80 mt-1">
                kg당 단가: <strong className="font-semibold">{unitPrice.toLocaleString()}원</strong>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">추정 순마진율</span>
                <span className="text-purple-300 font-bold">{yieldCalculations.netMarginPercent}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                순이익: ₩{yieldCalculations.estimatedNetMargin.toLocaleString()} (경비 ₩{yieldCalculations.totalInputCosts.toLocaleString()} 차감)
              </p>
            </div>
          </div>

          {/* Card 4: Actual Harvested Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <div>
              <div className="flex items-center justify-between text-xs text-blue-400 font-medium mb-1">
                <span>실제 누적 수확량 Tracker</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white mt-1">
                {Number(actualHarvestedKg).toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg</span>
              </p>
              <p className="text-xs text-blue-300/80 mt-1">
                잔여 예상 수확량: <strong className="font-bold text-amber-400">{yieldCalculations.remainingYieldKg.toLocaleString()} kg</strong>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-400">목표 수확 진척도</span>
                <span className="text-blue-400 font-bold">{yieldCalculations.estTotalYieldKg > 0 ? Math.round((actualHarvestedKg / yieldCalculations.estTotalYieldKg) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, yieldCalculations.estTotalYieldKg > 0 ? Math.round((actualHarvestedKg / yieldCalculations.estTotalYieldKg) * 100) : 0)}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts & Direct Sales Integration Main Section */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Monthly Distribution & Input Costs */}
          <section className="lg:col-span-2 space-y-6">
            {/* Monthly Yield Projection Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">월별 수확 출하량 시뮬레이션 및 추정 프로필</h2>
                    <p className="text-xs text-slate-400">GDD 발달 곡선 및 품종 특성 기반 월별 생산량 분포</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {activeCrop.cropName} ({activeCrop.varietyName})
                </span>
              </div>

              <div className="space-y-3.5">
                {monthlyHarvestData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">{item.month} 출하</span>
                      <span className="text-slate-400">
                        <strong className="text-emerald-400 font-bold">{item.kg.toLocaleString()} kg</strong> ({item.ratio}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${item.ratio}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Costs & Resource Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" /> 투입 영농자재 및 경영비 내역 요약
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">비료 / 양액 비용</span>
                  <p className="text-base font-extrabold text-slate-200 mt-1">₩{fertilizerCost.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">친환경 방제 / 농약</span>
                  <p className="text-base font-extrabold text-slate-200 mt-1">₩{pesticideCost.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">광열비 / 광원 / 난방비</span>
                  <p className="text-base font-extrabold text-slate-200 mt-1">₩{utilityCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Pre-Order Automation & Direct Sales */}
          <section className="space-y-6">
            {/* E-Commerce Pre-Order Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">직거래 쇼핑몰 사전예약 연동</h3>
                    <p className="text-[11px] text-slate-400">출고 D-7 자동 마케팅 SMS 발송</p>
                  </div>
                </div>
                <button onClick={() => setSmsAutomationEnabled(!smsAutomationEnabled)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${smsAutomationEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                  {smsAutomationEnabled ? "자동 연동 ON" : "OFF"}
                </button>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 mb-4 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>예상 사전 예약 알림일:</span>
                  <strong className="text-emerald-400 font-semibold">{timingCalculations.estHarvestDate !== "미정" ? new Date(new Date(timingCalculations.estHarvestDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : "계산 중"}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>예상 사전예약 확보 물량:</span>
                  <strong className="text-slate-200 font-semibold">{Math.round(yieldCalculations.estMarketableYieldKg * 0.4).toLocaleString()} kg (40%)</strong>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition-all">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>스마트 직거래 모듈 세팅 바로가기</span>
              </button>
            </div>

            {/* Quick Status Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400" /> AI 알고리즘 연산 지표 안내
              </h4>
              <p className="text-slate-400 leading-relaxed">본 대시보드는 실시간 시설 온도 오프셋, 품종별 생육 하한 온도(Base Temp) 및 착과 밀도를 종합 연산하여 수확 시점 및 상품과 생산량을 실시간 추정합니다.</p>
            </div>
          </section>
        </main>
      </div>

      {/* Slide-over Simulator Drawer */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">예측 조건 보정 / 시뮬레이터</h3>
                </div>
                <button onClick={() => setIsSimulatorOpen(false)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Controls */}
              <div className="space-y-4 text-xs">
                {/* Facility Type */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">재배 시설 유형 (온도 보정)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "outdoor", label: "노지 (+0℃)" },
                      { id: "vinyl", label: "비닐하우스 (+2.5℃)" },
                      { id: "glass", label: "유리온실 (+4.0℃)" },
                    ].map((item) => (
                      <button key={item.id} onClick={() => setFacilityType(item.id as any)} className={`p-2 rounded-xl border text-center transition-all ${facilityType === item.id ? "bg-emerald-950 text-emerald-300 border-emerald-500 font-bold" : "bg-slate-950 text-slate-400 border-slate-800"}`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cultivation Method */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">재배 방식 (수확량 가중치)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "soil", label: "토양 재배" },
                      { id: "hydroponic", label: "양액 재배 (+10%)" },
                      { id: "organic", label: "유기농 (-10%)" },
                    ].map((item) => (
                      <button key={item.id} onClick={() => setCultivationMethod(item.id as any)} className={`p-2 rounded-xl border text-center transition-all ${cultivationMethod === item.id ? "bg-emerald-950 text-emerald-300 border-emerald-500 font-bold" : "bg-slate-950 text-slate-400 border-slate-800"}`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">정식일 (Planting Date)</label>
                    <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">개화 확인일 (Flowering)</label>
                    <input type="date" value={floweringDate} onChange={(e) => setFloweringDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                {/* Area Input */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">재배 규모 (평)</label>
                  <input type="number" value={areaValue} onChange={(e) => setAreaValue(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                </div>

                {/* Fruits per plant & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">주당 예상 착과수 (개)</label>
                    <input type="number" value={fruitsPerPlant} onChange={(e) => setFruitsPerPlant(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">평균 과중 (g)</label>
                    <input type="number" value={avgFruitWeightG} onChange={(e) => setAvgFruitWeightG(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                {/* Pest Damage & Unit Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">병해충 예상 손실률 (%)</label>
                    <input type="number" value={pestDamageRate} onChange={(e) => setPestDamageRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">예상 판매 단가 (원/kg)</label>
                    <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                {/* Actual Harvested */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">실제 현재 누적 수확량 (kg)</label>
                  <input type="number" value={actualHarvestedKg} onChange={(e) => setActualHarvestedKg(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button onClick={() => setIsSimulatorOpen(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/50">
                시뮬레이션 적용 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
