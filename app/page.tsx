"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function HomePage() {
  // Ensures dark mode styling works natively since the design acts as dark-mode primary
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-slate-100 min-h-screen font-display selection:bg-[#137fec]/30 relative pb-12">

      <style jsx global>{`
                .hero-gradient {
                    background: radial-gradient(circle at 50% 50%, rgba(19, 127, 236, 0.15) 0%, rgba(10, 10, 10, 1) 70%);
                }
                .grid-pattern {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>

      {/* Grid Background Overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50 z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#137fec] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">terminal</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Live Code</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <Link href="#" className="hover:text-[#137fec] transition-colors">Platform</Link>
              <Link href="#" className="hover:text-[#137fec] transition-colors">Solutions</Link>
              <Link href="#" className="hover:text-[#137fec] transition-colors">Enterprise</Link>
              <Link href="#" className="hover:text-[#137fec] transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</button>
              <button className="bg-[#137fec] hover:bg-[#137fec]/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#137fec]/20">
                Get Started
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-grow">

          {/* Hero Section */}
          <section className="hero-gradient relative pt-24 pb-20 px-6 overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#137fec]/10 border border-[#137fec]/20 text-[#137fec] text-xs font-bold uppercase tracking-wider mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#137fec] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#137fec]"></span>
                </span>
                New: AI-Powered Screening v2.0
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
                Live Code <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#137fec] to-blue-400">Interviewer</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
                The unified platform for seamless technical collaboration. From high-fidelity video meetings to real-time pair programming and AI-driven screenings.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/interview">
                  <button className="w-full sm:w-auto px-8 py-4 bg-[#137fec] text-white font-bold rounded-xl transition-transform hover:scale-105 shadow-xl shadow-[#137fec]/25">
                    Start Hiring Now
                  </button>
                </Link>
                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                  Request Demo
                </button>
              </div>
            </div>

            {/* Hero Image/Mockup Placeholder */}
            <div className="mt-20 max-w-5xl mx-auto relative px-4">
              <div className="rounded-2xl border border-white/10 bg-[#161616] p-2 shadow-2xl">
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-800 flex items-center justify-center group relative">
                  <img
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    alt="Technical coding interview interface with code editor and video call"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVYIczuf7G_7pcwgavgKAglzngWIY3S0rKc2ievRhXoHWQPqYUwzFd7F0y2TuCe6G68swS8BHM32dUv8IgCFUqQjkMpQ_RKSg5hUsfTV8N-OyN6L94Ho9Q2X7eRc0YqvylGCYnbNhYqA2-wdKS0uITdRxpFYyQ3zAZo3SHZWUpg_vzG7WruLXmMURLZwBJkXSp1pnoAhs2ZWxeAxLMEMLeIMYbKxf8he3AxNU6zV5aHpO-S532JESgqtAEAynU4gVCLIfsQXOhQlS2"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-110 transition-transform cursor-pointer">
                      <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mode Selection Grid */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-white mb-4">Choose Your Mode</h2>
                <p className="text-slate-400">Tailor your technical evaluation process with three purpose-built environments designed for different stages of the funnel.</p>
              </div>
              <Link href="#" className="text-[#137fec] font-semibold flex items-center gap-1 group">
                Explore capabilities <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Meet Mode */}
              <div className="group relative flex flex-col p-8 rounded-2xl bg-[#161616] border border-[#262626] hover:border-[#137fec]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#137fec]/5">
                <div className="w-14 h-14 rounded-xl bg-[#137fec]/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#137fec] text-3xl">videocam</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Meet Mode</h3>
                <p className="text-slate-400 mb-8 flex-grow">Crystal clear audio and video for technical discussions, cultural fit, and behavioral rounds.</p>
                <Link href="/meet" className="w-full">
                  <button className="w-full py-3 px-4 rounded-lg bg-white/5 text-white font-semibold hover:bg-[#137fec] transition-all">
                    Start Meeting
                  </button>
                </Link>
              </div>

              {/* Live Interview */}
              <div className="group relative flex flex-col p-8 rounded-2xl bg-[#161616] border border-[#262626] hover:border-[#137fec]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#137fec]/5 ring-2 ring-[#137fec]/20 z-10 scale-105">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#137fec] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#137fec]/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#137fec] text-3xl">code</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Live Interview</h3>
                <p className="text-slate-400 mb-8 flex-grow">Collaborative IDE with multi-language support, real-time code execution, and synced terminals.</p>
                <Link href="/interview" className="w-full">
                  <button className="w-full py-3 px-4 rounded-lg bg-[#137fec] text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#137fec]/20">
                    Start Interview
                  </button>
                </Link>
              </div>

              {/* AI Interview */}
              <div className="group relative flex flex-col p-8 rounded-2xl bg-[#161616] border border-[#262626] hover:border-[#137fec]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#137fec]/5">
                <div className="w-14 h-14 rounded-xl bg-[#137fec]/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#137fec] text-3xl">auto_awesome</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Interview</h3>
                <p className="text-slate-400 mb-8 flex-grow">Scale your hiring with intelligent, automated technical assessments and auto-grading logic.</p>
                <Link href="/ai-interview" className="w-full">
                  <button className="w-full py-3 px-4 rounded-lg bg-white/5 text-white font-semibold hover:bg-[#137fec] transition-all">
                    Start AI Session
                  </button>
                </Link>
              </div>

            </div>
          </section>

          {/* Bottom CTA */}
          <section className="py-24 px-6 border-t border-white/5">
            <div className="max-w-4xl mx-auto rounded-3xl p-12 bg-gradient-to-br from-[#137fec]/10 to-transparent border border-[#137fec]/20 text-center relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#137fec]/20 blur-[100px] rounded-full pointer-events-none"></div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight relative z-10">Ready to transform your hiring?</h2>
              <p className="text-slate-400 mb-10 text-lg relative z-10">Join the next generation of technical recruitment with the fastest scaling companies.</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <button className="px-8 py-3 bg-[#137fec] text-white font-bold rounded-lg shadow-lg shadow-[#137fec]/30 hover:scale-105 transition-transform">Start Free Trial</button>
                <button className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-lg hover:bg-white/5 transition-colors">View Enterprise Pricing</button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-white">terminal</span>
              <span className="text-sm font-bold tracking-tight text-white">Live Code</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>An initiative by</span>
              <Link href="#" className="font-semibold text-slate-300 hover:text-[#137fec] transition-colors border-b border-transparent hover:border-[#137fec]">
                Aim Technologies
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <Link href="#" className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">alternate_email</span>
              </Link>
              <Link href="#" className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
              </Link>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-8 text-center md:text-left">
            <p className="text-xs text-slate-500">
              © 2024 Aim Technologies Inc. All rights reserved. Platform optimized for modern browsers.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
