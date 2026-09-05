"use client";

import React, { useState, useMemo } from "react";
import { Plus, Calendar, DollarSign, Sparkles, X, Trash2 } from "lucide-react";

// ----------------------------------------------------------------------
// 1. 타입 정의
// ----------------------------------------------------------------------
export type ExpenseCategory = "종묘/씨앗" | "비료비" | "농약비" | "포장재료비" | "인건비" | "기타자재";

export interface CropSelect {
  id: number;
  name: string;
  bloomDate?: string;
  totalGdd?: number;
  bloomDays?: number;
}

export interface LogTableItem {
  id: number;
  date: string;
  cropId: number;
  cropName: string;
  stage: string;
  workType: string;
  content: string;
  // 🧪 사용 정보
  usedItemName?: string; // 비료/농약 제품명
  usageQuantity?: number; // 실제 사용량
  usageUnit?: string; // 단위
  // 💳 구매/지출 정보
  expenseCategory?: ExpenseCategory | "";
  purchasedItemName?: string; // 구체적 구매 제품명
  purchasedQuantity?: string; // 구매 수량 (예: 2포, 5kg 등)
  expenseCost?: number; // 구매 지출액 (원)
  author: string;
}

interface DynamicLogItem {
  id: string;
  cropId: string;
  workType: string;
  growthStage: string;
  // 🧪 사용 입력 필드
  usedItemName: string;
  usageQuantity: string;
  usageUnit: string;
  // 💳 구매 입력 필드
  expenseCategory: ExpenseCategory | "";
  purchasedItemName: string;
  purchasedQuantity: string;
  expenseCost: string;
  content: string;
}

const createInitialLogItem = (): DynamicLogItem => ({
  id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  cropId: "",
  workType: "경운(땅갈기)/정지",
  growthStage: "1. 토양 및 재배 환경 조성",
  usedItemName: "",
  usageQuantity: "",
  usageUnit: "kg",
  expenseCategory: "",
  purchasedItemName: "",
  purchasedQuantity: "",
  expenseCost: "",
  content: "",
});

