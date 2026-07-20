// "use client";
// import { useState } from "react";

// // 농장 정보에서 정의한 CropItem 타입
// export interface CropItem {
//   id: string;
//   statusType: "growing" | "planned";
//   name: string;
//   area: string;
//   plantDate: string;
//   bloomDate: string;
// }

// // 📝 일지 항목에 맞게 타입을 확장합니다.
// interface LogItem {
//   id: string;
//   cropId: string;       // 농장 정보와 매핑할 작물 고유 ID
//   selectedWorks: string[]; // 다중 선택된 작업 종류들
//   fertilizerAmount: string; // 비료 사용량
//   fertilizerUnit: string;   // 비료 단위
//   pesticideAmount: string;  // 농약 사용량
//   pesticideUnit: string;    // 농약 단위
//   harvestAmount: string;    // 수확량
//   harvestUnit: string;      // 수확 단위
//   content: string;          // 구체적인 작업 내용
// }

// interface FarmingLogProps {
//   cropList: CropItem[]; // 부모나 저장소로부터 전달받은 농장의 작물 리스트
// }

// export default function FarmingLog({ cropList }: FarmingLogProps) {
//   // 농장 정보에 작물명이 올바르게 입력된 작물만 골라냅니다.
//   const availableCrops = cropList.filter((crop) => crop.name && crop.name.trim() !== "");

//   // 📅 일지 기준 날짜 상태
//   const [workDate, setWorkDate] = useState(new Date().toISOString().split("T")[0]);

//   // 📝 동적으로 추가될 작업 리스트 상태 (초기값 세팅)
//   const [logItems, setLogItems] = useState<LogItem[]>([
//     {
//       id: "1",
//       cropId: "",
//       selectedWorks: [],
//       fertilizerAmount: "",
//       fertilizerUnit: "kg",
//       pesticideAmount: "",
//       pesticideUnit: "ml",
//       harvestAmount: "",
//       harvestUnit: "kg",
//       content: "",
//     },
//   ]);

//   // 🛠️ 체크박스 토글 핸들러 (logItems 내의 특정 id를 찾아 업데이트)
//   const handleWorkToggle = (id: string, workType: string) => {
//     setLogItems((prevList) =>
//       prevList.map((item) => {
//         if (item.id !== id) return item;

//         const currentWorks = item.selectedWorks || [];
//         const nextWorks = currentWorks.includes(workType)
//           ? currentWorks.filter((w) => w !== workType) // 이미 있으면 제거
//           : [...currentWorks, workType];             // 없으면 추가

//         return { ...item, selectedWorks: nextWorks };
//       })
//     );
//   };

//   // ➕ 새로운 작업 행 추가
//   const handleAddLogItem = () => {
//     setLogItems([
//       ...logItems,
//       {
//         id: Date.now().toString(),
//         cropId: "",
//         selectedWorks: [],
//         fertilizerAmount: "",
//         fertilizerUnit: "kg",
//         pesticideAmount: "",
//         pesticideUnit: "ml",
//         harvestAmount: "",
//         harvestUnit: "kg",
//         content: "",
//       },
//     ]);
//   };

//   // ❌ 특정 작업 행 삭제
//   const handleRemoveLogItem = (id: string) => {
//     if (logItems.length === 1) {
//       alert("최소 한 개의 작업 내용은 입력해야 합니다.");
//       return;
//     }
//     setLogItems(logItems.filter((item) => item.id !== id));
//   };

//   // ✍️ 작업 행 데이터 변경 핸들러
//   const handleLogItemChange = <K extends keyof LogItem>(id: string, field: K, value: LogItem[K]) => {
//     setLogItems(
//       logItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
//     );
//   };

//   // 💾 일지 전체 저장 버튼 클릭 시
//   const handleSaveAllLogs = () => {
//     // 유효성 검사: 작물이 선택되지 않았거나 수행한 작업이 하나도 없는지 확인
//     const hasEmptyField = logItems.some((item) => !item.cropId || item.selectedWorks.length === 0);

