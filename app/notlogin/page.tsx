"use client";

import React, { useState } from "react";
import { TrendingUp, AlertTriangle, Sprout, ShieldCheck, ChevronRight, ArrowRight, CheckCircle2, Sparkles, Sliders } from "lucide-react";

interface GuestLandingPageProps {
  onStartLogin?: () => void;
}

export default function GuestLandingPage({ onStartLogin }: GuestLandingPageProps) {
  // 비회원 체험용 시뮬레이터 State
  const [laborCostRatio, setLaborCostRatio] = useState<number>(100);
  const baseRevenue = 7500000; // 기본 예상 매출
  const baseLaborCost = 2000000; // 기본 인건비
  const otherCost = 1500000; // 기타 경비

  const currentLaborCost = baseLaborCost * (laborCostRatio / 100);
  const totalExpense = currentLaborCost + otherCost;
  const netProfit = baseRevenue - totalExpense;
  const profitMargin = Math.max(0, (netProfit / baseRevenue) * 100).toFixed(1);
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* GNB (상단 네비게이션)  */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950 font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SmartFarm AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onStartLogin} className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition">
              로그인
            </button>
            <button onClick={onStartLogin} className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20">
              무료로 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>데이터 기반 스마트 영농 관리 솔루션</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
          농사의 시작과 끝,
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">농사하나로 원스톱 영농 시스템</span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">정확한 파종·수확 시기 예측부터 AI 기반 정산 리포트까지. <br/>대한민국 모든 농업인이 고민 없이 효율적으로 농사지을 수 있도록 가장 똑똑한 길잡이가 되어드립니다.</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={onStartLogin} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-xl shadow-emerald-500/20 text-base">
            <span>농가 등록하고 체험하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a href="#demo" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition border border-slate-700 text-base">
            기능 미리보기
          </a>
        </div>
      </section>

      {/* DEMO SECTION: 비회원 정산 시뮬레이터 체험 */}
      <section id="demo" className="py-16 px-6 bg-slate-950 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">직접 조절해보는 AI 정산 시뮬레이터</h2>
            <p className="text-sm text-slate-400">로그인 없이 아래 슬라이더를 움직여 순이익 변화를 직접 확인해보세요.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            {/* 시뮬레이터 컨트롤 (좌측) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Sliders className="w-4 h-4" />
                <span>인건비 실시간 조절</span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">인건비 증감률</span>
                  <span className="font-bold text-white">{laborCostRatio}%</span>
                </div>
                <input type="range" min="50" max="150" step="5" value={laborCostRatio} onChange={(e) => setLaborCostRatio(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
                {laborCostRatio < 100 ? (
                  <p className="text-emerald-400 font-medium">
                    💡 인건비를 {100 - laborCostRatio}% 절감하면 순이익이 약 {(baseLaborCost - currentLaborCost).toLocaleString()}원 늘어납니다!
                  </p>
                ) : laborCostRatio > 100 ? (
                  <p className="text-rose-400 font-medium">⚠️ 인건비가 {laborCostRatio - 100}% 증가하면 순이익률이 감소합니다.</p>
                ) : (
                  <p className="text-slate-400">슬라이더를 좌우로 움직여 목표 인건비를 설정해 보세요.</p>
                )}
              </div>
            </div>

            {/* 시뮬레이터 결과 카드 (우측) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-xs text-slate-400">예상 총 매출</span>
                <div className="text-xl font-bold text-white mt-1">{baseRevenue.toLocaleString()} 원</div>
                <span className="text-[11px] text-emerald-400 mt-2 block">📈 평당 목표 수량 기준</span>
              </div>

              <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-xs text-slate-400">조정된 총 지출</span>
                <div className="text-xl font-bold text-white mt-1">{totalExpense.toLocaleString()} 원</div>
                <span className="text-[11px] text-slate-400 mt-2 block">(인건비 {currentLaborCost.toLocaleString()}원 포함)</span>
              </div>

              <div className="sm:col-span-2 p-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-emerald-400">예상 순이익</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">순이익률 {profitMargin}% </span>
                </div>
                <div className="text-2xl font-extrabold text-white">{netProfit.toLocaleString()} 원</div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-emerald-400 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(Number(profitMargin), 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS (주요 기능 소개) */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">농가 경영에 필요한 모든 것</h2>
          <p className="text-slate-400 text-sm">복잡한 영농 관리를 직관적인 데이터와 AI로 단순화했습니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 카드 1 */}
          <div className="p-6 bg-slate-800/50 border border-slate-700/60 rounded-2xl hover:border-slate-600 transition">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">작물 이상 감지 알림</h3>
            <p className="text-sm text-slate-400 leading-relaxed">적정 재배 면적 대비 과다 수량이 설정되면 AI 뱃지가 즉시 주의를 안내해 실패 위험을 낮춥니다.</p>
          </div>

          {/* 카드 2 */}
          <div className="p-6 bg-slate-800/50 border border-slate-700/60 rounded-2xl hover:border-slate-600 transition">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">원클릭 퀵 영농일지</h3>
            <p className="text-sm text-slate-400 leading-relaxed">날씨, 물주기, 비료 투여 등 자주 쓰는 작업 내용을 원클릭 태그로 수초 만에 입력하세요.</p>
          </div>

          {/* 카드 3 */}
          <div className="p-6 bg-slate-800/50 border border-slate-700/60 rounded-2xl hover:border-slate-600 transition">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">자동 저장 & 단위 환산</h3>
            <p className="text-sm text-slate-400 leading-relaxed">평(坪)과 m² 자동 환산 및 작성 중 내용이 손실되지 않도록 실시간 Auto-save를 지원합니다.</p>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">지금 바로 스마트한 영농 관리를 시작해보세요</h2>
          <p className="text-slate-400 text-sm mb-8">무료 회원가입으로 나만의 농가 데이터와 정산 시뮬레이션을 생성할 수 있습니다.</p>
          <button onClick={onStartLogin} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-xl shadow-emerald-500/20 text-base">
            무료로 시작하기
          </button>
        </div>
      </section>
    </div>
  );
}
