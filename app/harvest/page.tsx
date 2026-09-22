"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Sun, Thermometer, TrendingUp, AlertTriangle, Layers, Sprout, CheckCircle2, Info } from "lucide-react";

// 품종별 기본 데이터베이스 (DB Mock Data)
interface VarietyData {
  id: string;
  crop: string;
  name: string;
  targetGdd: number; // 목표 적산온도 (°C)
  baseTemp: number; // 생육 하한온도(°C)
  standardDensity: number; // 표준 재식밀도 (주/㎡)
  standardYieldPerPlant: number; // 주당 표준 수확량 (kg)
  standardFruitWeight: number; // 표준 평균 과중 (g)
  standardMarketableRate: number; // 표준 상품과율 (%)
}

const VARIETY_DB: Record<string, VarietyData> = {
  cherry_tomato: {
    id: "cherry_tomato",
    crop: "토마토",
    name: "대추방울토마토 (스마트찰)",
    targetGdd: 1100,
    baseTemp: 10,
    standardDensity: 3.5,
    standardYieldPerPlant: 3.2,
    standardFruitWeight: 20,
    standardMarketableRate: 90,
  },
  strawberry: {
    id: "strawberry",
    crop: "딸기",
    name: "설향 딸기",
    targetGdd: 650,
    baseTemp: 5,
    standardDensity: 8.0,
    standardYieldPerPlant: 0.5,
    standardFruitWeight: 25,
    standardMarketableRate: 85,
  },
  pepper: {
    id: "pepper",
    crop: "고추",
    name: "PR청양고추",
    targetGdd: 1350,
    baseTemp: 12,
    standardDensity: 3.0,
    standardYieldPerPlant: 1.8,
    standardFruitWeight: 15,
    standardMarketableRate: 88,
  },
};

