"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md bg-[#080b12]/70">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 1C7 1 2 4 2 7.5C2 10.5 4.5 12 7 12C9.5 12 12 10.5 12 7.5C12 4 7 1 7 1Z"
              fill="white"
              opacity="0.9"
            />
            <circle cx="7" cy="7.5" r="1.5" fill="white" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">
          Speak
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
        <a href="#" className="hover:text-white/80 transition-colors">Product</a>
        <a href="#" className="hover:text-white/80 transition-colors">How it works</a>
        <a href="#" className="hover:text-white/80 transition-colors">Pricing</a>
      </nav>

      <div className="flex items-center gap-3">
        <button className="text-sm text-white/50 hover:text-white/80 transition-colors px-4 py-1.5">
          Sign in
        </button>
        <button className="text-sm font-medium bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-1.5 rounded-lg transition-colors">
          Get started
        </button>
      </div>
    </header>
  );
}
