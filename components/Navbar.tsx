"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout,LogIn, Home, BookOpen, Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const navItems = [
    {
      name: "로그인",
      href: "/login",
      icon: LogIn,
    },
    {
      name: "농장 정보",
      href: "/farm-info",
      icon: Home,
    },
    {
      name: "영농 일지",
      href: "/farmlogrecently",
      icon: BookOpen,
    },
    {
      name: "AI 분석",
      href: "/aiAnalysisFinalFinal",
      icon: Sparkles,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 영역 */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-black text-lg text-slate-800 tracking-tight">FarmManager</span>
          </Link>

          {/* GNB 메뉴 영역 */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              // 현재 경로가 해당 메뉴의 경로로 시작하면 active 처리
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"}`}>
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
