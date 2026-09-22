import { CropVariety, TimingCalculations, YieldCalculations } from "../types/crop";

export function calculateGDDTiming(plantingDate: string, floweringDate: string, facilityType: "outdoor" | "vinyl" | "glass", activeCrop: CropVariety): TimingCalculations {
  if (!plantingDate) {
    return {
      daysElapsed: 0,
      currentGDD: 0,
      targetGDD: activeCrop.targetGDD,
      progressPercent: 0,
      estHarvestDate: "미정",
      daysRemaining: 0,
      dailyRate: 0,
      tempAdjustment: 0,
      currentStage: 1,
    };
  }

  const today = new Date();
  const pDate = new Date(plantingDate);

  let tempOffset = 0;
  if (facilityType === "vinyl") tempOffset = 2.5;
  if (facilityType === "glass") tempOffset = 4.0;

  const adjustedAvgTemp = activeCrop.avgTempRecent + tempOffset;
  const effectiveDailyTemp = Math.max(0, adjustedAvgTemp - activeCrop.baseTemp);

  const diffTime = Math.max(0, today.getTime() - pDate.getTime());
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const floweringBonus = floweringDate ? 1.08 : 1.0;

  let currentGDD = Math.round(daysElapsed * effectiveDailyTemp * floweringBonus);
  if (currentGDD < 0) currentGDD = 0;

  const progressPercent = Math.min(100, Math.round((currentGDD / activeCrop.targetGDD) * 100));

  const adjusted7DayAvg = activeCrop.recent7DaysAvg + tempOffset;
  const dailyGDDRate = Math.max(1, (adjusted7DayAvg - activeCrop.baseTemp) * floweringBonus);

  const remainingGDD = Math.max(0, activeCrop.targetGDD - currentGDD);
  const daysRemaining = Math.ceil(remainingGDD / dailyGDDRate);

  const projectedDate = new Date();
  projectedDate.setDate(today.getDate() + daysRemaining);
  const formattedEstDate = projectedDate.toISOString().split("T")[0];

  let currentStage = 1;
  if (progressPercent >= 20 && progressPercent < 75) currentStage = 2;
  else if (progressPercent >= 75 && progressPercent < 95) currentStage = 3;
  else if (progressPercent >= 95) currentStage = 4;

  return {
    daysElapsed,
    currentGDD,
    targetGDD: activeCrop.targetGDD,
    progressPercent,
    estHarvestDate: formattedEstDate,
    daysRemaining,
    dailyRate: Number(dailyGDDRate.toFixed(1)),
    tempAdjustment: tempOffset,
    currentStage,
  };
}

export function calculateYieldAndFinancials(params: {
  areaMode: "pyeong" | "m2" | "plants";
  areaValue: number;
  plantCountInput: number;
  fruitsPerPlant: number;
  avgFruitWeightG: number;
  pestDamageRate: number;
  cultivationMethod: "soil" | "hydroponic" | "organic";
  actualHarvestedKg: number;
  unitPrice: number;
  fertilizerCost: number;
  pesticideCost: number;
  utilityCost: number;
  activeCrop: CropVariety;
}): YieldCalculations {
  const { areaMode, areaValue, plantCountInput, fruitsPerPlant, avgFruitWeightG, pestDamageRate, cultivationMethod, actualHarvestedKg, unitPrice, fertilizerCost, pesticideCost, utilityCost, activeCrop } = params;

  let totalPlants = 0;
  if (areaMode === "pyeong") {
    const m2 = areaValue * 3.305785;
    totalPlants = Math.round(m2 * activeCrop.standardPlantDensity);
  } else if (areaMode === "m2") {
    totalPlants = Math.round(areaValue * activeCrop.standardPlantDensity);
  } else {
    totalPlants = Number(plantCountInput) || 0;
  }

  let methodMultiplier = 1.0;
  if (cultivationMethod === "hydroponic") methodMultiplier = 1.1;
  if (cultivationMethod === "organic") methodMultiplier = 0.9;

  const grossPerPlantGrams = (Number(fruitsPerPlant) || 0) * (Number(avgFruitWeightG) || 0);
  const grossTotalKg = (totalPlants * grossPerPlantGrams * methodMultiplier) / 1000;

  const damageMultiplier = 1 - (Number(pestDamageRate) || 0) / 100;
  const estTotalYieldKg = Math.round(grossTotalKg * Math.max(0, damageMultiplier));

  const gradeARate = Math.max(50, activeCrop.standardGradeA - Math.round((Number(pestDamageRate) || 0) * 0.6));
  const estMarketableYieldKg = Math.round(estTotalYieldKg * (gradeARate / 100));

  const remainingYieldKg = Math.max(0, estTotalYieldKg - (Number(actualHarvestedKg) || 0));

  const minYield = Math.round(estTotalYieldKg * 0.9);
  const maxYield = Math.round(estTotalYieldKg * 1.1);

  const estimatedGrossRevenue = Math.round(estMarketableYieldKg * unitPrice);
  const totalInputCosts = fertilizerCost + pesticideCost + utilityCost;
  const estimatedNetMargin = estimatedGrossRevenue - totalInputCosts;
  const netMarginPercent = estimatedGrossRevenue > 0 ? Math.round((estimatedNetMargin / estimatedGrossRevenue) * 100) : 0;

  return {
    totalPlants,
    estTotalYieldKg,
    gradeARate,
    estMarketableYieldKg,
    remainingYieldKg,
    minYield,
    maxYield,
    estimatedGrossRevenue,
    totalInputCosts,
    estimatedNetMargin,
    netMarginPercent,
    pestDamageRate,
  };
}
