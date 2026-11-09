import {
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";
import { Lock, RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useGetCsrfTokenQuery } from "../api/login";
import {
  useGetCategoriesQuery,
  useSendStoryMessageMutation,
} from "../api/storyApi";
import { PageHeading } from "../components/PageHeading";
import { createMessageId } from "../data/storyMocks";
import { useAuth } from "../hooks/authContext";
import type { ChatMessage, StorySetup } from "../types/story";

const CUSTOM = "custom";
const EPISODE_OPTIONS = [1, 3, 5, 10];
const DURATION_OPTIONS = [60, 120, 180, 240];
const EPISODE_LIMITS = { min: 1, max: 20 };
const DURATION_LIMITS = { min: 30, max: 600 };

const isAntiforgeryTokenError = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return false;
  }

  const { data } = error;
  const message =
    typeof data === "string"
      ? data
      : typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
        ? data.message
        : "";

  return /valid anti[- ]forgery token is required/i.test(message);
};

const formatDuration = (seconds: number) =>
  seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} sec`;

const parseChoice = (
  choice: string,
  customValue: string,
  limits: { min: number; max: number },
): number | null => {
  const raw = choice === CUSTOM ? customValue : choice;
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= limits.min && value <= limits.max
    ? value
    : null;
};

export const CreateStoryPage = () => {
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();
  const {
    isFetching: isFetchingCsrfToken,
    refetch: refreshCsrfToken,
  } = useGetCsrfTokenQuery();
  const [sendStoryMessage, { isLoading: isSendingMessage }] =
    useSendStoryMessageMutation();
  const { user } = useAuth();
  const isReplying = isFetchingCsrfToken || isSendingMessage;
  const [categoryId, setCategoryId] = useState("");
  const [episodeChoice, setEpisodeChoice] = useState("");
  const [customEpisodes, setCustomEpisodes] = useState("");
  const [durationChoice, setDurationChoice] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);

  const messageListRef = useRef<HTMLDivElement>(null);

  const episodeCount = parseChoice(
    episodeChoice,
    customEpisodes,
    EPISODE_LIMITS,
  );
  const episodeDurationSec = parseChoice(
    durationChoice,
    customDuration,
    DURATION_LIMITS,
  );
  const category = categories.find((c) => String(c.id) === categoryId);

  const isEpisodesUnlocked = Boolean(category);
  const isDurationUnlocked = isEpisodesUnlocked && episodeCount !== null;
  const setup: StorySetup | null =
    category && episodeCount !== null && episodeDurationSec !== null
      ? { categoryId: category.id, episodeCount, episodeDurationSec }
      : null;
  const isSetupLocked = messages.length > 0;
  const canSend = setup !== null && draft.trim() !== "" && !isReplying;

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, isReplying]);

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!setup || !canSend) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: draft.trim(),
      createdAt: new Date().toISOString(),
    };
    const history = [...messages, userMessage];

    setChatError(null);

    try {
      const token = user?.csrfToken?.trim();
      if (!token) {
        throw new Error("No CSRF token is available in the auth context.");
      }

      setMessages(history);
      setDraft("");

      const request = {
        storyChatRequest: { setup, messages: history },
      };

      let response;
      try {
        response = await sendStoryMessage({ ...request, token }).unwrap();
      } catch (error) {
        if (!isAntiforgeryTokenError(error)) throw error;

        const { token: refreshedToken } = await refreshCsrfToken().unwrap();
        if (!refreshedToken?.trim()) {
          throw new Error("The CSRF token endpoint returned an empty token.", {
            cause: error,
          });
        }
        response = await sendStoryMessage({
          ...request,
          token: refreshedToken.trim(),
        }).unwrap();
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: response.role === "user" ? "user" : "assistant",
        content: response.content,
        createdAt: response.createdAt,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("Story chat request failed:", error);
      setChatError(
        isAntiforgeryTokenError(error)
          ? "Couldn't verify your request. Please try again."
          : "Gemini didn't reply. Send your message again to retry.",
      );
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleStartOver = () => {
    setMessages([]);
    setDraft("");
    setChatError(null);
  };

  return (
    <>
      <PageHeading
        title="Create a story"
        description="Pick a category, how many episodes, and how long each one runs. Then describe your idea and refine it with Gemini."
        action={
          isSetupLocked && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RotateCcw size={16} />}
              onClick={handleStartOver}
              disabled={isReplying}
            >
              Start over
            </Button>
          )
        }
      />

      <div className="story-layout">
        <Paper
          component="section"
          className="story-setup-panel"
          elevation={0}
          aria-labelledby="story-setup-title"
        >
          <h2 id="story-setup-title">Story setup</h2>
          <ol className="story-steps">
            <li className="story-step is-unlocked">
              <span className="story-step-label">Category</span>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isSetupLocked || isCategoriesLoading}
                error={isCategoriesError}
                helperText={
                  isCategoriesError
                    ? "Categories couldn't be loaded."
                    : category?.description
                }
              >
                {isCategoriesLoading && (
                  <MenuItem value="" disabled>
                    Loading categories…
                  </MenuItem>
                )}
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              {isCategoriesError && (
                <Button size="small" onClick={() => void refetchCategories()}>
                  Try again
                </Button>
              )}
            </li>

            <li
              className={`story-step${isEpisodesUnlocked ? " is-unlocked" : ""}`}
            >
              <span className="story-step-label">Number of episodes</span>
              <TextField
                select
                fullWidth
                size="small"
                label="Episodes"
                value={episodeChoice}
                onChange={(e) => setEpisodeChoice(e.target.value)}
                disabled={isSetupLocked || !isEpisodesUnlocked}
              >
                {EPISODE_OPTIONS.map((n) => (
                  <MenuItem key={n} value={String(n)}>
                    {n} {n === 1 ? "episode" : "episodes"}
                  </MenuItem>
                ))}
                <MenuItem value={CUSTOM}>Custom</MenuItem>
              </TextField>
              {episodeChoice === CUSTOM && (
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Custom episodes"
                  value={customEpisodes}
                  onChange={(e) => setCustomEpisodes(e.target.value)}
                  disabled={isSetupLocked}
                  error={customEpisodes !== "" && episodeCount === null}
                  helperText={`Whole number from ${EPISODE_LIMITS.min} to ${EPISODE_LIMITS.max}`}
                  slotProps={{
                    htmlInput: EPISODE_LIMITS,
                  }}
                />
              )}
            </li>

            <li
              className={`story-step${isDurationUnlocked ? " is-unlocked" : ""}`}
            >
              <span className="story-step-label">Episode duration</span>
              <TextField
                select
                fullWidth
                size="small"
                label="Duration"
                value={durationChoice}
                onChange={(e) => setDurationChoice(e.target.value)}
                disabled={isSetupLocked || !isDurationUnlocked}
              >
                {DURATION_OPTIONS.map((s) => (
                  <MenuItem key={s} value={String(s)}>
                    {s} seconds ({formatDuration(s)})
                  </MenuItem>
                ))}
                <MenuItem value={CUSTOM}>Custom</MenuItem>
              </TextField>
              {durationChoice === CUSTOM && (
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Custom duration (seconds)"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  disabled={isSetupLocked}
                  error={customDuration !== "" && episodeDurationSec === null}
                  helperText={`Whole number from ${DURATION_LIMITS.min} to ${DURATION_LIMITS.max}`}
                  slotProps={{
                    htmlInput: DURATION_LIMITS,
                  }}
                />
              )}
            </li>
          </ol>
          {isSetupLocked && (
            <p className="story-setup-note">
              <Lock size={14} aria-hidden="true" />
              Setup is locked while you chat. Start over to change it.
            </p>
          )}
        </Paper>

        <Paper
          component="section"
          className={`story-chat-panel${setup ? "" : " is-locked"}`}
          elevation={0}
          aria-labelledby="story-chat-title"
        >
          <div className="story-chat-header">
            <span className="story-chat-avatar" aria-hidden="true">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 id="story-chat-title">Gemini story assistant</h2>
              <p>
                {setup && category
                  ? `${category.name}, ${setup.episodeCount} ${setup.episodeCount === 1 ? "episode" : "episodes"}, ${formatDuration(setup.episodeDurationSec)} each`
                  : "Finish the setup to start chatting"}
              </p>
            </div>
          </div>

          <div
            ref={messageListRef}
            className="story-chat-messages"
            role="log"
            aria-live="polite"
          >
            {!setup ? (
              <p className="story-chat-empty">
                Choose a category, number of episodes, and duration. The prompt
                box unlocks once all three are set.
              </p>
            ) : (
              <div className="chat-bubble chat-bubble-assistant">
                Describe the story you want to tell. Include the main character,
                the setting, and the twist or ending you have in mind.
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble chat-bubble-${m.role}`}>
                <span className="visually-hidden">
                  {m.role === "user" ? "You:" : "Gemini:"}
                </span>
                {m.content}
              </div>
            ))}

            {isReplying && (
              <div className="chat-bubble chat-bubble-assistant chat-typing">
                <CircularProgress size={14} aria-hidden="true" />
                Gemini is writing…
              </div>
            )}

            {chatError && (
              <p className="story-chat-error" role="alert">
                {chatError}
              </p>
            )}
          </div>

          <form className="story-chat-composer" onSubmit={handleSend}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={8}
              label="Your story idea"
              placeholder={
                setup
                  ? "e.g. A night-shift security guard keeps hearing his own voice on the radio…"
                  : "Finish the setup first"
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              disabled={!setup}
              helperText={
                setup ? "Enter to send, Shift+Enter for a new line" : " "
              }
            />
            <IconButton
              type="submit"
              color="primary"
              className="story-send-button"
              disabled={!canSend}
              aria-label="Send message"
            >
              <SendHorizontal size={20} />
            </IconButton>
          </form>
        </Paper>
      </div>
    </>
  );
};
