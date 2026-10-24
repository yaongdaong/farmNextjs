// farm.ts
export interface FarmCropItem {
  id: string;

  cropName: string;
  location: string;

  areaSize: number;
  plantDate: string;
  bloomDate?: string;

  statusType: "GROWING" | "PLANNED";
  growthStatus: string;

  accumulatedTemp: number;
  targetTemp?: number;

  baseTemp?: number;
  targetGdd?: number;

  facilityType?: string;

  accumulatedTempText?: string;
  expectedHarvestText?: string;

  analysisResult?: string;
  isEditing?: boolean;
  aiReport?: {
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
    fertilizerSchedule: {
      stage: string;
      date: string;
      type: string;
      amount: string;
      fertilizer_name?: string;
    }[];
  };
}