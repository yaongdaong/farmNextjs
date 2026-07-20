"use client";
import { useState } from "react";
import FarmInfo, { CropItem } from "../components/FarmInfo";
import DailyFarming from "../components/DailyFarming";

export default function Home() {
  // 1. 공통으로 관리되어 묶일 데이터 상태 정의 (상태 끌어올리기)
  const [totalArea, setTotalArea] = useState("500");
  const [cropList, setCropList] = useState<CropItem[]>([
    { id: "1", statusType: "growing", name: "화순 토마토", area: "200", plantDate: "2026-05-10", bloomDate: "" }
  ]);

  return (
    <main className="min-h-screen bg-slate-50/50 py-10 px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        
        {/* 상단 섹션: 농장 설정 및 분석 영역 */}
        <FarmInfo 
          totalArea={totalArea} 
          setTotalArea={setTotalArea} 
          cropList={cropList} 
          setCropList={setCropList} 
        />

        {/* 하단 섹션: 실시간 작물 정보가 연동되는 영농일지 영역 */}
        <DailyFarming 
          cropList={cropList} 
        />
        
      </div>
    </main>
  );
}