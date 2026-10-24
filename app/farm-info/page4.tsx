"use client";

import React, { useState, useEffect } from "react";
import FarmInfo, { CropItem } from "@/components/FarmInfo";
import { Sprout, MapPin, Calendar, Thermometer, Clock, BookOpen, Plus, Sparkles, TrendingUp, TrendingDown, Wallet, CheckCircle2 } from "lucide-react";

// ==========================================
// 1. 타입 정의 (통합 및 확장)
// ==========================================
type TabType = "DASHBOARD" | "DIARY";

export interface FertilizerSchedule {
  stage: string;
  date: string;
  type: string;
  amount: string;
}

export interface AIReport {
  cropName: string;
  category: string;
  accuracy: number;
  accumulatedTemp: number;
  targetTemp: number;
  environmentCorrection: string;
  expectedHarvestDate: string;
  daysRemaining: number;
  shippingBuffer: string;
  expectedYield: number;
  fertilizerSchedule: FertilizerSchedule[];
}

export interface ExtendedCropItem extends CropItem {
  facilityType?: string; // 예: 연동형 하우스, 수경재배 등
  location?: string;
  plantDate?: string;
  growthStage?: string;
  accumulatedTempText?: string; // 테이블 표시용 (예: "420.5℃ / 1200.0℃")
  expectedHarvestText?: string; // 테이블 표시용 (예: "11/20 (D-57) / 약 4,500kg")
  aiReport?: AIReport;
}


// 작물별 표준 매핑 데이터
export const CROP_GDD_DATABASE: Record<string, { baseTemp: number; targetGdd: number }> = {
  // 식량 작물
  벼: { baseTemp: 10.0, targetGdd: 2200 },
  옥수수: { baseTemp: 10.0, targetGdd: 1400 },
  감자: { baseTemp: 7.0, targetGdd: 1000 },
  고구마: { baseTemp: 15.0, targetGdd: 1800 },
  콩: { baseTemp: 10.0, targetGdd: 1300 },

  // 채소류 (과채류 / 엽채류)
  토마토: { baseTemp: 10.0, targetGdd: 1200 },
  고추: { baseTemp: 10.0, targetGdd: 1350 },
  딸기: { baseTemp: 5.0, targetGdd: 900 },
  오이: { baseTemp: 12.0, targetGdd: 1100 },
  상추: { baseTemp: 4.0, targetGdd: 600 },
  배추: { baseTemp: 5.0, targetGdd: 800 },
  양파: { baseTemp: 4.0, targetGdd: 1000 },
  마늘: { baseTemp: 4.0, targetGdd: 1100 },

  // 과수류
  사과: { baseTemp: 7.0, targetGdd: 1500 },
  배: { baseTemp: 7.0, targetGdd: 1600 },
  복숭아: { baseTemp: 8.0, targetGdd: 1400 },
  포도: { baseTemp: 10.0, targetGdd: 1600 },
};

export interface DiaryEntry {
  id: string;
  date: string;
  weather: string;
  targetCrop: string;
  solarTermTask: string;
  taskDone: string[];
  expense: number;
  income: number;
}

