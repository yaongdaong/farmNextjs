"use server";

import Prisma from "@prisma/client";

// Prisma 인스턴스 싱글톤 관리
const globalForPrisma = globalThis as unknown as { prisma: Prisma.PrismaClient };
const prisma = globalForPrisma.prisma || new Prisma.PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface WeatherInfo {
  date?: string;
  temp: number;
  avg_temp?: number;
  humidity: number;
  rain: number;
  sky: string;
  solHours: number;
}

// Prisma farmLog 조회 객체 안전한 속성 접근을 위한 확장 타입
type ExtendedFarmLog = {
  id: number;
  date: Date;
  avgTemp: number | null;
  cropId: number;
  humidity?: number;
  rain?: number;
  sky?: string;
  solHours?: number;
};

interface CropAnalysisResult {
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

export async function analyzeCropProgress(cropId: number, cropName: string, plantDate: string, targetGdd: number = 1200, baseTemp: number = 10.0): Promise<CropAnalysisResult> {
  // 1. Prisma DB에서 해당 작물의 영농 일지(FarmLog) 및 기상 데이터 조회
  const farmLogs = await prisma.farmLog.findMany({
    where: { cropId },
    orderBy: { date: "asc" },
  });

  // 3. FastAPI/Pydantic WeatherInfo 규격에 맞게 mapping
  const recentWeather: WeatherInfo[] = farmLogs.map((log) => {
    // 안전한 타입 캐스팅 (as any 대신 as unknown as ExtendedFarmLog 사용)
    const extendedLog = log as unknown as ExtendedFarmLog;
    const avgTemp = extendedLog.avgTemp ?? 0;

    return {
      date: extendedLog.date ? new Date(extendedLog.date).toISOString().split("T")[0] : undefined,
      temp: avgTemp,
      avg_temp: avgTemp,
      humidity: extendedLog.humidity ?? 60,
      rain: extendedLog.rain ?? 0.0,
      sky: extendedLog.sky ?? "맑음",
      solHours: extendedLog.solHours ?? 8.0,
    };
  });

  // 3. FastAPI 백엔드 호출
  const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

  const response = await fetch(`${FASTAPI_URL}/api/crop-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      crop_name: cropName,
      plant_date: plantDate,
      target_gdd: targetGdd,
      base_temp: baseTemp,
      recent_weather: recentWeather,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FastAPI 연동 오류: ${response.statusText}`);
  }

  return response.json();
}
