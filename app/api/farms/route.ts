import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

interface FarmSavePayload {
  location_str: string;
  area_pyeong: number;
  crop_name: string;
  status_type: "growing" | "planned";
  plant_date?: string;
  bloom_date?: string;
  target_temp?: number;
  base_temp?: number;
  target_gdd?: number;
  facility_type?: string;
  weather_data: {
    temp: number;
    humidity: number;
    rain: number;
    solHours: number;
  };
}

export async function POST(request: Request) {
  try {
    const payload: FarmSavePayload = await request.json();

    if (!payload.location_str) {
      return NextResponse.json(
        {
          success: false,
          message: "농장 위치가 없습니다.",
        },
        { status: 400 },
      );
    }

    if (!payload.crop_name) {
      return NextResponse.json(
        {
          success: false,
          message: "작물명이 없습니다.",
        },
        { status: 400 },
      );
    }

    // 날짜 유효성 검사 및 변환 함수 (빈 문자열이나 '-' 들어올 경우 null 처리)
    const parseDate = (dateStr?: string) => {
      if (!dateStr || dateStr.trim() === "" || dateStr === "-") return null;
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const plantDateObj = parseDate(payload.plant_date);
    const bloomDateObj = parseDate(payload.bloom_date);

    // Prisma 8에서는 $transaction이 아니라 transaction()
    const result = await db.$transaction(async (tx) => {
      // 1. 농장 생성
      const farm = await tx.farm.create({
        data: {
          name: payload.crop_name ,
          address: payload.location_str,
          // 현재는 실제 기상청 격자값이 없으므로 임시값
          gridX: 0,
          gridY: 0,
          totalArea: payload.area_pyeong,
          actualArea: payload.status_type === "growing" ? payload.area_pyeong : 0,
          plantDate: plantDateObj,
          bloomDate: bloomDateObj,
          targetTemp: payload.target_temp ?? null,
          baseTemp: payload.base_temp ?? null,
          targetGdd: payload.target_gdd ?? null,
          facilityType: payload.facility_type ?? null,
        },
      });

      // 2. 작물 생성
      const crop = await tx.crop.create({
        data: {
          farmId: farm.id,
          name: payload.crop_name,
          status: payload.status_type,

          plantingDate: plantDateObj,

          baseTemp: payload.base_temp ?? 10.0,
          targetGdd: payload.target_gdd ?? 1500.0,
        },
      });

      // 3. 기상 정보를 FarmLog에 저장
      //
      // 현재 contract.json의 FarmLog에는
      // humidity / rain / solHours / effectiveTemp가 없으므로
      // 우선 현재 존재하는 필드만 저장
      const farmLog = await tx.farmLog.create({
        data: {
          cropId: crop.id,
          date: new Date(),
          workType: "기상자동기록",
          growthStage: "등록",
          memo: "농장 등록 시 자동 저장된 기상 데이터",

          avgTemp: payload.weather_data.temp,
        },
      });

      return {
        farm,
        crop,
        farmLog,
      };
    });

    return NextResponse.json({
      success: true,
      farm_id: result.farm.id,
      message: "농장 및 작물 정보가 저장되었습니다.",
    });
  } catch (error) {
    console.error("농장 DB 저장 실패:", error);

    return NextResponse.json(
      {
        success: false,
        message: "농장 정보를 저장하는 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
