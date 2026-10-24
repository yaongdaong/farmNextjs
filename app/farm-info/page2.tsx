"use client";

import React, { useState, useEffect } from "react";
import { Sprout, MapPin, Calendar, CheckCircle2, Thermometer, Clock, TrendingUp, BookOpen, Wallet, Plus, ArrowRight } from "lucide-react";

// ==========================================
// 타입 정의
// ==========================================
type TabType = "DASHBOARD" | "DIARY";

// 1. 농장 정보(대시보드) 타입
interface FarmSummaryItem {
  id: string;
  cropName: string;
  facilityType: string; // 예: 연동형 하우스, 노지 등
  area: string;
  location: string;
  plantDate: string;
  growthStage: string;
  accumulatedTemp: string; // 예: "420℃ / 1200℃"
  expectedHarvest: string; // 예: "12/31 (D-98) / 184kg"
  statusType: "PLANTING_PLAN" | "GROWING" | "HARVESTING";
}

// 2. 영농일지 타입
interface DiaryEntry {
  id: string;
  date: string;
  weather: string; // 예: "맑음 (25℃/14℃)"
  targetCrop: string;
  solarTermTask: string; // AI 추천 작업 가이드
  taskDone: string[]; // 실제 수행한 작업
  expense: number; // 지출 금액
  income: number; // 수입 금액
}

