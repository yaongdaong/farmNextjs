"use client";

import React, { useState, useEffect } from "react";
import { Plus, Calendar, X } from "lucide-react";
import { getFarmLogs, getCropsForSelect, createFarmLog } from "@/app/actions/farmLog";

interface LogItem {
  id: string;
  date: string;
  cropName: string;
  workType: string;
  content: string;
  author: string;
}

interface CropSelect {
  id: number;
  name: string;
}

export default function FarmLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [crops, setCrops] = useState<CropSelect[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // DB엥서 일지 목록 및 작물 데이터 로드
  const loadData = async () => {
    try {
      const [fetchedLogs, fetchedCrops] = await Promise.all([getFarmLogs(), getCropsForSelect()]);
      setLogs(fetchedLogs);
      setCrops(fetchedCrops);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const [fetchedLogs, fetchedCrops] = await Promise.all([getFarmLogs(), getCropsForSelect()]);

      if (isMounted) {
        setLogs(fetchedLogs);
        setCrops(fetchedCrops);
        setIsLoading(false);
      }
    }
    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 폼 제출 (DB 저장)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createFarmLog(formData);

    if (res.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 및 일지 작성 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">영농일지</h1>
          <p className="text-sm text-slate-500 mt-1">일자별 농작업, 자원 투입 및 생육 기록을 작성하고 관리합니다.</p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          <span>새 일지 작성</span>
        </button>
      </div>

      {/* 일지 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 font-medium">로딩 중 ...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">등록된 영농일지가 없습니다. 새 일지를 작성해 보세요!</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-emerald-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-100">{log.cropName}</span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg">{log.workType}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{log.date}</span>
                </div>
              </div>

              <p className="text-slate-700 text-sm font-medium leading-relaxed">{log.content}</p>

              <div className="text-xs text-slate-400 text-right">작성자: {log.author}</div>
            </div>
          ))
        )}
      </div>

      {/* 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flext items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">새 영농일지 작성</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">작물 선택</label>
              <select name="cropId" required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focud:outline-none focue:border-emerald-500">
                <option value="">작물을 선택하세요</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">작업 일자</label>
                <input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} required className="w-full border border-slatae-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">작업 유형</label>
                <input type="text" name="workType" placeholder="예: 관수/영양제,병충해 방제" required className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">작업 내용 (메모)</label>
              <textarea name="memo" rows={4} required placeholder="오늘 진행한 작업 내용 및 특이사항을 입력하세요." className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-500"></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                취소
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm">
                저장하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
