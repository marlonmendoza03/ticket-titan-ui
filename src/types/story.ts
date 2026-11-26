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

export interface StoryAttachmentDto {
  id: string;
  fileName: string;
  type: "Character" | "Setting";
  downloadUrl: string;
  fileSize: number;
  contentType?: string;
  uploadedAt: string;
}

export interface UploadAttachmentRequest {
  sessionId: string;
  file: File;
  type: "Character" | "Setting";
}

export const SessionStatus = {
  Draft: 0,
  AwaitingReferences: 1,
  Approved: 2,
} as const;

export type SessionStatusType = typeof SessionStatus[keyof typeof SessionStatus];

export interface StoryChatSessionDto {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages: StoryChatMessageDto[];
  storySetup?: StorySetup;
  status: SessionStatusType;
  attachments: StoryAttachmentDto[];
}