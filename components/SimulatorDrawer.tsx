import React from "react";
import { Sliders, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  facilityType: "outdoor" | "vinyl" | "glass";
  setFacilityType: (val: "outdoor" | "vinyl" | "glass") => void;
  cultivationMethod: "soil" | "hydroponic" | "organic";
  setCultivationMethod: (val: "soil" | "hydroponic" | "organic") => void;
  plantingDate: string;
  setPlantingDate: (val: string) => void;
  floweringDate: string;
  setFloweringDate: (val: string) => void;
  areaValue: number;
  setAreaValue: (val: number) => void;
  fruitsPerPlant: number;
  setFruitsPerPlant: (val: number) => void;
  avgFruitWeightG: number;
  setAvgFruitWeightG: (val: number) => void;
  pestDamageRate: number;
  setPestDamageRate: (val: number) => void;
  unitPrice: number;
  setUnitPrice: (val: number) => void;
  actualHarvestedKg: number;
  setActualHarvestedKg: (val: number) => void;
}

export default function SimulatorDrawer({
  isOpen,
  onClose,
  facilityType,
  setFacilityType,
  cultivationMethod,
  setCultivationMethod,
  plantingDate,
  setPlantingDate,
  floweringDate,
  setFloweringDate,
  areaValue,
  setAreaValue,
  fruitsPerPlant,
  setFruitsPerPlant,
  avgFruitWeightG,
  setAvgFruitWeightG,
  pestDamageRate,
  setPestDamageRate,
  unitPrice,
  setUnitPrice,
  actualHarvestedKg,
  setActualHarvestedKg,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">예측 조건 보정 / 시뮬레이터</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Facility Type */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">재배 시설 유형 (온도 보정)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "outdoor", label: "노지 (+0℃)" },
                  { id: "vinyl", label: "비닐하우스 (+2.5℃)" },
                  { id: "glass", label: "유리온실 (+4.0℃)" },
                ].map((item) => (
                  <button key={item.id} onClick={() => setFacilityType(item.id as any)} className={`p-2 rounded-xl border text-center transition-all ${facilityType === item.id ? "bg-emerald-950 text-emerald-300 border-emerald-500 font-bold" : "bg-slate-950 text-slate-400 border-slate-800"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cultivation Method */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">재배 방식 (수확량 가중치)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "soil", label: "토양 재배" },
                  { id: "hydroponic", label: "양액 재배 (+10%)" },
                  { id: "organic", label: "유기농 (-10%)" },
                ].map((item) => (
                  <button key={item.id} onClick={() => setCultivationMethod(item.id as any)} className={`p-2 rounded-xl border text-center transition-all ${cultivationMethod === item.id ? "bg-emerald-950 text-emerald-300 border-emerald-500 font-bold" : "bg-slate-950 text-slate-400 border-slate-800"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">정식일 (Planting Date)</label>
                <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">개화 확인일 (Flowering)</label>
                <input type="date" value={floweringDate} onChange={(e) => setFloweringDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">재배 규모 (평)</label>
              <input type="number" value={areaValue} onChange={(e) => setAreaValue(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
            </div>

            {/* Fruits & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">주당 예상 착과수 (개)</label>
                <input type="number" value={fruitsPerPlant} onChange={(e) => setFruitsPerPlant(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">평균 과중 (g)</label>
                <input type="number" value={avgFruitWeightG} onChange={(e) => setAvgFruitWeightG(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            {/* Pest & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">병해충 예상 손실률 (%)</label>
                <input type="number" value={pestDamageRate} onChange={(e) => setPestDamageRate(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">예상 판매 단가 (원/kg)</label>
                <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            {/* Actual Harvested */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">실제 현재 누적 수확량 (kg)</label>
              <input type="number" value={actualHarvestedKg} onChange={(e) => setActualHarvestedKg(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/50">
            시뮬레이션 적용 완료
          </button>
        </div>
      </div>
    </div>
  );
}