// ==========================================
// 2. 메인 통합 페이지 컴포넌트
// ==========================================
export default function FarmManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [userName, setUserName] = useState("홍길동");

  // 데이터 상태 관리
  const [totalArea, setTotalArea] = useState("");
  const [cropList, setCropList] = useState<ExtendedCropItem[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 경영 요약 손익 계산
  const totalIncome = diaries.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpense = diaries.reduce((sum, item) => sum + (item.expense || 0), 0);
  const netProfit = totalIncome - totalExpense;

  // 데이터 통합 로드 (API mock)
  useEffect(() => {
    async function fetchIntegratedFarmData() {
      try {
        setLoading(true);
        // TODO: 백엔드 API 연동 시 실제 fetch 호출로 교체
        // const response = await fetch("/api/farms");
        // const data = await response.json();

        setTimeout(() => {
          setTotalArea("1000");

          // 작물 및 AI 리포트 통합 데이터
          setCropList([
            {
              id: "f1",
              name: "딸기 (설향)",
              area: "800",
              facilityType: "연동형 하우스 / 수경재배",
              location: "제1하우스 (김해)",
              plantDate: "2026-08-15 (41일차)",
              statusType: "GROWING",
              growthStage: "생육 2단계 (영양생장)",
              accumulatedTempText: "420.5℃ / 1200.0℃",
              expectedHarvestText: "11/20 (D-57) / 약 4,500kg",
              aiReport: {
                cropName: "딸기(설향)",
                category: "과채류",
                accuracy: 94.2,
                accumulatedTemp: 420.5,
                targetTemp: 1200,
                environmentCorrection: "야간 보온 단열재 차단율 +15% 권장",
                expectedHarvestDate: "2026-11-20",
                daysRemaining: 57,
                shippingBuffer: "11/18 ~ 11/22 내 출하 추천",
                expectedYield: 4500,
                fertilizerSchedule: [
                  {
                    stage: "영양생장기",
                    date: "2026-10-01",
                    type: "질소/가리 위주 관주",
                    amount: "동당 0.5kg",
                  },
                  {
                    stage: "개화/개과기",
                    date: "2026-10-20",
                    type: "인산/인산칼슘 관주",
                    amount: "동당 0.8kg",
                  },
                ],
              },
            },
            {
              id: "f2",
              name: "애호박",
              area: "200",
              facilityType: "단동 비닐하우스 / 토양재배",
              location: "제2하우스 (김해)",
              plantDate: "2026-09-01 (24일차)",
              statusType: "GROWING",
              growthStage: "생육 1단계 (초기)",
              accumulatedTempText: "120.0℃ / 1000.0℃",
              expectedHarvestText: "12/31 (D-98) / 약 184kg",
              aiReport: {
                cropName: "애호박",
                category: "과채류",
                accuracy: 89.5,
                accumulatedTemp: 120.0,
                targetTemp: 1000,
                environmentCorrection: "주간 환기온도 28℃ 이하 유지 필요",
                expectedHarvestDate: "2026-12-31",
                daysRemaining: 98,
                shippingBuffer: "12/29 ~ 01/02 내 출하 추천",
                expectedYield: 184,
                fertilizerSchedule: [
                  {
                    stage: "초기 착근기",
                    date: "2026-09-15",
                    type: "기초 관주 영양제",
                    amount: "동당 0.3kg",
                  },
                ],
              },
            },
          ]);

          // 영농일지 데이터
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
              expense: 150000,
              income: 0,
            },
          ]);

          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setLoading(false);
      }
    }

    fetchIntegratedFarmData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* 헤더 타이틀 */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">🌾 {userName}님의 스마트 영농 관리</h1>
        <p className="text-sm text-slate-500 mt-1">농장 자산 현황과 AI 생육 리포트를 확인하고 일일 농작업 및 경영 손익을 기록하세요.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab("DASHBOARD")} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === "DASHBOARD" ? "border-emerald-500 text-emerald-700 bg-emerald-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
          <Sprout className="w-4 h-4" /> 농장 현황 및 AI 대시보드
        </button>
        <button onClick={() => setActiveTab("DIARY")} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === "DIARY" ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
          <BookOpen className="w-4 h-4" /> 영농일지 및 손익
        </button>
      </div>

      {/* 로딩 표시 */}
      {loading && <div className="p-12 text-center text-slate-400 font-medium">농장 정보 및 AI 분석 데이터를 동기화 중입니다...</div>}

      {/* ==========================================
          TAB 1: 농장 현황 대시보드 & AI 리포트
      ========================================== */}
      {!loading && activeTab === "DASHBOARD" && (
        <div className="space-y-8">
          {/* 메인 농장 정보 입력/상태 컴포넌트 */}
          <FarmInfo totalArea={totalArea} setTotalArea={setTotalArea} cropList={cropList} setCropList={setCropList} />

          {/* 1. 작물 생육 현황 요약 테이블 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-emerald-600" />
                농장 구역별 생육 현황 요약
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
                  {cropList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {item.name || "미지정 작물"}
                        </div>
                        <div className="text-slate-500 mt-0.5 ml-3.5">{item.area || 0}평</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location || "위치 미설정"}
                        </div>
                        <div className="text-slate-500 mt-0.5 ml-4.5">{item.facilityType || "일반 하우스"}</div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.plantDate || "미등록"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{item.growthStage || item.statusType || "생육 중"}</div>
                        <div className="text-amber-600 font-medium mt-0.5">{item.accumulatedTempText || (item.aiReport ? `${item.aiReport.accumulatedTemp}℃ / ${item.aiReport.targetTemp}℃` : "-")}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.expectedHarvestText ? item.expectedHarvestText.split("/")[0] : item.aiReport ? `${item.aiReport.expectedHarvestDate} (D-${item.aiReport.daysRemaining})` : "-"}
                        </div>
                        <div className="text-slate-500 mt-0.5 font-medium">{item.expectedHarvestText ? item.expectedHarvestText.split("/")[1] : item.aiReport ? `약 ${item.aiReport.expectedYield}kg` : "-"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. 등록 작물별 상세 AI 생육/환경 분석 리포트 카드 영역 */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              구역별 AI 생육 및 정밀 환경 분석 리포트
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {cropList.map((crop) => (
                <div key={crop.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  {/* 카드 기본 정보 */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                        <span>
                          작물: {crop.name || "미지정"} ({crop.area || 0}평)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        위치: {crop.location || "경남 김해"} | 시설: {crop.facilityType || "일반"}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">{crop.statusType || "GROWING"}</span>
                  </div>

                  {/* AI 분석 리포트 본문 */}
                  {crop.aiReport ? (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>🌱 [생육 상태 및 환경 보정 예측 리포트]</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                        <div>
                          <span className="font-semibold text-slate-500">작물/부류:</span> {crop.aiReport.cropName} ({crop.aiReport.category} | 예측 정확도: {crop.aiReport.accuracy}%)
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">적산온도:</span> {crop.aiReport.accumulatedTemp}℃ / 목표 {crop.aiReport.targetTemp}℃
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">환경 보정:</span> {crop.aiReport.environmentCorrection}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">예상 수확량:</span> 약 {crop.aiReport.expectedYield}kg
                        </div>
                        <div className="col-span-1 md:col-span-2 text-emerald-800 font-medium">
                          <span className="font-semibold text-slate-500">최종 예측 수확일:</span> {crop.aiReport.expectedHarvestDate} (약 {crop.aiReport.daysRemaining}일 후)
                        </div>
                        <div className="col-span-1 md:col-span-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 text-amber-900 text-xs">
                          🛡️ <span className="font-semibold">쇼핑몰 권장 발송 버퍼:</span> {crop.aiReport.shippingBuffer}
                        </div>
                      </div>

                      {/* 시비 스케줄 */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <p className="text-xs font-bold text-slate-700 mb-2">
                          💊 [{crop.name} {crop.area}평 맞춤 비료 Schedule]
                        </p>
                        <ul className="space-y-1 text-xs text-slate-600 pl-2">
                          {crop.aiReport.fertilizerSchedule.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>
                                {item.stage} ({item.date}): {item.type} [{item.amount}]
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">AI 분석 리포트를 생성하는 중이거나 데이터가 없습니다.</div>
                  )}
                </div>
              ))}

              {/* 신규 구역 추가 버튼 */}
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer transition-colors font-semibold text-sm flex flex-col items-center justify-center gap-2 bg-white/50">
                <Plus className="w-6 h-6" /> 신규 농장 구역 / 시설 추가하기
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: 영농일지 및 경영 손익
      ========================================== */}
      {!loading && activeTab === "DIARY" && (
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
              <button className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 일지 작성
              </button>
            </div>

            <div className="space-y-4">
              {diaries.map((diary) => (
                <div key={diary.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{diary.date}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600">{diary.weather}</span>
                      <span className="px-2 py-0.5 bg-slate-200/60 text-slate-700 font-medium rounded text-[11px]">{diary.targetCrop}</span>
                    </div>
                    <div className="text-right">
                      {diary.income > 0 && <span className="text-emerald-600 font-bold block">+{diary.income.toLocaleString()}원</span>}
                      {diary.expense > 0 && <span className="text-rose-500 font-bold block">-{diary.expense.toLocaleString()}원</span>}
                    </div>
                  </div>

                  <div className="text-xs text-amber-800 bg-amber-50/80 p-2 rounded-md font-medium border border-amber-200/50">💡 절기 가이드: {diary.solarTermTask}</div>

                  <div className="pt-1">
                    <p className="text-xs font-semibold text-slate-700 mb-1">수행 작업:</p>
                    <ul className="space-y-1">
                      {diary.taskDone.map((task, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
