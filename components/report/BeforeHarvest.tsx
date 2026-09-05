"use client";

import React from "react";
import { Calendar, Sprout, Target } from "lucide-react";
// 1. 전달받는 데이터의 타입 정의 (필요한 속성에 맞게 수정)
interface BeforeHarvestProps {
  data?: {
    cropName?: string;
    expectedHarvestDate?: string;
    estimatedYield?: number;
    plantDate: string;
    bloomDate: string;
    expectedYieldKg: number;
    expectedRevenue: number;
  };
}
export default function BeforeHarvest({ data }: BeforeHarvestProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg border-b pb-3">
          <Sprout className="w-5 h-5" />
          <h3>농사 시작전: 재배 설계 및 목표 예측</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800">권장 식재/개화 시기</p>
            <p className="text-base font-bold text-slate-800 mt-1">
              {data?.plantDate} ~ {data?.bloomDate}
            </p>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800">목표 수확량</p>
            <p className="text-base font-bold text-slate-800 mt-1">{data?.expectedYieldKg.toLocaleString()} kg</p>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800">목표 예상 매출</p>
            <p className="text-base font-bold text-slate-800 mt-1">{data?.expectedRevenue.toLocaleString()} 원</p>
          </div>
        </div>
      </div>
    </div>
  );
}
