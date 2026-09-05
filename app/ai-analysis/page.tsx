"use client";

import React, { useState } from "react";
import { Sparkles, BarChart3 } from "lucide-react";
import BeforeHarvest from "@/components/report/BeforeHarvest";
import GrowingStage from "@/components/report/GrowingStage";
import HarvestReady from "@/components/report/HarvestReady";
import SettlementStage from "@/components/report/SettlementStage";
import CropSelector, { CropItem } from "@/components/CropSelector";

type StageType = "BEFORE" | "GROWING" | "READY" | "SETTLEMENT";

export default function AiAnalysisPage() {
  // 농장 작물 목록 state
  const [cropList] = useState<CropItem[]>([
    { id: "crop-1", name: "설향 딸기", area: 1200, plantDate: "2026-08-01" },
    { id: "crop-2", name: "완숙 토마토", area: 800, plantDate: "2026-07-15" },
    { id: "crop-3", name: "샤인머스켓", area: 1500, plantDate: "2026-05-10" },
  ]);

  // 현재 선택된 작물
  const [selectedCrop, setSelectedCrop] = useState<CropItem | undefined>(cropList[0]);

  const [activeStage, setActiveStage] = useState<StageType>("GROWING");

  // 예시 데이터
  const sampleData = {
    cropName: "설향 딸기",
    plantDate: "2026-08-01",
    bloomDate: "2026-09-15",
    expectedHarvestDate: "2026-11-15",
    daysLeft: 75,
    expectedYieldKg: 2400,
    expectedRevenue: 36000000,
    nextTasks: ["야간 온도 8℃ 이상 유지 관리", "적엽 및 적화 작업 1차 시행", "벌통 입식 준비 (수분 관리)"],
    pestWarnings: [
      {
        name: "흰가루병",
        risk: "주의",
        desc: "주간/야간 습도 차이로 발생 위험 증가. 환기 점검 필요.",
      },
    ],
    harvestData: [
      { month: "11월", amountKg: 600, boxCount: 300 },
      { month: "12월", amountKg: 1000, boxCount: 500 },
      { month: "1월", amountKg: 800, boxCount: 400 },
    ],
    resourceData: [
      { name: "양액 A/B", amount: "50L", cost: 120000, category: "비료" },
      { name: "친환경 방제제", amount: "2L", cost: 45000, category: "농약" },
    ],
  };

  const stages: { id: StageType; label: string }[] = [
    { id: "BEFORE", label: "1단계: 재배 준비" },
    { id: "GROWING", label: "2단계: 생육 집중" },
    { id: "READY", label: "3단계: 수확 대기" },
    { id: "SETTLEMENT", label: "4단계: 수확/정산" },
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>AI Smart Farm Analytics</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">AI 진단 및 생육 분석 리포트</h1>
        <p className="text-sm text-slate-500 mt-1">생육 단계별 데이터 분석 기반 예측 및 작업 권장 사항을 제공합니다.</p>
      </div>

      {/* 작물 선택 칩 컴포넌트 배치 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <CropSelector crops={cropList} selectedCropId={selectedCrop?.id} onSelectCrop={(crop) => setSelectedCrop(crop)} />
      </div>

      {/* 선택된 작물 기반 AI 분석 카드 표시 */}
      {selectedCrop ? (
        <div className="bg-emerald-50/50 border border-emerald-200/70 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-emerald-900">[{selectedCrop.name}] 생육 및 AI 리포트</h2>
          <p className="text-sm text-emerald-700 mt-1">
            재배 면적:{selectedCrop.area}평 | 정식일: {selectedCrop.plantDate}
          </p>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">분석할 작물을 상단에서 선택해주세요.</div>
      )}

      {/* 단계 탭 탭바 */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {stages.map((stage) => (
          <button key={stage.id} onClick={() => setActiveStage(stage.id)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeStage === stage.id ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            {stage.label}
          </button>
        ))}
      </div>

      {/* 단계별 컴포넌트 렌더링 */}
      <div>
        {activeStage === "BEFORE" && <BeforeHarvest data={sampleData} />}
        {activeStage === "GROWING" && <GrowingStage data={sampleData} />}
        {activeStage === "READY" && <HarvestReady data={sampleData} />}
        {activeStage === "SETTLEMENT" && <SettlementStage data={sampleData} />}
      </div>
    </div>
  );
}
