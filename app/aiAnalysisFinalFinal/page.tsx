"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, Sliders, Sprout, Clock, BarChart3, Building2, BellRing, ShoppingCart, Info } from "lucide-react";

import { StageType, CropVariety } from "@//types/crop";
import { CROP_VARIETIES } from "@//constants/cropVarieties";
import { calculateGDDTiming, calculateYieldAndFinancials } from "@/utils/cropCalculations";

import BeforeHarvestStageView from "@//components/stages/BeforeHarvestStageView";
import GrowingStageView from "@//components/stages/GrowingStageView";
import HarvestReadyStageView from "@//components/stages/HarvestReadyStageView";
import SettlementStageView from "@//components/stages/SettlementStageView";
import MetricCards from "@//components/MetricCards";
import SimulatorDrawer from "@//components/SimulatorDrawer";

export default function App() {
  const [selectedCropId, setSelectedCropId] = useState<string>("strawberry");
  const [activeStage, setActiveStage] = useState<StageType>("GROWING");
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [smsAutomationEnabled, setSmsAutomationEnabled] = useState<boolean>(true);

  // Facility & Cultivation
  const [facilityType, setFacilityType] = useState<"outdoor" | "vinyl" | "glass">("vinyl");
  const [cultivationMethod, setCultivationMethod] = useState<"soil" | "hydroponic" | "organic">("hydroponic");

  // Dates
  const [plantingDate, setPlantingDate] = useState<string>("");
  const [floweringDate, setFloweringDate] = useState<string>("");

  // Params
  const [areaMode, setAreaMode] = useState<"pyeong" | "m2" | "plants">("pyeong");
  const [areaValue, setAreaValue] = useState<number>(300);
  const [plantCountInput, setPlantCountInput] = useState<number>(7900);
  const [fruitsPerPlant, setFruitsPerPlant] = useState<number>(22);
  const [avgFruitWeightG, setAvgFruitWeightG] = useState<number>(24);
  const [pestDamageRate, setPestDamageRate] = useState<number>(4);
  const [unitPrice, setUnitPrice] = useState<number>(14500);
  const [actualHarvestedKg, setActualHarvestedKg] = useState<number>(350);

  // Costs
  const [fertilizerCost, setFertilizerCost] = useState<number>(1200000);
  const [pesticideCost, setPesticideCost] = useState<number>(450000);
  const [utilityCost, setUtilityCost] = useState<number>(950000);

  const activeCrop = useMemo(() => {
    return CROP_VARIETIES.find((c) => c.id === selectedCropId) || CROP_VARIETIES[0];
  }, [selectedCropId]);

  // 1. AreaMode 타입 정의 (만약 기존에 정의된 타입이 있다면 import해서 사용하세요)
  type AreaMode = "pyeong" | "m2" | "plants";
type CropPreset = {
  plantingDate: string;
  floweringDate: string;
  unitPrice: number;
  fruitsPerPlant: number;
  avgFruitWeightG: number;
  areaValue: number;
  areaMode: AreaMode;
  plantCountInput: number;
  fertilizerCost: number;
  pesticideCost: number;
  utilityCost: number;
  actualHarvestedKg: number;
};
  // 2. getCropPreset 함수의 반환 타입 또는 baseData에 타입 지정
  const getCropPreset = (crop: (typeof CROP_VARIETIES)[number]):CropPreset => {
    const baseData: CropPreset= {
      plantingDate: crop.defaultPlantingDate,
      floweringDate: crop.defaultFloweringDate,
      unitPrice: crop.unitPricePerKg,
      fruitsPerPlant: crop.standardFruitPerPlant,
      avgFruitWeightG: crop.standardFruitWeight,
      areaValue: crop.defaultArea,
      areaMode: "pyeong", // 이제 에러 없이 'AreaMode'로 인식됩니다.
      plantCountInput: 0,
      fertilizerCost: 0,
      pesticideCost: 0,
      utilityCost: 0,
      actualHarvestedKg: 0,
    };

    switch (crop.id) {
      case "strawberry":
        return {
          ...baseData,
          areaMode: "pyeong",
          plantCountInput: 7900,
          fertilizerCost: 1200000,
          pesticideCost: 450000,
          utilityCost: 950000,
          actualHarvestedKg: 350,
        };
      case "cherry-tomato":
        return {
          ...baseData,
          areaMode: "pyeong",
          plantCountInput: 3470,
          fertilizerCost: 980000,
          pesticideCost: 380000,
          utilityCost: 720000,
          actualHarvestedKg: 210,
        };
      case "pepper":
        return {
          ...baseData,
          areaMode: "pyeong",
          plantCountInput: 2970,
          fertilizerCost: 850000,
          pesticideCost: 520000,
          utilityCost: 450000,
          actualHarvestedKg: 120,
        };
      case "grape":
        return {
          ...baseData,
          areaMode: "pyeong",
          plantCountInput: 250,
          fertilizerCost: 1850000,
          pesticideCost: 650000,
          utilityCost: 600000,
          actualHarvestedKg: 0,
        };
      default:
        return baseData;
    }
  };

  // 2. 작물이 변경될 때 실행시킬 변경 핸들러
  const handleCropChange = (newCrop: (typeof CROP_VARIETIES)[number]) => {
    setSelectedCropId(newCrop.id); // 또는 setActiveCrop(newCrop)

    const preset = getCropPreset(newCrop);

    setPlantingDate(preset.plantingDate);
    setFloweringDate(preset.floweringDate);
    setUnitPrice(preset.unitPrice);
    setFruitsPerPlant(preset.fruitsPerPlant);
    setAvgFruitWeightG(preset.avgFruitWeightG);
    setAreaValue(preset.areaValue);
    if ("areaMode" in preset && preset.areaMode) setAreaMode(preset.areaMode);
    if ("plantCountInput" in preset && preset.plantCountInput) setPlantCountInput(preset.plantCountInput);
    if ("fertilizerCost" in preset && preset.fertilizerCost) setFertilizerCost(preset.fertilizerCost);
    if ("pesticideCost" in preset && preset.pesticideCost) setPesticideCost(preset.pesticideCost);
    if ("utilityCost" in preset && preset.utilityCost) setUtilityCost(preset.utilityCost);
    if ("actualHarvestedKg" in preset && preset.actualHarvestedKg !== undefined) {
      setActualHarvestedKg(preset.actualHarvestedKg);
    }
  };

  const timingCalculations = useMemo(() => {
    return calculateGDDTiming(plantingDate, floweringDate, facilityType, activeCrop);
  }, [plantingDate, floweringDate, facilityType, activeCrop]);

  const yieldCalculations = useMemo(() => {
    return calculateYieldAndFinancials({
      areaMode,
      areaValue,
      plantCountInput,
      fruitsPerPlant,
      avgFruitWeightG,
      pestDamageRate,
      cultivationMethod,
      actualHarvestedKg,
      unitPrice,
      fertilizerCost,
      pesticideCost,
      utilityCost,
      activeCrop,
    });
  }, [areaMode, areaValue, plantCountInput, fruitsPerPlant, avgFruitWeightG, pestDamageRate, cultivationMethod, actualHarvestedKg, unitPrice, fertilizerCost, pesticideCost, utilityCost, activeCrop]);

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
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

            <button onClick={() => setIsSimulatorOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/20 transition-all transform active:scale-95">
              <Sliders className="w-4 h-4" />
              <span>예측 조건 보정 / 시뮬레이션</span>
            </button>
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
                  onClick={() => handleCropChange(crop)}
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

        {/* Active Stage Detail View */}
        <section>
          {activeStage === "BEFORE" && <BeforeHarvestStageView calculations={yieldCalculations} />}
          {activeStage === "GROWING" && <GrowingStageView calculations={yieldCalculations} crop={activeCrop} />}
          {activeStage === "READY" && <HarvestReadyStageView calculations={yieldCalculations} timing={timingCalculations} />}
          {activeStage === "SETTLEMENT" && <SettlementStageView calculations={yieldCalculations} />}
        </section>

        {/* Metric Cards */}
        <MetricCards timingCalculations={timingCalculations} yieldCalculations={yieldCalculations} unitPrice={unitPrice} actualHarvestedKg={actualHarvestedKg} cultivationMethod={cultivationMethod} />

        {/* Bottom Section */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
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

          <section className="space-y-6">
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

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400" /> AI 알고리즘 연산 지표 안내
              </h4>
              <p className="text-slate-400 leading-relaxed">본 대시보드는 실시간 시설 온도 오프셋, 품종별 생육 하한 온도(Base Temp) 및 착과 밀도를 종합 연산하여 수확 시점 및 상품과 생산량을 실시간 추정합니다.</p>
            </div>
          </section>
        </main>
      </div>

      {/* Simulator Drawer Component */}
      <SimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        facilityType={facilityType}
        setFacilityType={setFacilityType}
        cultivationMethod={cultivationMethod}
        setCultivationMethod={setCultivationMethod}
        plantingDate={plantingDate}
        setPlantingDate={setPlantingDate}
        floweringDate={floweringDate}
        setFloweringDate={setFloweringDate}
        areaValue={areaValue}
        setAreaValue={setAreaValue}
        fruitsPerPlant={fruitsPerPlant}
        setFruitsPerPlant={setFruitsPerPlant}
        avgFruitWeightG={avgFruitWeightG}
        setAvgFruitWeightG={setAvgFruitWeightG}
        pestDamageRate={pestDamageRate}
        setPestDamageRate={setPestDamageRate}
        unitPrice={unitPrice}
        setUnitPrice={setUnitPrice}
        actualHarvestedKg={actualHarvestedKg}
        setActualHarvestedKg={setActualHarvestedKg}
      />
    </div>
  );
}
