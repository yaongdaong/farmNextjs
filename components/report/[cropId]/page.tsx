"use client";

import React, { useState } from "react";
import { Sprout, Thermometer, Droplets } from "lucide-react";
import BeforeHarvest from "@/components/report/BeforeHarvest";
import GrowingStage from "@/components/report/GrowingStage";
import HarvestReady from "@/components/report/HarvestReady";
import SettlementStage from "@/components/report/SettlementStage";

// Mock 데이터
const mockData = {
  cropName: "화순 토마토",
  location: "전라남도 화순군",
  area: 200,
  weather: { temp: 25.5, humidity: 60, condition: "맑음" },
  before: { plantDate: "2026-05-10", bloomDate: "2026-06-20", expectedYieldKg: 3500, expectedRevenue: 14700000 },
  growing: {
    nextTasks: ["영양 생장기 2차 웃거름(N-K 비료) 관수 시비", "하엽 제거 및 곁순 지르기", "온도 상승 대비 하우스 환기창 점검"],
    pestWarnings: [
      { name: "잎곰팡이병", risk: "주의", desc: "현재 기온(25.5°C) 및 습도(60%) 조건으로 발생 가능성 높음" },
      { name: "담배가루이", risk: "경고", desc: "주변 농가 발생 보고. 옐로우 트랩 설치 권장" },
    ],
    resourceData: [
      { name: "복합비료", amount: "50 kg", cost: 85000, category: "비료" },
      { name: "유기농 농약", amount: "2 L", cost: 45000, category: "농약" },
      { name: "관수(용수)", amount: "1,200 L", cost: 12000, category: "용수" },
    ],
    harvestData: [
      { month: "6월", amountKg: 400, boxCount: 40 },
      { month: "7월", amountKg: 1200, boxCount: 120 },
      { month: "8월", amountKg: 1500, boxCount: 150 },
    ],
  },
  harvestReady: {
    expectedHarvestDate: "2026-09-15",
    daysLeft: 15,
    expectedYieldKg: 3500,
    expectedRevenue: 14700000,
    resourceData: [
      { name: "복합비료", amount: "50 kg", cost: 85000, category: "비료" },
      { name: "유기농 농약", amount: "2 L", cost: 45000, category: "농약" },
    ],
    harvestData: [
      { month: "6월", amountKg: 400, boxCount: 40 },
      { month: "7월", amountKg: 1200, boxCount: 120 },
      { month: "8월", amountKg: 1500, boxCount: 150 },
    ],
  },
  settlement: { totalRevenue: 15200000, totalCost: 3400000, netProfit: 11800000, profitMargin: 77.6 },
};

export default function FarmAiReportPage() {
  const [tab, setTab] = useState<"BEFORE" | "GROWING" | "HARVEST" | "SETTLEMENT">("GROWING");

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 상단 헤더 & 상태 스위처 탭 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-1">
              <Sprout className="w-4 h-4" />
              <span>AI Smart Farm Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{mockData.cropName} 영농 리포트</h1>
            <p className="text-slate-500 text-sm mt-1">
              📍 {mockData.location} · {mockData.area}평
            </p>
          </div>

          {/* 4단계 탭 메뉴 */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button onClick={() => setTab("BEFORE")} className={`px-3 py-2 rounded-lg transition-all ${tab === "BEFORE" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600"}`}>
              1. 농사전
            </button>
            <button onClick={() => setTab("GROWING")} className={`px-3 py-2 rounded-lg transition-all ${tab === "GROWING" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600"}`}>
              2. 농사중
            </button>
            <button onClick={() => setTab("HARVEST")} className={`px-3 py-2 rounded-lg transition-all ${tab === "HARVEST" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600"}`}>
              3. 수확/출하
            </button>
            <button onClick={() => setTab("SETTLEMENT")} className={`px-3 py-2 rounded-lg transition-all ${tab === "SETTLEMENT" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600"}`}>
              4. 정산 완료
            </button>
          </div>
        </div>

        {/* 기상 카드 위젯 */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">실시간 기상</span>
            <h3 className="text-lg font-bold mt-1">{mockData.location} 날씨 정보</h3>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold">{mockData.weather.temp}°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-bold">{mockData.weather.humidity}%</span>
            </div>
          </div>
        </div>

        {/* 선택한 탭에 따라 컴포넌트 분리 렌더링 */}
        {tab === "BEFORE" && <BeforeHarvest data={mockData.before} />}
        {tab === "GROWING" && <GrowingStage data={mockData.growing} />}
        {tab === "HARVEST" && <HarvestReady data={mockData.harvestReady} />}
        {tab === "SETTLEMENT" && <SettlementStage data={mockData.settlement} />}
      </div>
    </div>
  );
}
