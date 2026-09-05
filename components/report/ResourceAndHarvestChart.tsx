"use client";

import React from "react";
import { TrendingUp, PackageCheck, Droplets } from "lucide-react";

export interface HarvestDataItem {
  month: string;
  amountKg: number;
  boxCount: number;
}

export interface ResourceDataItem {
  name: string;
  amount: string;
  cost: number;
  category: string;
}

interface ResourceAndHarvestChartProps {
  harvestData: HarvestDataItem[];
  resourceData: ResourceDataItem[];
}

export default function ResourceAndHarvestChart({ harvestData, resourceData }: ResourceAndHarvestChartProps) {
  const maxHarvest = Math.max(...harvestData.map((d) => d.amountKg), 1);
  const totalResourceCost = resourceData.reduce((acc, cur) => acc + cur.cost, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 📊 월별/작물별 수확량 그래프 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800">월별 수확량 추이</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">단위: kg / 박스</span>
        </div>

        <div className="space-y-3 pt-2">
          {harvestData.map((item, idx) => {
            const percentage = Math.round((item.amountKg / maxHarvest) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.month}</span>
                  <span>
                    {item.amountKg.toLocaleString()} kg ({item.boxCount} 박스)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💧 자원 사용량 추적 & 합산 통계 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">투입 자재 합산 통계</h3>
          </div>
          <span className="text-xs font-bold text-blue-600">총 {totalResourceCost.toLocaleString()} 원</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {resourceData.map((res, idx) => (
            <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{res.category}</span>
              <p className="text-xs font-bold text-slate-700 mt-1">{res.name}</p>
              <p className="text-sm font-extrabold text-slate-900">{res.amount}</p>
              <p className="text-xs font-semibold text-slate-500">{res.cost.toLocaleString()}원</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
