export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  persona: string;
  openingPrompt: string;
  coachingFocus: string[];
  tone: string;
}

export const SCENARIOS: ConversationScenario[] = [
  {
    id: "hr_manager",
    title: "HR Manager",
    description: "Practice answering interview questions with calm confidence.",
    persona: "A warm but professional HR manager.",
    openingPrompt:
      "Hi, I'm Aria playing the role of an HR manager. Let's start simple: tell me about yourself.",
    coachingFocus: ["confidence", "clarity", "structure"],
    tone: "professional",
  },
  {
    id: "teacher",
    title: "Teacher",
    description: "Practice explaining ideas clearly and simply.",
    persona: "A supportive teacher who asks thoughtful follow-up questions.",
    openingPrompt:
      "Hi, I'm Aria playing the role of a teacher. Explain one idea you recently learned in simple words.",
    coachingFocus: ["clarity", "conciseness", "articulation"],
    tone: "supportive",
  },
  {
    id: "colleague",
    title: "Colleague",
    description: "Practice natural workplace conversation.",
    persona: "A friendly colleague having a casual professional conversation.",
    openingPrompt:
      "Hi, I'm Aria playing the role of your colleague. Tell me how your workday is going.",
    coachingFocus: ["comfort", "flow", "confidence"],
    tone: "friendly",
  },
  {
    id: "businessman",
    title: "Businessman",
    description: "Practice sounding confident, concise, and persuasive.",
    persona: "A sharp businessperson who values clear and confident communication.",
    openingPrompt:
      "Hi, I'm Aria playing the role of a businessperson. Pitch me one idea in 30 seconds.",
    coachingFocus: ["confidence", "conciseness", "persuasion"],
    tone: "direct",
  },
];
