"use client";

import React from "react";
import { PackageCheck, Send } from "lucide-react";
import ResourceAndHarvestChart, { HarvestDataItem, ResourceDataItem } from "./ResourceAndHarvestChart";

// 1. 필요한 모든 속성을 포함하도록 인터페이스 확장
export interface HarvestReadyData {
  cropId?: string;
  cropName?: string;
  harvestQuality?: string;
  expectedYield?: number;
  expectedHarvestDate?: string;
  daysLeft?: number;
  expectedYieldKg?: number;
  expectedRevenue?: number; // 👈 추가
  harvestData?: HarvestDataItem[]; // 👈 차트에 필요한 데이터 타입 추가
  resourceData?: ResourceDataItem[]; // 👈 차트에 필요한 데이터 타입 추가
}

interface HarvestReadyProps {
  data?: HarvestReadyData;
}

export default function HarvestReady({ data }: HarvestReadyProps) {
  // 2. data가 없으면 얼리 리턴 처리 (data/expectedYieldKg 등의 undefined 에러 방지)
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">예상 수확일</p>
          <h4 className="text-2xl font-black text-slate-800 mt-2">{data.expectedHarvestDate ?? "-"}</h4>
          <p className="text-xs text-emerald-600 font-bold mt-1">D-{data.daysLeft ?? 0}일 남음</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">예상 생산량 (kg)</p>
          <h4 className="text-2xl font-black text-slate-800 mt-2">{(data.expectedYieldKg ?? data.expectedYield ?? 0).toLocaleString()} kg</h4>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">예상 매출액</p>
          <h4 className="text-2xl font-black text-emerald-600 mt-2">{(data.expectedRevenue ?? 0).toLocaleString()} 원</h4>
        </div>
      </div>

      {/* 쇼핑몰 사전예약 알림 배너 */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-blue-300">쇼핑몰 사전 예약 연동</span>
          </div>
          <h3 className="text-xl font-bold">출고 7일 전 고객 예약 SMS 발송 예약됨</h3>
          <p className="text-xs text-blue-200">예상 수확일({data.expectedHarvestDate ?? "-"}) 7일 전에 구매자에게 예약 문자가 자동 트리거됩니다.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-md flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span>7일 전 알림 작동 중</span>
        </button>
      </div>

      <ResourceAndHarvestChart harvestData={data.harvestData || []} resourceData={data.resourceData || []} />
    </div>
  );
}
