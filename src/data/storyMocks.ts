import type {
  CategoryDto,
  ChatMessage,
  StoryChatRequest,
} from "../types/story";

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

const formatDuration = (seconds: number) =>
  seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} sec`;

const scenesPerEpisode = (durationSec: number) =>
  Math.max(1, Math.round(durationSec / 8));

export const buildMockReply = ({
  setup,
  messages,
}: StoryChatRequest): ChatMessage => {
  const category =
    mockCategories.find((c) => c.id === setup.categoryId)?.name ?? "Story";
  const userMessages = messages.filter((m) => m.role === "user");
  const latestPrompt = userMessages.at(-1)?.content.trim() ?? "";
  const isFirstTurn = userMessages.length === 1;
  const duration = formatDuration(setup.episodeDurationSec);

  const content = isFirstTurn
    ? [
        `Here's a first pass at a ${setup.episodeCount}-episode ${category.toLowerCase()} series, about ${duration} per episode.`,
        "",
        `Premise: ${latestPrompt}`,
        "",
        ...Array.from(
          { length: setup.episodeCount },
          (_, i) =>
            `Episode ${i + 1}: ${
              i === 0
                ? "Set up the hook and introduce the main character."
                : i === setup.episodeCount - 1
                  ? "Pay off the mystery and end on a final twist."
                  : "Raise the stakes and end on a cliffhanger."
            }`,
        ),
        "",
        `Each episode will be split into about ${scenesPerEpisode(setup.episodeDurationSec)} scenes of roughly 8 seconds.`,
        "Want me to change the tone, the main character, or the ending?",
      ].join("\n")
    : [
        `Got it. I'll revise the ${category.toLowerCase()} outline with this change:`,
        "",
        `"${latestPrompt}"`,
        "",
        `The series still has ${setup.episodeCount} episode${setup.episodeCount === 1 ? "" : "s"} at ${duration} each. Anything else you'd like to adjust?`,
      ].join("\n");

  return {
    id: createMessageId(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
};
