"use client";

const ONBOARDING_KEY = "speak_onboarding_seen";

function markSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
  } catch {
    // localStorage unavailable — onboarding dismissed in memory only
  }
}

export function hasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}

const STEPS: { number: string; title: string; description: string }[] = [
  {
    number: "01",
    title: "Choose who you want to talk to",
    description:
      "Pick a practice partner — an HR manager, teacher, colleague, or business contact.",
  },
  {
    number: "02",
    title: "Speak naturally for 20–30 seconds",
    description:
      "No scripts. Click the mic and respond to Aria's opening prompt like you would in a real conversation.",
  },
  {
    number: "03",
    title: "Get feedback on your delivery",
    description:
      "Aria tracks your confidence, clarity, tempo, and hesitation words (um, uh, like) in real time.",
  },
  {
    number: "04",
    title: "Practice again and compare",
    description:
      "When Aria spots something to improve, try again. See a before/after comparison of your two attempts.",
  },
];

export default function OnboardingGuide({ onStart }: { onStart: () => void }) {
  function handleStart() {
    markSeen();
    onStart();
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-10">
      <div className="w-full max-w-lg flex flex-col gap-7">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[11px] text-indigo-300 font-medium mb-4 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
            How it works
          </div>
          <h2 className="text-2xl font-semibold text-white/90 tracking-tight">
            Welcome to Speak
          </h2>
          <p className="text-sm text-white/40 mt-2 leading-relaxed">
            Four steps to your first practice session.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2.5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-4 px-5 py-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl"
            >
              <span className="text-[11px] font-bold text-indigo-400/50 tabular-nums mt-0.5 shrink-0 w-5">
                {step.number}
              </span>
              <div>
                <p className="text-sm font-medium text-white/80">{step.title}</p>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-500/20"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
}
