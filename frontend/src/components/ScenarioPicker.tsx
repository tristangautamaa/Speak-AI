"use client";

import { SCENARIOS, type ConversationScenario } from "@/lib/scenarios";
import { useConversationStore } from "@/store/conversationStore";

const TONE_STYLES: Record<string, string> = {
  professional: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  supportive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  friendly: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  direct: "text-red-400 bg-red-500/10 border-red-500/20",
};

function ScenarioCard({ scenario }: { scenario: ConversationScenario }) {
  const { setSelectedScenario } = useConversationStore();
  const toneStyle =
    TONE_STYLES[scenario.tone] ?? "text-white/40 bg-white/[0.04] border-white/[0.08]";

  return (
    <button
      onClick={() => setSelectedScenario(scenario)}
      className="group flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-left hover:bg-white/[0.04] hover:border-white/10 transition-all duration-150"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-white/90">{scenario.title}</p>
        <span
          className={`shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${toneStyle}`}
        >
          {scenario.tone}
        </span>
      </div>
      <p className="text-sm text-white/50 leading-relaxed">{scenario.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {scenario.coachingFocus.map((focus) => (
          <span
            key={focus}
            className="text-[10px] text-white/30 bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-0.5"
          >
            {focus}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function ScenarioPicker() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-10">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white/90">Choose a Scenario</h2>
          <p className="text-sm text-white/40 mt-1">
            Select who you want to practice speaking with.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SCENARIOS.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </div>
    </div>
  );
}
