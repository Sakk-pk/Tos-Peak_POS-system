import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Globe, Send, X } from 'lucide-react';

export default function Footer() {
  const [easterEggOpen, setEasterEggOpen] = useState(false);

  return (
    <footer className="bg-gray-50 border-t border-black/5 py-12 mt-16 text-[#111111] shrink-0">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-black/5 pb-10">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-black flex items-center justify-center">
                <img src="/images/Tos_Peak-Logo.png" alt="TOS-PEAK" className="h-5 w-5 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <span className="text-base font-black uppercase tracking-widest text-black">TOS-PEAK</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 max-w-[280px]">
              Premium athletic lifestyle gear engineered for the modern everyday. Built to move. Designed to last.
            </p>
          </div>

          {/* Column 2: Shopping */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4">
              Shopping
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              <li>
                <Link href={route('storefront.index')} className="text-sm font-medium text-gray-500 hover:text-black transition no-underline block">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              <li>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-black transition no-underline block">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium text-gray-500 hover:text-black transition no-underline block">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: About Me */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4">
              About Me
            </h4>
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900 leading-tight">
                Designed & Developed by Senasak
              </p>
              <p className="text-sm leading-relaxed text-gray-500">
                A personal project exploring modern ecommerce, POS systems, and inventory management.
              </p>
              
              {/* Social links */}
              <div className="flex items-center gap-2 pt-1">
                {/* Portfolio */}
                <a href="https://sakk-dev.netlify.app/" target="_blank" rel="noopener noreferrer" aria-label="Portfolio"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-gray-400 transition hover:border-black/30 hover:bg-black/5 hover:text-black">
                  <Globe className="h-3.5 w-3.5" />
                </a>
                {/* Facebook */}
                <a href="https://www.facebook.com/share/1D1XUKiHiX/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-gray-400 transition hover:border-black/30 hover:bg-black/5 hover:text-black">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/yr.kasss969?igsh=M2F3anhoMzB5ZXlx&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-gray-400 transition hover:border-black/30 hover:bg-black/5 hover:text-black">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                {/* Telegram */}
                <a href="https://t.me/ChytasenasakMok" target="_blank" rel="noopener noreferrer" aria-label="Telegram"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-gray-400 transition hover:border-black/30 hover:bg-black/5 hover:text-black">
                  <Send className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <span>© {new Date().getFullYear()} TOS-PEAK. All rights reserved.</span>
            <button
              onClick={() => setEasterEggOpen(true)}
              className="inline-flex cursor-pointer items-center justify-center rounded p-1 text-gray-300 transition-all duration-300 hover:scale-125 hover:bg-black/5 hover:text-black/60 focus:outline-none"
              title="Developer Credits"
              aria-label="Developer Credits"
            >
              👟
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Cambodia · Find Your Pair
            </span>
          </div>
        </div>
      </div>

      {/* Easter Egg Dialog Modal */}
      {easterEggOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setEasterEggOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[340px] transform rounded-2xl border border-white/10 bg-[#161616]/95 p-6 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setEasterEggOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl animate-bounce">
                👟
              </div>
              <h3 className="mt-4 text-lg font-black tracking-tight text-white">
                You found the easter egg!
              </h3>
              <p className="text-xs text-white/40">
                TOS-PEAK developer signature
              </p>
            </div>

            <div className="mt-6 space-y-4 text-center">
              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Created by</p>
                <p className="mt-1 font-bold text-white text-sm">Senasak</p>
                <p className="text-xs text-[#2563EB] font-medium">Web Developer</p>
              </div>

              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Built with</p>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-white/80">
                  Laravel • React • Inertia.js • Tailwind CSS
                </p>
              </div>

              <p className="text-xs italic text-white/50">
                "Thank you for exploring TOS-PEAK."
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