export default function FarmManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [userName, setUserName] = useState("홍길동");

  // 데이터 상태 관리
  const [farms, setFarms] = useState<FarmSummaryItem[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 경영 요약(수입/지출 합계) 자동 계산
  const totalIncome = diaries.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpense = diaries.reduce((sum, item) => sum + (item.expense || 0), 0);
  const netProfit = totalIncome - totalExpense;

  // 초기 데이터 Fetch (API 연동 예시)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: 실제 백엔드 연동 시 fetch("/api/farm") 등 호출

        // 목업 데이터 로드
        setTimeout(() => {
          setFarms([
            {
              id: "f1",
              cropName: "딸기 (설향)",
              facilityType: "연동형 하우스 / 수경재배",
              area: "800평",
              location: "제1하우스 (김해)",
              plantDate: "2026-08-15 (41일차)",
              growthStage: "생육 2단계 (영양생장)",
              accumulatedTemp: "420.5℃ / 1200.0℃",
              expectedHarvest: "11/20 (D-57) / 약 4,500kg",
              statusType: "GROWING",
            },
            {
              id: "f2",
              cropName: "애호박",
              facilityType: "단동 비닐하우스 / 토양재배",
              area: "200평",
              location: "제2하우스 (김해)",
              plantDate: "2026-09-01 (24일차)",
              growthStage: "생육 1단계 (초기)",
              accumulatedTemp: "120.0℃ / 1000.0℃",
              expectedHarvest: "12/31 (D-98) / 약 184kg",
              statusType: "GROWING",
            },
          ]);

          setDiaries([
            {
              id: "d1",
              date: "2026-09-24",
              weather: "맑음 (25℃/14℃)",
              targetCrop: "제1하우스 (딸기)",
              solarTermTask: "추분: 1차 추비 및 야간 보온 점검",
              taskDone: ["1차 추비(요소 0.9kg) 살포 완료", "측창 환기 제어"],
              expense: 12000,
              income: 0,
            },
            {
              id: "d2",
              date: "2026-09-20",
              weather: "흐림 (21℃/16℃)",
              targetCrop: "전체 구역",
              solarTermTask: "가을 장마 대비 배수로 정비",
              taskDone: ["하우스 주변 배수로 정비", "잡초 제거 인력 투입"],
              expense: 150000, // 인건비
              income: 0,
            },
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("데이터 로드 실패", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* 헤더 타이틀 */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">🌾 {userName}님의 스마트 영농 관리</h1>
        <p className="text-sm text-slate-500 mt-1">현재 농장 자산 현황을 체크하고 일일 농작업 및 경영 손익을 기록하세요.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab("DASHBOARD")} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === "DASHBOARD" ? "border-emerald-500 text-emerald-700 bg-emerald-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
          <Sprout className="w-4 h-4" /> 농장 현황 대시보드
        </button>
        <button onClick={() => setActiveTab("DIARY")} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === "DIARY" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
          <BookOpen className="w-4 h-4" /> 영농일지 및 손익
        </button>
      </div>

      {/* 로딩 표시 */}
      {loading && <div className="p-10 text-center text-slate-400 font-medium">데이터를 동기화 중입니다...</div>}

      {/* ==========================================
          TAB 1: 농장 현황 대시보드 (현재 상태 체크)
      ========================================== */}
      {!loading && activeTab === "DASHBOARD" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-emerald-600" />
                AI 분석 기반 작물 생육 현황
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-4 min-w-[140px]">작물명 (면적)</th>
                    <th className="p-4 min-w-[160px]">위치 및 시설유형</th>
                    <th className="p-4 min-w-[130px]">식재일 (경과)</th>
                    <th className="p-4 min-w-[150px]">생육단계 (적산온도)</th>
                    <th className="p-4 min-w-[150px]">예상 수확일 (수량)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {farms.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {item.cropName}
                        </div>
                        <div className="text-slate-500 mt-0.5 ml-3.5">{item.area}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                        </div>
                        <div className="text-slate-500 mt-0.5 ml-4.5">{item.facilityType}</div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.plantDate}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{item.growthStage}</div>
                        <div className="text-amber-600 font-medium mt-0.5">{item.accumulatedTemp}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {item.expectedHarvest.split("/")[0]}
                        </div>
                        <div className="text-slate-500 mt-0.5 font-medium">{item.expectedHarvest.split("/")[1]}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 구역 추가 버튼 */}
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer transition-colors font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> 신규 농장 구역 / 시설 추가하기
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: 영농일지 및 손익 (기록 및 요약)
      ========================================== */}
      {!loading && activeTab === "DIARY" && (
        <div className="space-y-6">
          {/* 경영 손익 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">총 수입 (매출)</p>
                <p className="text-xl font-black text-slate-800">{totalIncome.toLocaleString()}원</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">총 지출 (경영비)</p>
                <p className="text-xl font-black text-slate-800">{totalExpense.toLocaleString()}원</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="bg-emerald-600 p-5 rounded-2xl border border-emerald-700 shadow-sm flex items-center justify-between text-white">
              <div>
                <p className="text-xs font-bold text-emerald-200 mb-1">순수익 (BEP)</p>
                <p className="text-xl font-black">
                  {netProfit > 0 ? "+" : ""}
                  {netProfit.toLocaleString()}원
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* 일지 기록 표 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" /> 최근 작업 및 경영 기록
              </h2>
              <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">새 영농일지 작성</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-4 w-[110px]">날짜 / 기상</th>
                    <th className="p-4 w-[120px]">작업 구역</th>
                    <th className="p-4 w-[240px]">AI 추천 및 실제 작업 내역</th>
                    <th className="p-4 w-[100px] text-right">지출(비용)</th>
                    <th className="p-4 w-[100px] text-right">수입(매출)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {diaries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-800">{entry.date}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{entry.weather}</div>
                      </td>
                      <td className="p-4 align-top font-medium text-slate-700">{entry.targetCrop}</td>
                      <td className="p-4 align-top">
                        <div className="bg-amber-50/50 px-2 py-1 rounded text-[11px] font-semibold text-amber-800 mb-2 border border-amber-100">🌱 AI 제안: {entry.solarTermTask}</div>
                        <ul className="space-y-1">
                          {entry.taskDone.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4 align-top text-right font-semibold text-red-500">{entry.expense > 0 ? `-${entry.expense.toLocaleString()}` : "-"}</td>
                      <td className="p-4 align-top text-right font-bold text-blue-600">{entry.income > 0 ? `+${entry.income.toLocaleString()}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
