import React from "react";

export interface SettlementData {
  totalRevenue?: number;
  totalCost?: number;
  netProfit?: number;
  profitMargin?: number;
}

interface SettlementStageProps {
  data?: SettlementData;
}

export default function SettlementStage({ data }: SettlementStageProps) {
  // 1. data가 없을 경우 빈 상태 UI
  if (!data) {
    return <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">정산 데이터가 없습니다.</div>;
  }

  // 2. 안전한 값 할당 및 기본값 0 세팅
  const totalRevenue = data.totalRevenue ?? 0;
  const totalCost = data.totalCost ?? 0;
  const netProfit = data.netProfit ?? 0;
  const profitMargin = data.profitMargin ?? 0;

  // 3. 지출 및 순이익 비율 계산 (매출이 0 이하일 때 분모 예외 처리)
  const costRatio = totalRevenue > 0 ? Math.min(Math.max(Math.round((totalCost / totalRevenue) * 100), 0), 100) : 0;

  const profitRatio = totalRevenue > 0 ? Math.min(Math.max(Math.round((netProfit / totalRevenue) * 100), 0), 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 주요 지표 3종 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 총 매출액 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">총 매출액</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Target 100%</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {totalRevenue.toLocaleString()}
            <span className="text-sm font-normal text-slate-500 ml-1">원</span>
          </p>
        </div>

        {/* 총 지출 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">총 지출 (자재/인건비)</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">비율 {costRatio}%</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {totalCost.toLocaleString()}
            <span className="text-sm font-normal text-slate-500 ml-1">원</span>
          </p>
        </div>

        {/* 순이익 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">순이익</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${netProfit >= 0 ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>수익률 {profitMargin}%</span>
          </div>
          <p className={`text-2xl font-extrabold mt-3 ${netProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
            {netProfit.toLocaleString()}
            <span className="text-sm font-normal text-slate-500 ml-1">원</span>
          </p>
        </div>
      </div>

      {/* 매출 분해 프로그레스 바 영역 */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-bold text-slate-700">매출액 대비 지출 및 순이익 비중</h4>
          <span className="text-xs text-slate-500">기준: 총 매출 {totalRevenue.toLocaleString()}원</span>
        </div>

        {/* 프로그레스 바 그래프 */}
        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
          {/* 지출 비중 */}
          <div style={{ width: `${costRatio}%` }} className="bg-amber-400 transition-all duration-500 ease-out" title={`지출: ${costRatio}%`} />
          {/* 순이익 비중 */}
          <div style={{ width: `${profitRatio}%` }} className="bg-blue-500 transition-all duration-500 ease-out" title={`순이익: ${profitRatio}%`} />
        </div>

        {/* 프로그레스 바 범례 (Legend) */}
        <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
              <span className="text-slate-600 font-medium">지출 ({costRatio}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
              <span className="text-slate-600 font-medium">순이익 ({profitRatio}%)</span>
            </div>
          </div>

          <div className="text-slate-500 font-medium">{costRatio + profitRatio > 100 ? "⚠️ 지출이 매출을 초과했습니다 (손실 발생)" : `여유분 ${Math.max(0, 100 - (costRatio + profitRatio))}%`}</div>
        </div>
      </div>
    </div>
  );
}