//     if (hasEmptyField) {
//       alert("⚠️ 대상 작물을 선택하고 수행한 작업을 최소 하나 이상 체크해 주세요.");
//       return;
//     }

//     // 최종 서버로 전송하거나 저장할 데이터 구조 객체
//     const finalPayload = {
//       date: workDate,
//       logs: logItems.map((item) => {
//         const targetCrop = availableCrops.find((c) => c.id === item.cropId);
//         return {
//           ...item,
//           cropName: targetCrop ? targetCrop.name : "알 수 없는 작물",
//         };
//       }),
//     };

//     console.log("저장될 데이터:", finalPayload);
//     alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 영농 기록이 저장되었습니다.`);
//   };

//   return (
//     <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-sans mt-6">
//       <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">📝 영농 일지 일괄 작성</h2>

//       {/* 1. 작업 기준 날짜 설정 */}
//       <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
//         <label className="block text-xs font-bold text-slate-500 mb-2">📅 작업 기준 일자</label>
//         <input
//           type="date"
//           value={workDate}
//           onChange={(e) => setWorkDate(e.target.value)}
//           className="w-full sm:w-auto p-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:ring-emerald-500 focus:outline-none"
//         />
//       </div>

//       {/* 2. 동적 작업 추가 리스트 영역 */}
//       <div className="mb-5">
//         <div className="flex justify-between items-center mb-3">
//           <label className="text-sm font-bold text-slate-700">🛠️ 오늘 진행한 작업 내역</label>
//           <button
//             type="button"
//             onClick={handleAddLogItem}
//             className="px-2.5 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all"
//           >
//             ➕ 작업 추가
//           </button>
//         </div>

//         <div className="flex flex-col gap-4">
//           {logItems.map((item, index) => (
//             <div key={item.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm flex flex-col gap-3">
//               {/* 우측 상단 행 삭제 버튼 */}
//               <button
//                 type="button"
//                 onClick={() => handleRemoveLogItem(item.id)}
//                 className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs"
//               >
//                 ❌ 삭제
//               </button>

//               <div className="text-xs font-bold text-emerald-600"># 작업 기록 {index + 1}</div>

//               {/* 🌾 대상 작물 선택 셀렉트박스 (농장 정보 연동) */}
//               <div>
//                 <label className="block text-[11px] text-slate-500 mb-1">대상 작물</label>
//                 <select
//                   value={item.cropId}
//                   onChange={(e) => handleLogItemChange(item.id, "cropId", e.target.value)}
//                   className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500"
//                 >
//                   <option value="">-- 작물 선택 --</option>
//                   {availableCrops.map((crop) => (
//                     <option key={crop.id} value={crop.id}>
//                       {crop.name} ({crop.statusType === "growing" ? "🌱식재중" : "📅예정"} · {crop.area}평)
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* 3. 해당 작물에 한 작업 다중 선택 (체크박스) */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-bold text-slate-800">수행한 작업 (다중 선택 가능)</label>
//                 <div className="p-3.5 border border-slate-300 rounded-lg bg-white grid grid-cols-2 gap-3">
//                   {(["물주기", "밭만들기/멀칭", "가지치기/풀뽑기","유인줄/지주대 설치", "비료살포", "농약방제", "수확", "포장/밭정리"] as const).map((type) => (
//                     <label key={type} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 text-sm select-none">
//                       <input
//                         type="checkbox"
//                         checked={item.selectedWorks?.includes(type) || false}
//                         onChange={() => handleWorkToggle(item.id, type)}
//                         className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-slate-300"
//                       />
//                       <span className={item.selectedWorks?.includes(type) ? "text-emerald-700 font-bold" : ""}>
//                         {type}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* 4. [조건부] 선택한 작업에 따른 상세 입력창 영역 */}
//               <div className="flex flex-col gap-2.5">
//                 {/* 🧪 '비료살포'가 체크되었을 때만 비료 사용량 입력창 노출 */}
//                 {item.selectedWorks?.includes("비료살포") && (
//                   <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300">
//                     <span className="text-xs font-bold text-slate-800 pl-1 w-20 shrink-0">🧪 비료 사용량:</span>
//                     <input
//                       type="number"
//                       placeholder="예: 500"
//                       value={item.fertilizerAmount}
//                       onChange={(e) => handleLogItemChange(item.id, "fertilizerAmount", e.target.value)}
//                       className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
//                     />
//                     <select
//                       value={item.fertilizerUnit}
//                       onChange={(e) => handleLogItemChange(item.id, "fertilizerUnit", e.target.value)}
//                       className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold"
//                     >
//                       <option value="kg">kg (킬로그램)</option>
//                       <option value="g">g (그램)</option>
//                       <option value="포대">포대 (포)</option>
//                     </select>
//                   </div>
//                 )}

