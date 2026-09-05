"use client";

import React, { useState } from "react";
import FarmInfo,{CropItem} from "@/components/FarmInfo";
import { Sprout, MapPin } from "lucide-react";

export default function FarmInfoPage() {
  const [totalArea, setTotalArea] = useState("");

  const [cropList, setCropList] = useState<CropItem[]>([
    {
      id: "crop-initial",
      statusType: "growing",
      name: "",
      area: "",
      plantDate: "",
      bloomDate: "",
      analysisResult: "",
    },
  ]);


  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">농장 관리</h1>
        <p className="text-sm text-slate-500 mt-1">현재 등록된 농장 구역, 기상 정보 및 재배 중인 작물 개요를 확인합니다.</p>
      </div>

      {/* 메인 농장 정보 컴포넌트 */}
      <FarmInfo totalArea={totalArea} setTotalArea={setTotalArea} cropList={cropList} setCropList={setCropList} />

      {/* 구역별 상태 카드 예시 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <MapPin className="w-5 h-5" />
            <span>제 1 하우스 (딸기)</span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>면적: 1,200평</p>
            <p>상태: 생육 진행 중 (정식 45일차)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>면적: 800평</p>
            <p>상태: 수확 예정 (D-7)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-center items-center text-slate-400 border-dashed border-2">
          <Sprout className="w-8 h-8 text-slate-300" />
          <span className="text-xs font-semibold">새 농장 구역 추가</span>
        </div>
      </div>
    </div>
  );
}
