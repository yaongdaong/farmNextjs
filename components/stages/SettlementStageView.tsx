import React from "react";
import { DollarSign } from "lucide-react";
import { YieldCalculations } from "../../types/crop";

interface Props {
  calculations: YieldCalculations;
}

export default function SettlementStageView({ calculations }: Props) {
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
