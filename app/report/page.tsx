"use client";

import React, { useState, useMemo } from "react";
import { Sprout, Calendar, TrendingUp, DollarSign, Settings2, X, Send, BarChart3, PackageCheck, CheckCircle2, Info, Thermometer, Layers, ChevronRight } from "lucide-react";

// ----------------------------------------------------------------------
// 1. Types & Data Structures
// ----------------------------------------------------------------------
type FacilityType = "outdoor" | "vinyl" | "glass";
type CultivationMethod = "hydroponics" | "soil" | "organic";

interface CropInfo {
  id: string;
  cropName: string;
  varietyName: string;
  areaPyeong: number;
  plantDate: string;
  pricePerKg: number; // kg당 단가 (원)
  targetGdd: number;
  baseTemp: number;
  standardDensity: number; // 주/㎡
  standardFruitWeight: number; // g
  standardMarketableRate: number; // %
}

const REGISTERED_CROPS: Record<string, CropInfo> = {
  strawberry: {
    id: "strawberry",
    cropName: "딸기",
    varietyName: "설향 딸기",
    areaPyeong: 1200,
    plantDate: "2026-08-01",
    pricePerKg: 15000,
    targetGdd: 650,
    baseTemp: 5,
    standardDensity: 8.0,
    standardFruitWeight: 25,
    standardMarketableRate: 85,
  },
  tomato: {
    id: "tomato",
    cropName: "토마토",
    varietyName: "완숙 토마토",
    areaPyeong: 800,
    plantDate: "2026-03-15",
    pricePerKg: 6000,
    targetGdd: 1100,
    baseTemp: 10,
    standardDensity: 3.5,
    standardFruitWeight: 180,
    standardMarketableRate: 90,
  },
  grape: {
    id: "grape",
    cropName: "포도",
    varietyName: "샤인머스캣",
    areaPyeong: 1500,
    plantDate: "2026-04-01",
    pricePerKg: 18000,
    targetGdd: 1400,
    baseTemp: 10,
    standardDensity: 1.2,
    standardFruitWeight: 650,
    standardMarketableRate: 92,
  },
};

