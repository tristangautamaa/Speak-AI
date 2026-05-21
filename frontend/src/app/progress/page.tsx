import ProgressDashboard from "@/components/ProgressDashboard";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Progress — Speak",
};

export default function ProgressPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080b12]">
      <Navbar />
      <div className="flex-1 pt-[72px] overflow-y-auto">
        <ProgressDashboard />
      </div>
    </div>
  );
}
