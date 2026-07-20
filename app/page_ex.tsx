"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ==========================================
// 0. 정적 데이터 정의 (컴포넌트 외부로 분리하여 메모리 최적화)
// ==========================================
const LOCATION_DATA: Record<string, string[]> = {
  서울특별시: ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  부산광역시: ["중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구", "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구", "사상구", "기장군"],
  대구광역시: ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군", "군위군"],
  인천광역시: ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
  광주광역시: ["동구", "서구", "남구", "북구", "광산구"],
  대전광역시: ["동구", "중구", "서구", "유성구", "대덕구"],
  울산광역시: ["중구", "남구", "동구", "북구", "울주군"],
  세종특별자치시: ["세종시"],
  경기도: ["수원시", "고양시", "용인시", "성남시", "부천시", "화성시", "안산시", "남양주시", "안양시", "평택시", "시흥시", "파주시", "의정부시", "김포시", "광주시", "광명시", "군포시", "하남시", "오산시", "양주시", "이천시", "구리시", "안성시", "포천시", "의왕시", "양평군", "여주시", "동두천시", "가평군", "과천시", "연천군"],
  강원특별자치도: ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
  충청북도: ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
  충청남도: ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
  전라북도: ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
  전라남도: ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
  경상북도: ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
  경상남도: ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
  제주특별자치도: ["제주시", "서귀포시"],
};

interface ChartDataItem {
  date: string;
  pastPrice: number;
  predictPrice: number;
}

interface DiaryLogItem {
  id: string;
  date: string;
  item: string;
  areaPyeong: number;
  location: string;
  realTemp: number;
  content: string;
}

// 날씨 정보 데이터 모델 정의
interface WeatherInfo {
  temp?: number;
  humidity?: number;
  clouds?: number;
  rain?: number;
  factor?: number;
}

const mockCsvPredictionData: Record<string, Array<ChartDataItem>> = {
  "완숙 토마토": [
    { date: "05-01", pastPrice: 2100, predictPrice: 2200 },
    { date: "05-15", pastPrice: 2400, predictPrice: 2600 },
    { date: "06-01", pastPrice: 2800, predictPrice: 3100 },
    { date: "06-06", pastPrice: 3400, predictPrice: 3800 },
    { date: "06-15", pastPrice: 2900, predictPrice: 3200 },
    { date: "07-01", pastPrice: 2300, predictPrice: 2400 },
    { date: "07-15", pastPrice: 1900, predictPrice: 2100 },
  ],
  딸기: [
    { date: "12-01", pastPrice: 11000, predictPrice: 12500 },
    { date: "12-15", pastPrice: 13000, predictPrice: 14000 },
    { date: "01-05", pastPrice: 15000, predictPrice: 16500 },
    { date: "01-20", pastPrice: 12000, predictPrice: 13000 },
  ],
};

const mockAiMentDict: Record<string, string> = {
  "완숙 토마토": "📊 공영도매시장 5개년 빅데이터 분석 결과, 완숙 토마토는 6월 6일쯤에 출고하는 것이 평균 경락 단가가 가장 비쌉니다. 현재 생육 속도를 감안할 때 해당 주차에 물량을 집중시키는 것을 권장합니다.",
  딸기: "📊 가락시장 도매 경향 및 정밀 분석 결과, 딸기는 1월 5일 주차에 출하할 때 가장 고단가를 받으실 수 있습니다.",
};

// diaryData의 완전한 타입 정의
interface DiaryDataState {
  date: string;
  item: string;
  envTemp: string;
  envHumid: string;
  growType: string;
  status: string;
  expenseType: string;
  expenseAmount: string;
  weather: WeatherInfo | null;
  work: string;
  area_pyeong: number;
  sido: string;
  sigungu: string;
  stage: string;
}

