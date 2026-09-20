import { BookOpen, Brain, Code2, Calculator } from "lucide-react";

export const suggestions = [
  {
    icon: Brain,
    title: "Explain a concept",
    text: "Explain photosynthesis in simple words",
  },
  {
    icon: Calculator,
    title: "Solve a problem",
    text: "Explain how to solve quadratic equations",
  },
  {
    icon: BookOpen,
    title: "Create study notes",
    text: "Create concise study notes about World War 1",
  },
  {
    icon: Code2,
    title: "Learn programming",
    text: "Explain JavaScript promises with examples",
  },
];

export const defaultSettings = {
  style: "balanced",
  length: "medium",
  level: "standard",
};