//                 {/* 🧪 '농약방제'가 체크되었을 때만 농약 사용량 입력창 노출 */}
//                 {item.selectedWorks?.includes("농약방제") && (
//                   <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300">
//                     <span className="text-xs font-bold text-slate-800 pl-1 w-20 shrink-0">🚜 농약 사용량:</span>
//                     <input
//                       type="number"
//                       placeholder="예: 20"
//                       value={item.pesticideAmount}
//                       onChange={(e) => handleLogItemChange(item.id, "pesticideAmount", e.target.value)}
//                       className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
//                     />
//                     <select
//                       value={item.pesticideUnit}
//                       onChange={(e) => handleLogItemChange(item.id, "pesticideUnit", e.target.value)}
//                       className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold"
//                     >
//                       <option value="ml">ml (밀리리터)</option>
//                       <option value="L">L (리터)</option>
//                       <option value="g">g (그램)</option>
//                     </select>
//                   </div>
//                 )}

//                 {/* 📦 '수확'이 체크되었을 때만 수확량 입력창 노출 */}
//                 {item.selectedWorks?.includes("수확") && (
//                   <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300">
//                     <span className="text-xs font-bold text-slate-800 pl-1 w-20 shrink-0">📦 수확량 기록:</span>
//                     <input
//                       type="number"
//                       placeholder="예: 15"
//                       value={item.harvestAmount}
//                       onChange={(e) => handleLogItemChange(item.id, "harvestAmount", e.target.value)}
//                       className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
//                     />
//                     <select
//                       value={item.harvestUnit}
//                       onChange={(e) => handleLogItemChange(item.id, "harvestUnit", e.target.value)}
//                       className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold"
//                     >
//                       <option value="kg">kg (킬로그램)</option>
//                       <option value="g">g (그램)</option>
//                       <option value="박스">박스</option>
//                     </select>
//                   </div>
//                 )}
//               </div>

//               {/* ✍️ 상세 내용 입력란 */}
//               <div>
//                 <label className="block text-[11px] text-slate-500 mb-1">상세 작업 내용</label>
//                 <textarea
//                   placeholder="진행한 작업의 특이사항이나 상세 내용을 입력하세요."
//                   value={item.content}
//                   onChange={(e) => handleLogItemChange(item.id, "content", e.target.value)}
//                   rows={2}
//                   className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-emerald-500"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 3. 전체 저장 버튼 */}
//       <button
//         onClick={handleSaveAllLogs}
//         className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
//       >
//         🎯 작성된 모든 일지 내역 저장하기
//       </button>
//     </div>
//   );
// }
"use client";
import { useState } from "react";

export interface CropItem {
  id: string;
  statusType: "growing" | "planned";
  name: string;
  area: string;
  plantDate: string;
  bloomDate: string;
}

