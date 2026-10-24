// "use client";

// import React, { useState } from "react";
// import FarmInfo,{CropItem} from "@/components/FarmInfo";
// import { Sprout, MapPin,Calendar,CheckCircle2,Sparkles,ArrowRight,TrendingUp,Clock } from "lucide-react";

// // 농장 작물 상태 타입
// export type CropStatus = "PLANTING_PLAN" | "GROWING" | "HARVESTING";

// export default function FarmInfoPage() {
//   const [totalArea, setTotalArea] = useState("");

//   const [cropList, setCropList] = useState<CropItem[]>([
//     {
//       id: "crop-initial",
//       statusType: "growing",
//       name: "",
//       area: "",
//       plantDate: "",
//       bloomDate: "",
//       analysisResult: "",
//     },
//   ]);

//   return (
//     <div className="space-y-8">
//       {/* 헤더 */}
//       <div>
//         <h1 className="text-2xl font-black text-slate-800 tracking-tight">농장 관리</h1>
//         <p className="text-sm text-slate-500 mt-1">현재 등록된 농장 구역, 기상 정보 및 재배 중인 작물 개요를 확인합니다.</p>
//       </div>

//       {/* 메인 농장 정보 컴포넌트 */}
//       <FarmInfo totalArea={totalArea} setTotalArea={setTotalArea} cropList={cropList} setCropList={setCropList} />

//       {/* 구역별 상태 카드 예시 */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
//           <div className="flex items-center gap-2 text-emerald-600 font-bold">
//             <MapPin className="w-5 h-5" />
//             <span>제 1 하우스 (딸기)</span>
//           </div>
//           <div className="text-xs text-slate-500 space-y-1">
//             <p>면적: 1,200평</p>
//             <p>상태: 생육 진행 중 (정식 45일차)</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
//           <div className="flex items-center gap-2 text-emerald-600 font-bold">
//             <MapPin className="w-5 h-5" />
//           </div>
//           <div className="text-xs text-slate-500 space-y-1">
//             <p>면적: 800평</p>
//             <p>상태: 수확 예정 (D-7)</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-center items-center text-slate-400 border-dashed border-2">
//           <Sprout className="w-8 h-8 text-slate-300" />
//           <span className="text-xs font-semibold">새 농장 구역 추가</span>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect } from "react";
import FarmInfo, { CropItem } from "@/components/FarmInfo";
import { Sprout, MapPin, Calendar, Sparkles, AlertCircle } from "lucide-react";

// AI 분석 리포트 타입 정의
interface AIReport {
  cropName: string;
  category: string;
  accuracy: number;
  accumulatedTemp: number;
  targetTemp: number;
  environmentCorrection: string;
  expectedHarvestDate: string;
  daysRemaining: number;
  shippingBuffer: string;
  expectedYield: number;
  fertilizerSchedule: {
    stage: string;
    date: string;
    type: string;
    amount: string;
  }[];
}

// 확장된 CropItem 타입 (AI 분석 결과 포함)
interface ExtendedCropItem extends CropItem {
  location?: string;
  aiReport?: AIReport;
}

export default function FarmInfoPage() {
  const [totalArea, setTotalArea] = useState("");
  const [cropList, setCropList] = useState<ExtendedCropItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. DB 및 AI 분석 데이터 조회 (useEffect)
  useEffect(() => {
    async function fetchFarmData() {
      try {
        setLoading(true);
        // TODO: 실제 백엔드 API 엔드포인트로 변경하세요 (예: /api/farm 또는 Python FastAPI URL)
        const response = await fetch("/api/farms");
        const data = await response.json();

        if (data) {
          setTotalArea(data.totalArea || "");
          setCropList(data.cropList || []);
        }
      } catch (error) {
        console.error("농장 및 AI 분석 데이터를 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFarmData();
  }, []);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">농장 관리</h1>
        <p className="text-sm text-slate-500 mt-1">현재 등록된 농장 구역, 기상 정보 및 AI 생육 분석 리포트를 확인합니다.</p>
      </div>

      {/* 메인 농장 정보 입력/상태 컴포넌트 */}
      <FarmInfo totalArea={totalArea} setTotalArea={setTotalArea} cropList={cropList} setCropList={setCropList} />

      {/* 등록된 작물 및 AI 생육/환경 분석 리포트 카드 영역 */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">데이터 및 AI 분석 결과를 불러오는 중...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cropList.map((crop) => (
            <div key={crop.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* 기본 정보 헤더 */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                    <MapPin className="w-5 h-5" />
                    <span>
                      작물: {crop.name || "미지정"} ({crop.area || 0}평)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    위치: {crop.location || "경남 김해"} | 생육단계: {crop.statusType || "정식"}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">{crop.statusType}</span>
              </div>

              {/* AI 생육 분석 리포트 섹션 */}
              {crop.aiReport ? (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                  {/* 예측 리포트 헤더 */}
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>🌱 [생육 상태 및 환경 보정 예측 리포트]</span>
                  </div>

                  {/* 리포트 본문 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500">작물/부류:</span> {crop.aiReport.cropName} ({crop.aiReport.category} | 예측 정확도: {crop.aiReport.accuracy}%)
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">적산온도:</span> {crop.aiReport.accumulatedTemp}℃ / 목표 {crop.aiReport.targetTemp}℃
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">환경 보정:</span> {crop.aiReport.environmentCorrection}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">예상 수확량:</span> 약 {crop.aiReport.expectedYield}kg
                    </div>
                    <div className="col-span-1 md:col-span-2 text-emerald-800 font-medium">
                      <span className="font-semibold text-slate-500">최종 예측 수확일:</span> {crop.aiReport.expectedHarvestDate} (약 {crop.aiReport.daysRemaining}일 후)
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 text-amber-900 text-xs">
                      🛡️ <span className="font-semibold">쇼핑몰 권장 발송 버퍼:</span> {crop.aiReport.shippingBuffer}
                    </div>
                  </div>

                  {/* 시비 스케줄 */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      💊 [{crop.name} {crop.area}평 맞춤 비료 Schedule]
                    </p>
                    <ul className="space-y-1 text-xs text-slate-600 pl-2">
                      {crop.aiReport.fertilizerSchedule.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>
                            {item.stage} ({item.date}): {item.type} [{item.amount}]
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">AI 분석 리포트를 생성하는 중이거나 데이터가 없습니다.</div>
              )}
            </div>
          ))}

          {/* 구역 추가 버튼 */}
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col justify-center items-center text-slate-400 hover:border-emerald-400 cursor-pointer transition-colors">
            <Sprout className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-xs font-semibold text-slate-600">새 농장 구역 추가</span>
          </div>
        </div>
      )}
    </div>
  );
}