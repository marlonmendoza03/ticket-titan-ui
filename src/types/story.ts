export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface StorySetup {
  categoryId: number;
  episodeCount: number;
  episodeDurationSec: number;
}

export interface StoryChatRequest {
  setup: StorySetup;
  messages: ChatMessage[];
}

export interface StoryChatResponse {
  message: ChatMessage;
}
