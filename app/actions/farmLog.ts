"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Prisma 조인 결과 타입 인터페이스 정의 수정
interface FarmLogWithCrop {
  id: number;
  date: Date;
  weather?: string | null;
  workType: string;
  memo: string;
  crop?: {
    name: string;
  } | null;
  farm?: {
    plantDate: Date | null;
    bloomDate: Date | null;
  } | null;
}

// 영농일지 목록 조회
export async function getFarmLogs() {
  try {
    const logs = await db.farmLog.findMany({
      include: {
        crop: true,
        farm: true, // 👈 farm 조인 포함
      },
      orderBy: {
        date: "desc",
      },
    });

    return (logs as FarmLogWithCrop[]).map((log) => ({
      id: log.id,
      date: new Date(log.date).toISOString().split("T")[0],
      weather: log.weather || "맑음",
      cropName: log.crop?.name || "미지정 작물",
      plantDate: log.farm?.plantDate ? new Date(log.farm.plantDate).toISOString().split("T")[0] : null,
      bloomDate: log.farm?.bloomDate ? new Date(log.farm.bloomDate).toISOString().split("T")[0] : null,
      workType: log.workType,
      content: log.memo,
      income: 0,
      expense: 0,
      author: "관리자",
    }));
  } catch (error) {
    console.error("Failed to fetch farm logs:", error);
    return [];
  }
}

// 작물 목록 조회 (일지 작성 시 선택용)
export async function getCropsForSelect() {
  try {
    return await db.crop.findMany({
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error("Failed to fetch crops:", error);
    return [];
  }
}

// 새 영농일지 DB 저장
export async function createFarmLog(
  data:
    | FormData
    | {
        date: string;
        cropId: number | string;
        workType: string;
        stage?: string;
        memo?: string;
        content?: string;
      },
) {
  let date: string, cropIdRaw: string | number, workType: string, content: string, stage: string;

  if (data instanceof FormData) {
    date = data.get("date") as string;
    cropIdRaw = data.get("cropId") as string;
    workType = data.get("workType") as string;
    stage = (data.get("stage") || "생육기") as string;
    content = (data.get("content") || data.get("memo") || "") as string;
  } else {
    date = data.date;
    cropIdRaw = data.cropId;
    workType = data.workType;
    stage = data.stage || "생육기";
    content = data.content || data.memo || "";
  }

  // 1. 필수 값 검증
  if (!date || cropIdRaw === undefined || cropIdRaw === null || !workType) {
    return { success: false, error: "모든 필수 항목을 입력해 주세요." };
  }

  const parsedCropId = Number(cropIdRaw);
  if (isNaN(parsedCropId)) {
    return { success: false, error: "올바른 작물을 선택해 주세요." };
  }

  try {
    // 2. DB 저장 (schema.prisma에 맞게 stage -> growthStage로 수정)
    await db.farmLog.create({
      data: {
        cropId: parsedCropId,
        date: new Date(date),
        workType,
        growthStage: stage, // 👈 schema.prisma 컬럼명에 맞춤
        memo: content,
      },
    });

    // 3. 해당 경로 서버 캐시 갱신
    revalidatePath("/farm-logs");
    return { success: true };
  } catch (error) {
    console.error("Failed to create farm log:", error);
    return { success: false, error: "저장 중 오류가 발생했습니다." };
  }
}
