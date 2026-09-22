import React from "react";
import { Sprout } from "lucide-react";
import { YieldCalculations } from "../../types/crop";

interface Props {
  calculations: YieldCalculations;
}

export default function BeforeHarvestStageView({ calculations }: Props) {
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
