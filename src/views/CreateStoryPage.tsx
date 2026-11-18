import {
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";
import { SendHorizontal, Sparkles } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useGetCsrfTokenQuery } from "../api/login";
import { useSendInitialMessageMutation } from "../api/storyApi";
import { PageHeading } from "../components/PageHeading";
import { useAuth } from "../hooks/authContext";
import type {
  CategoryDto,
  StoryChatMessageDto,
  StorySetup,
} from "../types/story";
import { TicketTitanModal } from "../components/TicketTitanModal";
import { useNavigate } from "react-router";

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

const mockCategories: CategoryDto[] = [
  {
    name: "Horror",
    description: "Slow-burn dread, unexplained events, twist endings.",
    isActive: true,
  },
  {
    name: "True crime",
    description: "Narrated case breakdowns told through evidence.",
    isActive: true,
  },
  {
    name: "History",
    description: "Little-known moments from the past, told as stories.",
    isActive: true,
  },
  {
    name: "Motivation",
    description: "Short, punchy lessons with a clear takeaway.",
    isActive: true,
  },
  {
    name: "Fantasy",
    description: "Original worlds, quests, and mythical creatures.",
    isActive: true,
  },
];

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
  const { isFetching: isFetchingCsrfToken, refetch: refreshCsrfToken } =
    useGetCsrfTokenQuery();
  const [sendInitialMessage, { isLoading: isSendingMessage }] =
    useSendInitialMessageMutation();
  const { user } = useAuth();
  const isReplying = isFetchingCsrfToken || isSendingMessage;
  const [category, setCategory] = useState("");
  const [episodeChoice, setEpisodeChoice] = useState("");
  const [customEpisodes, setCustomEpisodes] = useState("");
  const [durationChoice, setDurationChoice] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [secondsLeft, setIsSecondsLeft] = useState(5);
  const navigate = useNavigate();

  const messageListRef = useRef<HTMLDivElement>(null);

  const episodeCount = parseChoice(
    episodeChoice,
    customEpisodes,
    EPISODE_LIMITS,
  );
  const episodeDurationInSec = parseChoice(
    durationChoice,
    customDuration,
    DURATION_LIMITS,
  );

  const handleRedirect = () => {
    navigate(`/tickets/${sessionId}`);
  };

  useEffect(() => {
    if (!isRedirectModalOpen) return;

    const timerId = setInterval(() => {
      setIsSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setIsRedirectModalOpen(false);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRedirectModalOpen]);

  const isEpisodesUnlocked = Boolean(category);
  const isDurationUnlocked = isEpisodesUnlocked && episodeCount !== null;
  const setup: StorySetup | null =
    category && episodeCount !== null && episodeDurationInSec !== null
      ? { category: category, episodeCount, episodeDurationInSec }
      : null;
  const canSend = setup !== null && !isReplying;

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!setup || !canSend) return;

    setChatError(null);

    try {
      const token = user?.csrfToken?.trim();
      if (!token) {
        throw new Error("No CSRF token is available in the auth context.");
      }

      const request: StoryChatMessageDto = {
        role: "User",
        storySetup: setup,
        content: draft,
      };

      try {
        const response = await sendInitialMessage({ request, token }).unwrap();
        if (response.id) {
          setSessionId(`/${response.id}`);
          setIsRedirectModalOpen(true);
        }
      } catch (error) {
        if (!isAntiforgeryTokenError(error)) throw error;

        const { token: refreshedToken } = await refreshCsrfToken().unwrap();
        if (!refreshedToken?.trim()) {
          throw new Error("The CSRF token endpoint returned an empty token.", {
            cause: error,
          });
        }
      }
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

  return (
    <>
      <PageHeading
        title="Create a story"
        description="Pick a category, how many episodes, and how long each one runs. Then describe your idea and refine it with Gemini."
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {mockCategories.map((c) => (
                  <MenuItem key={c.name} value={String(c.name)}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
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
                disabled={!isEpisodesUnlocked}
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
                disabled={!isDurationUnlocked}
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
                  error={customDuration !== "" && episodeDurationInSec === null}
                  helperText={`Whole number from ${DURATION_LIMITS.min} to ${DURATION_LIMITS.max}`}
                  slotProps={{
                    htmlInput: DURATION_LIMITS,
                  }}
                />
              )}
            </li>
          </ol>
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
                  ? `${category}, ${setup.episodeCount} ${setup.episodeCount === 1 ? "episode" : "episodes"}, ${formatDuration(setup.episodeDurationInSec)} each`
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
      <TicketTitanModal
        open={isRedirectModalOpen}
        onClose={handleRedirect}
        title={
          "Session Generated. Redirecting you to the session details page..."
        }
        acceptButtonText="Redirect Now"
        onAccept={handleRedirect}
        onCancel={handleRedirect}
      >
        <>
          <Box>Redirecting you in {secondsLeft}...</Box>
        </>
      </TicketTitanModal>
    </>
  );
};
