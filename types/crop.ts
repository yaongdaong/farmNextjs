export type StageType = "BEFORE" | "GROWING" | "READY" | "SETTLEMENT";

export interface CropVariety {
  id: string;
  cropName: string;
  varietyName: string;
  category: string;
  icon: string;
  targetGDD: number;
  baseTemp: number;
  standardPlantDensity: number; // 주/m²
  standardFruitWeight: number; // g
  standardFruitPerPlant: number; // 개/주
  standardGradeA: number; // %
  unitPricePerKg: number; // KRW
  typicalDaysToHarvest: number;
  defaultPlantingDate: string;
  defaultFloweringDate: string;
  avgTempRecent: number;
  recent7DaysAvg: number;
  defaultArea: number; // 평
}

export interface TimingCalculations {
  daysElapsed: number;
  currentGDD: number;
  targetGDD: number;
  progressPercent: number;
  estHarvestDate: string;
  daysRemaining: number;
  dailyRate: number;
  tempAdjustment: number;
  currentStage: number;
}

export interface YieldCalculations {
  totalPlants: number;
  estTotalYieldKg: number;
  gradeARate: number;
  estMarketableYieldKg: number;
  remainingYieldKg: number;
  minYield: number;
  maxYield: number;
  estimatedGrossRevenue: number;
  totalInputCosts: number;
  estimatedNetMargin: number;
  netMarginPercent: number;
  pestDamageRate: number;
}
