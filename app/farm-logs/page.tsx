"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Wallet, BookOpen, Plus, CheckCircle2, X, Trash2, Calendar, Sun, Thermometer, Mic, MicOff, Camera } from "lucide-react";
import { getFarmLogs, getCropsForSelect, createFarmLog } from "@/app/actions/farmLog";
import { analyzeFarmImage } from "@/app/actions/analyzeFarmImage";

// Web Speech API를 위한 커스텀 인터페이스 정의 (any 없음)
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null;
  start(): void;
}
// TypeScript가 브라우저의 Web Speech API를 인식할 수 있도록 전역 확장
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}
// ----------------------------------------------------------------------
// 1. 타입 및 데이터 구조 정의
// ----------------------------------------------------------------------

export function calculateDailyGDD(tempMax: number, tempMin: number, baseTemp: number = 10): number {
  const tempAvg = (tempMax + tempMin) / 2;
  if (tempAvg < baseTemp) return 0;
  return Number((tempAvg - baseTemp).toFixed(1));
}

// 예시 날씨 API 호출 함수 (실제 API 경로에 맞춰 조정)
export async function fetchDailyWeatherAndGdd(date: string, nx: number = 60, ny: number = 127, cropBaseTemp: number = 10): Promise<DailyWeatherData> {
  try {
    const weatherRes = await fetch(`/api/weather?date=${date}&nx=${nx}&ny=${ny}`);
    if (!weatherRes.ok) throw new Error("날씨 정보 조회 실패");
    const data = await weatherRes.json();

    const tempMax = data.tempMax ?? 25;
    const tempMin = data.tempMin ?? 15;
    const tempAvg = Number(((tempMax + tempMin) / 2).toFixed(1));
    const dailyGdd = calculateDailyGDD(tempMax, tempMin, cropBaseTemp);

    return {
      weather: data.weatherCondition || "맑음",
      tempAvg,
      tempMax,
      tempMin,
      dailyGdd,
    };
  } catch (error) {
    console.warn("기상 정보 불러오기 실패 (기본값 설정):", error);
    return { weather: "맑음", tempAvg: 20, tempMax: 25, tempMin: 15, dailyGdd: 10 };
  }
}

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
  area?: string;
}

export interface DailyWeatherData {
  weather: string;
  tempAvg: number;
  tempMax: number;
  tempMin: number;
  dailyGdd?: number;
}

export interface DiaryDisplayItem {
  id: number | string;
  date: string;
  weather?: string;
  tempAvg?: number;
  tempMax?: number;
  tempMin?: number;
  dailyGdd?: number;
  targetCrop?: string;
  plantDate?: string | null;
  bloomDate?: string | null;
  income?: number;
  expense?: number;
  solarTermTask?: string;
  taskDone?: string[];
  content?: string;
  author?: string;
  workType?: string;
}

export interface RawFarmLog {
  id: number | string;
  date: string;
  weather?: string;
  tempAvg?: number;
  tempMax?: number;
  tempMin?: number;
  dailyGdd?: number;
  cropName?: string;
  targetCrop?: string;
  cropBaseTemp?: number;
  income?: number;
  expense?: number;
  solarTermTask?: string;
  workType?: string;
  taskDone?: string[];
  content?: string;
  author?: string;
}

const WORK_CATEGORIES = [
  {
    id: "env",
    title: "🌱 1. 토양 및 재배 환경 조성 (시작 단계)",
    tasks: ["경운(땅갈기)/정지", "시비(밑거름 주기)", "멀칭", "유인줄/지주대 설치"],
  },
  {
    id: "growth",
    title: "🌿 2. 생육 관리 및 전지 (성장 단계)",
    tasks: ["파종(씨뿌리기)", "모종 심기(정식)", "물주기(관수)", "비료/영양제 살포", "농약방제/병해충 관리", "제초(풀뽑기)", "가식/이식", "보식/솎아내기(적묘)", "순지르기(적심)/곁순 제거", "적화(꽃솎기)/적과(열매솎기)", "유인"],
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
  imageUrl?: string;
}

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
  imageUrl: "",
});

