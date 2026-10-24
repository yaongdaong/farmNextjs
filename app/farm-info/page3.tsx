"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, X, Trash2, CloudSun, Loader2 } from "lucide-react";
import { getFarmLogs, getCropsForSelect, createFarmLog } from "@/app/actions/farmLog";

// ----------------------------------------------------------------------
// 1. 타입 및 데이터 구조 정의
// ----------------------------------------------------------------------

export interface CropItem {
  id: string | number;
  statusType: "growing" | "planned";
  name: string;
  area: string;
  plantDate?: string;
  bloomDate?: string;
}

interface CropSelect {
  id: number;
  name: string;
}

interface LogDisplayItem {
  id: string | number;
  date: string;
  cropName: string | undefined;
  workType: string;
  content: string;
  author: string;
}

// 농업 작업 카테고리 구조
const WORK_CATEGORIES = [
  {
    id: "env",
    title: "🌱 1. 토양 및 재배 환경 조성 (시작 단계)",
    tasks: ["경운(땅갈기)/정지", "시비(밑거름 주기)", "멀칭", "유인줄/지주대 설치"],
  },
  {
    id: "growth",
    title: "🌿 2. 생육 관리 및 전지 (성장 단계)",
    tasks: [
      "물주기(관수)",
      "비료/영양제 살포",
      "농약방제/병해충 관리",
      "가식/이식",
      "보식/솎아내기(적묘)",
      "순지르기(적심)/곁순 제거",
      "적화(꽃솎기)/적과(열매솎기)",
      "유인",
    ],
  },
  {
    id: "facility",
    title: "⚙️ 3. 시설 및 농기계 관리",
    tasks: ["시설 점검(하우스 개폐기, 관수시설 등)", "농기계 정비(예초기, 관리기, 트랙터 등)"],
  },
  {
    id: "harvest",
    title: "🎯 4. 수확 및 수확 이후 단계",
    tasks: ["수확", "잔재물 정리/포장 정비", "선별/포장", "출하"],
  },
] as const;

const ALL_TASKS = WORK_CATEGORIES.flatMap((cat) => cat.tasks);
type FarmTask = (typeof ALL_TASKS)[number];

interface DynamicLogItem {
  id: string;
  cropId: string;
  selectedWorks: FarmTask[];
  fertilizerAmount: string;
  fertilizerUnit: string;
  pesticideAmount: string;
  pesticideUnit: string;
  harvestAmount: string;
  harvestUnit: string;
  content: string;
  growthStage: string;
}

// 초기 일지 항목 생성 헬퍼 함수
const createInitialLogItem = (): DynamicLogItem => ({
  id: typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  cropId: "",
  selectedWorks: [],
  fertilizerAmount: "",
  fertilizerUnit: "kg",
  pesticideAmount: "",
  pesticideUnit: "ml",
  harvestAmount: "",
  harvestUnit: "kg",
  content: "",
  growthStage: "",
});

// Weather Code to Text Converter
const parseWeatherCode = (code: number): string => {
  if (code === 0) return "☀️ 맑음";
  if (code >= 1 && code <= 3) return "⛅ 구름조금/흐림";
  if (code >= 45 && code <= 48) return "🌫️ 안개";
  if (code >= 51 && code <= 67) return "🌧️ 비";
  if (code >= 71 && code <= 77) return "❄️ 눈";
  if (code >= 80 && code <= 82) return "🌦️ 소나기";
  if (code >= 95) return "⛈️ 뇌우";
  return "🌤️ 보통";
};

// ----------------------------------------------------------------------
// 2. 영농 일지 동적 작성 폼 컴포넌트 (모달 내부용)
// ----------------------------------------------------------------------

