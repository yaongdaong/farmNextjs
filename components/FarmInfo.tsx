"use client";
import { useState, useEffect } from "react";

// 전국 시·도 및 시·구·군 데이터 정의
const LOCATION_DATA: Record<string, string[]> = {
  서울특별시: ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  부산광역시: ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
  대구광역시: ["군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  인천광역시: ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
  광주광역시: ["광산구", "남구", "동구", "북구", "서구"],
  대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
  울산광역시: ["남구", "동구", "북구", "울주군", "중구"],
  세종특별자치시: ["세종시"],
  경기도: ["가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"],
  강원특별자치도: ["강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군"],
  충청북도: ["괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군", "청주시", "충주시"],
  충청남도: ["계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군", "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군"],
  전북특별자치도: ["고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군"],
  전라남도: ["강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
  경상북도: ["경산시", "경주시", "고령군", "구미시", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시"],
  경상남도: ["거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군"],
  제주특별자치도: ["서귀포시", "제주시"]
};

export interface CropItem {
  id: string;
  statusType: "growing" | "planned";
  name: string;
  area: string;
  plantDate: string;
  bloomDate: string;
  analysisResult?: string;
}

export default function FarmInfo() {
  // 1. 기본 농장 정보
  const [totalArea, setTotalArea] = useState("500");
  const [sido, setSido] = useState("전라남도");
  const [sigungu, setSigungu] = useState("화순군");
  const [weatherInfo, setWeatherInfo] = useState({ temp: 24, humidity: 65, rain: 0, sky: "맑음", solHours: 9.5 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [cropList, setCropList] = useState<CropItem[]>([
    { id: "1", statusType: "growing", name: "", area: "", plantDate: "", bloomDate: "" }
  ]);

  // 💡 시/도 변경 핸들러 수정
  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSido(e.target.value);
    setSigungu(""); // 시/도가 바뀌면 시구군은 빈칸("")으로 돌아갑니다.
  };

  const handleAddCrop = () => {
    setCropList([...cropList, { id: Date.now().toString(), statusType: "growing", name: "", area: "", plantDate: "", bloomDate: "" }]);
  };

  const handleRemoveCrop = (id: string) => {
    if (cropList.length === 1) {
      alert("최소 한 개의 작물 정보는 입력해야 합니다.");
      return;
    }
    setCropList(cropList.filter((crop) => crop.id !== id));
  };

  const handleCropChange = <K extends keyof CropItem>(id: string, field: K, value: CropItem[K]) => {
    setCropList(cropList.map((crop) => (crop.id === id ? { ...crop, [field]: value } : crop)));
  };

  const handleRecommendArea = (id: string, name: string) => {
    const total = parseFloat(totalArea) || 0;
    const otherAllocated = cropList
      .filter((crop) => crop.id !== id)
      .reduce((sum, crop) => sum + (parseFloat(crop.area) || 0), 0);

    const remaining = total - otherAllocated;
    if (remaining <= 0) {
      alert("남은 밭 면적이 없습니다.");
      return;
    }
    handleCropChange(id, "area", remaining.toString());
  };

  const getCalculatedDateStr = (dateStr: string, days: number) => {
    if (!dateStr) return "미지정";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleAnalyzeAll = async () => {
    if (!sido || !sigungu) {
      alert("⚠️ 농장 재배 위치(시/도 및 시/구/군)를 모두 선택해 주세요.");
      return;
    }
    setIsAnalyzing(true);

    const updatedList = await Promise.all(
      cropList.map(async (crop) => {
        if (!crop.name) return { ...crop, analysisResult: "⚠️ 작물 이름을 입력해 주세요." };

        try {
          if (crop.statusType === "growing") {
            const harvestDate = "10월 중순";
            const expectedYield = `${parseInt(crop.area || "0") * 3}kg`;
            const manureDate = getCalculatedDateStr(crop.plantDate, -14);
            const firstFertilizerDate = getCalculatedDateStr(crop.plantDate, 30);
            const secondFertilizerDate = getCalculatedDateStr(crop.plantDate, 60);

            const scheduleText = crop.plantDate
              ? `\n\n[📅 맞춤 관리 일정]\n- 밭 만들기(밑거름/석회): 예정일이었던 [${manureDate}]에 완료되었어야 합니다.\n- 1차 웃거름(추비): [${firstFertilizerDate}] 권장\n- 2차 웃거름(추비): [${secondFertilizerDate}] 권장`
              : `\n\n💡 [식재 시기]를 입력하시면 정확한 거름/비료 살포 일정을 받아보실 수 있습니다.`;

            return {
              ...crop,
              analysisResult: `🌱 현재 [${sigungu}]의 날씨와 개화시기(${crop.bloomDate || "미지정"})를 보아 [${harvestDate}]가 [${crop.name}]의 최적의 수확시기가 될 것으로 보이고, 예상 수확량은 [${expectedYield}]입니다.${scheduleText}`,
            };
          } else {
            const recommendedDate = "3월 하순";
            const expectedHarvestDate = "6월 하순~7월 초순";
            const pyeong = parseFloat(crop.area || "0");
            const yieldPerPyeong = crop.name.includes("고추") ? 4 : 20;
            const expectedYield = `${(pyeong * yieldPerPyeong).toLocaleString()}kg`;
            
            return {
              ...crop,
              analysisResult: `📅 [${sigungu}]의 기후와 날짜별 농산물 경매가격을 분석한 결과, [${crop.name}]은(는) [${recommendedDate}]에 심는 것이 가장 적합합니다. 이 시기에 심을 경우 예상 수확 시기는 [${expectedHarvestDate}]이며, 예상 수확량은 약 [${expectedYield}]입니다.`,
            };
          }
        } catch (e) {
          return { ...crop, analysisResult: "❌ 이 작물은 분석 중 오류가 발생했습니다." };
        }
      }),
    );

    setCropList(updatedList);
    setIsAnalyzing(false);
  };

  const allocatedArea = cropList.reduce((sum, crop) => sum + (parseFloat(crop.area) || 0), 0);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-sans">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">🏡 나의 농장 정보 설정</h2>

      {/* 1. 기본 위치 및 날씨 블록 */}
      <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="block text-xs font-bold text-slate-500 mb-2">📍 농장 재배 위치 및 실시간 기상</label>
        
        {/* 💡 시/도 및 시/구/군 선택 셀렉트박스 영역 */}
        <div className="flex gap-2 mb-3">
          {/* 시/도 선택 */}
          <select value={sido} onChange={handleSidoChange} className="flex-1 p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-emerald-500 focus:outline-none">
            <option value="">-- 시/도 선택 --</option>
            {Object.keys(LOCATION_DATA).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* 시/구/군 선택 */}
          <select value={sigungu} onChange={(e) => setSigungu(e.target.value)} disabled={!sido} className="flex-1 p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400">
            <option value="">-- 시/구/군 선택 --</option>
            {sido && LOCATION_DATA[sido]?.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {sido && sigungu ? (
          <div className="text-xs text-slate-600 leading-relaxed">
            ☀️ <span className="font-semibold text-emerald-600">{sigungu}</span>의 현재 기온은
            <span className="font-bold text-slate-700"> {weatherInfo.temp}°C</span>, 습도는
            <span className="font-bold text-slate-700"> {weatherInfo.humidity}%</span>, 강수량은
            <span className="font-bold text-slate-700"> {weatherInfo.rain}mm</span>입니다. 현재 하늘은 <span className="font-bold text-emerald-600">{weatherInfo.sky}</span> 상태입니다.
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">💡 농장의 재배 위치를 상단에서 선택해 주세요.</div>
        )}
      </div>

      {/* 2. 총 밭 면적 설정 */}
      <div className="mb-6 grid grid-cols-2 gap-4 items-center bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/40">
        <div>
          <label className="block text-xs font-bold text-emerald-800 mb-1">📐 총 밭 면적</label>
          <div className="relative">
            <input type="number" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-emerald-500" />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400">평</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">📊 현재 작물 할당량</label>
          <div className="text-xs text-slate-600">
            <span className={`font-bold ${allocatedArea > parseFloat(totalArea) ? "text-red-500" : "text-slate-700"}`}>{allocatedArea}평</span> / {totalArea}평 입력됨
          </div>
        </div>
      </div>

      {/* 3. 동적 작물 추가 리스트 영역 */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-slate-700">🌾 재배 작물 상세 등록</label>
          <button type="button" onClick={handleAddCrop} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all">
            ➕ 작물 추가
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {cropList.map((crop, index) => (
            <div key={crop.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm">
              <button type="button" onClick={() => handleRemoveCrop(crop.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs">
                ❌ 삭제
              </button>

              <div className="text-xs font-bold text-emerald-600 mb-3"># 작물 {index + 1}</div>

              {/* 라디오 버튼 */}
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input type="radio" name={`statusType-${crop.id}`} checked={crop.statusType === "growing"} onChange={() => handleCropChange(crop.id, "statusType", "growing")} className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                  🌱 식재 중
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input type="radio" name={`statusType-${crop.id}`} checked={crop.statusType === "planned"} onChange={() => handleCropChange(crop.id, "statusType", "planned")} className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                  📅 식재 예정
                </label>
              </div>

              {/* 입력 인풋 그리드 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">작물명</label>
                  <input type="text" placeholder="예: 완숙 토마토" value={crop.name} onChange={(e) => handleCropChange(crop.id, "name", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-emerald-500" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    {crop.statusType === "growing" ? "심은 면적 (평)" : "심을 면적 (평)"}
                  </label>
                  <div className="flex gap-1 items-start">
                    <input type="number" placeholder="면적 입력" value={crop.area} onChange={(e) => handleCropChange(crop.id, "area", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-emerald-500" />
                    {crop.statusType === "planned" && (
                      <button type="button" onClick={() => handleRecommendArea(crop.id, crop.name)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] whitespace-nowrap h-[34px]">
                        💡 추천
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 자재 소요량 가이드 */}
              {crop.area && crop.name && (
                <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-slate-700">
                  <div className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                    💡 {crop.name} ({crop.area}평) 맞춤 자재 소요량 가이드
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] leading-relaxed text-slate-600">
                    <div>
                      🚜 <span className="font-semibold text-slate-800">권장 물 & 농약 양:</span> 물 약 <span className="font-bold text-emerald-600">{(parseFloat(crop.area) * 0.5).toFixed(1)}L</span> (총 {Math.ceil((parseFloat(crop.area) * 0.5) / 20)}말 분량)
                    </div>
                    <div>
                      📦 <span className="font-semibold text-slate-800">추천 밑거름(비료) 양:</span> 약 <span className="font-bold text-emerald-600">{(parseFloat(crop.area) * 0.03).toFixed(1)}kg</span> 소요 예상
                    </div>
                  </div>
                </div>
              )}

              {/* 식재 중일 때만 추가 가이드 */}
              {crop.statusType === "growing" && (
                <div className="mt-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">📅 식재 시기 (밭에 심은 날짜)</label>
                    <input type="date" value={crop.plantDate} onChange={(e) => handleCropChange(crop.id, "plantDate", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-medium text-slate-600">🌸 개화 시기 (꽃이 핀 날짜)</label>
                      <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer select-none">
                        <input type="checkbox" checked={crop.bloomDate === "unknown"} onChange={(e) => handleCropChange(crop.id, "bloomDate", e.target.checked ? "unknown" : "")} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3 h-3" />
                        아직 안 핌 / 모름
                      </label>
                    </div>
                    <input type="date" value={crop.bloomDate === "unknown" ? "" : crop.bloomDate} disabled={crop.bloomDate === "unknown"} onChange={(e) => handleCropChange(crop.id, "bloomDate", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400 transition-all" />
                  </div>
                </div>
              )}

              {crop.analysisResult && (
                <div className="mt-3 p-3 bg-slate-900 text-white rounded-lg text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                  {crop.analysisResult}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. 전체 분석 가동 버튼 */}
      <button onClick={handleAnalyzeAll} disabled={isAnalyzing} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-medium rounded-xl text-sm transition-all shadow-sm">
        {isAnalyzing ? "🤖 전 품목 기후 데이터 병렬 분석 중..." : "🎯 등록된 모든 작물 예측 리포트 출력"}
      </button>
    </div>
  );
}