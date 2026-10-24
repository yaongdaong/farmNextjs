"use client";

import { useState } from "react";

interface WeatherInfo {
  date?: string;
  temp: number;
  avg_temp?: number;
  humidity: number;
  rain: number;
  sky: string;
  solHours: number;
}

interface NotificationTrigger {
  triggered: boolean;
  diff_days: number;
  message: string;
  action: string;
}

interface AnalysisResponse {
  crop_name: string;
  crop_category: string;
  accuracy_range: string;
  accumulated_gdd: number;
  target_accumulated_temp: number;
  today_effective_gdd: number;
  gdd_progress_percent: number;
  estimated_harvest_date: string;
  harvest_buffer_range: string;
  expected_yield_kg: number;
  notification_trigger?: NotificationTrigger;
  analysis_report: string;
  weather: WeatherInfo;
}

export default function FarmAnalysisPage() {
  const [cropName, setCropName] = useState("사과");
  const [locationStr, setLocationStr] = useState("서울특별시 종로구");
  const [areaPyeong, setAreaPyeong] = useState(100);
  const [targetGdd, setTargetGdd] = useState(1400);
  const [baseTemp, setBaseTemp] = useState(7.0);
  const [plantDate, setPlantDate] = useState("2026-03-25");

  const [growthStage, setGrowthStage] = useState("BLOOMING");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);

  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      crop_name: cropName,
      location_str: locationStr,
      status_type: "growing",
      area_pyeong: Number(areaPyeong),
      target_gdd: Number(targetGdd),
      plant_date: plantDate,
      base_temp: Number(baseTemp),
      farming_logs: [
        {
          log_date: logDate,
          growth_stage: growthStage,
          note: "사용자 영농일지 기록 입력",
        },
      ],
      recent_weather: [
        {
          date: logDate,
          temp: 18.5,
          avg_temp: 16.0,
          humidity: 60,
          rain: 5.0,
          sky: "구름많음",
          solHours: 3.5,
        },
      ],
    };

    try {
      const response = await fetch("http://localhost:8000/api/analyze-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("서버 분석 중 오류가 발생했습니다.");
      }

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif", color: "#111" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>🌱 스마트팜 적산온도 및 수확일 예측 시스템</h1>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "#f1f3f5", padding: "20px", borderRadius: "8px", border: "1px solid #ced4da" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>작물명:</label>
          <input type="text" value={cropName} onChange={(e) => setCropName(e.target.value)} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>재배 지역:</label>
          <input type="text" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>재배 면적 (평):</label>
          <input type="number" value={areaPyeong} onChange={(e) => setAreaPyeong(Number(e.target.value))} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>목표 적산온도 (GDD):</label>
          <input type="number" value={targetGdd} onChange={(e) => setTargetGdd(Number(e.target.value))} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>기준온도 (Base Temp):</label>
          <input type="number" step="0.1" value={baseTemp} onChange={(e) => setBaseTemp(Number(e.target.value))} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>정식일 / 파종일:</label>
          <input type="date" value={plantDate} onChange={(e) => setPlantDate(e.target.value)} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>영농일지 생육단계 이벤트:</label>
          <select value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }}>
            <option value="NORMAL">일반 관리</option>
            <option value="BLOOMING">🌸 개화 (꽃 핌 - GDD 재보정)</option>
            <option value="FRUITING">🍇 착과 (열매 맺힘)</option>
            <option value="HARVEST">🧺 수확</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#212529" }}>기록 일자:</label>
          <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} style={{ width: "100%", padding: "8px", color: "#000", backgroundColor: "#fff", border: "1px solid #adb5bd", borderRadius: "4px" }} required />
        </div>

        <div style={{ gridColumn: "span 2", marginTop: "10px" }}>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", backgroundColor: "#1b5e20", color: "#ffffff", border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
            {loading ? "분석 중..." : "적산온도 계산 및 수확일 예측 실행"}
          </button>
        </div>
      </form>

      {error && <p style={{ color: "#d32f2f", fontWeight: "bold", marginTop: "15px" }}>{error}</p>}

      {/* 결과 대시보드 */}
      {result && (
        <div style={{ marginTop: "30px", padding: "20px", background: "#e8f5e9", borderRadius: "8px", border: "1px solid #81c784", color: "#111" }}>
          <h2 style={{ fontSize: "20px", color: "#1b5e20", fontWeight: "bold", marginBottom: "15px" }}>📊 생육 및 수확 예측 분석 결과</h2>

          {result.notification_trigger?.triggered && <div style={{ padding: "12px", marginBottom: "15px", backgroundColor: "#ffebee", borderLeft: "5px solid #c62828", color: "#b71c1c", borderRadius: "4px", fontWeight: "bold" }}>🚨 [문자 발송 알림 트리거] {result.notification_trigger.message}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "15px", marginBottom: "20px", color: "#212529" }}>
            <p>
              <strong>작물 분류:</strong> {result.crop_category} (정확도 {result.accuracy_range})
            </p>
            <p>
              <strong>생육 진행률:</strong> {result.gdd_progress_percent}% ({result.accumulated_gdd}℃ / {result.target_accumulated_temp}℃)
            </p>
            <p>
              <strong>최종 예측 수확일:</strong> <span style={{ color: "#c62828", fontWeight: "bold" }}>{result.estimated_harvest_date}</span>
            </p>
            <p>
              <strong>쇼핑몰 버퍼 기간:</strong> {result.harvest_buffer_range}
            </p>
            <p>
              <strong>예상 총 수확량:</strong> 약 {result.expected_yield_kg} kg
            </p>
            <p>
              <strong>오늘 유효 GDD:</strong> +{result.today_effective_gdd} ℃/일
            </p>
          </div>

          <div style={{ background: "#ffffff", padding: "15px", borderRadius: "6px", whiteSpace: "pre-line", fontSize: "14px", border: "1px solid #ced4da", color: "#212529" }}>
            <strong style={{ color: "#000" }}>📝 상세 분석 리포트:</strong>
            <div style={{ marginTop: "8px", color: "#212529", lineHeight: "1.5" }}>{result.analysis_report}</div>
          </div>
        </div>
      )}
    </main>
  );
}
