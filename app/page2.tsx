 
import { useState } from 'react';
// 데이터 인터페이스 정의
interface SalesSummary {
    totalRevenue: number;
    netProfit: number;
    stockLeft: number;
    salesTrend: string;
}

 // 2. 당일 입고 및 문자 발송 상태
    const [incomingItem, setIncomingItem] = useState({ name: '토마토', qty: '10kg' });
    const [smsStatus, setSmsStatus] = useState('');

    // 3. 수입/지출 내역 등록 상태 정의 (날짜 필드 추가)
    const [ledgerType, setLedgerType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [ledgerForm, setLedgerForm] = useState({
        date: '2026-07-07', // 오늘 날짜 기본값 세팅
        item: '',
        unitPrice: 0,
        quantity: 0,
    });
    const [ledgerList, setLedgerList] = useState<
        Array<{
            date: string;
            type: string;
            item: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }>
    >([]);

    // 수입/지출 등록 버튼 클릭 시
    const handleAddLedger = () => {
        const { date, item, unitPrice, quantity } = ledgerForm;
        if (!date) return alert('날짜를 선택해주세요.');
        if (!item.trim() || unitPrice <= 0 || quantity <= 0) {
            return alert('품목명, 단가, 수량을 정확히 입력해주세요.');
        }

        const newItem = {
            date,
            type: ledgerType,
            item,
            unitPrice,
            quantity,
            total: unitPrice * quantity,
        };

        setLedgerList([newItem, ...ledgerList]);
        alert(`💰 [${date}] ${ledgerType === 'INCOME' ? '수입' : '지출'} 내역이 등록되었습니다.`);

        // 폼 초기화 (날짜는 유지하고 내용만 비웁니다)
        setLedgerForm({ ...ledgerForm, item: '', unitPrice: 0, quantity: 0 });
    };

    // 4&5. AI 보고서 및 파일 생성 상태
    const [reportStatus, setReportStatus] = useState('');
    const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);

    // 💬 [기능 2] 당일 입고 알림 문자 발송
    const handleSendStockSMS = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/farm/send-stock-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(incomingItem),
            });
            const data = await res.json();
            setSmsStatus(`${incomingItem.name} ${incomingItem.qty} 입고 안내 문자 발송 완료!`);
        } catch (err) {
            alert('문자 발송 실패');
        }
    };

    // 📊 [기능 4&5] Spring Boot 판매 데이터를 기반으로 Excel, PPT 생성 및 발송
    const handleGenerateAiReports = async () => {
        setIsGeneratingFiles(true);
        setReportStatus('Spring Boot에서 실시간 데이터 수집 중...');
        try {
            // FastAPI에게 엑셀/PPT 마스터 리포트 빌드 프로세스 요청
            const res = await fetch('http://127.0.0.1:8000/farm/generate-reports', {
                method: 'POST',
            });
            const data = await res.json();

            if (data.status === 'success') {
                setReportStatus(
                    '📊 엑셀 정산표, 보고서, PPT 패키지 작성이 완료되어 농장주 이메일로 발송되었습니다!',
                );
            }
        } catch (err) {
            setReportStatus('파일 생성 중 에러가 발생했습니다.');
        } finally {
            setIsGeneratingFiles(false);
        }
    };
