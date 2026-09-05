"use client";

import React from "react";
import { Sprout, Check, Plus } from "lucide-react";

export interface CropItem {
  id: string;
  name: string;
  area?: number | string;
  plantDate?: string;
  status?: string;
}

interface CropSelectorProps {
  crops: CropItem[];
  selectedCropId?: string;
  onSelectCrop: (crop: CropItem) => void;
  onAddCropClick?: () => void;
}

export default function CropSelector({ crops = [], selectedCropId, onSelectCrop, onAddCropClick }: CropSelectorProps) {
  return (
    <div className="space-y-3">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>분석/기록 대상 작물 선택</span>
        </label>
        <span className="text-xs font-medium text-slate-400">총 {crops.length}개 작물</span>
      </div>

      {/* 칩 목록 영역 */}
      <div className="flex flex-wrap gap-2.5 items-center">
        {crops.length > 0 ? (
          crops.map((crop) => {
            const isSelected = crop.id === selectedCropId;

            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => onSelectCrop(crop)}
                className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border outline-none ${isSelected ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/20" : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"}`}
              >
                {/* 체크 아이콘 또는 도트 */}
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-white text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"}`}>{isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-emerald-500" />}</div>

                {/* 작물명 */}
                <span>{crop.name}</span>

                {/* 부가 정보 (면적 등) */}
                {crop.area && <span className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${isSelected ? "bg-emerald-700/50 text-emerald-100" : "bg-slate-100 text-slate-500 group-hover:bg-emerald-100/60"}`}>{crop.area}평</span>}
              </button>
            );
          })
        ) : (
          <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3">등록된 작물이 없습니다. 먼저 작물을 등록해주세요.</div>
        )}

        {/* 신규 작물 추가 버튼 (옵션) */}
        {onAddCropClick && (
          <button type="button" onClick={onAddCropClick} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 border border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all outline-none">
            <Plus className="w-3.5 h-3.5" />
            <span>작물 추가</span>
          </button>
        )}
      </div>
    </div>
  );
}
