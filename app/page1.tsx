'use client';

import { useState, useRef, useEffect } from 'react';
// 차트 시각화를 위한 Recharts 라이브러리 추가
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from 'recharts';

// FastAPI에서 받아올 데이터 규격 정의
interface ParsedData {
    item: string;
    quantity: string;
    farm_name: string;
    grade: string;
    harvest_date: string;
    safe_shelf_life: number;
    memo: string;
}

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// CSV 가격 데이터 규격 정의
interface PriceRecord {
    date: string;
    wholesale_price: number;
    retail_price: number;
}

// DashboardPage라는 이름의 프론트엔드 화면 컴포넌트를 외부에서 쓸 수 있도록 기본 내보내기(export)합니다.
export default function DashboardPage() {
    // AI 분석이 진행 중일 때(로딩 화면 표시용) true/false를 제어하는 상태 변수입니다. (기본값: false)
    const [loading, setLoading] = useState(false);

    // MongoDB에 저장된 문서의 고유 ID(_id)를 저장하여 카톡 발송 시 재사용하기 위한 상태 변수입니다. (기본값: 비어있음)
    const [dbId, setDbId] = useState<string | null>(null);

    // FastAPI가 파싱해서 돌려준 농산물 품목, 수량 등의 정밀 데이터를 객체 형태로 저장하는 상태 변수입니다. (기본값: 비어있음)
    const [farmData, setFarmData] = useState<ParsedData | null>(null);

    // 카카오톡 전송이 성공했는지, 실패했는지의 결과 메시지를 화면에 띄우기 위한 상태 변수입니다. (기본값: 비어있음)
    const [kakaoStatus, setKakaoStatus] = useState<string | null>(null);

    // 신선도 조절 시뮬레이션 상태 (포트폴리오 시연용: 남은 일수를 수동 조절 가능하게 만듦)
    const [daysLeft, setDaysLeft] = useState<number>(5);

    // 시세 조회용 상태 변수들
    const [selectedItem, setSelectedItem] = useState<string>('토마토');
    const [chartData, setChartData] = useState<PriceRecord[]>([]);
    const [chartLoading, setChartLoading] = useState<boolean>(false);

    // 챗봇 상태
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState(''); // 오타 수정: setChatinput -> setChatInput
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'model',
            content:
                '안녕하세요! 행복농장 신선도 방어 지능형 챗봇입니다. 재고 소진 전략을 물어보세요!',
        },
    ]);
    const [chatLoading, setChatLoading] = useState(false); // 오류 수정: 중복 정의되었던 setChartLoading 제거 후 chatLoading으로 변경
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    //  파이썬 통합 CSV 데이터를 가져오는 비동기 함수
    const fetchPriceTrend = async (item: string) => {
        setChartLoading(true);
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/farm/test-price?item_name=${encodeURIComponent(item)}`,
            );
            if (!res.ok) throw new Error('가격 데이터 조회 실패');
            const result = await res.json();

            if (result.status === 'success') {
                setChartData(result.data);
            } else {
                setChartData([]); // 데이터가 없거나 실패 시 빈 배열
                console.log(result.message);
            }
        } catch (error) {
            console.error('시세 데이터 로드 에러:', error);
        } finally {
            setChartLoading(false);
        }
    };

    // 화면이 처음 켜지거나, 사용자가 드롭다운에서 품목을 바꿀 때마다 파이썬을 찌릅니다.
    useEffect(() => {
        // 비동기 실행을 위해 안전한 래퍼 함수를 선언하고 즉시 실행합니다.
        const loadData = async () => {
            await fetchPriceTrend(selectedItem);
        };
        loadData();
    }, [selectedItem]);

    // 🤖 1. AI 문서 정밀 구조화 API 호출 (FastAPI 연동)
    const handleAnalyzeDoc = async () => {
        setLoading(true);
        setKakaoStatus(null);

        try {
            const res = await fetch('http://127.0.0.1:8000/analyze-farm-doc');
            if (!res.ok) throw new Error('서버 분석 실패');

            const data = await res.json();
            setDbId(data.saved_db_id);
            setFarmData(data.parsed_data);

            // AI가 분석한 품목이 나오면, 하단 시세 차트도 해당 품목으로 자동 동기화
            if (data.parsed_data?.item) {
                setSelectedItem(data.parsed_data.item);
            }
        } catch (error) {
            alert('AI 분석 중 오류가 발생했습니다. 백엔드 서버를 확인해 주세요.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 💬 2. 가공된 데이터를 바탕으로 B2C 알림톡 발송 API 호출
    const handleSendKakao = async () => {
        if (!dbId) return;

        try {
            const res = await fetch('http://127.0.0.1:8000/send-kakao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: '010-1234-5678',
                    db_id: dbId,
                }),
            });

            if (!res.ok) throw new Error('알림톡 발송 실패');

            const data = await res.json();
            setKakaoStatus(data.status || '카카오톡 알림톡 전송 완료');
        } catch (error) {
            alert('알림톡 발송 중 오류가 발생했습니다.');
            console.error(error);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 p-8 text-gray-800'>
            <div className='max-w-4xl mx-auto space-y-6'>
                {/* 대시보드 헤더 */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            스마트팜 B2C 마케팅 대시보드
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            비정형 입고 내역을 파싱하여 소비자에게 실시간 가격 마케팅 문구를
                            발송합니다.
                        </p>
                    </div>
                    <span className='px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200'>
                        AI 엔진 가동 중
                    </span>
                </div>

                {/* 1구역: PDF 분석 제어 컨트롤러 */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                        1. 신선 농산물 입고서 분석
                    </h2>
                    <p className='text-sm text-gray-500'>
                        프로젝트 폴더 내{' '}
                        <code className='bg-gray-100 px-1 py-0.5 rounded text-red-500 font-mono text-xs'>
                            test.pdf
                        </code>{' '}
                        정산서 문서를 읽어와 단위당 가격 및 B2C 카피라이팅을 자동 추출합니다.
                    </p>
                    <button
                        onClick={handleAnalyzeDoc}
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-medium text-white transition-all ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 active:scale-[0.99] shadow-md shadow-green-100'
                        }`}>
                        {loading
                            ? '🔮 Gemini AI가 정밀 분석 및 가격 계산 중...'
                            : '🚀 가상 정산서(test.pdf) AI 정밀 분석 실행'}
                    </button>
                </div>

                {/* 2구역: AI 추출 결과 표출 및 DB 데이터 확인 */}
                {farmData && (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn'>
                        {/* DB 적재 현황 및 파싱 데이터 데이터 테이블 */}
                        <div className='md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
                            <div className='flex justify-between items-center'>
                                <h2 className='text-lg font-semibold text-gray-900'>
                                    2. 데이터베이스(MongoDB) 적재 결과
                                </h2>
                                <span className='text-xs text-gray-400 font-mono'>ID: {dbId}</span>
                            </div>

                            <table className='w-full text-left border-collapse'>
                                <tbody>
                                    <tr className='border-b border-gray-100'>
                                        <td className='py-3 font-medium text-gray-500 text-sm w-32'>
                                            입고 품목
                                        </td>
                                        <td className='py-3 font-semibold text-gray-900'>
                                            {farmData.item}
                                        </td>
                                    </tr>
                                    <tr className='border-b border-gray-100'>
                                        <td className='py-3 font-medium text-gray-500 text-sm'>
                                            총 물량
                                        </td>
                                        <td className='py-3 text-gray-900 font-medium'>
                                            {farmData.quantity}
                                        </td>
                                    </tr>
                                    <tr className='border-b border-gray-100'>
                                        <td className='py-3 font-medium text-gray-500 text-sm'>
                                            출하 농가
                                        </td>
                                        <td className='py-3 text-gray-600 text-sm'>
                                            {farmData.farm_name}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='py-3 font-medium text-gray-500 text-sm'>
                                            품질 등급
                                        </td>
                                        <td className='py-3'>
                                            <span className='px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold'>
                                                {farmData.grade}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 3구역: AI 가공 B2C 알림톡 발송 구역 */}
                        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4'>
                            <div className='space-y-2'>
                                <h2 className='text-lg font-semibold text-gray-900'>
                                    3. B2C 마케팅 메시지
                                </h2>
                                <div className='bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-xs leading-relaxed text-gray-700 max-h-48 overflow-y-auto font-sans'>
                                    {farmData.memo || '생성된 알림 초안이 없습니다.'}
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <button
                                    onClick={handleSendKakao}
                                    className='w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] text-gray-900 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2'>
                                    💬 일반 소비자(B2C) 카톡 알림 발송
                                </button>

                                {kakaoStatus && (
                                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-2 text-center text-xs font-semibold text-blue-700 animate-pulse'>
                                        ✅ {kakaoStatus}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4구역: 파이썬 통합 CSV 연동 시세 시각화 차트 대시보드*/}
                {/* 오타 수정: rounede-2xl -> rounded-2xl */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
                    <div className='flex justify-between items-center flex-wrap gap-2'>
                        <div>
                            <h2 className='text-lg font-semibold text-gray-900'>
                                4. 1개년 농수축산물 실시간 도소매 추이 분석
                            </h2>
                            <p className='text-xs text-gray-400 mt-0.5'>
                                파이썬 백엔드가 전처리한 마스터 CSV 시계열 데이터를 렌더링합니다.
                            </p>
                        </div>

                        {/* 품목 선택 컨트롤러 */}
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            className='p-2 text-sm border border-gray-200 rounded-xl bg-gray-50 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500'>
                            <option value='토마토'>토마토</option>
                            <option value='산딸기'>산딸기</option>
                            <option value='오이'>오이</option>
                            <option value='마늘'>마늘</option>
                        </select>
                    </div>

                    {/* 차트 영역 */}
                    <div className='h-[350px] w-full pt-4 relative'>
                        {chartLoading && (
                            <div className='absolute inset-0 bg-white/70 flex items-center justify-center z-10 font-medium text-sm text-green-600 animate-pulse'>
                                파이썬 데이터 연산 중
                            </div>
                        )}

                        {chartData.length > 0 ? (
                            <ResponsiveContainer width='100%' height='100%'>
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                                    <XAxis
                                        dataKey='date'
                                        tick={{ fontSize: 11 }}
                                        stroke='#9ca3af'
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        stroke='#9ca3af'
                                        tickFormatter={(v) => `${v.toLocaleString()}원`}
                                    />
                                    <Tooltip
                                        formatter={(value) => {
                                            // value가 없거나 null이면 빈 문자열 반환
                                            if (value === undefined || value === null) return '';
                                            
                                            // 값이 있을 때만 안전하게 숫자로 변환 후 포맷팅
                                            return `${Number(value).toLocaleString()}원`;
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                                    <Line
                                        type='monotone'
                                        dataKey='wholesale_price'
                                        stroke='#ef4444'
                                        strokeWidth={2.5}
                                        name='도매가격'
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='retail_price'
                                        stroke='#3b82f6'
                                        strokeWidth={2.5}
                                        name='소매가격'
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            /* 오타 수정: itmes-center -> items-center */
                            <div className='h-full flex items-center justify-center text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-200'>
                                데이터가 없거나 조회 조건과 일치하는 품목이 통합 CSV에 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
