"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CloudSun, Calendar, Sprout, BookOpen, Wallet, PlusCircle, ArrowRight, MapPin, TrendingUp, TrendingDown, Mic, Send, Sparkles } from "lucide-react";

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(true);

  // 대시보드 데이터 상태
  const [homeData, setHomeData] = useState({
    weather: { temp: "22°C", condition: "맑음", location: "부산광역시" },
    farmOverview: {
      totalFarms: 3,
      totalArea: "1,200평",
      mainCrop: "방울토마토, 고추",
      avgStage: "개화 및 착과기",
    },
    solarTerm: {
      name: "망종 (芒種)",
      tips: ["보리 베기와 모내기 준비", "논물 및 배수로 정비 철저"],
      crops: ["참깨", "고추", "콩"],
    },
    monthlyTip: "병해충(진딧물, 응애) 예방 및 과채류 웃거름 주기",
    farmSummary: {
      cropName: "방울토마토 (A구역)",
      growthStage: "개화 및 착과기",
      gddProgress: 68,
      accumulatedTemp: "1,250 GDD",
      targetTemp: "1,800 GDD",
    },
    recentLogs: [
      { id: 1, date: "06-06", content: "고추 웃거름 비료 살포 완료", stage: "생장기" },
      { id: 2, date: "06-04", content: "진딧물 예방 방제 작업 실시", stage: "생장기" },
    ],
    financeSummary: {
      totalRevenue: "12,500,000원",
      totalExpense: "3,840,000원",
      netProfit: "8,660,000원",
      budgetStatus: "안전 (예산 범위 내)",
    },
  });

  // 5가지 핵심 서비스 가로 슬림 바 데이터
  const coreFeatures = [
    { id: 1, title: "파종·수익 작물", desc: "고수익 작물 추천", icon: Sprout, href: "/recommend" },
    { id: 2, title: "수확 시기·량", desc: "위치 기반 정밀 예측", icon: MapPin, href: "/yield-forecast" },
    { id: 3, title: "적산온도(GDD)", desc: "생육 단계 실시간 추적", icon: CloudSun, href: "/gdd-tracker" },
    { id: 4, title: "AI 간편 일지", desc: "음성·사진 정돈 일지", icon: Mic, href: "/farm-journal/write" },
    { id: 5, title: "SMS 사전 예약", desc: "수확 전 미리 완판", icon: Send, href: "/pre-order" },
  ];

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
    setCurrentDate(today.toLocaleDateString("ko-KR", options));
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8 text-center bg-slate-900 text-white min-h-screen">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12">
      {/* 💡 [신규] 나의 농장 현황판 위 - 무조건 가로 1줄 5대 핵심 기능 */}
      <section className="bg-gradient-to-r from-emerald-950/70 via-slate-800/90 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-3 mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">농사하나로</span>
          <h2 className="text-xs font-bold text-white tracking-tight">스마트 영농 5대 핵심 기능</h2>
        </div>

        {/* grid-cols-5 고정으로 무조건 가로 한 줄 배치 */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {/* 1. 파종/고수익 */}
          <div className="bg-slate-900/80 border border-slate-700/50 hover:border-emerald-500/50 p-2 rounded-xl transition text-center flex flex-col items-center justify-center min-w-0">
            <span className="text-base sm:text-lg mb-0.5">🌱</span>
            <div className="text-[11px] sm:text-xs font-bold text-white truncate w-full">최적 파종·고수익</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate w-full mt-0.5">빅데이터 추천</div>
          </div>

          {/* 2. 수확 예측 */}
          <div className="bg-slate-900/80 border border-slate-700/50 hover:border-blue-500/50 p-2 rounded-xl transition text-center flex flex-col items-center justify-center min-w-0">
            <span className="text-base sm:text-lg mb-0.5">📍</span>
            <div className="text-[11px] sm:text-xs font-bold text-white truncate w-full">수확 시기·량 예측</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate w-full mt-0.5">위치 환경 계산</div>
          </div>

          {/* 3. 기후/병해충 */}
          <div className="bg-slate-900/80 border border-slate-700/50 hover:border-amber-500/50 p-2 rounded-xl transition text-center flex flex-col items-center justify-center min-w-0">
            <span className="text-base sm:text-lg mb-0.5">🌦️</span>
            <div className="text-[11px] sm:text-xs font-bold text-white truncate w-full">기후·병해충 알림</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate w-full mt-0.5">실시간 사전 경보</div>
          </div>

          {/* 4. SMS 사전예약 */}
          <div className="bg-slate-900/80 border border-slate-700/50 hover:border-purple-500/50 p-2 rounded-xl transition text-center flex flex-col items-center justify-center min-w-0">
            <span className="text-base sm:text-lg mb-0.5">📲</span>
            <div className="text-[11px] sm:text-xs font-bold text-white truncate w-full">SMS 사전 예약</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate w-full mt-0.5">수확 전 재고 Zero</div>
          </div>

          {/* 5. AI일지/정산 */}
          <div className="bg-slate-900/80 border border-slate-700/50 hover:border-teal-500/50 p-2 rounded-xl transition text-center flex flex-col items-center justify-center min-w-0">
            <span className="text-base sm:text-lg mb-0.5">💰</span>
            <div className="text-[11px] sm:text-xs font-bold text-white truncate w-full">AI일지·수지 정산</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate w-full mt-0.5">음성/사진 정돈</div>
          </div>
        </div>
      </section>
      {/* 1. 상단 헤더: 오늘 날짜 + 실시간 날씨 */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDate}</span>
            </div>
            <h1 className="text-xl font-bold text-white">나의 농장 현황판 🌱</h1>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl flex items-center gap-3">
            <CloudSun className="w-6 h-6 text-yellow-400" />
            <div className="text-xs">
              <span className="text-slate-400">{homeData.weather.location} · </span>
              <span className="font-semibold text-slate-200">
                {homeData.weather.condition} ({homeData.weather.temp})
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* 내 농장 전체 정보 요약 바 */}
        <section className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">내 농장 전체 요약</h2>
            </div>
            <Link href="/farm-info" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              농장 관리 바로가기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">등록 구역/농장</span>
              <span className="text-base font-bold text-white">{homeData.farmOverview.totalFarms}개 구역</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">총 재배 면적</span>
              <span className="text-base font-bold text-white">{homeData.farmOverview.totalArea}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">주요 재배 작물</span>
              <span className="text-base font-bold text-emerald-400 truncate block">{homeData.farmOverview.mainCrop}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">평균 생육 상태</span>
              <span className="text-base font-bold text-amber-400">{homeData.farmOverview.avgStage}</span>
            </div>
          </div>
        </section>

        {/* 빠른 실행 바 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/farm-journal/write" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 p-4 rounded-2xl flex items-center justify-between font-bold transition shadow-lg shadow-emerald-900/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-700/40 rounded-xl text-white">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-white">오늘의 영농일지 기록하기</span>
            </div>
            <ArrowRight className="w-5 h-5 text-white" />
          </Link>

          <Link href="/farm-costs/write" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 p-4 rounded-2xl flex items-center justify-between font-semibold transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-xl text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
              <span>수입 / 지출 내역 추가하기</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>

        {/* 정보성 콘텐츠 (외부 절기 & 이달의 팁) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">절기 가이드</span>
                <span className="text-sm font-bold text-white">{homeData.solarTerm.name}</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 mb-4 list-disc list-inside">
                {homeData.solarTerm.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="text-xs bg-slate-900/60 border border-slate-700/40 p-3 rounded-xl flex items-center gap-2">
              <span className="text-amber-400 font-semibold">추천 작물:</span>
              <span className="text-slate-300">{homeData.solarTerm.crops.join(", ")}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">이달의 핵심 관리</span>
                <BookOpen className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium mb-4">{homeData.monthlyTip}</p>
            </div>
            <div className="text-[11px] text-slate-500 text-right">농촌진흥청 영농정보 기준</div>
          </div>
        </div>

        {/* 개인화 콘텐츠 (대표 상태, 일지, 영농 수지) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 대표 농장 상태 */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400">대표 농장 상태</span>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-medium">{homeData.farmSummary.growthStage}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-4">{homeData.farmSummary.cropName}</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">적산온도 (GDD) 달성률</span>
                  <span className="font-bold text-emerald-400">{homeData.farmSummary.gddProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${homeData.farmSummary.gddProgress}%` }}></div>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between mt-1">
                  <span>현재: {homeData.farmSummary.accumulatedTemp}</span>
                  <span>목표: {homeData.farmSummary.targetTemp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 영농일지 요약 */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400">최근 영농일지</span>
                <Link href="/farm-info" className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5">
                  전체보기 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {homeData.recentLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-900/60 border border-slate-700/40 rounded-xl">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>{log.date}</span>
                      <span className="text-emerald-400">{log.stage}</span>
                    </div>
                    <p className="text-xs text-slate-200 truncate">{log.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 올해 영농 수지 요약 */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400">올해 영농 수지 요약</span>
                <Link href="/farm-costs" className="text-xs text-blue-400 hover:underline flex items-center gap-0.5">
                  장부 상세 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-xs bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> 총 수입
                  </span>
                  <span className="font-bold text-emerald-400">{homeData.financeSummary.totalRevenue}</span>
                </div>
                <div className="flex justify-between text-xs bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> 총 지출
                  </span>
                  <span className="font-bold text-rose-400">{homeData.financeSummary.totalExpense}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-[11px] text-slate-400">예상 순수익 (잔액)</span>
                <div className="text-xl font-extrabold text-white mt-0.5">{homeData.financeSummary.netProfit}</div>
              </div>
            </div>

            <div className="bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs text-blue-300 mt-4">
              <span>경영 상태</span>
              <span className="font-bold">{homeData.financeSummary.budgetStatus}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
