export interface CategoryDto {
  name: string;
  description: string;
  isActive: boolean;
}

export type ChatRole = "user" | "assistant";

export interface StorySetup {
  category: string;
  episodeCount: number;
  episodeDurationInSec: number;
}

export interface StoryChatRequest {
  messages: StoryChatMessageDto[];
}

export interface StoryChatResponse {
  content: string;
  role: string | null;
  createdAt: string;
}

export interface StoryChatMessageDto {
  role: "User" | "Assistant";
  content: string;
  storySetup?: StorySetup;
}

export interface StoryChatSessionDto {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages: StoryChatMessageDto[];
  storySetup?: StorySetup;
}
