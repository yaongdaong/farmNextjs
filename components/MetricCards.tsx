import React from "react";
import { Calendar, Scale, DollarSign, TrendingUp } from "lucide-react";
import { TimingCalculations, YieldCalculations } from "../types/crop";

interface Props {
  timingCalculations: TimingCalculations;
  yieldCalculations: YieldCalculations;
  unitPrice: number;
  actualHarvestedKg: number;
  cultivationMethod: "soil" | "hydroponic" | "organic";
}

export default function MetricCards({ timingCalculations, yieldCalculations, unitPrice, actualHarvestedKg, cultivationMethod }: Props) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Harvest Target & D-Day */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div>
          <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
            <span>예상 수확일 (Target)</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{timingCalculations.estHarvestDate}</p>
          <p className="text-xs text-amber-300/80 mt-1 font-semibold">
            D-{timingCalculations.daysRemaining}일 남음 <span className="text-slate-400 font-normal">({timingCalculations.daysElapsed}일차)</span>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-400">GDD 달성률</span>
            <span className="text-amber-400 font-bold">{timingCalculations.progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${timingCalculations.progressPercent}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
            <span>
              누적 {timingCalculations.currentGDD} / {timingCalculations.targetGDD} ℃·일
            </span>
            <span>+{timingCalculations.dailyRate}℃/일</span>
          </p>
        </div>
      </div>

      {/* Card 2: Expected Total Yield */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div>
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
            <span>예상 총수확량</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {yieldCalculations.estTotalYieldKg.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg</span>
          </p>
          <p className="text-xs text-emerald-300/80 mt-1">
            상품과율 <strong className="font-bold">{yieldCalculations.gradeARate}%</strong> 적용: {yieldCalculations.estMarketableYieldKg.toLocaleString()} kg
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>신뢰 범위 (±10%)</span>
            <span className="text-emerald-400 font-semibold">
              {yieldCalculations.minYield.toLocaleString()} ~ {yieldCalculations.maxYield.toLocaleString()} kg
            </span>
          </div>
          <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-[10%] right-[10%] bg-emerald-500/40 rounded-full"></div>
            <div className="absolute inset-y-0 left-[50%] w-1 bg-emerald-400"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 truncate">{cultivationMethod === "hydroponic" ? "양액재배 가중치 (+10%) 반영" : cultivationMethod === "organic" ? "유기농 가중치 (-10%) 반영" : "토양재배 기준"}</p>
        </div>
      </div>

      {/* Card 3: Revenue & Net Margin */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div>
          <div className="flex items-center justify-between text-xs text-purple-400 font-medium mb-1">
            <span>예상 총매출액</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">₩{yieldCalculations.estimatedGrossRevenue.toLocaleString()}</p>
          <p className="text-xs text-purple-300/80 mt-1">
            kg당 단가: <strong className="font-semibold">{unitPrice.toLocaleString()}원</strong>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">추정 순마진율</span>
            <span className="text-purple-300 font-bold">{yieldCalculations.netMarginPercent}%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            순이익: ₩{yieldCalculations.estimatedNetMargin.toLocaleString()} (경비 ₩{yieldCalculations.totalInputCosts.toLocaleString()} 차감)
          </p>
        </div>
      </div>

      {/* Card 4: Actual Harvested Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div>
          <div className="flex items-center justify-between text-xs text-blue-400 font-medium mb-1">
            <span>실제 누적 수확량 Tracker</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {Number(actualHarvestedKg).toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg</span>
          </p>
          <p className="text-xs text-blue-300/80 mt-1">
            잔여 예상 수확량: <strong className="font-bold text-amber-400">{yieldCalculations.remainingYieldKg.toLocaleString()} kg</strong>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-400">목표 수확 진척도</span>
            <span className="text-blue-400 font-bold">{yieldCalculations.estTotalYieldKg > 0 ? Math.round((actualHarvestedKg / yieldCalculations.estTotalYieldKg) * 100) : 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, yieldCalculations.estTotalYieldKg > 0 ? Math.round((actualHarvestedKg / yieldCalculations.estTotalYieldKg) * 100) : 0)}%` }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
