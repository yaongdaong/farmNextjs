import React from "react";
import { FarmCropItem } from "@/types/farm";

interface FarmCropTableProps {
  crops: FarmCropItem[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export default function FarmCropTable({ crops, isLoading, onRefresh }: FarmCropTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">DB에서 작물 목록을 불러오는 중...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">🌱 등록 밭 & 작물 현황</h2>
        {onRefresh && (
          <button onClick={onRefresh} className="px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium flex items-center gap-1">
            🔄 새로고침
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm">
              <th className="py-3 px-4 font-semibold">작물명</th>
              <th className="py-3 px-4 font-semibold">위치</th>
              <th className="py-3 px-4 font-semibold">평수</th>
              <th className="py-3 px-4 font-semibold">생육상태 (영농일지)</th>
              <th className="py-3 px-4 font-semibold">정식일</th>
              <th className="py-3 px-4 font-semibold">개화일</th>
              <th className="py-3 px-4 font-semibold">현재 적산온도</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {crops.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  등록된 밭/작물 정보가 없습니다.
                </td>
              </tr>
            ) : (
              crops.map((crop) => (
                <tr key={crop.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{crop.cropName}</td>
                  <td className="py-3.5 px-4 text-gray-600">{crop.location}</td>
                  <td className="py-3.5 px-4 font-medium">{crop.areaSize}평</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">📖 {crop.growthStatus || "일지 미작성"}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{crop.plantDate}</td>
                  <td className="py-3.5 px-4 text-gray-500">{crop.bloomDate || "-"}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">{crop.accumulatedTemp.toLocaleString()}℃</span>
                      {crop.targetTemp && <span className="text-xs text-gray-400">/ {crop.targetTemp.toLocaleString()}℃</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
