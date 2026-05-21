import SessionSummary from "@/components/SessionSummary";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Session Summary — Speak",
};

export default function SummaryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080b12]">
      <Navbar />
      <div className="flex-1 pt-[72px] overflow-y-auto">
        <SessionSummary />
      </div>
    </div>
  );
}