return ( 
     <div className='min-h-screen bg-slate-50 p-8 text-slate-800 font-sans'>
    {/* 섹션 2: 당일 입고 및 고객 문자 발송 */}
                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 flex flex-col justify-between'>
                        <div>
                            <h2 className='text-lg font-semibold text-slate-900'>
                                2. 당일 수확물 입고 및 B2C 알림
                            </h2>
                            <p className='text-xs text-slate-400 mt-0.5'>
                                오늘 수확되어 저장고에 입고된 품목 정보를 소비자에게 대량 문자로
                                안내합니다.
                            </p>

                            <div className='grid grid-cols-2 gap-3 mt-4'>
                                <div>
                                    <label className='text-xs font-semibold text-slate-500'>
                                        품목명
                                    </label>
                                    <input
                                        type='text'
                                        value={incomingItem.name}
                                        onChange={(e) =>
                                            setIncomingItem({
                                                ...incomingItem,
                                                name: e.target.value,
                                            })
                                        }
                                        className='w-full p-2 mt-1 border border-slate-200 rounded-lg text-sm bg-slate-50'
                                    />
                                </div>
                                <div>
                                    <label className='text-xs font-semibold text-slate-500'>
                                        입고 수량
                                    </label>
                                    <input
                                        type='text'
                                        value={incomingItem.qty}
                                        onChange={(e) =>
                                            setIncomingItem({
                                                ...incomingItem,
                                                qty: e.target.value,
                                            })
                                        }
                                        className='w-full p-2 mt-1 border border-slate-200 rounded-lg text-sm bg-slate-50'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <button
                                onClick={handleSendStockSMS}
                                className='w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-sm transition-all'>
                                🚀 실시간 입고 알림 문자(SMS) 고객 전송
                            </button>
                            {smsStatus && (
                                <div className='bg-amber-50 border border-amber-100 p-3 rounded-xl text-xs text-amber-800 text-center font-medium'>
                                    {smsStatus}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 섹션: 수입/지출 실시간 장부 등록 */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4'>
                    <div className='border-l-4 border-emerald-600 pl-3'>
                        <h2 className='text-lg font-semibold text-slate-900'>
                            3. 당일 수입 / 지출 내역 등록
                        </h2>
                        <p className='text-xs text-slate-400 mt-0.5'>
                            날짜별 품목, 단가, 수량을 입력하면 가격이 자동 연산되어 경영 DB에 실시간
                            누적됩니다.
                        </p>
                    </div>

                    {/* 수입/지출 토글 버튼 */}
                    <div className='flex gap-2 p-1 bg-slate-100 rounded-xl w-48'>
                        <button
                            type='button'
                            onClick={() => setLedgerType('INCOME')}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${ledgerType === 'INCOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                            📈 수입 (매출)
                        </button>
                        <button
                            type='button'
                            onClick={() => setLedgerType('EXPENSE')}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${ledgerType === 'EXPENSE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                            📉 지출 (비용)
                        </button>
                    </div>

                    {/* 입력 그리드 패널 (날짜 추가 - 5분할 grid 변환) */}
                    <div className='grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200'>
                        <div>
                            <label className='text-xs font-bold text-slate-500 block mb-1'>
                                발생 날짜
                            </label>
                            <input
                                type='date'
                                value={ledgerForm.date}
                                onChange={(e) =>
                                    setLedgerForm({ ...ledgerForm, date: e.target.value })
                                }
                                className='w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-sans'
                            />
                        </div>
                        <div>
                            <label className='text-xs font-bold text-slate-500 block mb-1'>
                                품목 / 항목명
                            </label>
                            <input
                                type='text'
                                placeholder='예: 완숙 토마토 5kg'
                                value={ledgerForm.item}
                                onChange={(e) =>
                                    setLedgerForm({ ...ledgerForm, item: e.target.value })
                                }
                                className='w-full p-2 border border-slate-200 rounded-lg text-sm bg-white'
                            />
                        </div>
                        <div>
                            <label className='text-xs font-bold text-slate-500 block mb-1'>
                                단가 (원)
                            </label>
                            <input
                                type='number'
                                placeholder='0'
                                value={ledgerForm.unitPrice || ''}
                                onChange={(e) =>
                                    setLedgerForm({
                                        ...ledgerForm,
                                        unitPrice: Number(e.target.value),
                                    })
                                }
                                className='w-full p-2 border border-slate-200 rounded-lg text-sm bg-white'
                            />
                        </div>
                        <div>
                            <label className='text-xs font-bold text-slate-500 block mb-1'>
                                수량
                            </label>
                            <input
                                type='number'
                                placeholder='0'
                                value={ledgerForm.quantity || ''}
                                onChange={(e) =>
                                    setLedgerForm({
                                        ...ledgerForm,
                                        quantity: Number(e.target.value),
                                    })
                                }
                                className='w-full p-2 border border-slate-200 rounded-lg text-sm bg-white'
                            />
                        </div>
                        <div>
                            <label className='text-xs font-bold text-slate-500 block mb-1'>
                                총 가격 (자동 연산)
                            </label>
                            <div className='w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-right font-semibold text-slate-700 h-[38px] flex items-center justify-end'>
                                {(ledgerForm.unitPrice * ledgerForm.quantity).toLocaleString()} 원
                            </div>
                        </div>
                    </div>

                    {/* 등록 버튼 */}
                    <button
                        type='button'
                        onClick={handleAddLedger}
                        className={`w-full py-2.5 text-white font-medium rounded-xl text-sm transition-all ${ledgerType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                        ➕ {ledgerType === 'INCOME' ? '수입' : '지출'} 항목 장부 등록
                    </button>

                    {/* 실시간 등록 내역 테이블 프리뷰 (날짜 컬럼 반영) */}
                    {ledgerList.length > 0 && (
                        <div className='mt-3 border border-slate-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto shadow-inner'>
                            <table className='w-full text-left text-xs border-collapse'>
                                <thead className='bg-slate-100 text-slate-600 font-bold sticky top-0'>
                                    <tr>
                                        <th className='p-2.5 w-24 text-center'>날짜</th>
                                        <th className='p-2.5 text-center w-16'>구분</th>
                                        <th className='p-2.5'>품목/항목명</th>
                                        <th className='p-2.5 text-right'>단가</th>
                                        <th className='p-2.5 text-center w-16'>수량</th>
                                        <th className='p-2.5 text-right'>총 가격</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100 text-slate-700'>
                                    {ledgerList.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className='hover:bg-slate-50 transition-colors'>
                                            <td className='p-2.5 text-center text-slate-500 font-mono'>
                                                {row.date}
                                            </td>
                                            <td className='p-2.5 text-center font-bold'>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] ${row.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                    {row.type === 'INCOME' ? '수입' : '지출'}
                                                </span>
                                            </td>
                                            <td className='p-2.5 font-medium'>{row.item}</td>
                                            <td className='p-2.5 text-right'>
                                                {row.unitPrice.toLocaleString()}원
                                            </td>
                                            <td className='p-2.5 text-center'>{row.quantity}</td>
                                            <td className='p-2.5 text-right font-bold text-slate-900'>
                                                {row.total.toLocaleString()}원
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 섹션 3: 쇼핑몰 판매 데이터 기반 AI 정산 리포트 스케줄러 (4 & 5번 요구사항) */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
                    <div className='border-l-4 border-blue-600 pl-3'>
                        <h2 className='text-lg font-semibold text-slate-900'>
                            3. AI 경영 분석 보고서 & PPT 패키지 생성 발행
                        </h2>
                        <p className='text-xs text-slate-400 mt-0.5'>
                            Spring Boot 쇼핑몰 DB에 적재된 실제 재고, 판매량, 순수익 데이터를
                            추적하여 데이터 스케일을 분석하고 자동 보고서를 빌드합니다.
                        </p>
                    </div>

                    <div className='p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed'>
                        💡 <strong>[자동 포함 파이프라인]</strong>
                        <br />
                        1. <span className='text-emerald-600 font-semibold'>Pandas 엔진</span>:
                        총수익, 순수익, 판매추이 연산 후 <code>.xlsx</code> 시트 작성
                        <br />
                        2.{' '}
                        <span className='text-blue-600 font-semibold'>Docx/PPTX 마스터 엔진</span>:
                        요약 데이터 시각화 슬라이드(PPT) 디자인 빌드 및 농장주 메일 자동 발송
                    </div>

                    <button
                        onClick={handleGenerateAiReports}
                        disabled={isGeneratingFiles}
                        className='w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-50'>
                        {isGeneratingFiles
                            ? '⚙️ AI가 대용량 데이터 연산 및 파일 빌드 중...'
                            : '📊 이번 달 정산 마스터 파일 패키지 전송 (Excel + Report + PPT)'}
                    </button>

                    {reportStatus && (
                        <div className='p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium animate-fadeIn'>
                            {reportStatus}
                        </div>
                    )}
                    </div>
                    )