// ----------------------------------------------------------------------
// 2. 영농 일지 동적 작성 폼 컴포넌트 (모달 내부용)
// ----------------------------------------------------------------------

function FarmingLogForm({ cropList, setCropList, onSaveSuccess, onClose }: { cropList: CropSelect[]; setCropList?: React.Dispatch<React.SetStateAction<CropSelect[]>>; onSaveSuccess: () => Promise<void>; onClose: () => void }) {
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [weatherData, setWeatherData] = useState<DailyWeatherData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logItems, setLogItems] = useState<DynamicLogItem[]>([createInitialLogItem()]);
  const [listeningId, setListeningId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // 날짜 변경 시 기상 정보 및 GDD 자동 계산 호출
  useEffect(() => {
    let active = true;
    async function loadWeather() {
      const data = await fetchDailyWeatherAndGdd(workDate);
      if (active) setWeatherData(data);
    }
    loadWeather();
    return () => {
      active = false;
    };
  }, [workDate]);

  const handleWorkToggle = (id: string, workType: FarmTask) => {
    setLogItems((prevList) =>
      prevList.map((item) => {
        if (item.id !== id) return item;
        const currentWorks = item.selectedWorks || [];
        const nextWorks = currentWorks.includes(workType) ? currentWorks.filter((w) => w !== workType) : [...currentWorks, workType];
        return { ...item, selectedWorks: nextWorks };
      }),
    );
  };

  const handleAddLogItem = () => setLogItems((prev) => [...prev, createInitialLogItem()]);

  const handleRemoveLogItem = (id: string) => {
    if (logItems.length === 1) {
      alert("최소 한 개의 작업 내용은 입력해야 합니다.");
      return;
    }
    setLogItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 📝 입력 필드 변경 핸들러 (수치 삭제 시 관련 작업 해제 및 입력값 초기화)
  const handleLogItemChange = <K extends keyof DynamicLogItem>(id: string, field: K, value: DynamicLogItem[K]) => {
    setLogItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let updatedWorks = [...(item.selectedWorks || [])];
          let updatedFertAmount = item.fertilizerAmount;
          let updatedPestAmount = item.pesticideAmount;
          let updatedHarvestAmount = item.harvestAmount;
          const updatedCropId = item.cropId;
          const updatedGrowthStage = item.growthStage;

          // 💡 입력값이 빈값일 때(백스페이스로 다 지웠을 때)
          if (value === "" || value === null || value === undefined) {
            if (field === "content") {
              // 1. 상세 내용(content)을 다 지웠을 때는 모든 항목을 통째로 초기화!
              return {
                ...item,
                content: "",
                cropId: "",
                growthStage: "",
                selectedWorks: [],
                fertilizerAmount: "",
                pesticideAmount: "",
                harvestAmount: "",
              };
            } else if (field === "fertilizerAmount") {
              updatedWorks = updatedWorks.filter((w) => !w.includes("비료") && !w.includes("시비"));
              updatedFertAmount = "";
            } else if (field === "pesticideAmount") {
              updatedWorks = updatedWorks.filter((w) => !w.includes("농약") && !w.includes("방제"));
              updatedPestAmount = "";
            } else if (field === "harvestAmount") {
              updatedWorks = updatedWorks.filter((w) => !w.includes("수확"));
              updatedHarvestAmount = "";
            }
          }

          return {
            ...item,
            [field]: value,
            selectedWorks: updatedWorks,
            fertilizerAmount: updatedFertAmount,
            pesticideAmount: updatedPestAmount,
            harvestAmount: updatedHarvestAmount,
          };
        }
        return item;
      }),
    );
  };

  // 사진 업로드 핸들러
  // 📸 사진 업로드 및 Gemini AI 자동 분석 핸들러
  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    handleLogItemChange(id, "imageUrl", previewUrl);

    setLogItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: item.content ? `${item.content}\n[AI 사진 분석 중...]` : "[AI 사진 분석 중...]",
          };
        }
        return item;
      }),
    );

    // 2. 현재 선택된 항목의 작물 정보 가져오기
    const currentItem = logItems.find((item) => item.id === id);
    const selectedCrop = cropList.find((c) => String(c.id) === currentItem?.cropId);

    const cropName = selectedCrop ? selectedCrop.name : "미지정 작물";
    const farmArea = "400평";

    // 3. 이미지를 Base64로 변환하여 서버 액션(Gemini Vision) 호출
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;

      try {
        const res = await analyzeFarmImage(base64Image, cropName, farmArea);

        if (res.success && res.resultText) {
          setLogItems((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                // 기존 내용 중 '[현장사진첨부완료]'가 있다면 AI 결과로 대체하거나 아래에 붙여넣기
                let cleaned = item.content || "";
                cleaned = cleaned.replace("[AI 사진 분석 중...]", "").replace("[현장사진첨부완료]", "").trim();
                const finalContent = cleaned ? `${cleaned}\n${res.success && res.resultText ? res.resultText : "[사진 분석 실패]"}` : res.success && res.resultText ? res.resultText : "[사진 분석 실패]";
                return {
                  ...item,
                  content: finalContent,
                  ...(res.growthStage && { growthStage: res.growthStage }),
                };
              }
              return item;
            }),
          );
        } else {
          // 유효하지 않은 사진이거나 에러 발생 시 처리
          alert(res.error || "사진 분석에 실패했습니다.");
          setLogItems((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  content: (item.content || "").replace("[AI 사진 분석 중...]", "[사진 분석 실패]").trim(),
                };
              }
              return item;
            }),
          );
        }
      } catch (err) {
        console.error("사진 분석 오류:", err);
        alert("사진 분석 중 오류가 발생했습니다.");
        setLogItems((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                content: (item.content || "").replace("[AI 사진 분석 중...]", "[사진 분석 실패]").trim(),
              };
            }
            return item;
          }),
        );
      }
    };
  };

  // 음성 텍스트에서 신규 작물명을 유추하는 추출 함수
  const extractNewCropName = (text: string, currentCropList: Array<{ id: string | number; name: string }>): string | null => {
    // 이미 등록된 작물 단어는 제외하기 위한 목록
    const existingNames = currentCropList.map((c) => c.name);
    // 농업 관련 조사/조동사/작업 키워드는 작물명에서 제외
    const stopWords = ["물", "비료", "농약", "풀", "제포", "파종", "모종", "정식", "수확", "밭", "작업", "오늘"];
    //  주표 패턴 매칭 정규식
    // 1) "OO밭에", "OO에" 패턴 (예: "샤인머스캣밭에", "상추에")
    // 2) "OO 심었", "OO 가꿨" 패턴
    const patterns = [/([가-힣a-zA-Z0-9]+)(?=밭|논|에|에서|로|과|와|\s|$)/, /([가-힣a-zA-Z0-9]+)(?:을|를)\s*(?:심|가꾸|재배)/];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        // 기존 작물 목록에 이미 있거나, 불용어(조사/작업명)인 경우
        if (!existingNames.includes(candidate) && !stopWords.includes(candidate) && candidate.length >= 2) {
          return candidate;
        }
      }
    }
    return null;
  };

  // 💡 입력된 텍스트(음성 또는 타이핑)를 분석하여 추출된 데이터를 반환하는 공통 함수
  const parseFarmInputText = (text: string, currentCropList: Array<{ id: string | number; name: string }>, currentItem: DynamicLogItem, setCropListState?: React.Dispatch<React.SetStateAction<CropSelect[]>>) => {
    let newCropId = currentItem.cropId;
    let newGrowthStage = currentItem.growthStage;
    const newWorks = [...(currentItem.selectedWorks || [])] as DynamicLogItem["selectedWorks"];

    let newFertilizerAmount = currentItem.fertilizerAmount;
    let newFertilizerUnit = currentItem.fertilizerUnit || "kg";
    let newPesticideAmount = currentItem.pesticideAmount;
    let newPesticideUnit = currentItem.pesticideUnit || "ml";
    let newHarvestAmount = currentItem.harvestAmount;
    let newHarvestUnit = currentItem.harvestUnit || "kg";

    // 1. 작물 자동 감지 및 신규 등록
    const matchedCrop = currentCropList.find((crop) => text.includes(crop.name));
    if (matchedCrop) {
      newCropId = String(matchedCrop.id);
    } else {
      const inferredCropName = extractNewCropName(text, currentCropList);
      if (inferredCropName) {
        const newId = Date.now();
        const newCropObj = { id: newId, name: inferredCropName };
        if (setCropListState) {
          setCropListState((prevCrops) => [...prevCrops, newCropObj]);
        }
        newCropId = String(newId);
      }
    }

    // 2. 생육 단계 자동 감지
    if (text.includes("육묘") || text.includes("모종") || text.includes("씨앗") || text.includes("파종")) {
      newGrowthStage = "육묘";
    } else if (text.includes("정식") || text.includes("심") || text.includes("활착")) {
      newGrowthStage = "정식/활착";
    } else if (text.includes("영양") || text.includes("자라") || text.includes("잎") || text.includes("순") || text.includes("성장") || text.includes("비료") || text.includes("시비")) {
      newGrowthStage = "영양생장";
    } else if (text.includes("꽃") || text.includes("개화")) {
      newGrowthStage = "개화";
    } else if (text.includes("열매") || text.includes("착과") || text.includes("비대") || text.includes("크기")) {
      newGrowthStage = "착과/비대";
    } else if (text.includes("수확") || text.includes("따") || text.includes("출하") || text.includes("성숙")) {
      newGrowthStage = "성숙/수확";
    } else if (text.includes("정리") || text.includes("청소") || text.includes("수확후")) {
      newGrowthStage = "수확후관리";
    } else if (text.includes("농약") || text.includes("방제") || text.includes("병해충")) {
      newGrowthStage = "영양생장";
    }

    // 3. 비료/영양제 추출 및 작업 체크
    if (text.includes("비료") || text.includes("시비") || text.includes("영양제") || text.includes("밑거름")) {
      if (text.includes("밑거름")) {
        if (!newWorks.includes("시비(밑거름 주기)")) newWorks.push("시비(밑거름 주기)");
      } else {
        if (!newWorks.includes("비료/영양제 살포")) newWorks.push("비료/영양제 살포");
      }
      const fertMatch = text.match(/(\d+(?:\.\d+)?)\s*(포대|포|kg|g|L|ml)?/i);
      if (fertMatch) {
        newFertilizerAmount = fertMatch[1];
        if (fertMatch[2]) {
          const unit = fertMatch[2].toLowerCase();
          newFertilizerUnit = unit === "포" ? "포대" : unit;
        }
      }
    }

    // 4. 농약 추출 및 작업 체크
    if (text.includes("농약") || text.includes("방제") || text.includes("병해충") || text.includes("벌레")) {
      if (!newWorks.includes("농약방제/병해충 관리")) newWorks.push("농약방제/병해충 관리");
      const pestMatch = text.match(/(\d+(?:\.\d+)?)\s*(ml|L|l|g|리터)?/i);
      if (pestMatch) {
        newPesticideAmount = pestMatch[1];
        if (pestMatch[2]) {
          const unit = pestMatch[2].toLowerCase();
          newPesticideUnit = unit === "리터" ? "L" : unit === "l" ? "L" : unit;
        }
      }
    }

    // 5. 수확량 추출 및 작업 체크
    if (text.includes("수확") || text.includes("따") || text.includes("출하")) {
      if (!newWorks.includes("수확")) newWorks.push("수확");
      const harvestMatch = text.match(/(\d+(?:\.\d+)?)\s*(kg|g|박스|포대)?/i);
      if (harvestMatch) {
        newHarvestAmount = harvestMatch[1];
        if (harvestMatch[2]) newHarvestUnit = harvestMatch[2];
      }
    }

    // 6. 기타 작업 종류 키워드 자동 체크
    const workKeywords: Record<string, DynamicLogItem["selectedWorks"][number]> = {
      경운: "경운(땅갈기)/정지",
      땅갈기: "경운(땅갈기)/정지",
      정지: "경운(땅갈기)/정지",
      멀칭: "멀칭",
      비닐: "멀칭",
      // 🌟 추가: 비닐하우스 점검/관리 관련 키워드 매핑
      비닐하우스: "잔재물 정리/포장 정비", // 또는 해당하는 작업명
      점검: "잔재물 정리/포장 정비",
      시설: "잔재물 정리/포장 정비",

      유인줄: "유인줄/지주대 설치",
      지주대: "유인줄/지주대 설치",
      파종: "파종(씨뿌리기)",
      씨뿌리: "파종(씨뿌리기)",
      모종: "모종 심기(정식)",
      정식: "모종 심기(정식)",
      물: "물주기(관수)",
      관수: "물주기(관수)",
      급수: "물주기(관수)",
      풀: "제초(풀뽑기)",
      제초: "제초(풀뽑기)",
      잡초: "제초(풀뽑기)",
      가식: "가식/이식",
      이식: "가식/이식",
      보식: "보식/솎아내기(적묘)",
      솎아내기: "보식/솎아내기(적묘)",
      순지르기: "순지르기(적심)/곁순 제거",
      적심: "순지르기(적심)/곁순 제거",
      곁순: "순지르기(적심)/곁순 제거",
      적화: "적화(꽃솎기)/적과(열매솎기)",
      적과: "적화(꽃솎기)/적과(열매솎기)",
      잔재물: "잔재물 정리/포장 정비",
      선별: "선별/포장",
      포장: "선별/포장",
      출하: "출하",
      판매: "출하",
      납품: "출하",
    };

    for (const [keyword, workName] of Object.entries(workKeywords)) {
      if (text.includes(keyword) && !newWorks.includes(workName)) {
        if (keyword === "유인" && text.includes("유인줄")) continue; // 예외 처리
        newWorks.push(workName);
      }
    }

    return {
      cropId: String(newCropId),
      growthStage: newGrowthStage,
      selectedWorks: newWorks,
      fertilizerAmount: newFertilizerAmount,
      fertilizerUnit: newFertilizerUnit,
      pesticideAmount: newPesticideAmount,
      pesticideUnit: newPesticideUnit,
      harvestAmount: newHarvestAmount,
      harvestUnit: newHarvestUnit,
    };
  };

  // 🎙️ 음성 입력 핸들러 (Web Speech API + 작업 자동 체크 연동)
  const handleVoiceInput = (id: string) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";

    recognition.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      const currentItem = logItems.find((i) => i.id === id);
      if (!currentItem) return;

      // 🌟 공통 파싱 함수 호출 한 번으로 모든 데이터 추출 완료!
      const parsedData = parseFarmInputText(speechText, cropList, currentItem, setCropList);

      setLogItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const updatedContent = item.content ? `${item.content}\n${speechText}` : speechText;
            return {
              ...item,
              content: updatedContent,
              ...parsedData,
            };
          }
          return item;
        }),
      );
    };

    recognition.start();
  };

  // 상세 내용 텍스트가 변경될 때 호출되는 핸들러
  const handleContentChange = (id: string, newContent: string) => {
    const currentItem = logItems.find((i) => i.id === id);
    if (!currentItem) return;

    // 🌟 똑같이 공통 파싱 함수 활용!
    const parsedData = parseFarmInputText(newContent, cropList, currentItem, setCropList);

    setLogItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: newContent,
            ...parsedData,
          };
        }
        return item;
      }),
    );
  };

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
        if (item.content) details.push(item.content);
        if (item.growthStage) details.push(`[생장단계: ${item.growthStage}]`);
        if (item.fertilizerAmount) details.push(`[비료사용량: ${item.fertilizerAmount}${item.fertilizerUnit}]`);
        if (item.pesticideAmount) details.push(`[농약사용량: ${item.pesticideAmount}${item.pesticideUnit}]`);
        if (item.harvestAmount) details.push(`[수확량: ${item.harvestAmount}${item.harvestUnit}]`);
        if (item.imageUrl) details.push(`[현장사진첨부완료]`);
        const fullContent = details.join("\n").trim();

        // 날씨 및 GDD 데이터 포함하여 저장
        const payload = {
          date: workDate,
          cropId: Number(item.cropId),
          workType: item.selectedWorks.join(", "),
          stage: item.growthStage || "기초",
          memo: fullContent,
          content: fullContent,
          weather: weatherData?.weather || "맑음",
          tempAvg: weatherData?.tempAvg,
          tempMax: weatherData?.tempMax,
          tempMin: weatherData?.tempMin,
          dailyGdd: weatherData?.dailyGdd,
        };

        return createFarmLog(payload);
      });

      const results = await Promise.all(requests);
      const failedResult = results.find((res) => !res.success);

      if (failedResult) {
        throw new Error(failedResult.error || "일지 저장 중 오류가 발생했습니다.");
      }

      alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 영농 기록이 저장되었습니다.`);
      await onSaveSuccess(); // 목록 재로드
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("저장 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 font-sans text-left">
      {/* 작업 기준 날짜 & 기상 정보 / GDD 미리보기 */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div>
          <label htmlFor="work-date" className="block text-xs font-bold text-slate-600 mb-1">
            📅 작업 기준 일자
          </label>
          <input id="work-date" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium" />
        </div>

        {weatherData && (
          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-900">
            <span className="flex items-center gap-1 font-semibold">
              <Sun className="w-4 h-4 text-amber-500" /> 날씨: {weatherData.weather} ({weatherData.tempMin}℃ / {weatherData.tempMax}℃)
            </span>
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <Thermometer className="w-4 h-4 text-emerald-600" /> 당일 GDD: {weatherData.dailyGdd}℃·일
            </span>
          </div>
        )}
      </div>

      {/* 동적 작업 추가 리스트 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-slate-700">🛠️ 오늘 진행한 작업 내역</label>
          <button type="button" onClick={handleAddLogItem} className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> 작업 추가
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {logItems.map((item, index) => (
            <div key={item.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm flex flex-col gap-4">
              {logItems.length > 1 && (
                <button type="button" onClick={() => handleRemoveLogItem(item.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-0.5 cursor-pointer transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
              )}

              <div className="text-xs font-bold text-emerald-600"># 작업 기록 {index + 1}</div>

              {/* 상세 작업 내용 & 음성 입력/사진 첨부 버튼 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-500">상세 작업 내용</label>
                  <div className="flex items-center gap-2">
                    {/* 음성 입력 버튼 */}
                    <button type="button" onClick={() => handleVoiceInput(item.id)} className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${listeningId === item.id ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {listeningId === item.id ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-emerald-600" />}
                      {listeningId === item.id ? "듣고 있어요..." : "음성 입력"}
                    </button>

                    {/* 사진 첨부 버튼 */}
                    <label className="px-2 py-1 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer">
                      <Camera className="w-3 h-3 text-amber-600" />
                      사진 첨부
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(item.id, e)} />
                    </label>
                  </div>
                </div>
                <textarea placeholder="진행한 작업의 특이사항이나 구체적인 규격을 입력하세요. (음성 입력으로 말해서 채울 수 있습니다)" value={item.content} onChange={(e) => handleContentChange(item.id, e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-emerald-500" />
                {/* 첨부된 사진 미리보기 */}
                {item.imageUrl && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt="현장 사진 미리보기" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleLogItemChange(item.id, "imageUrl", "")} className="absolute top-1 right-1 bg-slate-900/60 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

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
              </div>

              {/* 카테고리별 작업 선택 */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-800">
                  수행한 작업 (단계별 선택) <span className="text-red-500">*</span>
                </label>

                {WORK_CATEGORIES.map((category) => (
                  <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                    <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[11px] font-bold text-slate-700">{category.title}</div>
                    <div className="p-3 bg-white grid grid-cols-2 gap-2">
                      {category.tasks.map((type) => {
                        const isChecked = item.selectedWorks?.includes(type) || false;
                        return (
                          <label key={type} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 text-xs select-none">
                            <input type="checkbox" checked={isChecked} onChange={() => handleWorkToggle(item.id, type)} className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 border-slate-300" />
                            <span className={isChecked ? "text-emerald-700 font-bold" : ""}>{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 조건부 입력 영역 */}
              <div className="flex flex-col gap-1">
                {item.selectedWorks?.some((w) => w.includes("비료") || w.includes("시비")) && (
                  <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300 shadow-inner mb-2">
                    <span className="text-xs font-bold text-slate-800 shrink-0 w-24">🧪 밑거름/비료량:</span>
                    <input type="number" placeholder="예: 500" value={item.fertilizerAmount || ""} onChange={(e) => handleLogItemChange(item.id, "fertilizerAmount", e.target.value)} className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600" />
                    <select value={item.fertilizerUnit || "kg"} onChange={(e) => handleLogItemChange(item.id, "fertilizerUnit", e.target.value)} className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold">
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="포대">포대</option>
                    </select>
                  </div>
                )}

                {item.selectedWorks?.some((w) => w.includes("농약") || w.includes("방제")) && (
                  <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300 shadow-inner mb-2">
                    <span className="text-xs font-bold text-slate-800 shrink-0 w-24">🚜 농약 사용량:</span>
                    <input type="number" placeholder="예: 20" value={item.pesticideAmount || ""} onChange={(e) => handleLogItemChange(item.id, "pesticideAmount", e.target.value)} className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600" />
                    <select value={item.pesticideUnit || "ml"} onChange={(e) => handleLogItemChange(item.id, "pesticideUnit", e.target.value)} className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold">
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                )}

                {item.selectedWorks?.some((w) => w.includes("수확")) && (
                  <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300 shadow-inner mb-2">
                    <span className="text-xs font-bold text-slate-800 shrink-0 w-24">📦 수확량 기록:</span>
                    <input type="number" placeholder="예: 15" value={item.harvestAmount || ""} onChange={(e) => handleLogItemChange(item.id, "harvestAmount", e.target.value)} className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600" />
                    <select value={item.harvestUnit || "kg"} onChange={(e) => handleLogItemChange(item.id, "harvestUnit", e.target.value)} className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold">
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="박스">박스</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 생장 단계 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">🌱 현재 생장 단계</label>
                <select value={item.growthStage || ""} onChange={(e) => handleLogItemChange(item.id, "growthStage", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-emerald-500">
                  <option value="">-- 현재 생장 단계 선택 --</option>
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
      <button type="button" disabled={isSubmitting} onClick={handleSaveAllLogs} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4 cursor-pointer disabled:cursor-not-allowed">
        {isSubmitting ? "저장 처리 중..." : "🎯 작성된 모든 일지 내역 저장하기"}
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. 메인 영농일지 & 손익 관리 페이지 컴포넌트
// ----------------------------------------------------------------------

export default function FarmLogsPage() {
  const [diaries, setDiaries] = useState<DiaryDisplayItem[]>([]);
  const [crops, setCrops] = useState<CropSelect[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    try {
      // 비동기 작업 전에 호출하되, useCallback 내부 비동기 컨텍스트에서 안전하게 처리
      const [fetchedLogs, fetchedCrops] = await Promise.all([getFarmLogs(), getCropsForSelect()]);

      const formattedLogs: DiaryDisplayItem[] = (fetchedLogs as RawFarmLog[]).map((log) => ({
        id: String(log.id),
        date: log.date,
        weather: log.weather || "맑음",
        tempAvg: log.tempAvg,
        tempMax: log.tempMax,
        tempMin: log.tempMin,
        dailyGdd: log.dailyGdd,
        targetCrop: log.cropName || log.targetCrop || "미지정 작물",
        income: log.income || 0,
        expense: log.expense || 0,
        solarTermTask: log.solarTermTask || "절기 가이드 정보 없음",
        taskDone: log.workType ? log.workType.split(", ") : log.taskDone || (log.content ? [log.content] : []),
        content: log.content,
        author: log.author,
      }));

      setDiaries(formattedLogs);
      setCrops(fetchedCrops);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 마운트 시 데이터 비동기 조회
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      await loadData();
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [loadData]);
  const totalIncome = diaries.reduce((acc, cur) => acc + (cur.income || 0), 0);
  const totalExpense = diaries.reduce((acc, cur) => acc + (cur.expense || 0), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      {/* 헤더 및 추가 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">영농일지 및 경영 손익</h1>
          <p className="text-sm text-slate-500 mt-1">일자별 농작업, 자원 투입 기록 및 경영 손익 현황을 관리합니다.</p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>새 일지 작성</span>
        </button>
      </div>

      {!loading && (
        <div className="space-y-6">
          {/* 손익 경영 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 font-semibold">총 수입</p>
                <p className="text-xl font-black text-emerald-600 mt-1">+{totalIncome.toLocaleString()} 원</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 font-semibold">총 지출</p>
                <p className="text-xl font-black text-rose-600 mt-1">-{totalExpense.toLocaleString()} 원</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 font-semibold">순이익</p>
                <p className={`text-xl font-black mt-1 ${netProfit >= 0 ? "text-slate-800" : "text-rose-600"}`}>{netProfit.toLocaleString()} 원</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 영농일지 목록 리스트 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" /> 최근 기록된 영농일지
              </h2>
              <button onClick={() => setIsModalOpen(true)} className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> 일지 작성
              </button>
            </div>

            {diaries.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">등록된 영농일지가 없습니다. 새 일지를 작성해 보세요!</div>
            ) : (
              <div className="space-y-4">
                {diaries.map((diary) => (
                  <div key={diary.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2 pb-2 border-b">
                      <span className="font-bold text-emerald-700">🌱 작물/농장: {diary.targetCrop}</span>
                      <div className="flex gap-3">
                        {diary.plantDate && <span>파종/정식일: {diary.plantDate}</span>}
                        {diary.bloomDate && <span>개화일: {diary.bloomDate}</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-start text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {diary.date}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600 font-medium">{diary.weather}</span>

                        {/* 기온 정보가 존재하는 경우 표시 */}
                        {diary.tempMin !== undefined && diary.tempMax !== undefined && (
                          <span className="text-slate-500 text-[11px]">
                            ({diary.tempMin}℃ ~ {diary.tempMax}℃)
                          </span>
                        )}

                        {/* 적산온도(GDD) 태그 표시 */}
                        {diary.dailyGdd !== undefined && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold border border-amber-200 rounded text-[11px]">GDD: {diary.dailyGdd}℃·일</span>}

                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded text-[11px]">{diary.targetCrop}</span>
                      </div>
                      <div className="text-right shrink-0">
                        {diary.income && diary.income > 0 ? <span className="text-emerald-600 font-bold block">+{diary.income.toLocaleString()}원</span> : null}
                        {diary.expense && diary.expense > 0 ? <span className="text-rose-500 font-bold block">-{diary.expense.toLocaleString()}원</span> : null}
                      </div>
                    </div>

                    {diary.solarTermTask && <div className="text-xs text-amber-800 bg-amber-50/80 p-2 rounded-md font-medium border border-amber-200/50">💡 절기 가이드: {diary.solarTermTask}</div>}

                    {diary.taskDone && diary.taskDone.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs font-semibold text-slate-700 mb-1">수행 작업:</p>
                        <ul className="space-y-1">
                          {diary.taskDone.map((task, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {diary.content && <p className="text-slate-600 text-xs mt-2 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-100">{diary.content}</p>}

                    {diary.author && <div className="text-[11px] text-slate-400 text-right pt-1">작성자: {diary.author}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 동적 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">📝 영농일지 일괄 작성</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <FarmingLogForm cropList={crops} setCropList={setCrops} onSaveSuccess={loadData} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