export default function HarvestPredictionDashboard() {
  // 공통 선택: 작물 및 품종
  const [selectedVarietyId, setSelectedVarietyId] = useState<string>("cherry_tomato");
  const currentVariety = VARIETY_DB[selectedVarietyId];

  // [1. 예상 수확 시기] 사용자 입력 상태
  const [plantDate, setPlantDate] = useState<string>("2026-03-01"); // 정식일
  const [facilityType, setFacilityType] = useState<"outdoor" | "vinyl" | "glass">("vinyl"); // 재배 유형
  const [bloomDate, setBloomDate] = useState<string>(""); // 개화일 (선택)
  const [actualFirstHarvestDate, setActualFirstHarvestDate] = useState<string>(""); // 실제 첫 수확일

  // [2. 예상 수확량] 사용자 입력 상태
  const [areaSizeType, setAreaSizeType] = useState<"area_m2" | "area_pyeong" | "plants">("area_m2");
  const [areaValue, setAreaValue] = useState<number>(330); // 기본 330㎡ (약 100평)
  const [cultivationMethod, setCultivationMethod] = useState<"hydroponics" | "soil" | "organic">("hydroponics"); // 재배 방식
  const [customFruitCount, setCustomFruitCount] = useState<number>(150); // 주당 착과수
  const [customFruitWeight, setCustomFruitWeight] = useState<number>(currentVariety.standardFruitWeight); // 과중(g)
  const [damageRate, setDamageRate] = useState<number>(5); // 병해충/피해 정도 (%)
  const [actualYield, setActualYield] = useState<number>(0); // 실제 수확량 (kg)

  // 품종 변경 시 기본 과중 자동 동기화
  const handleVarietyChange = (id: string) => {
    setSelectedVarietyId(id);
    setCustomFruitWeight(VARIETY_DB[id].standardFruitWeight);
  };

  // [1. 서버 계산 로직] 수확 시기 예측 (적산온도 GDD 기반)
  const timingCalculation = useMemo(() => {
    // 1. 재배 환경에 따른 가산 온도
    const tempBonus = facilityType === "glass" ? 4.0 : facilityType === "vinyl" ? 2.5 : 0.0;

    // 2. 가상의 환경 데이터 (실제 서비스에서는 기상청 API 연동)
    const mockDailyAvgTemp = 21.0 + tempBonus; // 일평균 기온 (시설 가중치 포함)
    const mockRecent7DaysAvg = 22.5 + tempBonus; // 최근 7일 평균 기온

    // 3. 일일 유효 적산 온도 (GDD = 일평균기온 - 생육하한온도)
    const dailyGdd = Math.max(0, mockDailyAvgTemp - currentVariety.baseTemp);

    // 4. 정식일 기준 경과일수
    const today = new Date();
    const startDate = new Date(plantDate);
    const diffTime = Math.max(0, today.getTime() - startDate.getTime());
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 5. 현재 누적 적산온도 (가상 계산)
    const currentAccumulatedGdd = Math.min(currentVariety.targetGdd, Math.round(elapsedDays * dailyGdd));

    // 6. 개화일 입력 여부에 따른 잔여 목표 GDD 재조정 (개화 후 성숙 GDD는 전체의 약 60%)
    let remainingTargetGdd = currentVariety.targetGdd - currentAccumulatedGdd;
    if (bloomDate) {
      const bloom = new Date(bloomDate);
      const bloomElapsed = Math.floor((today.getTime() - bloom.getTime()) / (1000 * 60 * 60 * 24));
      const postBloomGdd = Math.round(bloomElapsed * dailyGdd);
      const targetPostBloomGdd = currentVariety.targetGdd * 0.6;
      remainingTargetGdd = Math.max(0, targetPostBloomGdd - postBloomGdd);
    }

    // 7. 남은 일수(D-Day) 및 예상 수확일 계산
    const remainingDays = dailyGdd > 0 ? Math.ceil(remainingTargetGdd / dailyGdd) : 999;
    const predictedHarvestDate = new Date();
    predictedHarvestDate.setDate(today.getDate() + remainingDays);

    const progressPercent = Math.min(100, Math.round((currentAccumulatedGdd / currentVariety.targetGdd) * 100));

    return {
      mockDailyAvgTemp,
      mockRecent7DaysAvg,
      dailyGdd,
      elapsedDays,
      currentAccumulatedGdd,
      remainingDays,
      predictedHarvestDate: predictedHarvestDate.toISOString().split("T")[0],
      progressPercent,
    };
  }, [plantDate, facilityType, bloomDate, currentVariety]);

  // [2. 서버 계산 로직] 수확량 예측 (재식 밀도 & 손실율 기반)
  const yieldCalculation = useMemo(() => {
    // 1. 재배 규모 -> 총 주수(Plant Count) 산출
    let totalPlants = 0;
    if (areaSizeType === "plants") {
      totalPlants = areaValue;
    } else if (areaSizeType === "area_pyeong") {
      const areaM2 = areaValue * 3.30579;
      totalPlants = Math.round(areaM2 * currentVariety.standardDensity);
    } else {
      totalPlants = Math.round(areaValue * currentVariety.standardDensity);
    }

    // 2. 비배 관리(재배 방식) 생육 적합도 지수 가중치
    const methodWeight = cultivationMethod === "hydroponics" ? 1.1 : cultivationMethod === "soil" ? 1.0 : 0.9;

    // 3. 주당 수량 산출 (kg/주) = (착과수 × 과중 (g)) /1000
    const yieldPerPlantKg = (customFruitCount * customFruitWeight) / 1000;

    // 4. 잠재 총 수확량 (kg)
    const potentialTotalYield = totalPlants * yieldPerPlantKg * methodWeight;

    // 5. 위험/감수 요인 반영 (피해율 차감) -> 예상 총 수확량
    const estimatedTotalYield = Math.round(potentialTotalYield * (1 - damageRate / 100));

    // 6. 상품과율 적용 -> 예상 판매 가능량
    const marketableRate = currentVariety.standardMarketableRate;
    const estimatedMarketableYield = Math.round(estimatedTotalYield * (marketableRate / 100));

    // 7. 예상 범위 (±10% 오차 범위)
    const yieldMin = Math.round(estimatedTotalYield * 0.9);
    const yieldMax = Math.round(estimatedTotalYield * 1.1);

    // 8. 잔여 수확량 (실제 수확 기록 차감)
    const remainingYield = Math.max(0, estimatedTotalYield - actualYield);

    return {
      totalPlants,
      estimatedTotalYield,
      marketableRate,
      estimatedMarketableYield,
      yieldMin,
      yieldMax,
      remainingYield,
    };
  }, [areaSizeType, areaValue, cultivationMethod, customFruitCount, customFruitWeight, damageRate, actualYield, currentVariety]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 상단 헤더 & 품종 선택 */}
        <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
              <Sprout className="w-5 h-5" />
              <span>Smart Farm Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">수확 시기 & 수확량 예측 대시보드</h1>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <label className="text-xs font-medium text-slate-600 pl-2">품종 선택:</label>
            <select value={selectedVarietyId} onChange={(e) => handleVarietyChange(e.target.value)} className="bg-white text-slate-800 text-sm font-semibold py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {Object.values(VARIETY_DB).map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.crop}]{v.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* 메인 2열 그리드 (좌: 예상 수확시기 / 우: 예상 수확량) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: 예상 수확 시기 예측 */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {/* 섹션 타이틀 */}
              <div className="bg-emerald-50/80 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-800 text-lg">1. 예상 수확 시기 예측</h2>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">GDD 적산온도 모델</span>
              </div>

              <div className="p-6 space-y-6">
                {/* 1-1. 사용자 입력 요소 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <span>사용자 입력값</span>
                    <span className="text-emerald-500">●</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 정식일 (중요도 1) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        정식일 (파종일) <span className="text-red-500">*</span>
                      </label>
                      <input type="date" value={plantDate} onChange={(e) => setPlantDate(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    </div>

                    {/* 재배 환경 (중요도 4) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">재배 환경 (온도 보정)</label>
                      <select value={facilityType} onChange={(e) => setFacilityType(e.target.value as "outdoor" | "vinyl" | "glass")} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white">
                        <option value="outdoor">노지 (+0℃)</option>
                        <option value="vinyl">비닐하우스 (+2.5℃)</option>
                        <option value="glass">유리온실 (+4.0℃)</option>
                      </select>
                    </div>

                    {/* 개화일 (중요도 5) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">현장 개화일 (선택 - 보정용)</label>
                      <input type="date" value={bloomDate} onChange={(e) => setBloomDate(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    </div>

                    {/* 실제 첫 수확일 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">실제 첫 수확일 (기록/학습용)</label>
                      <input type="date" value={actualFirstHarvestDate} onChange={(e) => setActualFirstHarvestDate(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50" />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 1-2. 서버 계산 및 실시간 분석 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <span>서버 연산 & 기상 분석 데이터</span>
                    <span className="text-blue-500">●</span>
                  </h3>

                  {/* 기온 지표 3개 */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                    <div>
                      <div className="text-[11px] text-slate-500">일평균기온</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{timingCalculation.mockDailyAvgTemp.toFixed(1)}℃</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">최근 7일 평균</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{timingCalculation.mockRecent7DaysAvg.toFixed(1)}℃</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">경과일수</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{timingCalculation.elapsedDays}일 차</div>
                    </div>
                  </div>

                  {/* 적산온도(GDD) Progress Bar */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">누적 유효 적산온도 (GDD)</span>
                      <span className="text-emerald-600">
                        {timingCalculation.currentAccumulatedGdd} / {currentVariety.targetGdd}℃
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${timingCalculation.progressPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>생육하한: {currentVariety.baseTemp}℃</span>
                      <span>달성률: {timingCalculation.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1-3. 최종 결과 박스 */}
            <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-b-2xl mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-100 font-medium">최종 예상 수확일</div>
                  <div className="text-2xl font-black mt-1 tracking-tight">{timingCalculation.predictedHarvestDate}</div>
                </div>
                <div className="text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="text-[11px] text-emerald-100">수확까지 남은 시간</div>
                  <div className="text-xl font-bold text-amber-300">D-{timingCalculation.remainingDays}일</div>
                </div>{" "}
              </div>
            </div>
          </section>

          {/* SECTION 2: 예상 수확량 예측  */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {/* 섹션 타이틀 */}
              <div className="bg-blue-50/80 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-slate-800 text-lg">2. 예상 수확량 예측</h2>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">수량 구성 요소 모델</span>
              </div>

              <div className="p-6 space-y-6">
                {/* 2-1. 사용자 입력 요소 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex- items-center-gap-1">
                    <span>사용자 입력값</span>
                    <span className="text-blue-500">●</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 재배 규모 (중요도 1) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          재배 규모 <span className="text-red-500">*</span>
                        </label>
                        <select value={areaSizeType} onChange={(e) => setAreaSizeType(e.target.value as "area_m2" | "area_pyeong" | "plants")} className="text-[11px] text-blue-600 font-medium bg-transparent border-none p-0 focus:outline-none">
                          <option value="area_m2">면적 (㎡)</option>
                          <option value="area_pyeong">면적 (평)</option>
                          <option value="plants">총 주수 (포기)</option>
                        </select>
                      </div>
                      <input type="number" value={areaValue} onChange={(e) => setAreaValue(Number(e.target.value))} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    {/* 비배 관리 / 재배 방식 (중요도 4) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">재배 방식 (생육 보정)</label>
                      <select value={cultivationMethod} onChange={(e) => setCultivationMethod(e.target.value as "hydroponics" | "soil" | "organic")} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                        <option value="hydroponics">수경/양액 재배 (보정 +10%)</option>
                        <option value="soil">일반 토양 재배 (기본)</option>
                        <option value="organic">유기농 재배 (보정 -10%)</option>
                      </select>
                    </div>

                    {/* 주당 착과수 (중요도 3) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">주당 평균 착과수 (개)</label>
                      <input type="number" value={customFruitCount} onChange={(e) => setCustomFruitCount(Number(e.target.value))} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    {/* 평균 과중 (중요도 3) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">평균 과실 중량 (g)</label>
                      <input type="number" value={customFruitWeight} onChange={(e) => setCustomFruitWeight(Number(e.target.value))} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    {/* 병해충 피해 정도 (중요도 5) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">병해충/피해 정도 (% 차감)</label>
                      <input type="number" min="0" max="100" value={damageRate} onChange={(e) => setDamageRate(Number(e.target.value))} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    {/* 실제 수확량 (수확 진행 중) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">누적 실제 수확량 (kg - 기록)</label>
                      <input type="number" value={actualYield} onChange={(e) => setActualYield(Number(e.target.value))} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50" />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2-2. 서버 계산 산출 데이터 */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <span>서버 분석 & 세부 수량 산출</span>
                    <span className="text-emerald-500">●</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">계산된 총 주수</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{yieldCalculation.totalPlants.toLocaleString()} 주</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">표준 상품과율</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{yieldCalculation.marketableRate}%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                      <div className="text-[11px] text-slate-500">남은 예상 수확량</div>
                      <div className="text-sm font-bold text-blue-600 mt-0.5">{yieldCalculation.remainingYield.toLocaleString()}kg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-3. 최종 결과 박스 */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-b-2xl mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-300 font-medium">예상 총 수확량</div>
                  <div className="text-3xl font-black mt-1 text-white">
                    {yieldCalculation.estimatedTotalYield.toLocaleString()}
                    <span className="text-lg font-normal text-slate-300">kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-300 font-medium">예상 판매 가능량</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">약 {yieldCalculation.estimatedMarketableYield.toLocaleString()} kg</div>
                </div>
              </div>

              {/* 오차 범위 바 */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  예상 수확량 범위 (±10%):
                </span>
                <span className="font-semibold text-slate-200">
                  {yieldCalculation.yieldMin.toLocaleString()} kg ~ {yieldCalculation.yieldMax.toLocaleString()} kg
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
