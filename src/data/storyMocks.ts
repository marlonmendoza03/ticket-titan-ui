import type { CategoryDto } from "../types/story";

export const mockCategories: CategoryDto[] = [
  {
    id: 1,
    name: "Horror",
    description: "Slow-burn dread, unexplained events, twist endings.",
    isActive: true,
  },
  {
    id: 2,
    name: "True crime",
    description: "Narrated case breakdowns told through evidence.",
    isActive: true,
  },
  {
    id: 3,
    name: "History",
    description: "Little-known moments from the past, told as stories.",
    isActive: true,
  },
  {
    id: 4,
    name: "Motivation",
    description: "Short, punchy lessons with a clear takeaway.",
    isActive: true,
  },
  {
    id: 5,
    name: "Fantasy",
    description: "Original worlds, quests, and mythical creatures.",
    isActive: true,
  },
];

export const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const createMessageId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
