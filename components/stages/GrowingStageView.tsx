import React from "react";
import { Sun, CheckCircle2, Bug } from "lucide-react";
import { CropVariety, YieldCalculations } from "../../types/crop";

interface Props {
  calculations: YieldCalculations;
  crop: CropVariety;
}

export default function GrowingStageView({ calculations, crop }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">2단계: 생육 집중 및 AI 환경 진단</h3>
        </div>
        <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">생육 왕성기</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 권장 작업 가이드
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span>야간 최소 온도 {crop.baseTemp + 3}℃ 이상 유지 관리 (난방 및 측창 제어)</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span>적엽 및 적화 작업 1차 시행 (하부 노화엽 제거로 통풍 확보)</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span>수분 수화 벌통 입식 및 착과율 점검</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bug className="w-4 h-4 text-amber-400" /> AI 병해충 주의보
          </h4>
          <div className="space-y-2.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">흰가루병 / 잿빛곰팡이병</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold">주의 Stage</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">주/야간 습도 차이로 발병 위험 증가. 야간 제습 및 환기 팬 가동 필요.</p>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400">설정된 피해 차감 비율</span>
              <span className="text-red-400 font-bold">-{calculations.pestDamageRate}% 적용 중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