// 🗂️ 농업 작업 카테고리 구조 정의
const WORK_CATEGORIES = [
  {
    id: "env",
    title: "🌱 1. 토양 및 재배 환경 조성 (시작 단계)",
    tasks: ["경운(땅갈기)/정지", "시비(밑거름 주기)", "멀칭", "유인줄/지주대 설치"],
  },
  {
    id: "growth",
    title: "🌿 2. 생육 관리 및 전지 (성장 단계)",
    tasks: ["물주기(관수)","비료/영양제 살포","농약방제/병해충 관리","가식/이식", "보식/솎아내기(적묘)", "순지르기(적심)/곁순 제거", "적화(꽃솎기)/적과(열매솎기)", "유인"],
  },
  {
    id: "facility",
    title: "⚙️ 3. 시설 및 농기계 관리",
    tasks: ["시설 점검(하우스 개폐기, 관수시설 등)", "농기계 정비(예초기, 관리기, 트랙터 등)"],
  },
  {
    id: "harvest",
    title: "🎯 4. 수확 및 수확 이후 단계",
    tasks: ["수확", "잔재물 정리/포장 정비", "선별/포장", "출하"],
  },
] as const;

// 작업 리스트의 타입 명시를 위해 단일 배열도 추출
const ALL_TASKS = WORK_CATEGORIES.flatMap((cat) => cat.tasks);
type FarmTask = (typeof ALL_TASKS)[number];
type GrowthStage = "육묘" | "정식/활착" | "영양생장" | "개화" | "착과/비대" | "성숙/수확" | "수확후관리";
interface LogItem {
  id: string;
  cropId: string;
  selectedWorks: FarmTask[]; // 확장된 작업 타입 반영
  fertilizerAmount: string;
  fertilizerUnit: string;
  pesticideAmount: string;
  pesticideUnit: string;
  harvestAmount: string;
  harvestUnit: string;
  content: string;
  growthStage: string;
}

interface FarmingLogProps {
  cropList: CropItem[];
}

