"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Prisma 조인 결과를 위한 타입 인터페이스
interface FarmLogWithCrop {
  id: number;
  date: Date;
  workType: string;
  memo: string;
  crop?: {
    name: string;
  } | null;
}

// 영농일지 목록 조회
export async function getFarmLogs() {
  try {
    const logs = await db.farmLog.findMany({
      include: {
        crop: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return (logs as FarmLogWithCrop[]).map((log) => ({
      id: log.id,
      date: new Date(log.date).toISOString().split("T")[0],
      cropName: log.crop?.name,
      workType: log.workType,
      content: log.memo,
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
  let date: string, cropId: string | number, workType: string, content: string;

  if (data instanceof FormData) {
    date = data.get("date") as string;
    cropId = data.get("cropId") as string;
    workType = data.get("workType") as string;
    content = (data.get("content") || data.get("memo") || "") as string;
  } else {
    date = data.date;
    cropId = data.cropId;
    workType = data.workType;
    content = data.content || data.memo || "";
  }

  if (!date || !cropId || !workType) {
    return { success: false, error: "모든 필수 항목을 입력해 주세요." };
  }

  try {
    await db.farmLog.create({
      data: {
        cropId: cropId ? Number(cropId) : undefined,
        date: new Date(date),
        workType,
        stage: "생육기",
        memo: content,
      },
    });

    // 페이지 캐시 갱신
    revalidatePath("/farm-logs");
    return { success: true };
  } catch (error) {
    console.error("Failed to create farm log:", error);
    return { success: false, error: "저장 중 오류가 발생했습니다." };
  }
}
