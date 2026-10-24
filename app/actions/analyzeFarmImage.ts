// app/actions/analyzeFarmImage.ts
"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFarmImage(imageBase64: string, cropName: string, farmArea: string): Promise<{ success: boolean; resultText?: string; growthStage?: string; error?: string }> {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

    const prompt = `
    당신은 전문 농업 컨설턴트입니다. 사용자가 업로드한 사진(밭 또는 농자재/비료 등)을 분석해주세요.
    
    [농장 정보]
    - 대상 작물: ${cropName} (만약 미지정이라면 사진을 보고 작물을 유추하세요)
    - 재배 면적: ${farmArea}
     
   [요청 사항]
    1. 사진이 농업/농자재와 전혀 관련 없다면 isValid를 false로 하고 error 메시지를 담아주세요.
    2. 영농일지 기록용 문장(resultText)을 작성하세요. (비료 사진이면 규격 및 적정 사용량 계산, 밭 사진이면 생육 상태 요약)
    3. **가장 중요 (생육 단계 판별):** 현재 작물의 생육 상태를 분석하여, 아래 7가지 **value 문자열 중 정확히 하나**를 선택해 growthStage에 담아주세요.
       - "육묘" (육묘 및 묘종기)
       - "정식/활착" (정식 및 활착기)
       - "영양생장" (영양 생장기)
       - "개화" (개화기)
       - "착과/비대" (착과 및 비대기)
       - "성숙/수확" (성숙 및 수확기)
       - "수확후관리" (수확 후 관리기)
       (판단하기 어렵다면 빈 문자열 ""을 반환하세요)

    [출력 형식]
    반드시 아래 JSON 형식으로만 응답해주세요. (마크다운 백틱 제외)
    {
      "isValid": true 또는 false,
      "resultText": "영농일지 기록용 문장 또는 관련 없을 경우 안내 메시지",
      "growthStage": "위 7가지 중 하나의 value 문자열 (예: 영양생장)"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ inlineData: { data: base64Data, mimeType } }, prompt],
    });

    const rawText = response.text?.trim();
    if (!rawText) throw new Error("AI 응답이 비어 있습니다.");

    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedData = JSON.parse(cleanedText);

    if (!parsedData.isValid) {
      return { success: false, error: parsedData.resultText || "농업 또는 농자재와 관련된 사진을 올려주세요." };
    }

    return {
      success: true,
      resultText: parsedData.resultText,
      growthStage: parsedData.growthStage,
    };
  } catch (error) {
    console.error("Gemini Vision API 오류:", error);
    return { success: false, error: "사진 분석 중 오류가 발생했습니다." };
  }
}
