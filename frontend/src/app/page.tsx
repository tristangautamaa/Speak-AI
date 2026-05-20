import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080b12] overflow-hidden">
      <Navbar />

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-indigo-500/6 blur-[100px]" />
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 font-medium mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
          AI-Powered · Real-Time · Private
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08] max-w-3xl mb-6">
          Speak with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            calm confidence.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-white/40 max-w-xl leading-relaxed mb-12 font-light">
          Practice real conversations and improve your confidence with an AI
          coach that listens, responds, and gives you live feedback.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/conversation"
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-base transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="group-hover:scale-110 transition-transform"
            >
              <rect x="9" y="2" width="6" height="11" rx="3" fill="white" />
              <path
                d="M5 11C5 14.866 8.134 18 12 18C15.866 18 19 14.866 19 11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Start Conversation
          </Link>
          <button className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-white/50 hover:text-white/70 text-sm transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 8.5L15 12L10 15.5V8.5Z" fill="currentColor" />
            </svg>
            Watch demo
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-20 flex flex-col items-center gap-5">
          <div className="flex -space-x-2">
            {["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"].map((color, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-[#080b12] flex items-center justify-center"
              >
                <div
                  className="w-9 h-9 rounded-full"
                  style={{ backgroundColor: color + "55" }}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-white/25">
            Join{" "}
            <span className="text-white/50 font-medium">2,400+</span> people
            already practicing with Speak
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            {
              icon: "⚡",
              title: "Real-time feedback",
              desc: "Live metrics on confidence, tempo, and clarity as you speak.",
            },
            {
              icon: "🎯",
              title: "Filler word detection",
              desc: 'Catch "um", "uh", and "like" before they become habits.',
            },
            {
              icon: "🔒",
              title: "Fully private",
              desc: "Conversations stay on your device. Nothing is stored.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 text-left hover:bg-white/[0.04] transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white/80 mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-xs text-white/15">
        © 2026 Speak · Built for better conversations
      </footer>
    </div>
  );
}
