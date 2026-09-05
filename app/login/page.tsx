"use client";

import React, { useState } from "react";
import { Sprout, MessageCircle, Mail, ShoppingBag, ArrowRight, Lock, User, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  // 'kakao' | 'email-login' | 'email-signup' | 'shop-link'
  const [activeTab, setActiveTab] = useState<"main" | "email" | "shop">("main");
  const [isSignUp, setIsSignUp] = useState(false); // 이메일 로그인 vs 회원가입 전환

  // 폼 입력 State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // 카카오 로그인 핸들러 (쇼핑몰 가입 없이 영농일지 단독 이용)
  const handleKakaoLogin = () => {
    // NextAuth 또는 카카오 OAuth SDK 호출 (예시)
    alert("카카오 간편 로그인을 진행합니다. (쇼핑몰 가입 없이 영농일지 단독 시작)");
    window.location.href = "/api/auth/signin/kakao";
  };

  // 이메일 로그인 / 회원가입 제출 핸들러
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      alert(`[영농일지 전용 회원가입] ${formData.name}님 가입을 환영합니다.`);
    } else {
      alert(`[영농일지 이메일 로그인] ${formData.email} 계정으로 로그인합니다.`);
    }
  };

  // 쇼핑몰 기존 계정 연동 로그인 핸들러
  const handleShopLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`[쇼핑몰 계정 연동] 쇼핑몰 MariaDB 중앙 인증서버로 이동하거나 토큰을 검증합니다.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
        {/* 헤더 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-3">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">농사하나로 영농일지</h1>
          <p className="text-xs text-slate-400 mt-1">원하는 로그인 방식을 선택하여 바로 영농 관리를 시작해보세요.</p>
        </div>

        {/* 메인 선택 화면 (3가지 옵션 버튼) */}
        {activeTab === "main" && (
          <div className="space-y-4">
            {/* 옵션1. 카카오로 3초 만에 시작하기 */}
            <button onClick={handleKakaoLogin} className="w-full py-3.5 px-4 bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] font-bold rounded-2xl transition flex items-center justify-between shadow-lg shadow-yellow-500/10 group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#191919]/10 rounded-lg">
                  <MessageCircle className="w-5 h-5 fill-[#191919] text-[#191919]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-extrabold">카카오로 3초 만에 시작하기</div>
                  <div className="text-[11px] text-[#191919]/70 font-medium">쇼핑몰 가입 없이 영농일지 바로 이용</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#191919]/50 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* 옵션2. 이메일로 회원가입 /로그인 */}
            <button onClick={() => setActiveTab("email")} className="w-full py-3.5 px-4 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/80 text-white font-semibold rounded-2xl transition flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600/60 text-slate-300 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">이메일로 회원가입 / 로그인</div>
                  <div className="text-[11px] text-slate-400">영농일지 전용 계정 만들기</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* 옵션3. 쇼핑몰 계정으로 로그인 */}
            <button onClick={() => setActiveTab("shop")} className="w-full py-3.5 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-semibold rounded-2xl transition flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">쇼핑몰 계정으로 로그인</div>
                  <div className="text-[11px] text-emerald-400/70">기존 쇼핑몰 회원인 경우 연동</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500/60 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* 영농일지 전용 이메일 로그인 / 회원가입 폼 */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-slate-200">{isSignUp ? "영농일지 전용 회원가입" : "영농일지 이메일 로그인"}</h2>
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-xs text-emerald-400 hover:underline">
                {isSignUp ? "기존 계정으로 로그인" : "새 이메일로 가입하기"}
              </button>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">농업인 성함 / 농장명</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input type="text" required placeholder="홍길동 (행복농장)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">이메일 주소</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input type="email" required placeholder="farmer@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input type="password" required placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition text-sm mt-2">
              {isSignUp ? "영농일지 계정 만들기" : "로그인"}
            </button>
            <button type="button" onClick={() => setActiveTab("main")} className="w-full py-2 text-xs text-slate-400 hover:text-white transition">
              ← 다른 로그인 방법 선택
            </button>
          </form>
        )}

        {/* 쇼핑몰 기존 계정 연동 폼 */}
        {activeTab === "shop" && (
          <form onSubmit={handleShopLogin} className="space-y-4">
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 leading-relaxed mb-4">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>쇼핑몰 회원 연동 혜택</span>
              </div>
              쇼핑몰의 자재 구매 내역 및 수확물 예약 판매 정보를 영농일지 정산 시뮬레이터와 자동으로 연동할 수 있습니다.
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">쇼핑몰 아이디 (이메일)</label>
              <input type="email" required placeholder="shop_user@example.com" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white" />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">쇼핑몰 비밀번호</label>
              <input type="password" required placeholder="••••••••" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white" />
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm mt-2">
              쇼핑몰 계정으로 로그인 & 연동
            </button>

            <button type="button" onClick={() => setActiveTab("main")} className="w-full py-2 text-xs text-slate-400 hover:text-white transition">
              ← 다른 로그인 방법 선택
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
