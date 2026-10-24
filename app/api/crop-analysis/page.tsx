"use client";

import React, { useState, useTransition } from "react";
import { analyzeCropProgress } from "@/app/actions/cropAnalysis";

interface AnalysisData {
  crop_name: string;
  accumulated_gdd: number;
  today_effective_gdd: number;
  gdd_progress_percent: number;
  estimated_harvest_date: string;
  fertilizer_recommendation: {
    stage: string;
    fertilizer_type: string;
    amount_kg_per_10a: number;
    description: string;
  };
}

export default function CropAnalysisPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);  
  
    const handleAnalysis = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // startTransition 사용 또는 일반 async/await 처리
        startTransition(async () => {
          const data = await analyzeCropProgress(1, "토마토", "2026-03-01");
          setResult(data); // 💡 setResult 및 result 사용
        });
      } catch (err: unknown) {
        // 💡 catch 블록 변수를 err로 통일
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>🌱 영농 일지 기반 수확일 & 시비 처방 대시보드</h1>

      <button
        onClick={handleAnalysis}
        disabled={loading || isPending}
        style={{
          padding: "12px 24px",
          backgroundColor: isPending ? "#ccc" : "#22c55e",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {loading || isPending ? "FarmLog 분석 중..." : "작물 생육 및 수확일 추정"}
      </button>

      {errorMessage && <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px" }}>{errorMessage}</div>}

      {result && (
        <div style={{ marginTop: "30px", display: "grid", gap: "20px" }}>
          {/* 1. 적산온도 진행 현황 */}
          <div style={{ border: "1px solid #e5e7eb", padding: "20px", borderRadius: "12px", backgroundColor: "#f9fafb" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>📊 {result.crop_name} 생육 진행률</h2>
            <div style={{ width: "100%", backgroundColor: "#e5e7eb", height: "20px", borderRadius: "10px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${result.gdd_progress_percent}%`,
                  backgroundColor: "#16a34a",
                  height: "100%",
                  transition: "width 0.5s ease-in-out",
                }}
              />
            </div>
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#4b5563" }}>
              누적 GDD: <strong>{result.accumulated_gdd} ℃</strong> / 달성률: <strong>{result.gdd_progress_percent}%</strong>
            </p>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              오늘 유효 GDD: <strong>+{result.today_effective_gdd} ℃</strong>
            </p>
            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#15803d", marginTop: "8px" }}>📅 예상 수확일: {result.estimated_harvest_date}</p>
          </div>

          {/* 2. 비료 시비 추천 */}
          <div style={{ border: "1px solid #bbf7d0", padding: "20px", borderRadius: "12px", backgroundColor: "#f0fdf4" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#166534", marginBottom: "10px" }}>💡 맞춤 시비(비료) 처방</h2>
            <p style={{ fontSize: "15px", margin: "4px 0" }}>
              현재 단계: <strong>{result.fertilizer_recommendation.stage}</strong>
            </p>
            <p style={{ fontSize: "15px", margin: "4px 0" }}>
              추천 비료: <strong>{result.fertilizer_recommendation.fertilizer_type}</strong>
            </p>
            <p style={{ fontSize: "15px", margin: "4px 0" }}>
              권장 시비량: <strong>{result.fertilizer_recommendation.amount_kg_per_10a} kg / 10a</strong>
            </p>
            <p style={{ fontSize: "14px", color: "#15803d", marginTop: "8px" }}>{result.fertilizer_recommendation.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
