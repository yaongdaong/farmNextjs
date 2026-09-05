"use client";

import React from "react";
import { Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import ResourceAndHarvestChart from "./ResourceAndHarvestChart";

export interface PestWarning {
  name: string;
  risk: string;
  desc: string;
}

export interface ResourceData {
  name: string;
  amount: string;
  cost: number;
  category: string;
}

export interface HarvestData {
  month: string;
  amountKg: number;
  boxCount: number;
}

export interface GrowingStageData {
  nextTasks: string[];
  pestWarnings: PestWarning[];
  resourceData: ResourceData[];
  harvestData: HarvestData[];
}

export interface GrowingStageProps {
  data?: GrowingStageData;
}
export default function GrowingStage({ data }:GrowingStageProps ) {
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 다음 주 권장 작업 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg border-b pb-3">
            <Calendar className="w-5 h-5" />
            <h3>다음 주 권장 영농 작업</h3>
          </div>
          <ul className="space-y-3">
            {data.nextTasks.map((task: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-slate-700">{task}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 병충해 위험 알림 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-lg border-b pb-3">
            <AlertTriangle className="w-5 h-5" />
            <h3>기상 맞춤 병충해 예보</h3>
          </div>
          <div className="space-y-3">
            {data.pestWarnings.map((pest: PestWarning, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{pest.name}</span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800">{pest.risk}</span>
                </div>
                <p className="text-xs text-slate-600">{pest.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 자원 사용량 통계 차트 */}
      <ResourceAndHarvestChart harvestData={data.harvestData || []} resourceData={data.resourceData || []} />
    </div>
  );
}