function FarmingLogForm({
  cropList,
  onSaveSuccess,
  onClose,
}: {
  cropList: CropSelect[];
  onSaveSuccess: () => Promise<void>;
  onClose: () => void;
}) {
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [weatherInfo, setWeatherInfo] = useState<string>("날씨 조회 중...");
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [logItems, setLogItems] = useState<DynamicLogItem[]>([createInitialLogItem()]);

  // 날씨 API 조회 함수 (Open-Meteo)
  const fetchWeather = useCallback(async (dateStr: string) => {
    setIsWeatherLoading(true);
    try {
      // 기본 위치: 서울 (사용자 브라우저 GPS 위치 조회 시도)
      let lat = 37.5665;
      let lon = 126.9780;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch {
          // GPS 접근 실패 시 기본 좌표 사용
        }
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`
      );
      const data = await res.json();

      if (data && data.daily && data.daily.time) {
        const dateIndex = data.daily.time.indexOf(dateStr);
        if (dateIndex !== -1) {
          const code = data.daily.weathercode[dateIndex];
          const maxTemp = Math.round(data.daily.temperature_2m_max[dateIndex]);
          const minTemp = Math.round(data.daily.temperature_2m_min[dateIndex]);
          setWeatherInfo(`${parseWeatherCode(code)} (${minTemp}°C ~ ${maxTemp}°C)`);
        } else {
          setWeatherInfo("☀️ 맑음 (20°C)");
        }
      } else {
        setWeatherInfo("☀️ 맑음");
      }
    } catch (err) {
      console.error("날씨 정보 불러오기 실패:", err);
      setWeatherInfo("☀️ 맑음");
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

useEffect(() => {
  let isMounted = true;

  const runFetch = async () => {
    if (isMounted) {
      await fetchWeather(workDate);
    }
  };

  runFetch();

  return () => {
    isMounted = false;
  };
}, [workDate, fetchWeather]);

  const handleWorkToggle = (id: string, workType: FarmTask) => {
    setLogItems((prevList) =>
      prevList.map((item) => {
        if (item.id !== id) return item;
        const currentWorks = item.selectedWorks || [];
        const nextWorks = currentWorks.includes(workType)
          ? currentWorks.filter((w) => w !== workType)
          : [...currentWorks, workType];
        return { ...item, selectedWorks: nextWorks };
      })
    );
  };

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

  const handleLogItemChange = <K extends keyof DynamicLogItem>(
    id: string,
    field: K,
    value: DynamicLogItem[K]
  ) => {
    setLogItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // DB 전송 핸들러
  const handleSaveAllLogs = async () => {
    const hasEmptyField = logItems.some((item) => !item.cropId || item.selectedWorks.length === 0);
    if (hasEmptyField) {
      alert("⚠️ 모든 작업 항목의 '대상 작물'을 선택하고 '수행한 작업'을 최소 하나 이상 체크해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requests = logItems.map((item) => {
        const details: string[] = [];
        if (weatherInfo) details.push(`[날씨: ${weatherInfo}]`);
        if (item.growthStage) details.push(`[생장단계: ${item.growthStage}]`);
        if (item.fertilizerAmount) details.push(`[비료사용량: ${item.fertilizerAmount}${item.fertilizerUnit}]`);
        if (item.pesticideAmount) details.push(`[농약사용량: ${item.pesticideAmount}${item.pesticideUnit}]`);
        if (item.harvestAmount) details.push(`[수확량: ${item.harvestAmount}${item.harvestUnit}]`);
        if (item.content) details.push(`\n[상세내용]\n${item.content}`);

        const fullContent = details.join(" ").trim();

        const payload = {
          date: workDate,
          cropId: Number(item.cropId),
          workType: item.selectedWorks.join(", "),
          stage: item.growthStage || "기초",
          memo: fullContent,
          content: fullContent,
        };

        return createFarmLog(payload);
      });

      const results = await Promise.all(requests);
      const failedResult = results.find((res) => !res.success);

      if (failedResult) {
        throw new Error(failedResult.error || "일지 저장 중 오류가 발생했습니다.");
      }

      alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 영농 기록이 저장되었습니다.`);
      await onSaveSuccess();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        console.error("저장 에러:", error.message);
        alert(error.message);
      } else {
        console.error("알 수 없는 에러 발생:", error);
        alert("저장 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 font-sans text-left text-slate-900">
      {/* 1. 작업 기준 날짜 및 자동 날씨 정보 */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="work-date" className="block text-xs font-bold text-slate-700 mb-1.5">
            📅 작업 기준 일자
          </label>
          <input
            id="work-date"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            🌤️ 날씨 정보 (자동 수집)
          </label>
          <div className="p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white font-semibold flex items-center gap-2 shadow-sm min-h-[38px]">
            {isWeatherLoading ? (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                날씨 정보를 불러오는 중...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-800">
                <CloudSun className="w-4 h-4 text-amber-500 shrink-0" />
                {weatherInfo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. 동적 작업 추가 리스트 영역 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-slate-800">🛠️ 오늘 진행한 작업 내역</label>
          <button
            type="button"
            onClick={handleAddLogItem}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 작업 추가
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {logItems.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border border-slate-300 rounded-xl relative bg-white shadow-sm flex flex-col gap-4 text-slate-900"
            >
              {logItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLogItem(item.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
              )}

              <div className="text-xs font-extrabold text-emerald-700"># 작업 기록 {index + 1}</div>

              {/* 대상 작물 선택 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  대상 작물 <span className="text-red-500">*</span>
                </label>
                <select
                  value={item.cropId}
                  onChange={(e) => handleLogItemChange(item.id, "cropId", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                >
                  <option value="" className="text-slate-500">
                    -- 작물 선택 --
                  </option>
                  {cropList.map((crop) => (
                    <option key={crop.id} value={crop.id} className="text-slate-900 font-semibold">
                      {crop.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 카테고리별 작업 선택 */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-800">
                  수행한 작업 (단계별 선택) <span className="text-red-500">*</span>
                </label>

                {WORK_CATEGORIES.map((category) => (
                  <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                    <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-xs font-bold text-slate-800">
                      {category.title}
                    </div>
                    <div className="p-3 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {category.tasks.map((type) => {
                        const isChecked = item.selectedWorks?.includes(type) || false;
                        return (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs select-none hover:text-emerald-700"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleWorkToggle(item.id, type)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-slate-300 cursor-pointer"
                            />
                            <span className={isChecked ? "text-emerald-700 font-extrabold" : "text-slate-800"}>
                              {type}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 조건부 세부 입력 영역 (비료, 농약, 수확량) */}
              <div className="flex flex-col gap-1">
                {/* 비료 */}
                {item.selectedWorks?.some((w) => w.includes("비료") || w.includes("시비")) && (
                  <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-300 shadow-inner mb-2">
                    <span className="text-xs font-bold text-slate-800 shrink-0 w-28">🧪 밑거름/비료량:</span>
                    <input
                      type="number"
                      placeholder="예: 500"
                      value={item.fertilizerAmount || ""}
                      onChange={(e) => handleLogItemChange(item.id, "fertilizerAmount", e.target.value)}
                      className="flex-1 p-1.5 text-xs font-bold border-b border-slate-400 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600"
                    />
                    <select
                      value={item.fertilizerUnit || "kg"}
                      onChange={(e) => handleLogItemChange(item.id, "fertilizerUnit", e.target.value)}
                      className="p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900 font-bold"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="포대">포대</option>
                    </select>
                  </div>
                )}

                {/* 농약 */}
                {item.selectedWorks?.some((w) => w.includes("농약") || w.includes("방제")) && (
                  <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-300 shadow-inner mb-2">
                    <span className="text-xs font-bold text-slate-800 shrink-0 w-28">🚜 농약 사용량:</span>
                    <input
                      type="number"
                      placeholder="예: 20"
                      value={item.pesticideAmount || ""}
                      onChange={(e) => handleLogItemChange(item.id, "pesticideAmount", e.target.value)}
                      className="flex-1 p-1.5 text-xs font-bold border-b border-slate-400 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600"
                    />
                    <select
                      value={item.pesticideUnit || "ml"}
                      onChange={(e) => handleLogItemChange(item.id, "pesticideUnit", e.target.value)}
                      className="p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900 font-bold"
                    >
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                )}

                {/* 수확량 */}
                {item.selectedWorks?.some((w) => w.includes("수확")) && (
                  <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-300 shadow-inner mb-2">
                    <span className="text-xs font-bold text-slate-800 shrink-0 w-28">📦 수확량 기록:</span>
                    <input
                      type="number"
                      placeholder="예: 15"
                      value={item.harvestAmount || ""}
                      onChange={(e) => handleLogItemChange(item.id, "harvestAmount", e.target.value)}
                      className="flex-1 p-1.5 text-xs font-bold border-b border-slate-400 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600"
                    />
                    <select
                      value={item.harvestUnit || "kg"}
                      onChange={(e) => handleLogItemChange(item.id, "harvestUnit", e.target.value)}
                      className="p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900 font-bold"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="박스">박스</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 상세 작업 내용 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상세 작업 내용</label>
                <textarea
                  placeholder="진행한 작업의 특이사항이나 구체적인 규격을 입력하세요."
                  value={item.content}
                  onChange={(e) => handleLogItemChange(item.id, "content", e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white font-semibold placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                />
              </div>

              {/* 생장 단계 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🌱 현재 생장 단계</label>
                <select
                  value={item.growthStage || ""}
                  onChange={(e) => handleLogItemChange(item.id, "growthStage", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                >
                  <option value="" className="text-slate-500">
                    -- 현재 생장 단계 선택 --
                  </option>
                  <option value="육묘">🌱 1. 육묘 및 묘종기 (정식 전)</option>
                  <option value="정식/활착">🪵 2. 정식 및 활착기</option>
                  <option value="영양생장">🌿 3. 영양 생장기</option>
                  <option value="개화">🌸 4. 개화기</option>
                  <option value="착과/비대">🍅 5. 착과 및 비대기</option>
                  <option value="성숙/수확">🎯 6. 성숙 및 수확기</option>
                  <option value="수확후관리">🧹 7. 수확 후 관리기</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 저장 버튼 */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleSaveAllLogs}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> 저장 처리 중...
          </>
        ) : (
          "🎯 작성된 모든 일지 내역 저장하기"
        )}
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. 메인 페이지 컴포넌트
// ----------------------------------------------------------------------

export default function FarmLogsPage() {
  const [logs, setLogs] = useState<LogDisplayItem[]>([]);
  const [crops, setCrops] = useState<CropSelect[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [fetchedLogs, fetchedCrops] = await Promise.all([getFarmLogs(), getCropsForSelect()]);

      const formattedLogs: LogDisplayItem[] = fetchedLogs.map((log) => ({
        ...log,
        id: String(log.id),
      }));

      setLogs(formattedLogs);
      setCrops(fetchedCrops);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6 text-slate-900">
      {/* 헤더 및 일지 작성 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">영농일지</h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">일자별 농작업, 자원 투입 및 생육 기록을 작성하고 관리합니다.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>새 일지 작성</span>
        </button>
      </div>

      {/* 일지 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> 데이터 로딩 중 ...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm font-semibold">
            등록된 영농일지가 없습니다. 새 일지를 작성해 보세요!
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-emerald-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-lg border border-emerald-200">
                    {log.cropName || "미지정 작물"}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-lg">
                    {log.workType}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.date}</span>
                </div>
              </div>

              <p className="text-slate-800 text-sm font-semibold leading-relaxed whitespace-pre-line">
                {log.content}
              </p>

              <div className="text-xs text-slate-500 text-right font-bold">작성자: {log.author || "농가관리자"}</div>
            </div>
          ))
        )}
      </div>

      {/* 동적 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                📝 영농일지 상세 일괄 작성
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 스크롤 본문 */}
            <div className="p-6 overflow-y-auto flex-1">
              <FarmingLogForm cropList={crops} onSaveSuccess={loadData} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}