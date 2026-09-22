import React from "react";
import { Clock } from "lucide-react";
import { YieldCalculations, TimingCalculations } from "../../types/crop";

interface Props {
  calculations: YieldCalculations;
  timing: TimingCalculations;
}

export default function HarvestReadyStageView({ calculations, timing }: Props) {
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