export default function FarmingLog({ cropList }: FarmingLogProps) {
  const availableCrops = cropList.filter((crop) => crop.name && crop.name.trim() !== "");
  const [workDate, setWorkDate] = useState(new Date().toISOString().split("T")[0]);

  const [logItems, setLogItems] = useState<LogItem[]>([
    {
      id: "1",
      cropId: "",
      selectedWorks: [],
      fertilizerAmount: "",
      fertilizerUnit: "kg",
      pesticideAmount: "",
      pesticideUnit: "ml",
      harvestAmount: "",
      harvestUnit: "kg",
      content: "",
      growthStage:""
    },
  ]);

  const handleWorkToggle = (id: string, workType: FarmTask) => {
    setLogItems((prevList) =>
      prevList.map((item) => {
        if (item.id !== id) return item;
        const currentWorks = item.selectedWorks || [];
        const nextWorks = currentWorks.includes(workType) ? currentWorks.filter((w) => w !== workType) : [...currentWorks, workType];
        return { ...item, selectedWorks: nextWorks };
      }),
    );
  };

  const handleAddLogItem = () => {
    setLogItems([
      ...logItems,
      {
        id: Date.now().toString(),
        cropId: "",
        selectedWorks: [],
        fertilizerAmount: "",
        fertilizerUnit: "kg",
        pesticideAmount: "",
        pesticideUnit: "ml",
        harvestAmount: "",
        harvestUnit: "kg",
        content: "",
        growthStage: "",
      },
    ]);
  };

  const handleRemoveLogItem = (id: string) => {
    if (logItems.length === 1) {
      alert("최소 한 개의 작업 내용은 입력해야 합니다.");
      return;
    }
    setLogItems(logItems.filter((item) => item.id !== id));
  };

  const handleLogItemChange = <K extends keyof LogItem>(id: string, field: K, value: LogItem[K]) => {
    setLogItems(logItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSaveAllLogs = () => {
    const hasEmptyField = logItems.some((item) => !item.cropId || item.selectedWorks.length === 0);
    if (hasEmptyField) {
      alert("⚠️ 대상 작물을 선택하고 수행한 작업을 최소 하나 이상 체크해 주세요.");
      return;
    }

    const finalPayload = {
      date: workDate,
      logs: logItems.map((item) => {
        const targetCrop = availableCrops.find((c) => c.id === item.cropId);
        return {
          ...item,
          cropName: targetCrop ? targetCrop.name : "알 수 없는 작물",
        };
      }),
    };

    console.log("저장될 데이터:", finalPayload);
    alert(`🎯 ${workDate} 자로 총 ${logItems.length}건의 영농 기록이 저장되었습니다.`);
  };

return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-sans">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">📝 영농 일지 일괄 작성</h2>

      {/* 1. 작업 기준 날짜 설정 */}
      <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="block text-xs font-bold text-slate-500 mb-2">📅 작업 기준 일자</label>
        {/* 🛠️ 수정: sm:w-auto를 지우고 w-full로 고정하여 화면 크기에 따라 너비가 급변하는 것을 방지합니다. */}
        <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:ring-emerald-500 focus:outline-none" />
      </div>

      {/* 2. 동적 작업 추가 리스트 영역 */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-slate-700">🛠️ 오늘 진행한 작업 내역</label>
          <button type="button" onClick={handleAddLogItem} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all">
            ➕ 작업 추가
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {logItems.map((item, index) => (
            <div key={item.id} className="p-4 border border-slate-200 rounded-xl relative bg-white shadow-sm flex flex-col gap-4">
              <button type="button" onClick={() => handleRemoveLogItem(item.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs">
                ❌ 삭제
              </button>

              <div className="text-xs font-bold text-emerald-600"># 작업 기록 {index + 1}</div>

              {/* 🌾 대상 작물 선택 */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">대상 작물</label>
                <select value={item.cropId} onChange={(e) => handleLogItemChange(item.id, "cropId", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-emerald-500">
                  <option value="">-- 작물 선택 --</option>
                  {availableCrops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name} ({crop.statusType === "growing" ? "🌱식재중" : "📅예정"} · {crop.area}평)
                    </option>
                  ))}
                </select>
              </div>

              {/* 🗂️ 3. 단계별 작업 다중 선택 (구조화 레이아웃) */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-800">수행한 작업 (단계별 선택)</label>

                {WORK_CATEGORIES.map((category) => (
                  <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                    {/* 카테고리 헤더 */}
                    <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[11px] font-bold text-slate-700">{category.title}</div>
                    {/* 세부 체크박스 목록 */}
                    {/* 🛠️ 수정: grid-cols-1 sm:grid-cols-2 대신 항상 균일하게 정렬되는 고정 grid 혹은 flex-wrap 구조를 사용합니다. 
                        여기서는 첫 번째 컴포넌트처럼 안정적인 격자 모양 유지를 위해 grid-cols-2로 깔끔하게 고정했습니다. */}
                    <div className="p-3 bg-white grid grid-cols-2 gap-2">
                      {category.tasks.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 text-xs select-none">
                          <input type="checkbox" checked={item.selectedWorks?.includes(type) || false} onChange={() => handleWorkToggle(item.id, type)} className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 border-slate-300" />
                          <span className={item.selectedWorks?.includes(type) ? "text-emerald-700 font-bold" : ""}>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            {/* 4. [조건부] 특정 키워드 감지 시 투입량/수확량 입력창 노출 (스르륵 늘어나는 애니메이션 적용) */}
<div className="flex flex-col gap-1">
  
  {/* 비료 입력창 */}
  {(() => {
    const isVisible = item.selectedWorks?.some((w) => w.includes("비료"));
    return (
      <div className={`grid transition-all duration-300 ease-in-out ${isVisible ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"}`}>
        <div className="overflow-hidden">
          <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300 shadow-inner">
            <span className="text-xs font-bold text-slate-800 pl-1 w-24 shrink-0">🧪 밑거름/비료량:</span>
            <input type="number" placeholder="예: 500" value={item.fertilizerAmount || ""} onChange={(e) => handleLogItemChange(item.id, "fertilizerAmount", e.target.value)} className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600" />
            <select value={item.fertilizerUnit || "kg"} onChange={(e) => handleLogItemChange(item.id, "fertilizerUnit", e.target.value)} className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold">
              <option value="kg">kg (킬로그램)</option>
              <option value="g">g (그램)</option>
              <option value="포대">포대 (포)</option>
            </select>
          </div>
        </div>
      </div>
    );
  })()}

  {/* 농약 입력창 */}
  {(() => {
    const isVisible = item.selectedWorks?.some((w) => w.includes("농약"));
    return (
      <div className={`grid transition-all duration-300 ease-in-out ${isVisible ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"}`}>
        <div className="overflow-hidden">
          <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300 shadow-inner">
            <span className="text-xs font-bold text-slate-800 pl-1 w-24 shrink-0">🚜 농약 사용량:</span>
            <input type="number" placeholder="예: 20" value={item.pesticideAmount || ""} onChange={(e) => handleLogItemChange(item.id, "pesticideAmount", e.target.value)} className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600" />
            <select value={item.pesticideUnit || "ml"} onChange={(e) => handleLogItemChange(item.id, "pesticideUnit", e.target.value)} className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold">
              <option value="ml">ml (밀리리터)</option>
              <option value="L">L (리터)</option>
              <option value="g">g (그램)</option>
            </select>
          </div>
        </div>
      </div>
    );
  })()}

  {/* 수확량 입력창 */}
  {(() => {
    const isVisible = item.selectedWorks?.some((w) => w.includes("수확"));
    return (
      <div className={`grid transition-all duration-300 ease-in-out ${isVisible ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"}`}>
        <div className="overflow-hidden">
          <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-300 shadow-inner">
            <span className="text-xs font-bold text-slate-800 pl-1 w-24 shrink-0">📦 수확량 기록:</span>
            <input type="number" placeholder="예: 15" value={item.harvestAmount || ""} onChange={(e) => handleLogItemChange(item.id, "harvestAmount", e.target.value)} className="flex-1 p-1.5 text-sm font-bold border-b border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600" />
            <select value={item.harvestUnit || "kg"} onChange={(e) => handleLogItemChange(item.id, "harvestUnit", e.target.value)} className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-800 font-bold">
              <option value="kg">kg (킬로그램)</option>
              <option value="g">g (그램)</option>
              <option value="박스">박스</option>
            </select>
          </div>
        </div>
      </div>
    );
  })()}

</div>

              {/* ✍️ 상세 내용 입력란 */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">상세 작업 내용</label>
                <textarea placeholder="진행한 작업의 특이사항이나 구체적인 규격(비닐 두께, 농기계 모델 등)을 입력하세요." value={item.content} onChange={(e) => handleLogItemChange(item.id, "content", e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-emerald-500" />
              </div>

              {/* 생장 단계 선택 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">🌱 현재 생장 단계 (세부 선택)</label>
                <select value={item.growthStage || ""} onChange={(e) => handleLogItemChange(item.id, "growthStage", e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-emerald-500">
                  <option value="">-- 현재 생장 단계 선택 --</option>
                  <option value="육묘">🌱 1. 육묘 및 묘종기 (정식 전)</option>
                  <option value="정식/활착">🪵 2. 정식 및 활착기 (아주심기 후 뿌리내림)</option>
                  <option value="영양생장">🌿 3. 영양 생장기 (줄기/잎 신장 및 곁순 발생)</option>
                  <option value="개화">🌸 4. 개화기 (꽃눈 형성 및 개화 시작)</option>
                  <option value="착과/비대">🍅 5. 착과 및 비대기 (열매 맺힘 및 과실 커짐)</option>
                  <option value="성숙/수확">🎯 6. 성숙 및 수확기 (색 발현 및 본격 수확)</option>
                  <option value="수확후관리">🧹 7. 수확 후 관리기 (잔재물 정리 및 토양 환원)</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        
      </div>

      {/* 3. 전체 저장 버튼 */}
      <button onClick={handleSaveAllLogs} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm">
        🎯 작성된 모든 일지 내역 저장하기
      </button>
    </div>
);
}