export default function SmartFarmDirectorPage() {
  // 1. 영농일기 & 예측 상태 관리
  const [diaryData, setDiaryData] = useState<DiaryDataState>({
    date: "",
    item: "",
    envTemp: "",
    envHumid: "",
    growType: "하우스",
    status: "",
    expenseType: "",
    expenseAmount: "",
    weather: null,
    work: "",
    area_pyeong: 1,
    sido: "",
    sigungu: "",
    stage: "",
  });

  const fullLocation = `${diaryData.sido} ${diaryData.sigungu}`.trim();

  // 시도/시군구가 완성되었을 때 백엔드 날씨 정보를 자동으로 가져오는 이펙트
  useEffect(() => {
    if (!diaryData.sido || !diaryData.sigungu) return;
    const fetchWeather = async () => {
      try {
        const locationQuery = `${diaryData.sido} ${diaryData.sigungu}`.trim();

        // 주소 뒤에 encodeURIComponent()를 꼭 씌워주세요!
        const res = await fetch(`http://localhost:8000/api/farm/weather?location=${encodeURIComponent(locationQuery)}`);
        if (res.ok) {
          const weatherData = await res.json(); // weathearData 오타 수정
          setDiaryData((prev) => {
            const updated = { ...prev, weather: weatherData };
            // 노지 재배일 경우 날씨 데이터를 온/습도 필드에 즉시 동기화
            if (prev.growType === "노지") {
              updated.envTemp = weatherData.temp ? `${weatherData.temp}°C` : "";
              updated.envHumid = weatherData.humidity ? `${weatherData.humidity}%` : "";
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("날씨 연동 실패:", err); // print 오타 console.error로 수정
      }
    };
    fetchWeather();
  }, [diaryData.sido, diaryData.sigungu, diaryData.growType]);

  // 영농일지에서 가져온 데이터 목록
  const [diaryList] = useState<DiaryLogItem[]>([
    { id: "1", date: "2026-07-01", item: "완숙 토마토", areaPyeong: 150, location: "전라남도 함평군", realTemp: 26.5, content: "가지치기 및 추비 작업 완료" },
    { id: "2", date: "2026-07-05", item: "완숙 토마토", areaPyeong: 150, location: "전라남도 함평군", realTemp: 28.2, content: "일조량 양호, 관수 작업 진행" },
    { id: "3", date: "2026-07-10", item: "완숙 토마토", areaPyeong: 150, location: "전라남도 함평군", realTemp: 29.0, content: "첫 수확 시작 및 상태 점검" },
  ]);

  // 저장된 일지들의 '진짜 측정 온도' 누적합 계산
  const totalRealTempSum = diaryList.reduce((sum, log) => sum + log.realTemp, 0);
  const targetAccumulatedTemp = 1050.0;
  const tempDifference = totalRealTempSum - targetAccumulatedTemp;

  const [predictionNotice, setPredictionNotice] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);

  // 차트 및 AI 분석 문구 상태
  const [serverChartData, setServerChartData] = useState<ChartDataItem[] | null>(null);
  const [serverAnalysisMent, setServerAnalysisMent] = useState<string | null>(null);

  const currentItem = diaryData.item.trim();

  const chartData = serverChartData || mockCsvPredictionData[currentItem] || [];
  const aiAnalysisMent = serverAnalysisMent || mockAiMentDict[currentItem] || (currentItem !== "" ? `📊 '${currentItem}' 품목에 대한 수집된 데이터가 없습니다. 영농일지 분석을 요청해 주세요.` : "");

  // 로딩상태
  const [progress, setProgress] = useState(0); // 0%에서 시작
  // 시/도 변경 핸들러
  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDiaryData((prev) => ({
      ...prev,
      sido: e.target.value,
      sigungu: "",
    }));
  };

  // [기능 1] 영농일기 기반 AI 수확 예측 및 공지 등록
  const handleAnalyzeDiary = async () => {
    if (!diaryData.date.trim() || !diaryData.item.trim() || !diaryData.status.trim() || !diaryData.work.trim() || !diaryData.sido || !diaryData.sigungu) {
      return alert("모든 항목을 입력해주세요.");
    }

    const pyeongNum = Number(diaryData.area_pyeong);
    if (isNaN(pyeongNum) || pyeongNum <= 0) {
      alert("재배 면적(평)에는 0보다 큰 숫자만 입력해주세요.");
      return;
    }

    setIsPredicting(true);
    // ai분석 바
    setProgress(0); // 시작할 때 0%로 초기화
    // 기상 게이지 타이머 시작 (0% -> 90%까지 부드럽게 도달)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // 90% 도달하면 잠시 대기
          return 90;
        }
        // 처음에는 빠르게 오르다가 갈수록 느려지게 만듭니다(시각적 효과)
        const increment = prev < 50 ? 8 : prev < 75 ? 4 : 1.5;
        return Math.min(90, Math.round(prev + increment));
      });
    }, 150); // 0.15초마다 갱신

    try {
      const res = await fetch("http://localhost:8000/api/farm/predict-harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: diaryData.item.trim(),
          status: diaryData.status,
          work: diaryData.work,
          area_pyeong: pyeongNum,
          location: fullLocation,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.detail || `서버 에러 (상태코드:${res.status})`;
        alert(`입력 오류:${errorMsg}`);
        return;
      }

      const data = await res.json();
      // 통신 성공 시 즉시 100% 채우기
      setProgress(100);

      if (data.chart_data) setServerChartData(data.chart_data);
      if (data.analysis_ment) setServerAnalysisMent(data.analysis_ment);
      if (data.raw_ai_analysis?.notice_title) {
        setPredictionNotice(`📢 [출하 예고] ${data.raw_ai_analysis.notice_title}`);
      }

      alert(`📢 분석 완료! 최적 출하일: ${data.best_date || "확인 불가"}`);
    } catch (err: unknown) {
      console.error("에러 디테일:", err);
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      alert(`❌ 오류 발생: ${errorMessage}`);
      setProgress(0);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900">행복농장 AI 통합 비즈니스 컨트롤러</h1>
          <p className="text-sm text-slate-500 mt-1">영농 일지 분석부터 쇼핑몰 정산, 인공지능 PPT 보고서 발행까지 하나의 파이프라인으로 관리합니다.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 섹션 1: 데일리 영농일기 작성 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">1. 데일리 영농일기 작성</h2>
              <p className="text-xs text-slate-400 mt-0.5">양식 항목의 내용만 입력하시면 AI가 자동으로 분석을 수행합니다.</p>

              {/* 나의 농장 정보 설정 */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm my-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-800 font-bold">
                  <span className="text-lg">🏡</span>
                  <h2>나의 농장 정보 설정</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
                  {/* 밭 평수 입력 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 font-bold flex items-center gap-1">
                      <span>📐</span> 밭 면적 (평수):
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={diaryData.area_pyeong || ""}
                        onChange={(e) =>
                          setDiaryData((prev) => ({
                            ...prev,
                            area_pyeong: parseFloat(e.target.value),
                          }))
                        }
                        placeholder="예: 300"
                        className="w-full p-2.5 pr-10 border border-slate-200 rounded-xl bg-white font-sans text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
                      />
                      <span className="absolute right-3 text-xs text-slate-400 font-sans font-bold pointer-events-none">평</span>
                    </div>
                  </div>

                  {/* 농사 위치 선택 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 font-bold flex items-center gap-1">
                      <span>📍</span> 농장 재배 위치:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={diaryData.sido} onChange={handleSidoChange} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-sans text-xs focus:ring-green-500 focus:outline-none">
                        <option value="">-- 시/도 --</option>
                        {Object.keys(LOCATION_DATA).map((sido) => (
                          <option key={sido} value={sido}>
                            {sido}
                          </option>
                        ))}
                      </select>

                      <select
                        value={diaryData.sigungu}
                        onChange={(e) =>
                          setDiaryData((prev) => ({
                            ...prev,
                            sigungu: e.target.value,
                          }))
                        }
                        disabled={!diaryData.sido}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-sans text-xs focus:ring-1 focus:ring-green-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">-- 시/구/군 --</option>
                        {diaryData.sido &&
                          LOCATION_DATA[diaryData.sido].map((sigungu: string) => (
                            <option key={sigungu} value={sigungu}>
                              {sigungu}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 고정 양식 플레이트 */}
              <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 font-mono text-sm shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                  <span className="text-emerald-600 font-bold">[영농일지 양식 - 적산온도 분석형]</span>
                  <span className="text-[10px] text-slate-400 font-sans">일조량·강수량 가중치 엔진 연동</span>
                </div>

                {/* 작업 일자*/}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 w-24 shrink-0 font-sans font-medium">- 작업 일자:</span>
                    <input type="date" value={diaryData.date} onChange={(e) => setDiaryData((prev) => ({ ...prev, date: e.target.value }))} className="flex-1 p-1.5 border border-slate-200 rounded bg-white font-sans text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                </div>

                {/* AI 생육 적산온도 가중치 지표 대시보드 */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-2 font-sans text-xs">
                  <div className="flex justify-between items-center font-bold text-emerald-800 border-b border-emerald-100 pb-1">
                    <span className="flex items-center gap-1">📊 AI 생육 적산온도 가중치 지표</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md">실시간 연동 완료</span>
                  </div>

                  {fullLocation ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 my-1">
                      <div className="bg-white p-2 border border-emerald-100 rounded text-center">
                        <p className="text-slate-400 text-[10px]">실시간 기온</p>
                        <p className="text-sm font-bold text-slate-800">{diaryData.weather?.temp ?? "23.0"}°C</p>
                      </div>
                      <div className="bg-white p-2 border border-emerald-100 rounded text-center">
                        <p className="text-slate-400 text-[10px]">☀️ 일조 상태(구름)</p>
                        <p className="text-sm font-bold text-slate-800">{diaryData.weather?.clouds ?? "20"}%</p>
                      </div>
                      <div className="bg-white p-2 border border-emerald-100 rounded text-center">
                        <p className="text-slate-400 text-[10px]">🌧️ 실시간 강수량</p>
                        <p className="text-sm font-bold text-blue-600">{diaryData.weather?.rain ?? "0.0"} mm</p>
                      </div>
                      <div className="bg-white p-2 border border-emerald-500/20 bg-emerald-100/30 rounded text-center">
                        <p className="text-emerald-700 font-semibold text-[10px]">🔥 적산 가중치</p>
                        <p className="text-sm font-extrabold text-emerald-700">{diaryData.weather?.factor ?? "1.0"}x</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-center py-2">※ 상단 농가 정보에서 주소를 입력하시면 일조량과 강수량 분석 가중치가 활성화됩니다.</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 w-32 shrink-0">- 재배 유형:</span>
                  <select value={diaryData.growType} onChange={(e) => setDiaryData((prev) => ({ ...prev, growType: e.target.value }))} className="flex-1 p-1.5 border border-slate-200 rounded bg-white font-sans text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-700 font-bold">
                    <option value="하우스">시설 하우스</option>
                    <option value="노지">노지 재배</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 w-32 shrink-0">- 대상 품목:</span>
                  <input type="text" value={diaryData.item} onChange={(e) => setDiaryData((prev) => ({ ...prev, item: e.target.value }))} placeholder="예: 완숙 토마토" className="flex-1 p-1.5 border border-slate-200 rounded bg-white font-sans text-xs" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 w-24 shrink-0 font-sans font-medium">- 작업 단계:</span>
                  <select value={diaryData.stage} onChange={(e) => setDiaryData((prev) => ({ ...prev, stage: e.target.value }))} className="flex-1 p-1.5 border border-slate-200 rounded bg-white font-sans text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700">
                    <option value="">생장 단계 선택</option>
                    <option value="육묘/정식">육묘/정식</option>
                    <option value="개화">개화</option>
                    <option value="착과">착과</option>
                    <option value="수확">수확</option>
                    <option value="방제(농약살포)">방제(농약살포)</option>
                  </select>
                </div>

                {/* 환경구분별 온습도 자동 입력 구역 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 w-32 shrink-0">- 하우스 온/습도:</span>
                    <div className="flex flex-1 gap-1">
                      <input
                        type="text"
                        value={diaryData.envTemp}
                        onChange={(e) => setDiaryData((prev) => ({ ...prev, envTemp: e.target.value }))}
                        placeholder={diaryData.growType === "노지" ? "온도(자동)" : "온도(예:26°C)"}
                        disabled={diaryData.growType === "노지"}
                        className={`w-1/2 p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline font-sans text-center ${diaryData.growType === "노지" ? "bg-slate-100 text-slate-500 font-semibold cursor-not-allowed" : "bg-white text-slate-800"}`} // w=1/2 오타 수정
                      />
                      <input
                        type="text"
                        value={diaryData.envHumid}
                        onChange={(e) => setDiaryData((prev) => ({ ...prev, envHumid: e.target.value }))}
                        placeholder={diaryData.growType === "노지" ? "습도(자동)" : "습도(예:65%)"}
                        disabled={diaryData.growType === "노지"}
                        className={`w-1/2 p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-sans text-center ${diaryData.growType === "노지" ? "bg-slate-100 text-slate-500 font-semibold cursor-not-allowed" : "bg-white text-slate-800"}`} // w=1/2, cursor-not-allowded 오타 수정
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 w-24 shrink-0 font-sans font-medium">- 활동유형:</span>
                  <div className="flex flex-1 gap-1">
                    <select value={diaryData.expenseType} onChange={(e) => setDiaryData((prev) => ({ ...prev, expenseType: e.target.value }))} className="w-1/3 shrink-0 p-1.5 border border-slate-200 rounded bg-white font-sans text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-700">
                      <option value="">유형 선택</option>
                      <option value="농약">농약</option>
                      <option value="비료">비료</option>
                      <option value="인력">인력</option>
                      <option value="기타">기타</option>
                    </select>
                    <input type="text" value={diaryData.expenseAmount} onChange={(e) => setDiaryData((prev) => ({ ...prev, expenseAmount: e.target.value }))} placeholder="비용/살포량" className="flex-1 w-0 p-1.5 border border-slate-200 rounded bg-white font-sans text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-600">- 생육 상태 및 관찰 내용:</span>
                  <textarea value={diaryData.status} onChange={(e) => setDiaryData((prev) => ({ ...prev, status: e.target.value }))} placeholder="내용을 입력하세요 (예: 알이 굵어지고 하단부부터 붉은 빛이 돎)" className="w-full h-16 p-2 border border-slate-200 rounded bg-white font-sans text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-slate-600">- 오늘 수행한 작업:</span>
                  <textarea value={diaryData.work} onChange={(e) => setDiaryData((prev) => ({ ...prev, work: e.target.value }))} placeholder="내용을 입력하세요 (예: 양액 공급 및 환기팬 가동)" className="w-full h-16 p-2 border border-slate-200 rounded bg-white font-sans text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              {/* 1. 분석 중일 때만 보여주는 프로그래스 바 영억 */}
              {isPredicting && (
                <div className="w-full px-1">
                  <div className="flex justify-between items-center mb-1 text-xs font-sans">
                    <span className="text-emerald-600 font-semibold animate-pulse">🤖 AI가 기상 및 빅데이터를 정밀 분석 중입니다...</span>
                    <span className="text-slate-500 font-bold">{progress}</span>
                  </div>
                  {/* 바깥 회색 배경 바 */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    {/* 안쪽 초록색 채워지는 바 */}
                    <div className="h-full bg-emerald-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
            {/* 버튼 및 공지 확인 영역 */}
            <div className="space-y-3 mt-4">
              <button onClick={handleAnalyzeDiary} disabled={isPredicting} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl text-sm transition-all disabled:bg-slate-300">
                {isPredicting ? (
                  <>
                    <span>🤖</span> 분석 중...
                  </>
                ) : (
                  <>
                    <span>📝</span> 영농일기 분석 및 쇼핑몰 공지 자동 업로드
                  </>
                )}
              </button>
              {predictionNotice && (
                <div className="bg-green-50 border border-green-100 p-3 rounded-xl text-xs text-green-800 font-sans">
                  <strong>📢 쇼핑몰 공지 등록 예시:</strong> {predictionNotice}
                </div>
              )}
            </div>
          </div>

          {/* 섹션 2: 나의 영농일지 히스토리 */}
          <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow w-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4">나의 영농일지 히스토리</h2>
              {/* 영농일지 리스트 테이블 */}
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm text-gray-600">
                      <th className="p-3 border-b">날짜</th>
                      <th className="p-3 border-b">품목</th>
                      <th className="p-3 border-b">지역</th>
                      <th className="p-3 border-b">면적</th>
                      <th className="p-3 border-b">실제 기온</th>
                      <th className="p-3 border-b">작업 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diaryList &&
                      diaryList.map((log, index) => (
                        <tr key={log.id || index} className="text-sm border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-500">{log.date}</td>
                          <td className="p-3 font-semibold text-green-700">{log.item}</td>
                          <td className="p-3">{log.location}</td>
                          <td className="p-3">{log.areaPyeong}</td>
                          <td className="p-3 font-medium text-orange-600">{log.realTemp}</td>
                          <td className="p-3 text-gray-700">{log.content}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* 기후 분석 섹션 */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                <h3 className="text-lg font-bold text-orange-800 mb-3">기후 분석 및 생육 온도 비교</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-3 rounded shadow-sm border border-orange-100">
                    <span className="text-sm text-gray-500 block">현재 일지 기록 온도 총합</span>
                    <strong className="text-2xl text-orange-600">{totalRealTempSum?.toFixed(1) || "0.0"}°C</strong>
                  </div>

                  <div className="bg-white p-3 rounded shadow-sm border border-orange-100">
                    <span className="text-sm text-gray-500 block">품목 표준 목표 적산온도</span>
                    <strong className="text-2xl text-gray-700">{targetAccumulatedTemp?.toFixed(1) || "0.0"}°C</strong>
                  </div>

                  <div className="bg-white p-3 rounded shadow-sm border border-orange-100">
                    <span className="text-sm text-gray-500 block">목표 대비 온도 차이</span>
                    <strong className={`text-2xl ${tempDifference >= 0 ? "text-red-600" : "text-blue-600"}`}>{tempDifference >= 0 ? `+${tempDifference?.toFixed(1)}` : tempDifference?.toFixed(1)}°C</strong>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-right">* 표준 목표 적산온도 대비 현재 영농 기록의 온도 과부족 상태를 실시간 매핑한 결과입니다.</p>
              </div>
            </div>
          </div>

          {/* 빅데이터 예측 대시보드 영역 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">📈 CSV 빅데이터 기반 출하시기 예측</h3>
                  <p className="text-xs text-slate-400 mt-0.5">과거 경락 내역과 AI 예측 단가를 정밀 대조합니다.</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg font-mono whitespace-nowrap">품목: {diaryData.item || "선택 없음"}</span>
              </div>

              {/* 차트 시각화 컨테이너 */}
              <div className="w-full h-72 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "11px", fontFamily: "monospace" }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} unit="원" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "5px" }} />
                    <Line type="monotone" dataKey="pastPrice" name="과거 5개년 평균가 (CSV)" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="predictPrice" name="AI 예측 출하 단가" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Market-Timing Report 안내판 */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 shadow-sm mt-auto">
              <div className="text-2xl mt-0.5">💡</div>
              <div>
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider font-mono">AI Market-Timing Report</div>
                <p className="text-sm font-semibold text-blue-900 mt-1 leading-relaxed whitespace-pre-line">{aiAnalysisMent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
