import ConversationScreen from "@/components/ConversationScreen";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Conversation — Speak",
};

export default function ConversationPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#080b12]">
      <Navbar />
      <div className="flex-1 pt-[72px] overflow-hidden">
        <ConversationScreen />
      </div>
    </div>
  );
}