export default function SmartFarmReportDashboard() {
  // --------------------------------------------------------------------
  // State: 선택된 작물 및 UI 제어
  // --------------------------------------------------------------------
  const [selectedCropId, setSelectedCropId] = useState<string>("strawberry");
  const currentCrop = REGISTERED_CROPS[selectedCropId];

  // 시뮬레이터 슬라이드 패널(Drawer) 열림 상태
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // --------------------------------------------------------------------
  // State: 예측 변수 (시뮬레이터에서 보정 가능한 사용자 입력값)
  // --------------------------------------------------------------------
  const [plantDate, setPlantDate] = useState<string>(currentCrop.plantDate);
  const [facilityType, setFacilityType] = useState<FacilityType>("vinyl");
  const [bloomDate, setBloomDate] = useState<string>("");

  const [cultivationMethod, setCultivationMethod] = useState<CultivationMethod>("hydroponics");
  const [fruitCountPerPlant, setFruitCountPerPlant] = useState<number>(20);
  const [fruitWeight, setFruitWeight] = useState<number>(currentCrop.standardFruitWeight);
  const [damageRate, setDamageRate] = useState<number>(5);

  // 작물 변경 시 입력 변수 자동 리셋
  const handleCropSelect = (id: string) => {
    setSelectedCropId(id);
    const crop = REGISTERED_CROPS[id];
    setPlantDate(crop.plantDate);
    setFruitWeight(crop.standardFruitWeight);
  };

  // --------------------------------------------------------------------
  // ⚙️ 서버 계산 연산 (수확 시기 & 수확량 실시간 산출)
  // --------------------------------------------------------------------
  const prediction = useMemo(() => {
    // [1] 수확 시기 (GDD 적산온도)
    const tempBonus = facilityType === "glass" ? 4.0 : facilityType === "vinyl" ? 2.5 : 0.0;
    const mockDailyAvgTemp = 20.0 + tempBonus;
    const dailyGdd = Math.max(0, mockDailyAvgTemp - currentCrop.baseTemp);

    const today = new Date();
    const startDate = new Date(plantDate);
    const elapsedDays = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const currentAccumulatedGdd = Math.min(currentCrop.targetGdd, Math.round(elapsedDays * dailyGdd));

    let remainingTargetGdd = currentCrop.targetGdd - currentAccumulatedGdd;
    if (bloomDate) {
      const bloomElapsed = Math.floor((today.getTime() - new Date(bloomDate).getTime()) / (1000 * 60 * 60 * 24));
      const postBloomGdd = Math.round(bloomElapsed * dailyGdd);
      remainingTargetGdd = Math.max(0, currentCrop.targetGdd * 0.6 - postBloomGdd);
    }

    const remainingDays = dailyGdd > 0 ? Math.ceil(remainingTargetGdd / dailyGdd) : 0;
    const predictedHarvestDate = new Date();
    predictedHarvestDate.setDate(today.getDate() + remainingDays);

    // [2] 수확량 및 매출액
    const areaM2 = currentCrop.areaPyeong * 3.30579;
    const totalPlants = Math.round(areaM2 * currentCrop.standardDensity);
    const methodWeight = cultivationMethod === "hydroponics" ? 1.1 : cultivationMethod === "soil" ? 1.0 : 0.9;

    const yieldPerPlantKg = (fruitCountPerPlant * fruitWeight) / 1000;
    const potentialYield = totalPlants * yieldPerPlantKg * methodWeight;

    const totalEstimatedYieldKg = Math.round(potentialYield * (1 - damageRate / 100));
    const marketableYieldKg = Math.round(totalEstimatedYieldKg * (currentCrop.standardMarketableRate / 100));
    const estimatedSalesAmount = marketableYieldKg * currentCrop.pricePerKg;

    return {
      predictedHarvestDate: predictedHarvestDate.toISOString().split("T")[0],
      remainingDays,
      currentAccumulatedGdd,
      totalPlants,
      totalEstimatedYieldKg,
      marketableYieldKg,
      estimatedSalesAmount,
      progressPercent: Math.min(100, Math.round((currentAccumulatedGdd / currentCrop.targetGdd) * 100)),
    };
  }, [plantDate, facilityType, bloomDate, cultivationMethod, fruitCountPerPlant, fruitWeight, damageRate, currentCrop]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* ---------------------------------------------------------------- border-slate-800 */}
      {/* TOP HEADER */}
      {/* ---------------------------------------------------------------- */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">AI Smart Farm Analytics</div>
              <h1 className="text-xl font-bold text-white">AI 진단 및 생육 분석 리포트</h1>
            </div>
          </div>

          <button onClick={() => setIsSimulatorOpen(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl transition text-sm shadow-lg shadow-emerald-500/20">
            <Settings2 className="w-4 h-4" />
            <span>예측 조건 보정 / 시뮬레이션</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* 1. 작물 선택 칩 (Chips) */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">분석/기록 대상 작물:</span>
            <div className="flex items-center gap-2">
              {Object.values(REGISTERED_CROPS).map((crop) => {
                const isSelected = crop.id === selectedCropId;
                return (
                  <button key={crop.id} onClick={() => handleCropSelect(crop.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap border ${isSelected ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20" : "bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800"}`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    <span>{crop.varietyName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${isSelected ? "bg-slate-950/20 text-slate-900" : "bg-slate-700 text-slate-300"}`}>{crop.areaPyeong}평</span>
                  </button>
                );
              })}
            </div>
          </div>
          <span className="text-xs text-slate-500 hidden md:block">총 {Object.keys(REGISTERED_CROPS).length}개 작물 등록됨</span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 2. 생육 및 AI 리포트 헤더 & 생육 단계 바 */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">[{currentCrop.varietyName}] 생육 및 AI 리포트</h2>
              <p className="text-xs text-slate-400 mt-1">
                재배 면적: <span className="text-slate-200">{currentCrop.areaPyeong}평</span> | 정식일: <span className="text-slate-200">{plantDate}</span>
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-full border border-slate-700 w-fit">실시간 GDD 및 착과량 예측 보정 적용 중</span>
          </div>

          {/* 생육 단계 프로그레스 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { step: "1단계", name: "재배 준비", active: false },
              { step: "2단계", name: "생육 집중", active: false },
              { step: "3단계", name: "수확 대기", active: true },
              { step: "4단계", name: "수확/정산", active: false },
            ].map((item, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-center transition ${item.active ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-slate-950/40 border-slate-800 text-slate-500"}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider">{item.step}</div>
                <div className="text-sm font-semibold mt-0.5">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 3. 핵심 결과 지표 요약 카드 (3개) */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 카드 1: 예상 수확일 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  예상 수확일
                </span>
                <div className="text-2xl font-black text-white mt-2 tracking-tight">{prediction.predictedHarvestDate}</div>
              </div>
              <button onClick={() => setIsSimulatorOpen(true)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition" title="수확 시기 변수 보정">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">D-{prediction.remainingDays}일 남음</span>
              <span className="text-[11px] text-slate-500">적산온도: {prediction.progressPercent}% 달성</span>
            </div>
          </div>

          {/* 카드 2: 예상 생산량 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  예상 생산량 (kg)
                </span>
                <div className="text-2xl font-black text-white mt-2 tracking-tight">
                  {prediction.totalEstimatedYieldKg.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
                </div>
              </div>
              <button onClick={() => setIsSimulatorOpen(true)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition" title="수확량 변수 보정">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                상품과 가능량: <strong className="text-slate-200">{prediction.marketableYieldKg.toLocaleString()} kg</strong>
              </span>
              <span className="text-[11px] text-slate-500">주수: {prediction.totalPlants.toLocaleString()}주</span>
            </div>
          </div>

          {/* 카드 3: 예상 매출액 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  예상 매출액
                </span>
                <div className="text-2xl font-black text-amber-400 mt-2 tracking-tight">
                  {prediction.estimatedSalesAmount.toLocaleString()} <span className="text-sm font-normal text-slate-400">원</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              기준 단가: <span className="text-slate-200">kg당 {currentCrop.pricePerKg.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 4. 사전 예약 알림 배너 */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-800/60 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <PackageCheck className="w-4 h-4" />
              <span>쇼핑몰 사전 예약 연동</span>
            </div>
            <h3 className="text-lg font-bold text-white">출고 7일 전 고객 예약 SMS 자동 발송 예약됨</h3>
            <p className="text-xs text-slate-300">예상 수확일({prediction.predictedHarvestDate}) 7일 전에 구매자에게 예약 문자가 자동 트리거됩니다.</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap">
            <Send className="w-3.5 h-3.5" />
            <span>7일 전 알림 작동 중</span>
          </button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 5. 월별 수확량 추이 & 투입 자재 합산 통계 */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 월별 수확량 추이 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                월별 수확량 추이
              </h3>
              <span className="text-xs text-slate-500">단위: kg / 박스</span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { month: "11월", amount: Math.round(prediction.totalEstimatedYieldKg * 0.25), target: "300 박스", percent: 65 },
                { month: "12월", amount: Math.round(prediction.totalEstimatedYieldKg * 0.45), target: "500 박스", percent: 90 },
                { month: "1월", amount: Math.round(prediction.totalEstimatedYieldKg * 0.3), target: "400 박스", percent: 75 },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.month}</span>
                    <span className="text-slate-400">
                      {item.amount.toLocaleString()} kg ({item.target})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 투입 자재 합산 통계 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                투입 자재 합산 통계
              </h3>
              <span className="text-xs text-emerald-400 font-semibold">총 165,000 원</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">비료</span>
                <div className="text-sm font-bold text-slate-200">양액 A/B</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">50L</div>
                <div className="text-[11px] text-slate-500">120,000원</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">농약</span>
                <div className="text-sm font-bold text-slate-200">친환경 방제제</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">2L</div>
                <div className="text-[11px] text-slate-500">45,000원</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* ⚙️ [DRAWER] 수확 시기 & 수확량 예측 변수 보정 시뮬레이터 */}
      {/* ========================================================================= */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              {/* 패널 헤더 */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">예측 변수 보정 & 시뮬레이션</h2>
                </div>
                <button onClick={() => setIsSimulatorOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 📅 SECTION 1: 수확 시기 변수 설정 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>1. 수확 시기 예측 변수</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">정식일 (파종일)</label>
                    <input type="date" value={plantDate} onChange={(e) => setPlantDate(e.target.value)} className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">재배 환경 (온도 보정)</label>
                    <select value={facilityType} onChange={(e) => setFacilityType(e.target.value as FacilityType)} className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500">
                      <option value="outdoor">노지 (+0℃)</option>
                      <option value="vinyl">비닐하우스 (+2.5℃)</option>
                      <option value="glass">유리온실 (+4.0℃)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">개화일 (선택 - 보정용)</label>
                    <input type="date" value={bloomDate} onChange={(e) => setBloomDate(e.target.value)} className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              {/* 📦 SECTION 2: 수확량 변수 설정 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>2. 수확량 예측 변수</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">재배 방식 (생육 보정)</label>
                    <select value={cultivationMethod} onChange={(e) => setCultivationMethod(e.target.value as CultivationMethod)} className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500">
                      <option value="hydroponics">수경/양액 (+10%)</option>
                      <option value="soil">토양 재배 (기본)</option>
                      <option value="organic">유기농 재배 (-10%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">주당 평균 착과수 (개)</label>
                    <input type="number" value={fruitCountPerPlant} onChange={(e) => setFruitCountPerPlant(Number(e.target.value))} className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">평균 과실중량 (g)</label>
                    <input type="number" value={fruitWeight} onChange={(e) => setFruitWeight(Number(e.target.value))} className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">병해충/피해 정도 (% 차감)</label>
                    <input type="number" min="0" max="100" value={damageRate} onChange={(e) => setDamageRate(Number(e.target.value))} className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* 패널 푸터 (적용 버튼) */}
            <div className="pt-6 border-t border-slate-800">
              <button onClick={() => setIsSimulatorOpen(false)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>보정값 적용 및 리포트 갱신</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