// ----------------------------------------------------------------------
// 2. 영농일지 작성 모달 폼 컴포넌트
// ----------------------------------------------------------------------
function FarmingLogForm({ cropList, onSaveSuccess, onClose }: { cropList: CropSelect[]; onSaveSuccess: (newLogs: LogTableItem[]) => void; onClose: () => void }) {
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logItems, setLogItems] = useState<DynamicLogItem[]>([createInitialLogItem()]);

  const handleAddLogItem = () => {
    setLogItems((prev) => [...prev, createInitialLogItem()]);
  };

  const handleRemoveLogItem = (id: string) => {
    if (logItems.length === 1) {
      alert("최소 한 개의 작업 내용은 입력해야 합니다.");
      return;
    }
    setLogItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLogItemChange = <K extends keyof DynamicLogItem>(id: string, field: K, value: DynamicLogItem[K]) => {
    setLogItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSaveAllLogs = async () => {
    const hasEmptyCrop = logItems.some((item) => !item.cropId);
    if (hasEmptyCrop) {
      alert("⚠️ 모든 작업 항목의 '대상 작물'을 선택해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newCreatedLogs: LogTableItem[] = logItems.map((item, idx) => {
        const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);

        let finalContent = item.content;

        if (selectedCrop?.totalGdd !== undefined) {
          const autoGddText = `\n[자동기록] 개화 후 누적 적산온도: ${selectedCrop.totalGdd.toFixed(1)}℃`;
          finalContent = finalContent ? `${finalContent}${autoGddText}` : autoGddText.trim();
        }

        return {
          id: Date.now() + idx,
          date: workDate,
          cropId: Number(item.cropId),
          cropName: selectedCrop?.name || "알 수 없음",
          stage: item.growthStage || "일반",
          workType: item.workType || "경운(땅갈기)/정지",
          content: finalContent,
          usedItemName: item.usedItemName || undefined,
          usageQuantity: item.usageQuantity ? Number(item.usageQuantity) : undefined,
          usageUnit: item.usageUnit || "kg",
          expenseCategory: item.expenseCategory === "" ? undefined : item.expenseCategory,
          purchasedItemName: item.purchasedItemName || undefined,
          purchasedQuantity: item.purchasedQuantity || undefined,
          expenseCost: item.expenseCost ? Number(item.expenseCost) : undefined,
          author: "관리자",
        };
      });

      onSaveSuccess(newCreatedLogs);
      alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 일지가 저장되었습니다.`);
      onClose();
    } catch (error) {
      console.error("저장 에러:", error);
      alert("일지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 font-sans text-left">
      {/* 1. 작업 기준 날짜 */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label htmlFor="work-date" className="block text-xs font-bold text-slate-600 mb-1.5">
          📅 작업 기준 일자
        </label>
        <input id="work-date" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium" />
      </div>

      {/* 2. 작업 리스트 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-slate-800">🛠️ 오늘 진행한 작업 내역</label>
          <button type="button" onClick={handleAddLogItem} className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> 작업 추가
          </button>
        </div>

        {logItems.map((item, index) => {
          const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);
          const isChemicalOrFertilizer = item.workType === "비료/영양제 살포" || item.workType === "농약방제/병해충 관리";

          return (
            <div key={item.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm flex flex-col gap-3">
              {logItems.length > 1 && (
                <button type="button" onClick={() => handleRemoveLogItem(item.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-0.5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
              )}

              <div className="text-xs font-bold text-emerald-600"># 작업 기록 {index + 1}</div>

              {/* 대상 작물 선택 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  대상 작물 <span className="text-red-500">*</span>
                </label>
                <select value={item.cropId} onChange={(e) => handleLogItemChange(item.id, "cropId", e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
                  <option value="">-- 작물 선택 --</option>
                  {cropList.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>

                {selectedCrop && (
                  <div className="mt-2">
                    {selectedCrop.bloomDate && selectedCrop.totalGdd !== undefined ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-bold">
                        <span>🌸 {selectedCrop.name}</span>
                        <span className="text-amber-700">
                          (개화 D+{selectedCrop.bloomDays} / 누적 {selectedCrop.totalGdd.toFixed(1)}℃)
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-[11px] font-medium">⚠️ 개화일 미등록 작물 (적산온도 미산출)</span>
                    )}
                  </div>
                )}
              </div>

              {/* 수행한 작업 (단계별 선택) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">수행한 작업 (단계별 선택)</label>
                <select value={item.workType} onChange={(e) => handleLogItemChange(item.id, "workType", e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
                  <optgroup label="🌱 1. 토양 및 재배 환경 조성 (시작 단계)">
                    <option value="경운(땅갈기)/정지">경운(땅갈기)/정지</option>
                    <option value="시비(밑거름 주기)">시비(밑거름 주기)</option>
                    <option value="멀칭">멀칭</option>
                    <option value="유인줄/지주대 설치">유인줄/지주대 설치</option>
                  </optgroup>

                  <optgroup label="🌿 2. 생육 관리 및 전지 (성장 단계)">
                    <option value="물주기(관수)">물주기(관수)</option>
                    <option value="비료/영양제 살포">비료/영양제 살포</option>
                    <option value="농약방제/병해충 관리">농약방제/병해충 관리</option>
                    <option value="가식/이식">가식/이식</option>
                    <option value="보식/솎아내기(적묘)">보식/솎아내기(적묘)</option>
                    <option value="순지르기(적심)/곁순 제거">순지르기(적심)/곁순 제거</option>
                    <option value="적화(꽃솎기)/적과(열매솎기)">적화(꽃솎기)/적과(열매솎기)</option>
                    <option value="유인">유인</option>
                  </optgroup>

                  <optgroup label="⚙️ 3. 시설 및 농기계 관리">
                    <option value="시설 점검(하우스 개폐기, 관수시설 등)">시설 점검(하우스 개폐기, 관수시설 등)</option>
                    <option value="농기계 정비(예초기, 관리기, 트랙터 등)">농기계 정비(예초기, 관리기, 트랙터 등)</option>
                  </optgroup>

                  <optgroup label="🎯 4. 수확 및 수확 이후 단계">
                    <option value="수확">수확</option>
                    <option value="잔재물 정리/포장 정비">잔재물 정리/포장 정비</option>
                    <option value="선별/포장">선별/포장</option>
                    <option value="출하">출하</option>
                  </optgroup>
                </select>
              </div>

              {/* 🧪 오늘 현장 투입/사용량 섹션 (비료 살포 / 농약 방제 시에만 화면에 노출) */}
              {isChemicalOrFertilizer && (
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 space-y-2">
                  <label className="block text-[11px] font-bold text-emerald-800">🧪 오늘 현장 투입/사용량 (선택)</label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="col-span-1 sm:col-span-2">
                      <input
                        type="text"
                        placeholder={item.workType === "비료/영양제 살포" ? "사용 비료/영양제명 (예: 요소비료, 종합영양제)" : "사용 농약명 (예: 빅카드, 살균제)"}
                        value={item.usedItemName}
                        onChange={(e) => handleLogItemChange(item.id, "usedItemName", e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-emerald-500 font-medium"
                      />
                    </div>

                    <div className="flex-1">
                      <input type="number" step="any" placeholder="예: 2.5 (사용량)" value={item.usageQuantity} onChange={(e) => handleLogItemChange(item.id, "usageQuantity", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-emerald-500" />
                    </div>
                    <div>
                      <select value={item.usageUnit} onChange={(e) => handleLogItemChange(item.id, "usageUnit", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="포">포</option>
                        <option value="개">개</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 💳 신규 구매/지출 섹션 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">💳 신규 구매/지출 항목 (선택)</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 항목</label>
                    <select value={item.expenseCategory} onChange={(e) => handleLogItemChange(item.id, "expenseCategory", e.target.value as ExpenseCategory | "")} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
                      <option value="">구매 자재 없음</option>
                      <option value="종묘/씨앗">🌱 종묘 / 씨앗</option>
                      <option value="비료비">🧪 비료 / 영양제</option>
                      <option value="농약비">🚜 농약 / 방제비</option>
                      <option value="포장재료비">📦 포장 재료비</option>
                      <option value="인건비">👨‍🌾 인건비</option>
                      <option value="기타자재">🛠️ 기타 자재비</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 제품명/품목</label>
                    <input type="text" placeholder="예: 멀칭비닐 0.02mm" disabled={!item.expenseCategory} value={item.purchasedItemName} onChange={(e) => handleLogItemChange(item.id, "purchasedItemName", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 수량</label>
                    <input type="text" placeholder="예: 2롤 / 5포" disabled={!item.expenseCategory} value={item.purchasedQuantity} onChange={(e) => handleLogItemChange(item.id, "purchasedQuantity", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 지출액 (원)</label>
                    <input type="number" placeholder="예: 50000" disabled={!item.expenseCategory} value={item.expenseCost} onChange={(e) => handleLogItemChange(item.id, "expenseCost", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
                  </div>
                </div>
              </div>

              {/* 상세 내용 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">상세 작업 내용</label>
                <textarea placeholder="진행한 상세 내용이나 희석 배수, 기상 상황 등을 적어주세요." value={item.content} onChange={(e) => handleLogItemChange(item.id, "content", e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-emerald-500" />
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" disabled={isSubmitting} onClick={handleSaveAllLogs} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4 cursor-pointer">
        {isSubmitting ? "저장 처리 중..." : "🎯 작성된 일지 저장하기"}
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. 메인 영농일지 페이지 컴포넌트
// ----------------------------------------------------------------------
export default function FarmLogsPage() {
  const [selectedCropId, setSelectedCropId] = useState<number | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [crops] = useState<CropSelect[]>([
    { id: 101, name: "화순 토마토", bloomDate: "2026-04-10", totalGdd: 520.4, bloomDays: 45 },
    { id: 102, name: "설향 딸기", bloomDate: "2026-08-01", totalGdd: 480.5, bloomDays: 35 },
    { id: 103, name: "샤인머스켓", bloomDate: undefined },
  ]);

  const [logs, setLogs] = useState<LogTableItem[]>([
    {
      id: 1,
      date: "2026-09-05",
      cropId: 101,
      cropName: "화순 토마토",
      stage: "4. 수확 및 수확 이후 단계",
      workType: "출하",
      content: "토마토 2차 출하 완료 및 잔재물 정리\n[자동기록] 개화 후 누적 적산온도: 520.4℃",
      usageQuantity: 50,
      usageUnit: "개",
      expenseCategory: "포장재료비",
      purchasedItemName: "출하용 박스 10kg",
      purchasedQuantity: "100장",
      expenseCost: 45000,
      author: "관리자",
    },
    {
      id: 2,
      date: "2026-09-01",
      cropId: 101,
      cropName: "화순 토마토",
      stage: "2. 생육 관리 및 전지",
      workType: "비료/영양제 살포",
      content: "추비 1차 진행 (관수 시비)\n[자동기록] 개화 후 누적 적산온도: 505.0℃",
      usedItemName: "원예용 복합비료",
      usageQuantity: 2.5,
      usageUnit: "kg",
      expenseCategory: undefined,
      expenseCost: undefined,
      author: "관리자",
    },
  ]);

  const handleSaveSuccess = (newLogs: LogTableItem[]) => {
    setLogs((prev) => [...newLogs, ...prev]);
  };

  const filteredLogs = useMemo(() => {
    if (selectedCropId === "ALL") return logs;
    return logs.filter((log) => log.cropId === selectedCropId);
  }, [logs, selectedCropId]);

  const currentCropInfo = useMemo(() => {
    if (selectedCropId === "ALL") return null;
    return crops.find((c) => c.id === selectedCropId);
  }, [crops, selectedCropId]);

  const expenseSummary = useMemo(() => {
    const summary = {
      seed: 0,
      fertilizer: 0,
      pesticide: 0,
      packing: 0,
      labor: 0,
      etc: 0,
      total: 0,
    };

    filteredLogs.forEach((log) => {
      if (!log.expenseCost) return;
      const cost = log.expenseCost;
      summary.total += cost;

      switch (log.expenseCategory) {
        case "종묘/씨앗":
          summary.seed += cost;
          break;
        case "비료비":
          summary.fertilizer += cost;
          break;
        case "농약비":
          summary.pesticide += cost;
          break;
        case "포장재료비":
          summary.packing += cost;
          break;
        case "인건비":
          summary.labor += cost;
          break;
        default:
          if (log.expenseCategory) summary.etc += cost;
          break;
      }
    });

    return summary;
  }, [filteredLogs]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans text-slate-800">
      {/* 1. 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">영농일지 & 자원 관리</h1>
          <p className="text-xs text-slate-500 mt-1">현장 투입량(제품명·사용량)과 자재 구매 지출(품목·수량·비용)을 세부적으로 관리합니다.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>새 일지 작성</span>
        </button>
      </div>

      {/* 2. 적산온도 배너 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-amber-950 text-sm">정확한 AI 수확일 예측(적산온도 계산)을 위해 개화일을 등록해 주세요!</div>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              작물별 <strong>개화일(Bloom Date)</strong>이 설정되어 있으면 일지 작성 시 <strong>누적 적산온도(GDD)</strong>가 메모에 자동 저장됩니다.
            </p>
          </div>
        </div>
        {currentCropInfo && (
          <div className="shrink-0 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-200 text-right">
            <span className="text-[11px] text-slate-500 block">선택 작물 적산온도</span>
            <span className="font-bold text-amber-900">{currentCropInfo.totalGdd !== undefined ? `🌸 D+${currentCropInfo.bloomDays} (${currentCropInfo.totalGdd.toFixed(1)}℃)` : "⚠️ 개화일 미등록"}</span>
          </div>
        )}
      </div>

      {/* 3. 작물 선택 탭 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button onClick={() => setSelectedCropId("ALL")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCropId === "ALL" ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          🌱 전체 작물 보기
        </button>
        {crops.map((crop) => (
          <button key={crop.id} onClick={() => setSelectedCropId(crop.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${selectedCropId === crop.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <span>{crop.name}</span>
            {!crop.bloomDate && <span className="w-2 h-2 rounded-full bg-amber-500" title="개화일 미등록" />}
          </button>
        ))}
      </div>

      {/* 4. 경영비 집계 요약 표 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>자재 구매 지출 및 경영비 합계</span>
          </h3>
          <span className="text-xs text-slate-500">
            총 구매 비용: <strong className="text-emerald-600 text-sm">{expenseSummary.total.toLocaleString()}원</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5 text-center text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1 font-medium">🌱 모종/씨앗</div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.seed.toLocaleString()}원</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1 font-medium">🧪 비료/영양제</div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.fertilizer.toLocaleString()}원</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1 font-medium">🚜 농약/방제비</div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.pesticide.toLocaleString()}원</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1 font-medium">📦 포장재료비</div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.packing.toLocaleString()}원</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1 font-medium">👨‍🌾 인건비</div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.labor.toLocaleString()}원</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1 font-medium">🛠️ 기타자재</div>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.etc.toLocaleString()}원</div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2 sm:col-span-3 md:col-span-1">
            <div className="text-emerald-700 mb-1 font-medium">💰 총 지출액</div>
            <div className="font-black text-emerald-800 text-xs sm:text-sm">{expenseSummary.total.toLocaleString()}원</div>
          </div>
        </div>
      </div>

      {/* 5. 통합 데이터 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">📋 일자별 작업, 투입량 및 구매지출 목록</span>
          <span className="text-[11px] text-slate-400">총 {filteredLogs.length}건의 기록</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold">
                <th className="p-3.5 w-28 whitespace-nowrap">작업 일자</th>
                <th className="p-3.5 w-28 whitespace-nowrap">작물명</th>
                <th className="p-3.5 w-36 whitespace-nowrap">작업 유형</th>
                <th className="p-3.5 w-36 whitespace-nowrap">오늘 투입량</th>
                <th className="p-3.5">상세 작업 내용</th>
                <th className="p-3.5 w-40 text-right whitespace-nowrap">구매 지출액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    등록된 작업 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-medium text-slate-500 whitespace-nowrap">{log.date}</td>
                    <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">{log.cropName}</td>
                    <td className="p-3.5 font-semibold text-emerald-700 whitespace-nowrap">{log.workType}</td>
                    <td className="p-3.5 font-medium whitespace-nowrap">
                      {log.usageQuantity !== undefined ? (
                        <div className="flex flex-col gap-0.5">
                          {log.usedItemName && <span className="text-[11px] font-bold text-slate-800">{log.usedItemName}</span>}
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] w-fit">
                            {log.usageQuantity} {log.usageUnit}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-700 leading-normal whitespace-pre-line">{log.content}</td>
                    <td className="p-3.5 text-right font-bold whitespace-nowrap">
                      {log.expenseCost ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-slate-900">{log.expenseCost.toLocaleString()} 원</span>
                          {log.purchasedItemName && (
                            <span className="text-[11px] text-slate-700 font-semibold">
                              {log.purchasedItemName} ({log.purchasedQuantity || "1개"})
                            </span>
                          )}
                          {log.expenseCategory && <span className="text-[10px] text-slate-400 font-normal">[{log.expenseCategory}]</span>}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. 일지 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">📝 새 영농일지 작성</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <FarmingLogForm cropList={crops} onSaveSuccess={handleSaveSuccess} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import React, { useState, useMemo } from "react";
// import { Plus, Calendar, DollarSign, Sparkles, X, Trash2 } from "lucide-react";

// // ----------------------------------------------------------------------
// // 1. 타입 정의
// // ----------------------------------------------------------------------
// export type ExpenseCategory = "종묘/씨앗" | "비료비" | "농약비" | "포장재료비" | "인건비" | "기타자재";

// export interface CropSelect {
//   id: number;
//   name: string;
//   bloomDate?: string;
//   totalGdd?: number;
//   bloomDays?: number;
// }

// export interface LogTableItem {
//   id: number;
//   date: string;
//   cropId: number;
//   cropName: string;
//   stage: string;
//   workType: string;
//   content: string;
//   // 🧪 사용 정보
//   usedItemName?: string; // 비료/농약 제품명
//   usageQuantity?: number; // 실제 사용량
//   usageUnit?: string; // 단위
//   // 💳 구매/지출 정보
//   expenseCategory?: ExpenseCategory | "";
//   purchasedItemName?: string; // 구체적 구매 제품명
//   purchasedQuantity?: string; // 구매 수량 (예: 2포, 5kg 등)
//   expenseCost?: number; // 구매 지출액 (원)
//   author: string;
// }

// interface DynamicLogItem {
//   id: string;
//   cropId: string;
//   workType: string;
//   growthStage: string;
//   // 🧪 사용 입력 필드
//   usedItemName: string;
//   usageQuantity: string;
//   usageUnit: string;
//   // 💳 구매 입력 필드
//   expenseCategory: ExpenseCategory | "";
//   purchasedItemName: string;
//   purchasedQuantity: string;
//   expenseCost: string;
//   content: string;
// }

// const createInitialLogItem = (): DynamicLogItem => ({
//   id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
//   cropId: "",
//   workType: "경운(땅갈기)/정지",
//   growthStage: "1. 토양 및 재배 환경 조성",
//   usedItemName: "",
//   usageQuantity: "",
//   usageUnit: "kg",
//   expenseCategory: "",
//   purchasedItemName: "",
//   purchasedQuantity: "",
//   expenseCost: "",
//   content: "",
// });

// // ----------------------------------------------------------------------
// // 2. 영농일지 작성 모달 폼 컴포넌트
// // ----------------------------------------------------------------------
// function FarmingLogForm({ cropList, onSaveSuccess, onClose }: { cropList: CropSelect[]; onSaveSuccess: (newLogs: LogTableItem[]) => void; onClose: () => void }) {
//   const [workDate, setWorkDate] = useState(() => new Date().toISOString().split("T")[0]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [logItems, setLogItems] = useState<DynamicLogItem[]>([createInitialLogItem()]);

//   const handleAddLogItem = () => {
//     setLogItems((prev) => [...prev, createInitialLogItem()]);
//   };

//   const handleRemoveLogItem = (id: string) => {
//     if (logItems.length === 1) {
//       alert("최소 한 개의 작업 내용은 입력해야 합니다.");
//       return;
//     }
//     setLogItems((prev) => prev.filter((item) => item.id !== id));
//   };

//   const handleLogItemChange = <K extends keyof DynamicLogItem>(id: string, field: K, value: DynamicLogItem[K]) => {
//     setLogItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
//   };

//   const handleSaveAllLogs = async () => {
//     const hasEmptyCrop = logItems.some((item) => !item.cropId);
//     if (hasEmptyCrop) {
//       alert("⚠️ 모든 작업 항목의 '대상 작물'을 선택해 주세요.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const newCreatedLogs: LogTableItem[] = logItems.map((item, idx) => {
//         const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);

//         let finalContent = item.content;

//         if (selectedCrop?.totalGdd !== undefined) {
//           const autoGddText = `\n[자동기록] 개화 후 누적 적산온도: ${selectedCrop.totalGdd.toFixed(1)}℃`;
//           finalContent = finalContent ? `${finalContent}${autoGddText}` : autoGddText.trim();
//         }

//         return {
//           id: Date.now() + idx,
//           date: workDate,
//           cropId: Number(item.cropId),
//           cropName: selectedCrop?.name || "알 수 없음",
//           stage: item.growthStage || "일반",
//           workType: item.workType || "경운(땅갈기)/정지",
//           content: finalContent,
//           usedItemName: item.usedItemName || undefined,
//           usageQuantity: item.usageQuantity ? Number(item.usageQuantity) : undefined,
//           usageUnit: item.usageUnit || "kg",
//           expenseCategory: item.expenseCategory === "" ? undefined : item.expenseCategory,
//           purchasedItemName: item.purchasedItemName || undefined,
//           purchasedQuantity: item.purchasedQuantity || undefined,
//           expenseCost: item.expenseCost ? Number(item.expenseCost) : undefined,
//           author: "관리자",
//         };
//       });

//       onSaveSuccess(newCreatedLogs);
//       alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 일지가 저장되었습니다.`);
//       onClose();
//     } catch (error) {
//       console.error("저장 에러:", error);
//       alert("일지 저장 중 오류가 발생했습니다.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-5 font-sans text-left">
//       {/* 1. 작업 기준 날짜 */}
//       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//         <label htmlFor="work-date" className="block text-xs font-bold text-slate-600 mb-1.5">
//           📅 작업 기준 일자
//         </label>
//         <input id="work-date" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium" />
//       </div>

//       {/* 2. 작업 리스트 */}
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <label className="text-sm font-bold text-slate-800">🛠️ 오늘 진행한 작업 내역</label>
//           <button type="button" onClick={handleAddLogItem} className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer">
//             <Plus className="w-3.5 h-3.5" /> 작업 추가
//           </button>
//         </div>

//         {logItems.map((item, index) => {
//           const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);
//           const isChemicalOrFertilizer = item.workType === "비료/영양제 살포" || item.workType === "농약방제/병해충 관리";

//           return (
//             <div key={item.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm flex flex-col gap-3">
//               {logItems.length > 1 && (
//                 <button type="button" onClick={() => handleRemoveLogItem(item.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-0.5 transition-colors">
//                   <Trash2 className="w-3.5 h-3.5" /> 삭제
//                 </button>
//               )}

//               <div className="text-xs font-bold text-emerald-600"># 작업 기록 {index + 1}</div>

//               {/* 대상 작물 선택 */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">
//                   대상 작물 <span className="text-red-500">*</span>
//                 </label>
//                 <select value={item.cropId} onChange={(e) => handleLogItemChange(item.id, "cropId", e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
//                   <option value="">-- 작물 선택 --</option>
//                   {cropList.map((crop) => (
//                     <option key={crop.id} value={crop.id}>
//                       {crop.name}
//                     </option>
//                   ))}
//                 </select>

//                 {selectedCrop && (
//                   <div className="mt-2">
//                     {selectedCrop.bloomDate && selectedCrop.totalGdd !== undefined ? (
//                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-bold">
//                         <span>🌸 {selectedCrop.name}</span>
//                         <span className="text-amber-700">
//                           (개화 D+{selectedCrop.bloomDays} / 누적 {selectedCrop.totalGdd.toFixed(1)}℃)
//                         </span>
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-[11px] font-medium">⚠️ 개화일 미등록 작물 (적산온도 미산출)</span>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* 수행한 작업 (단계별 선택) */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">수행한 작업 (단계별 선택)</label>
//                 <select value={item.workType} onChange={(e) => handleLogItemChange(item.id, "workType", e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
//                   <optgroup label="🌱 1. 토양 및 재배 환경 조성 (시작 단계)">
//                     <option value="경운(땅갈기)/정지">경운(땅갈기)/정지</option>
//                     <option value="시비(밑거름 주기)">시비(밑거름 주기)</option>
//                     <option value="멀칭">멀칭</option>
//                     <option value="유인줄/지주대 설치">유인줄/지주대 설치</option>
//                   </optgroup>

//                   <optgroup label="🌿 2. 생육 관리 및 전지 (성장 단계)">
//                     <option value="물주기(관수)">물주기(관수)</option>
//                     <option value="비료/영양제 살포">비료/영양제 살포</option>
//                     <option value="농약방제/병해충 관리">농약방제/병해충 관리</option>
//                     <option value="가식/이식">가식/이식</option>
//                     <option value="보식/솎아내기(적묘)">보식/솎아내기(적묘)</option>
//                     <option value="순지르기(적심)/곁순 제거">순지르기(적심)/곁순 제거</option>
//                     <option value="적화(꽃솎기)/적과(열매솎기)">적화(꽃솎기)/적과(열매솎기)</option>
//                     <option value="유인">유인</option>
//                   </optgroup>

//                   <optgroup label="⚙️ 3. 시설 및 농기계 관리">
//                     <option value="시설 점검(하우스 개폐기, 관수시설 등)">시설 점검(하우스 개폐기, 관수시설 등)</option>
//                     <option value="농기계 정비(예초기, 관리기, 트랙터 등)">농기계 정비(예초기, 관리기, 트랙터 등)</option>
//                   </optgroup>

//                   <optgroup label="🎯 4. 수확 및 수확 이후 단계">
//                     <option value="수확">수확</option>
//                     <option value="잔재물 정리/포장 정비">잔재물 정리/포장 정비</option>
//                     <option value="선별/포장">선별/포장</option>
//                     <option value="출하">출하</option>
//                   </optgroup>
//                 </select>
//               </div>

//               {/* 🧪 [1번 반영] 오늘 현장 투입/사용량 섹션 */}
//               <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 space-y-2">
//                 <label className="block text-[11px] font-bold text-emerald-800">🧪 오늘 현장 투입/사용량 (선택)</label>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                   {/* 비료살포 또는 농약방제 선택 시 사용 제품명 입력란 활성화 */}
//                   {isChemicalOrFertilizer && (
//                     <div className="col-span-1 sm:col-span-2">
//                       <input
//                         type="text"
//                         placeholder={item.workType === "비료/영양제 살포" ? "사용 비료/영양제명 (예: 요소비료, 종합영양제)" : "사용 농약명 (예: 빅카드, 살균제)"}
//                         value={item.usedItemName}
//                         onChange={(e) => handleLogItemChange(item.id, "usedItemName", e.target.value)}
//                         className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-emerald-500 font-medium"
//                       />
//                     </div>
//                   )}

//                   <div className="flex-1">
//                     <input type="number" step="any" placeholder="예: 2.5 (사용량)" value={item.usageQuantity} onChange={(e) => handleLogItemChange(item.id, "usageQuantity", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-emerald-500" />
//                   </div>
//                   <div>
//                     <select value={item.usageUnit} onChange={(e) => handleLogItemChange(item.id, "usageUnit", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
//                       <option value="kg">kg</option>
//                       <option value="g">g</option>
//                       <option value="L">L</option>
//                       <option value="ml">ml</option>
//                       <option value="포">포</option>
//                       <option value="개">개</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* 💳 [2번 반영] 신규 구매/지출 섹션 (구매항목 - 제품명 - 수량 - 지출액) */}
//               <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
//                 <label className="block text-[11px] font-bold text-slate-700">💳 신규 구매/지출 항목 (선택)</label>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
//                   {/* 1. 구매 항목 선택 */}
//                   <div>
//                     <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 항목</label>
//                     <select value={item.expenseCategory} onChange={(e) => handleLogItemChange(item.id, "expenseCategory", e.target.value as ExpenseCategory | "")} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
//                       <option value="">구매 자재 없음</option>
//                       <option value="종묘/씨앗">🌱 종묘 / 씨앗</option>
//                       <option value="비료비">🧪 비료 / 영양제</option>
//                       <option value="농약비">🚜 농약 / 방제비</option>
//                       <option value="포장재료비">📦 포장 재료비</option>
//                       <option value="인건비">👨‍🌾 인건비</option>
//                       <option value="기타자재">🛠️ 기타 자재비</option>
//                     </select>
//                   </div>

//                   {/* 2. 구체적 제품명 */}
//                   <div>
//                     <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 제품명/품목</label>
//                     <input type="text" placeholder="예: 멀칭비닐 0.02mm" disabled={!item.expenseCategory} value={item.purchasedItemName} onChange={(e) => handleLogItemChange(item.id, "purchasedItemName", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
//                   </div>

//                   {/* 3. 구매 수량 */}
//                   <div>
//                     <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 수량</label>
//                     <input type="text" placeholder="예: 2롤 / 5포" disabled={!item.expenseCategory} value={item.purchasedQuantity} onChange={(e) => handleLogItemChange(item.id, "purchasedQuantity", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
//                   </div>

//                   {/* 4. 구매 지출액 */}
//                   <div>
//                     <label className="block text-[10px] font-bold text-slate-500 mb-1">구매 지출액 (원)</label>
//                     <input type="number" placeholder="예: 50000" disabled={!item.expenseCategory} value={item.expenseCost} onChange={(e) => handleLogItemChange(item.id, "expenseCost", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
//                   </div>
//                 </div>
//               </div>

//               {/* 상세 내용 */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">상세 작업 내용</label>
//                 <textarea placeholder="진행한 상세 내용이나 희석 배수, 기상 상황 등을 적어주세요." value={item.content} onChange={(e) => handleLogItemChange(item.id, "content", e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-emerald-500" />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <button type="button" disabled={isSubmitting} onClick={handleSaveAllLogs} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4 cursor-pointer">
//         {isSubmitting ? "저장 처리 중..." : "🎯 작성된 일지 저장하기"}
//       </button>
//     </div>
//   );
// }

// // ----------------------------------------------------------------------
// // 3. 메인 영농일지 페이지 컴포넌트
// // ----------------------------------------------------------------------
// export default function FarmLogsPage() {
//   const [selectedCropId, setSelectedCropId] = useState<number | "ALL">("ALL");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [crops] = useState<CropSelect[]>([
//     { id: 101, name: "화순 토마토", bloomDate: "2026-04-10", totalGdd: 520.4, bloomDays: 45 },
//     { id: 102, name: "설향 딸기", bloomDate: "2026-08-01", totalGdd: 480.5, bloomDays: 35 },
//     { id: 103, name: "샤인머스켓", bloomDate: undefined },
//   ]);

//   const [logs, setLogs] = useState<LogTableItem[]>([
//     {
//       id: 1,
//       date: "2026-09-05",
//       cropId: 101,
//       cropName: "화순 토마토",
//       stage: "4. 수확 및 수확 이후 단계",
//       workType: "출하",
//       content: "토마토 2차 출하 완료 및 잔재물 정리\n[자동기록] 개화 후 누적 적산온도: 520.4℃",
//       usageQuantity: 50,
//       usageUnit: "개",
//       expenseCategory: "포장재료비",
//       purchasedItemName: "출하용 박스 10kg",
//       purchasedQuantity: "100장",
//       expenseCost: 45000,
//       author: "관리자",
//     },
//     {
//       id: 2,
//       date: "2026-09-01",
//       cropId: 101,
//       cropName: "화순 토마토",
//       stage: "2. 생육 관리 및 전지",
//       workType: "비료/영양제 살포",
//       content: "추비 1차 진행 (관수 시비)\n[자동기록] 개화 후 누적 적산온도: 505.0℃",
//       usedItemName: "원예용 복합비료",
//       usageQuantity: 2.5,
//       usageUnit: "kg",
//       expenseCategory: undefined,
//       expenseCost: undefined,
//       author: "관리자",
//     },
//   ]);

//   const handleSaveSuccess = (newLogs: LogTableItem[]) => {
//     setLogs((prev) => [...newLogs, ...prev]);
//   };

//   const filteredLogs = useMemo(() => {
//     if (selectedCropId === "ALL") return logs;
//     return logs.filter((log) => log.cropId === selectedCropId);
//   }, [logs, selectedCropId]);

//   const currentCropInfo = useMemo(() => {
//     if (selectedCropId === "ALL") return null;
//     return crops.find((c) => c.id === selectedCropId);
//   }, [crops, selectedCropId]);

//   const expenseSummary = useMemo(() => {
//     const summary = {
//       seed: 0,
//       fertilizer: 0,
//       pesticide: 0,
//       packing: 0,
//       labor: 0,
//       etc: 0,
//       total: 0,
//     };

//     filteredLogs.forEach((log) => {
//       if (!log.expenseCost) return;
//       const cost = log.expenseCost;
//       summary.total += cost;

//       switch (log.expenseCategory) {
//         case "종묘/씨앗":
//           summary.seed += cost;
//           break;
//         case "비료비":
//           summary.fertilizer += cost;
//           break;
//         case "농약비":
//           summary.pesticide += cost;
//           break;
//         case "포장재료비":
//           summary.packing += cost;
//           break;
//         case "인건비":
//           summary.labor += cost;
//           break;
//         default:
//           if (log.expenseCategory) summary.etc += cost;
//           break;
//       }
//     });

//     return summary;
//   }, [filteredLogs]);

//   return (
//     <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans text-slate-800">
//       {/* 1. 헤더 */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900 tracking-tight">영농일지 & 자원 관리</h1>
//           <p className="text-xs text-slate-500 mt-1">현장 투입량(제품명·사용량)과 자재 구매 지출(품목·수량·비용)을 세부적으로 관리합니다.</p>
//         </div>
//         <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
//           <Plus className="w-4 h-4" />
//           <span>새 일지 작성</span>
//         </button>
//       </div>

//       {/* 2. 적산온도 배너 */}
//       <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
//         <div className="flex items-start gap-3">
//           <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 sm:mt-0">
//             <Sparkles className="w-4 h-4" />
//           </div>
//           <div>
//             <div className="font-extrabold text-amber-950 text-sm">정확한 AI 수확일 예측(적산온도 계산)을 위해 개화일을 등록해 주세요!</div>
//             <p className="text-amber-800 mt-0.5 leading-relaxed">
//               작물별 <strong>개화일(Bloom Date)</strong>이 설정되어 있으면 일지 작성 시 <strong>누적 적산온도(GDD)</strong>가 메모에 자동 저장됩니다.
//             </p>
//           </div>
//         </div>
//         {currentCropInfo && (
//           <div className="shrink-0 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-200 text-right">
//             <span className="text-[11px] text-slate-500 block">선택 작물 적산온도</span>
//             <span className="font-bold text-amber-900">{currentCropInfo.totalGdd !== undefined ? `🌸 D+${currentCropInfo.bloomDays} (${currentCropInfo.totalGdd.toFixed(1)}℃)` : "⚠️ 개화일 미등록"}</span>
//           </div>
//         )}
//       </div>

//       {/* 3. 작물 선택 탭 */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
//         <button onClick={() => setSelectedCropId("ALL")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCropId === "ALL" ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//           🌱 전체 작물 보기
//         </button>
//         {crops.map((crop) => (
//           <button key={crop.id} onClick={() => setSelectedCropId(crop.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${selectedCropId === crop.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//             <span>{crop.name}</span>
//             {!crop.bloomDate && <span className="w-2 h-2 rounded-full bg-amber-500" title="개화일 미등록" />}
//           </button>
//         ))}
//       </div>

//       {/* 4. 경영비 집계 요약 표 */}
//       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
//             <DollarSign className="w-4 h-4 text-emerald-600" />
//             <span>자재 구매 지출 및 경영비 합계</span>
//           </h3>
//           <span className="text-xs text-slate-500">
//             총 구매 비용: <strong className="text-emerald-600 text-sm">{expenseSummary.total.toLocaleString()}원</strong>
//           </span>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5 text-center text-xs">
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🌱 모종/씨앗</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.seed.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🧪 비료/영양제</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.fertilizer.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🚜 농약/방제비</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.pesticide.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">📦 포장재료비</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.packing.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">👨‍🌾 인건비</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.labor.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🛠️ 기타자재</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.etc.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2 sm:col-span-3 md:col-span-1">
//             <div className="text-emerald-700 mb-1 font-medium">💰 총 지출액</div>
//             <div className="font-black text-emerald-800 text-xs sm:text-sm">{expenseSummary.total.toLocaleString()}원</div>
//           </div>
//         </div>
//       </div>

//       {/* 5. 통합 데이터 테이블 */}
//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
//           <span className="text-xs font-bold text-slate-700">📋 일자별 작업, 투입량 및 구매지출 목록</span>
//           <span className="text-[11px] text-slate-400">총 {filteredLogs.length}건의 기록</span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs border-collapse">
//             <thead>
//               <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold">
//                 <th className="p-3.5 w-28 whitespace-nowrap">작업 일자</th>
//                 <th className="p-3.5 w-28 whitespace-nowrap">작물명</th>
//                 <th className="p-3.5 w-36 whitespace-nowrap">작업 유형</th>
//                 <th className="p-3.5 w-36 whitespace-nowrap">오늘 투입량</th>
//                 <th className="p-3.5">상세 작업 내용</th>
//                 <th className="p-3.5 w-40 text-right whitespace-nowrap">구매 지출액</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredLogs.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="text-center py-10 text-slate-400">
//                     등록된 작업 기록이 없습니다.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
//                     <td className="p-3.5 font-medium text-slate-500 whitespace-nowrap">{log.date}</td>
//                     <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">{log.cropName}</td>
//                     <td className="p-3.5 font-semibold text-emerald-700 whitespace-nowrap">{log.workType}</td>
//                     <td className="p-3.5 font-medium whitespace-nowrap">
//                       {log.usageQuantity !== undefined ? (
//                         <div className="flex flex-col gap-0.5">
//                           {log.usedItemName && <span className="text-[11px] font-bold text-slate-800">{log.usedItemName}</span>}
//                           <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] w-fit">
//                             {log.usageQuantity} {log.usageUnit}
//                           </span>
//                         </div>
//                       ) : (
//                         <span className="text-slate-300">-</span>
//                       )}
//                     </td>
//                     <td className="p-3.5 text-slate-700 leading-normal whitespace-pre-line">{log.content}</td>
//                     <td className="p-3.5 text-right font-bold whitespace-nowrap">
//                       {log.expenseCost ? (
//                         <div className="flex flex-col items-end gap-0.5">
//                           <span className="text-slate-900">{log.expenseCost.toLocaleString()} 원</span>
//                           {log.purchasedItemName && (
//                             <span className="text-[11px] text-slate-700 font-semibold">
//                               {log.purchasedItemName} ({log.purchasedQuantity || "1개"})
//                             </span>
//                           )}
//                           {log.expenseCategory && <span className="text-[10px] text-slate-400 font-normal">[{log.expenseCategory}]</span>}
//                         </div>
//                       ) : (
//                         <span className="text-slate-300">-</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* 6. 일지 작성 모달 */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
//               <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">📝 새 영농일지 작성</h2>
//               <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto flex-1">
//               <FarmingLogForm cropList={crops} onSaveSuccess={handleSaveSuccess} onClose={() => setIsModalOpen(false)} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import React, { useState, useMemo } from "react";
// import { Plus, Calendar, DollarSign, Sparkles, X, Trash2 } from "lucide-react";

// // ----------------------------------------------------------------------
// // 1. 타입 정의
// // ----------------------------------------------------------------------
// export type ExpenseCategory = "종묘/씨앗" | "비료비" | "농약비" | "포장재료비" | "인건비" | "기타자재";

// export interface CropSelect {
//   id: number;
//   name: string;
//   bloomDate?: string;
//   totalGdd?: number;
//   bloomDays?: number;
// }

// export interface LogTableItem {
//   id: number;
//   date: string;
//   cropId: number;
//   cropName: string;
//   stage: string;
//   workType: string;
//   content: string;
//   expenseCategory?: ExpenseCategory | "";
//   expenseCost?: number; // 💰 구매/지출 비용 (원)
//   usageQuantity?: number; // 🧪 실제 사용량 (숫자)
//   usageUnit?: string; // 📏 사용 단위 (kg, L, 포 등)
//   author: string;
// }

// interface DynamicLogItem {
//   id: string;
//   cropId: string;
//   workType: string;
//   growthStage: string;
//   expenseCategory: ExpenseCategory | "";
//   expenseCost: string; // 구매 비용
//   usageQuantity: string; // 실제 사용량
//   usageUnit: string; // 단위 (kg, L, 포, 개 등)
//   content: string;
// }

// const createInitialLogItem = (): DynamicLogItem => ({
//   id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
//   cropId: "",
//   workType: "경운(땅갈기)/정지",
//   growthStage: "1. 토양 및 재배 환경 조성",
//   expenseCategory: "",
//   expenseCost: "",
//   usageQuantity: "",
//   usageUnit: "kg",
//   content: "",
// });

// // ----------------------------------------------------------------------
// // 2. 영농일지 작성 모달 폼 컴포넌트
// // ----------------------------------------------------------------------
// function FarmingLogForm({ cropList, onSaveSuccess, onClose }: { cropList: CropSelect[]; onSaveSuccess: (newLogs: LogTableItem[]) => void; onClose: () => void }) {
//   const [workDate, setWorkDate] = useState(() => new Date().toISOString().split("T")[0]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [logItems, setLogItems] = useState<DynamicLogItem[]>([createInitialLogItem()]);

//   const handleAddLogItem = () => {
//     setLogItems((prev) => [...prev, createInitialLogItem()]);
//   };

//   const handleRemoveLogItem = (id: string) => {
//     if (logItems.length === 1) {
//       alert("최소 한 개의 작업 내용은 입력해야 합니다.");
//       return;
//     }
//     setLogItems((prev) => prev.filter((item) => item.id !== id));
//   };

//   const handleLogItemChange = <K extends keyof DynamicLogItem>(id: string, field: K, value: DynamicLogItem[K]) => {
//     setLogItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
//   };

//   const handleSaveAllLogs = async () => {
//     const hasEmptyCrop = logItems.some((item) => !item.cropId);
//     if (hasEmptyCrop) {
//       alert("⚠️ 모든 작업 항목의 '대상 작물'을 선택해 주세요.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const newCreatedLogs: LogTableItem[] = logItems.map((item, idx) => {
//         const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);

//         let finalContent = item.content;

//         if (selectedCrop?.totalGdd !== undefined) {
//           const autoGddText = `\n[자동기록] 개화 후 누적 적산온도: ${selectedCrop.totalGdd.toFixed(1)}℃`;
//           finalContent = finalContent ? `${finalContent}${autoGddText}` : autoGddText.trim();
//         }

//         return {
//           id: Date.now() + idx,
//           date: workDate,
//           cropId: Number(item.cropId),
//           cropName: selectedCrop?.name || "알 수 없음",
//           stage: item.growthStage || "일반",
//           workType: item.workType || "경운(땅갈기)/정지",
//           content: finalContent,
//           expenseCategory: item.expenseCategory === "" ? undefined : item.expenseCategory,
//           expenseCost: item.expenseCost ? Number(item.expenseCost) : undefined,
//           usageQuantity: item.usageQuantity ? Number(item.usageQuantity) : undefined,
//           usageUnit: item.usageUnit || "kg",
//           author: "관리자",
//         };
//       });

//       onSaveSuccess(newCreatedLogs);
//       alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 일지가 저장되었습니다.`);
//       onClose();
//     } catch (error) {
//       console.error("저장 에러:", error);
//       alert("일지 저장 중 오류가 발생했습니다.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-5 font-sans text-left">
//       {/* 1. 작업 기준 날짜 */}
//       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//         <label htmlFor="work-date" className="block text-xs font-bold text-slate-600 mb-1.5">
//           📅 작업 기준 일자
//         </label>
//         <input id="work-date" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium" />
//       </div>

//       {/* 2. 작업 리스트 */}
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <label className="text-sm font-bold text-slate-800">🛠️ 오늘 진행한 작업 내역</label>
//           <button type="button" onClick={handleAddLogItem} className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer">
//             <Plus className="w-3.5 h-3.5" /> 작업 추가
//           </button>
//         </div>

//         {logItems.map((item, index) => {
//           const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);

//           return (
//             <div key={item.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm flex flex-col gap-3">
//               {logItems.length > 1 && (
//                 <button type="button" onClick={() => handleRemoveLogItem(item.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-0.5 transition-colors">
//                   <Trash2 className="w-3.5 h-3.5" /> 삭제
//                 </button>
//               )}

//               <div className="text-xs font-bold text-emerald-600"># 작업 기록 {index + 1}</div>

//               {/* 대상 작물 선택 */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">
//                   대상 작물 <span className="text-red-500">*</span>
//                 </label>
//                 <select value={item.cropId} onChange={(e) => handleLogItemChange(item.id, "cropId", e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
//                   <option value="">-- 작물 선택 --</option>
//                   {cropList.map((crop) => (
//                     <option key={crop.id} value={crop.id}>
//                       {crop.name}
//                     </option>
//                   ))}
//                 </select>

//                 {selectedCrop && (
//                   <div className="mt-2">
//                     {selectedCrop.bloomDate && selectedCrop.totalGdd !== undefined ? (
//                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-bold">
//                         <span>🌸 {selectedCrop.name}</span>
//                         <span className="text-amber-700">
//                           (개화 D+{selectedCrop.bloomDays} / 누적 {selectedCrop.totalGdd.toFixed(1)}℃)
//                         </span>
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-[11px] font-medium">⚠️ 개화일 미등록 작물 (적산온도 미산출)</span>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* 이미지 기반 작업 유형 선택 */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">수행한 작업 (단계별 선택)</label>
//                 <select value={item.workType} onChange={(e) => handleLogItemChange(item.id, "workType", e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
//                   <optgroup label="🌱 1. 토양 및 재배 환경 조성 (시작 단계)">
//                     <option value="경운(땅갈기)/정지">경운(땅갈기)/정지</option>
//                     <option value="시비(밑거름 주기)">시비(밑거름 주기)</option>
//                     <option value="멀칭">멀칭</option>
//                     <option value="유인줄/지주대 설치">유인줄/지주대 설치</option>
//                   </optgroup>

//                   <optgroup label="🌿 2. 생육 관리 및 전지 (성장 단계)">
//                     <option value="물주기(관수)">물주기(관수)</option>
//                     <option value="비료/영양제 살포">비료/영양제 살포</option>
//                     <option value="농약방제/병해충 관리">농약방제/병해충 관리</option>
//                     <option value="가식/이식">가식/이식</option>
//                     <option value="보식/솎아내기(적묘)">보식/솎아내기(적묘)</option>
//                     <option value="순지르기(적심)/곁순 제거">순지르기(적심)/곁순 제거</option>
//                     <option value="적화(꽃솎기)/적과(열매솎기)">적화(꽃솎기)/적과(열매솎기)</option>
//                     <option value="유인">유인</option>
//                   </optgroup>

//                   <optgroup label="⚙️ 3. 시설 및 농기계 관리">
//                     <option value="시설 점검(하우스 개폐기, 관수시설 등)">시설 점검(하우스 개폐기, 관수시설 등)</option>
//                     <option value="농기계 정비(예초기, 관리기, 트랙터 등)">농기계 정비(예초기, 관리기, 트랙터 등)</option>
//                   </optgroup>

//                   <optgroup label="🎯 4. 수확 및 수확 이후 단계">
//                     <option value="수확">수확</option>
//                     <option value="잔재물 정리/포장 정비">잔재물 정리/포장 정비</option>
//                     <option value="선별/포장">선별/포장</option>
//                     <option value="출하">출하</option>
//                   </optgroup>
//                 </select>
//               </div>

//               {/* 🧪 [추가] 실제 사용량 입력 섹션 */}
//               <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 space-y-1.5">
//                 <label className="block text-[11px] font-bold text-emerald-800">🧪 오늘 현장 투입/사용량 (선택)</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   <div className="col-span-2">
//                     <input type="number" step="any" placeholder="예: 2.5 (사용량)" value={item.usageQuantity} onChange={(e) => handleLogItemChange(item.id, "usageQuantity", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-emerald-500" />
//                   </div>
//                   <div>
//                     <select value={item.usageUnit} onChange={(e) => handleLogItemChange(item.id, "usageUnit", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
//                       <option value="kg">kg</option>
//                       <option value="g">g</option>
//                       <option value="L">L</option>
//                       <option value="ml">ml</option>
//                       <option value="포(20kg)">포</option>
//                       <option value="개/장">개/장</option>
//                       <option value="인(명)">인(명)</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* 💰 [독립] 구매/지출 비용 입력 섹션 */}
//               <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
//                 <div>
//                   <label className="block text-[11px] font-bold text-slate-600 mb-1">💳 신규 구매/지출 항목 (선택)</label>
//                   <select value={item.expenseCategory} onChange={(e) => handleLogItemChange(item.id, "expenseCategory", e.target.value as ExpenseCategory | "")} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
//                     <option value="">새로 구매한 자재 없음</option>
//                     <option value="종묘/씨앗">🌱 종묘 / 씨앗 구매</option>
//                     <option value="비료비">🧪 비료 / 영양제 구매</option>
//                     <option value="농약비">🚜 농약 / 방제비</option>
//                     <option value="포장재료비">📦 포장 재료비</option>
//                     <option value="인건비">👨‍🌾 인건비</option>
//                     <option value="기타자재">🛠️ 기타 자재비</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-bold text-slate-600 mb-1">구매 지출액 (원)</label>
//                   <input type="number" placeholder="예: 50000" disabled={!item.expenseCategory} value={item.expenseCost} onChange={(e) => handleLogItemChange(item.id, "expenseCost", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
//                 </div>
//               </div>

//               {/* 상세 내용 */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">상세 작업 내용</label>
//                 <textarea placeholder="진행한 상세 내용이나 희석 배수, 기상 상황 등을 적어주세요." value={item.content} onChange={(e) => handleLogItemChange(item.id, "content", e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-emerald-500" />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <button type="button" disabled={isSubmitting} onClick={handleSaveAllLogs} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4 cursor-pointer">
//         {isSubmitting ? "저장 처리 중..." : "🎯 작성된 일지 저장하기"}
//       </button>
//     </div>
//   );
// }

// // ----------------------------------------------------------------------
// // 3. 메인 영농일지 페이지 컴포넌트
// // ----------------------------------------------------------------------
// export default function FarmLogsPage() {
//   const [selectedCropId, setSelectedCropId] = useState<number | "ALL">("ALL");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [crops] = useState<CropSelect[]>([
//     { id: 101, name: "화순 토마토", bloomDate: "2026-04-10", totalGdd: 520.4, bloomDays: 45 },
//     { id: 102, name: "설향 딸기", bloomDate: "2026-08-01", totalGdd: 480.5, bloomDays: 35 },
//     { id: 103, name: "샤인머스켓", bloomDate: undefined },
//   ]);

//   const [logs, setLogs] = useState<LogTableItem[]>([
//     {
//       id: 1,
//       date: "2026-09-05",
//       cropId: 101,
//       cropName: "화순 토마토",
//       stage: "4. 수확 및 수확 이후 단계",
//       workType: "출하",
//       content: "토마토 2차 출하 완료 및 잔재물 정리\n[자동기록] 개화 후 누적 적산온도: 520.4℃",
//       usageQuantity: 50,
//       usageUnit: "개/장",
//       expenseCategory: "포장재료비",
//       expenseCost: 45000,
//       author: "관리자",
//     },
//     {
//       id: 2,
//       date: "2026-09-01",
//       cropId: 101,
//       cropName: "화순 토마토",
//       stage: "2. 생육 관리 및 전지",
//       workType: "비료/영양제 살포",
//       content: "추비 1차 진행 (관수 시비)\n[자동기록] 개화 후 누적 적산온도: 505.0℃",
//       usageQuantity: 2.5,
//       usageUnit: "kg",
//       expenseCategory: undefined, // 지난달 사둔 비료 사용 (이번 구매 비용 없음)
//       expenseCost: undefined,
//       author: "관리자",
//     },
//     {
//       id: 3,
//       date: "2026-08-15",
//       cropId: 102,
//       cropName: "설향 딸기",
//       stage: "2. 생육 관리 및 전지",
//       workType: "가식/이식",
//       content: "설향 딸기 모종 800주 정식 완료",
//       usageQuantity: 2,
//       usageUnit: "인(명)",
//       expenseCategory: "인건비",
//       expenseCost: 200000,
//       author: "관리자",
//     },
//   ]);

//   const handleSaveSuccess = (newLogs: LogTableItem[]) => {
//     setLogs((prev) => [...newLogs, ...prev]);
//   };

//   const filteredLogs = useMemo(() => {
//     if (selectedCropId === "ALL") return logs;
//     return logs.filter((log) => log.cropId === selectedCropId);
//   }, [logs, selectedCropId]);

//   const currentCropInfo = useMemo(() => {
//     if (selectedCropId === "ALL") return null;
//     return crops.find((c) => c.id === selectedCropId);
//   }, [crops, selectedCropId]);

//   const expenseSummary = useMemo(() => {
//     const summary = {
//       seed: 0,
//       fertilizer: 0,
//       pesticide: 0,
//       packing: 0,
//       labor: 0,
//       etc: 0,
//       total: 0,
//     };

//     filteredLogs.forEach((log) => {
//       if (!log.expenseCost) return;
//       const cost = log.expenseCost;
//       summary.total += cost;

//       switch (log.expenseCategory) {
//         case "종묘/씨앗":
//           summary.seed += cost;
//           break;
//         case "비료비":
//           summary.fertilizer += cost;
//           break;
//         case "농약비":
//           summary.pesticide += cost;
//           break;
//         case "포장재료비":
//           summary.packing += cost;
//           break;
//         case "인건비":
//           summary.labor += cost;
//           break;
//         default:
//           if (log.expenseCategory) summary.etc += cost;
//           break;
//       }
//     });

//     return summary;
//   }, [filteredLogs]);

//   return (
//     <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans text-slate-800">
//       {/* 1. 헤더 */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900 tracking-tight">영농일지 & 자원 관리</h1>
//           <p className="text-xs text-slate-500 mt-1">현장 투입량(사용량)과 자재 구매 지출(경영비)을 각각 독립적으로 기록합니다.</p>
//         </div>
//         <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
//           <Plus className="w-4 h-4" />
//           <span>새 일지 작성</span>
//         </button>
//       </div>

//       {/* 2. 적산온도 배너 */}
//       <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
//         <div className="flex items-start gap-3">
//           <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 sm:mt-0">
//             <Sparkles className="w-4 h-4" />
//           </div>
//           <div>
//             <div className="font-extrabold text-amber-950 text-sm">정확한 AI 수확일 예측(적산온도 계산)을 위해 개화일을 등록해 주세요!</div>
//             <p className="text-amber-800 mt-0.5 leading-relaxed">
//               작물별 <strong>개화일(Bloom Date)</strong>이 설정되어 있으면 일지 작성 시 <strong>누적 적산온도(GDD)</strong>가 메모에 자동 저장됩니다.
//             </p>
//           </div>
//         </div>
//         {currentCropInfo && (
//           <div className="shrink-0 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-200 text-right">
//             <span className="text-[11px] text-slate-500 block">선택 작물 적산온도</span>
//             <span className="font-bold text-amber-900">{currentCropInfo.totalGdd !== undefined ? `🌸 D+${currentCropInfo.bloomDays} (${currentCropInfo.totalGdd.toFixed(1)}℃)` : "⚠️ 개화일 미등록"}</span>
//           </div>
//         )}
//       </div>

//       {/* 3. 작물 선택 탭 */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
//         <button onClick={() => setSelectedCropId("ALL")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCropId === "ALL" ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//           🌱 전체 작물 보기
//         </button>
//         {crops.map((crop) => (
//           <button key={crop.id} onClick={() => setSelectedCropId(crop.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${selectedCropId === crop.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//             <span>{crop.name}</span>
//             {!crop.bloomDate && <span className="w-2 h-2 rounded-full bg-amber-500" title="개화일 미등록" />}
//           </button>
//         ))}
//       </div>

//       {/* 4. 경영비 집계 요약 표 */}
//       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
//             <DollarSign className="w-4 h-4 text-emerald-600" />
//             <span>자재 구매 지출 및 경영비 합계</span>
//           </h3>
//           <span className="text-xs text-slate-500">
//             총 구매 비용: <strong className="text-emerald-600 text-sm">{expenseSummary.total.toLocaleString()}원</strong>
//           </span>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5 text-center text-xs">
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🌱 모종/씨앗</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.seed.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🧪 비료/영양제</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.fertilizer.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🚜 농약/방제비</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.pesticide.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">📦 포장재료비</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.packing.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">👨‍🌾 인건비</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.labor.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🛠️ 기타자재</div>
//             <div className="font-bold text-slate-800 text-xs sm:text-sm">{expenseSummary.etc.toLocaleString()}원</div>
//           </div>
//           <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2 sm:col-span-3 md:col-span-1">
//             <div className="text-emerald-700 mb-1 font-medium">💰 총 지출액</div>
//             <div className="font-black text-emerald-800 text-xs sm:text-sm">{expenseSummary.total.toLocaleString()}원</div>
//           </div>
//         </div>
//       </div>

//       {/* 5. 통합 데이터 테이블 */}
//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
//           <span className="text-xs font-bold text-slate-700">📋 일자별 작업, 투입량 및 구매지출 목록</span>
//           <span className="text-[11px] text-slate-400">총 {filteredLogs.length}건의 기록</span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs border-collapse">
//             <thead>
//               <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold">
//                 <th className="p-3.5 w-28 whitespace-nowrap">작업 일자</th>
//                 <th className="p-3.5 w-28 whitespace-nowrap">작물명</th>
//                 <th className="p-3.5 w-36 whitespace-nowrap">작업 유형</th>
//                 <th className="p-3.5 w-28 whitespace-nowrap">오늘 투입량</th>
//                 <th className="p-3.5">상세 작업 내용</th>
//                 <th className="p-3.5 w-32 text-right whitespace-nowrap">구매 지출액</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredLogs.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="text-center py-10 text-slate-400">
//                     등록된 작업 기록이 없습니다.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
//                     <td className="p-3.5 font-medium text-slate-500 whitespace-nowrap">{log.date}</td>
//                     <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">{log.cropName}</td>
//                     <td className="p-3.5 font-semibold text-emerald-700 whitespace-nowrap">{log.workType}</td>
//                     <td className="p-3.5 font-medium whitespace-nowrap">
//                       {log.usageQuantity !== undefined ? (
//                         <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">
//                           {log.usageQuantity} {log.usageUnit}
//                         </span>
//                       ) : (
//                         <span className="text-slate-300">-</span>
//                       )}
//                     </td>
//                     <td className="p-3.5 text-slate-700 leading-normal whitespace-pre-line">{log.content}</td>
//                     <td className="p-3.5 text-right font-bold whitespace-nowrap">
//                       {log.expenseCost ? (
//                         <div className="flex flex-col items-end">
//                           <span className="text-slate-900">{log.expenseCost.toLocaleString()} 원</span>
//                           {log.expenseCategory && <span className="text-[10px] text-slate-400 font-normal">({log.expenseCategory})</span>}
//                         </div>
//                       ) : (
//                         <span className="text-slate-300">-</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* 6. 일지 작성 모달 */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
//               <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">📝 새 영농일지 작성</h2>
//               <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto flex-1">
//               <FarmingLogForm cropList={crops} onSaveSuccess={handleSaveSuccess} onClose={() => setIsModalOpen(false)} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import { Plus, Calendar, DollarSign, Sparkles, X, Trash2, Sprout } from "lucide-react";

// // ----------------------------------------------------------------------
// // 1. 타입 정의
// // ----------------------------------------------------------------------
// export interface CropSelect {
//   id: number;
//   name: string;
//   bloomDate?: string; // 개화일 (YYYY-MM-DD)
//   totalGdd?: number; // 계산된 누적 적산온도 (℃)
//   bloomDays?: number; // 개화 후 경과일 (D+일수)
// }

// export interface LogTableItem {
//   id: number;
//   date: string;
//   cropId: number;
//   cropName: string;
//   stage: string; // 생육 단계
//   workType: string; // 작업 유형
//   content: string;
//   expenseCategory?: "" | "종묘/씨앗" | "비료비" | "농약비" | "기타자재";
//   expenseCost?: number; // 투입 비용 (원)
//   author: string;
// }

// // 모달 내부 동적 폼 데이터 구조
// interface DynamicLogItem {
//   id: string;
//   cropId: string;
//   workType: string;
//   growthStage: string;
//   expenseCategory: "종묘/씨앗" | "비료비" | "농약비" | "기타자재" | "";
//   expenseCost: string;
//   content: string;
// }

// const createInitialLogItem = (): DynamicLogItem => ({
//   id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
//   cropId: "",
//   workType: "일반관리",
//   growthStage: "",
//   expenseCategory: "",
//   expenseCost: "",
//   content: "",
// });

// // ----------------------------------------------------------------------
// // 2. 영농일지 작성 모달 폼 컴포넌트
// // ----------------------------------------------------------------------
// function FarmingLogForm({ cropList, onSaveSuccess, onClose }: { cropList: CropSelect[]; onSaveSuccess: (newLogs: LogTableItem[]) => void; onClose: () => void }) {
//   const [workDate, setWorkDate] = useState(() => new Date().toISOString().split("T")[0]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [logItems, setLogItems] = useState<DynamicLogItem[]>([createInitialLogItem()]);

//   const handleAddLogItem = () => {
//     setLogItems((prev) => [...prev, createInitialLogItem()]);
//   };

//   const handleRemoveLogItem = (id: string) => {
//     if (logItems.length === 1) {
//       alert("최소 한 개의 작업 내용은 입력해야 합니다.");
//       return;
//     }
//     setLogItems((prev) => prev.filter((item) => item.id !== id));
//   };

//   const handleLogItemChange = <K extends keyof DynamicLogItem>(id: string, field: K, value: DynamicLogItem[K]) => {
//     setLogItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
//   };

//   // 일지 저장 핸들러
//   const handleSaveAllLogs = async () => {
//     const hasEmptyCrop = logItems.some((item) => !item.cropId);
//     if (hasEmptyCrop) {
//       alert("⚠️ 모든 작업 항목의 '대상 작물'을 선택해 주세요.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const newCreatedLogs: LogTableItem[] = logItems.map((item, idx) => {
//         const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);

//         // 상세 작업 내용 구성
//         let finalContent = item.content;

//         // 🌟 [자동기록] 개화 후 누적 적산온도 문구 자동 삽입 로직
//         if (selectedCrop?.totalGdd !== undefined) {
//           const autoGddText = `\n[자동기록] 개화 후 누적 적산온도: ${selectedCrop.totalGdd.toFixed(1)}℃`;
//           finalContent = finalContent ? `${finalContent}${autoGddText}` : autoGddText.trim();
//         }

//         return {
//           id: Date.now() + idx,
//           date: workDate,
//           cropId: Number(item.cropId),
//           cropName: selectedCrop?.name || "알 수 없음",
//           stage: item.growthStage || "기초",
//           workType: item.workType || "일반관수/관리",
//           content: finalContent,
//           expenseCategory: item.expenseCategory,
//           expenseCost: item.expenseCost ? Number(item.expenseCost) : undefined,
//           author: "관리자",
//         };
//       });

//       onSaveSuccess(newCreatedLogs);
//       alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 일지가 저장되었습니다.`);
//       onClose();
//     } catch (error) {
//       console.error("저장 에러:", error);
//       alert("일지 저장 중 오류가 발생했습니다.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-5 font-sans text-left">
//       {/* 1. 작업 기준 날짜 */}
//       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//         <label htmlFor="work-date" className="block text-xs font-bold text-slate-600 mb-1.5">
//           📅 작업 기준 일자
//         </label>
//         <input id="work-date" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium" />
//       </div>

//       {/* 2. 작업 리스트 */}
//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <label className="text-sm font-bold text-slate-800">🛠️ 오늘 진행한 작업 내역</label>
//           <button type="button" onClick={handleAddLogItem} className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer">
//             <Plus className="w-3.5 h-3.5" /> 작업 추가
//           </button>
//         </div>

//         {logItems.map((item, index) => {
//           const selectedCrop = cropList.find((c) => String(c.id) === item.cropId);

//           return (
//             <div key={item.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm flex flex-col gap-3">
//               {logItems.length > 1 && (
//                 <button type="button" onClick={() => handleRemoveLogItem(item.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-0.5 transition-colors">
//                   <Trash2 className="w-3.5 h-3.5" /> 삭제
//                 </button>
//               )}

//               <div className="text-xs font-bold text-emerald-600"># 작업 기록 {index + 1}</div>

//               {/* 대상 작물 선택 */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">
//                   대상 작물 <span className="text-red-500">*</span>
//                 </label>
//                 <select value={item.cropId} onChange={(e) => handleLogItemChange(item.id, "cropId", e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
//                   <option value="">-- 작물 선택 --</option>
//                   {cropList.map((crop) => (
//                     <option key={crop.id} value={crop.id}>
//                       {crop.name}
//                     </option>
//                   ))}
//                 </select>

//                 {/* 🌟 [보조 연동 1] 작물 선택 시 배지(Badge) 형태 텍스트 노출 */}
//                 {selectedCrop && (
//                   <div className="mt-2">
//                     {selectedCrop.bloomDate && selectedCrop.totalGdd !== undefined ? (
//                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-bold">
//                         <span>🌸 {selectedCrop.name}</span>
//                         <span className="text-amber-700">
//                           (개화 D+${selectedCrop.bloomDays} / 누적 {selectedCrop.totalGdd.toFixed(1)}℃)
//                         </span>
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-[11px] font-medium">⚠️ 개화일 미등록 작물 (적산온도 미산출)</span>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* 생육 단계 & 작업 유형 */}
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-[11px] font-bold text-slate-500 mb-1">생육 단계</label>
//                   <select value={item.growthStage} onChange={(e) => handleLogItemChange(item.id, "growthStage", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
//                     <option value="">-- 생육단계 선택 --</option>
//                     <option value="육묘기">🌱 육묘기</option>
//                     <option value="정식/활착기">🪵 정식/활착기</option>
//                     <option value="영양생장기">🌿 영양생장기</option>
//                     <option value="개화기">🌸 개화기</option>
//                     <option value="착과/비대기">🍅 착과/비대기</option>
//                     <option value="성숙/수확기">🎯 성숙/수확기</option>
//                     <option value="수확후관리">🧹 수확후관리</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-bold text-slate-500 mb-1">작업 유형</label>
//                   <input type="text" placeholder="예: 추비 살포, 순지르기" value={item.workType} onChange={(e) => handleLogItemChange(item.id, "workType", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-emerald-500" />
//                 </div>
//               </div>

//               {/* 투입 비용 입력 */}
//               <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
//                 <div>
//                   <label className="block text-[11px] font-bold text-slate-600 mb-1">경영비 항목 (선택)</label>
//                   <select value={item.expenseCategory} onChange={(e) => handleLogItemChange(item.id, "expenseCategory", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium">
//                     <option value="">비용 발생 없음</option>
//                     <option value="종묘/씨앗">🌱 종묘 / 씨앗 구매</option>
//                     <option value="비료비">🧪 비료 / 영양제 구매</option>
//                     <option value="농약비">🚜 농약 / 방제비</option>
//                     <option value="기타자재">📦 기타 자재비</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-bold text-slate-600 mb-1">소요 금액 (원)</label>
//                   <input type="number" placeholder="예: 50000" disabled={!item.expenseCategory} value={item.expenseCost} onChange={(e) => handleLogItemChange(item.id, "expenseCost", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 disabled:bg-slate-100" />
//                 </div>
//               </div>

//               {/* 상세 내용 */}
//               <div>
//                 <label className="block text-[11px] font-bold text-slate-500 mb-1">상세 작업 내용</label>
//                 <textarea placeholder="진행한 상세 내용이나 특이사항을 적어주세요." value={item.content} onChange={(e) => handleLogItemChange(item.id, "content", e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-emerald-500" />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* 저장 버튼 */}
//       <button type="button" disabled={isSubmitting} onClick={handleSaveAllLogs} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4 cursor-pointer">
//         {isSubmitting ? "저장 처리 중..." : "🎯 작성된 일지 저장하기"}
//       </button>
//     </div>
//   );
// }

// // ----------------------------------------------------------------------
// // 3. 메인 영농일지 페이지 컴포넌트
// // ----------------------------------------------------------------------
// export default function FarmLogsPage() {
//   const [selectedCropId, setSelectedCropId] = useState<number | "ALL">("ALL");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // 샘플 작물 리스트 (적산온도 및 개화 후 경과일 데이터 포함)
//   const [crops] = useState<CropSelect[]>([
//     { id: 101, name: "화순 토마토", bloomDate: "2026-04-10", totalGdd: 520.4, bloomDays: 45 },
//     { id: 102, name: "설향 딸기", bloomDate: "2026-08-01", totalGdd: 480.5, bloomDays: 35 },
//     { id: 103, name: "샤인머스켓", bloomDate: undefined }, // 개화일 미등록 작물 예시
//   ]);

//   // 영농일지 데이터 상태
//   const [logs, setLogs] = useState<LogTableItem[]>([
//     {
//       id: 1,
//       date: "2026-09-05",
//       cropId: 101,
//       cropName: "화순 토마토",
//       stage: "수확후관리",
//       workType: "출하",
//       content: "토마토 2차 출하 완료 및 잔재물 정리\n[자동기록] 개화 후 누적 적산온도: 520.4℃",
//       expenseCategory: "기타자재",
//       expenseCost: 45000,
//       author: "관리자",
//     },
//     {
//       id: 2,
//       date: "2026-09-01",
//       cropId: 101,
//       cropName: "화순 토마토",
//       stage: "영양생장기",
//       workType: "비료/영양제 살포",
//       content: "추비 1차 진행 (관수 시비)\n[자동기록] 개화 후 누적 적산온도: 505.0℃",
//       expenseCategory: "비료비",
//       expenseCost: 120000,
//       author: "관리자",
//     },
//     {
//       id: 3,
//       date: "2026-08-15",
//       cropId: 102,
//       cropName: "설향 딸기",
//       stage: "정식/활착기",
//       workType: "가식/이식",
//       content: "설향 딸기 모종 800주 정식 완료",
//       expenseCategory: "종묘/씨앗",
//       expenseCost: 400000,
//       author: "관리자",
//     },
//   ]);

//   // 신규 일지 저장 시 목록 업데이트
//   const handleSaveSuccess = (newLogs: LogTableItem[]) => {
//     setLogs((prev) => [...newLogs, ...prev]);
//   };

//   // 선택 작물 필터링
//   const filteredLogs = useMemo(() => {
//     if (selectedCropId === "ALL") return logs;
//     return logs.filter((log) => log.cropId === selectedCropId);
//   }, [logs, selectedCropId]);

//   const currentCropInfo = useMemo(() => {
//     if (selectedCropId === "ALL") return null;
//     return crops.find((c) => c.id === selectedCropId);
//   }, [crops, selectedCropId]);

//   // 투입 경영비 합계 계산
//   const expenseSummary = useMemo(() => {
//     const summary = { seed: 0, fertilizer: 0, pesticide: 0, etc: 0, total: 0 };
//     filteredLogs.forEach((log) => {
//       if (!log.expenseCost) return;
//       const cost = log.expenseCost;
//       summary.total += cost;
//       switch (log.expenseCategory) {
//         case "종묘/씨앗":
//           summary.seed += cost;
//           break;
//         case "비료비":
//           summary.fertilizer += cost;
//           break;
//         case "농약비":
//           summary.pesticide += cost;
//           break;
//         default:
//           summary.etc += cost;
//           break;
//       }
//     });
//     return summary;
//   }, [filteredLogs]);

//   return (
//     <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans text-slate-800">
//       {/* 1. 페이지 헤더 */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900 tracking-tight">영농일지 & 자원 관리</h1>
//           <p className="text-xs text-slate-500 mt-1">작물별 생육 단계와 투입 비용(종묘·비료·농약) 현황을 통합 관리합니다.</p>
//         </div>
//         <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
//           <Plus className="w-4 h-4" />
//           <span>새 일지 작성</span>
//         </button>
//       </div>

//       {/* 2. 개화일 안내 및 적산온도 현황 배너 */}
//       <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
//         <div className="flex items-start gap-3">
//           <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 sm:mt-0">
//             <Sparkles className="w-4 h-4" />
//           </div>
//           <div>
//             <div className="font-extrabold text-amber-950 text-sm">정확한 AI 수확일 예측(적산온도 계산)을 위해 개화일을 등록해 주세요!</div>
//             <p className="text-amber-800 mt-0.5 leading-relaxed">
//               작물별 <strong>개화일(Bloom Date)</strong>이 설정되어 있으면 일지 작성 시 <strong>누적 적산온도(GDD)</strong>가 메모에 자동 저장됩니다.
//             </p>
//           </div>
//         </div>
//         {currentCropInfo && (
//           <div className="shrink-0 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-200 text-right">
//             <span className="text-[11px] text-slate-500 block">선택 작물 적산온도</span>
//             <span className="font-bold text-amber-900">{currentCropInfo.totalGdd !== undefined ? `🌸 D+${currentCropInfo.bloomDays} (${currentCropInfo.totalGdd.toFixed(1)}℃)` : "⚠️ 개화일 미등록"}</span>
//           </div>
//         )}
//       </div>

//       {/* 3. 작물 필터 탭 */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
//         <button onClick={() => setSelectedCropId("ALL")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCropId === "ALL" ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//           🌱 전체 작물 보기
//         </button>
//         {crops.map((crop) => (
//           <button key={crop.id} onClick={() => setSelectedCropId(crop.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${selectedCropId === crop.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//             <span>{crop.name}</span>
//             {!crop.bloomDate && <span className="w-2 h-2 rounded-full bg-amber-500" title="개화일 미등록" />}
//           </button>
//         ))}
//       </div>

//       {/* 4. 경영비 집계 요약 표 */}
//       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
//             <DollarSign className="w-4 h-4 text-emerald-600" />
//             <span>투입 자재 및 경영비 합계 요약</span>
//           </h3>
//           <span className="text-xs text-slate-500">
//             총 투입 비용: <strong className="text-emerald-600 text-sm">{expenseSummary.total.toLocaleString()}원</strong>
//           </span>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
//           <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🌱 모종 / 씨앗</div>
//             <div className="font-bold text-slate-800 text-sm">{expenseSummary.seed.toLocaleString()} 원</div>
//           </div>
//           <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🧪 비료 / 영양제</div>
//             <div className="font-bold text-slate-800 text-sm">{expenseSummary.fertilizer.toLocaleString()} 원</div>
//           </div>
//           <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">🚜 농약 / 방제비</div>
//             <div className="font-bold text-slate-800 text-sm">{expenseSummary.pesticide.toLocaleString()} 원</div>
//           </div>
//           <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
//             <div className="text-slate-400 mb-1 font-medium">📦 기타 자재비</div>
//             <div className="font-bold text-slate-800 text-sm">{expenseSummary.etc.toLocaleString()} 원</div>
//           </div>
//           <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
//             <div className="text-emerald-700 mb-1 font-medium">💰 총 합계</div>
//             <div className="font-black text-emerald-800 text-sm">{expenseSummary.total.toLocaleString()} 원</div>
//           </div>
//         </div>
//       </div>

//       {/* 5. 통합 데이터 테이블 */}
//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
//           <span className="text-xs font-bold text-slate-700">📋 일자별 작업 내용 및 생육 단계 목록</span>
//           <span className="text-[11px] text-slate-400">총 {filteredLogs.length}건의 기록</span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs border-collapse">
//             <thead>
//               <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold">
//                 <th className="p-3.5 w-28 whitespace-nowrap">작업 일자</th>
//                 <th className="p-3.5 w-28 whitespace-nowrap">작물명</th>
//                 <th className="p-3.5 w-28 whitespace-nowrap">생육 단계</th>
//                 <th className="p-3.5 w-32 whitespace-nowrap">작업 유형</th>
//                 <th className="p-3.5">상세 작업 내용</th>
//                 <th className="p-3.5 w-32 text-right whitespace-nowrap">투입 비용</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredLogs.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="text-center py-10 text-slate-400">
//                     등록된 작업 기록이 없습니다.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
//                     <td className="p-3.5 font-medium text-slate-500 whitespace-nowrap">{log.date}</td>
//                     <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">{log.cropName}</td>
//                     <td className="p-3.5 whitespace-nowrap">
//                       <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-semibold text-[11px]">{log.stage}</span>
//                     </td>
//                     <td className="p-3.5 font-semibold text-emerald-700 whitespace-nowrap">{log.workType}</td>
//                     <td className="p-3.5 text-slate-700 leading-normal whitespace-pre-line">{log.content}</td>
//                     <td className="p-3.5 text-right font-bold whitespace-nowrap">{log.expenseCost ? <span className="text-slate-900">{log.expenseCost.toLocaleString()} 원</span> : <span className="text-slate-300">-</span>}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* 6. 일지 작성 모달 */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
//               <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">📝 새 영농일지 작성</h2>
//               <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto flex-1">
//               <FarmingLogForm cropList={crops} onSaveSuccess={handleSaveSuccess} onClose={() => setIsModalOpen(false)} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
