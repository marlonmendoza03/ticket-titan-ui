import {
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { ArrowLeft, SendHorizontal, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router";
import { PageHeading } from "../components/PageHeading";
import { useGetCsrfTokenQuery } from "../api/login";
import {
  useGetChatSessionQuery,
  useSendMessageMutation,
} from "../api/storyApi";
import { useAuth } from "../hooks/authContext";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { StoryChatMessageDto } from "../types/story";
import Loading from "../components/Loading";

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

export const TicketDetailsPage = () => {
  const { isFetching: isFetchingCsrfToken, refetch: refreshCsrfToken } =
    useGetCsrfTokenQuery();
  const [sendMessage, { isLoading: isSendingMessage }] =
    useSendMessageMutation();
  const { id: sessionId } = useParams();
  const { data: sessionData, isLoading: isLoadingChatSession } =
    useGetChatSessionQuery(sessionId!);
  const { user } = useAuth();
  const isReplying = isFetchingCsrfToken || isSendingMessage;
  const [messages, setMessages] = useState<StoryChatMessageDto[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [isTextBoxEnabled, setIsTextBoxEnabled] = useState(false);

  if (
    sessionData?.messageCount &&
    !isLoadingChatSession &&
    (!messages.length || messages.length === 0)
  ) {
    setMessages(sessionData.messages);
  }

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, isReplying]);

  const storySetup = sessionData?.storySetup;

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isReplying) return;

    const userMessage: StoryChatMessageDto = {
      role: "User",
      content: draft.trim(),
    };
    const history = [...messages, userMessage];

    setChatError(null);

    try {
      const token = user?.csrfToken?.trim();
      if (!sessionId) return;
      if (!token) {
        throw new Error("No CSRF token is available in the auth context.");
      }

      setIsTextBoxEnabled(false);
      setMessages(history);
      setDraft("");

      let response;
      try {
        response = await sendMessage({
          sessionId,
          token,
          request: userMessage,
        }).unwrap();
      } catch (error) {
        if (!isAntiforgeryTokenError(error)) throw error;

        const { token: refreshedToken } = await refreshCsrfToken().unwrap();
        if (!refreshedToken?.trim()) {
          throw new Error("The CSRF token endpoint returned an empty token.", {
            cause: error,
          });
        }
        response = await sendMessage({
          sessionId,
          request: userMessage,
          token: refreshedToken.trim(),
        }).unwrap();
      }

      const assistantMessage: StoryChatMessageDto = {
        role: response.messages.at(-1)?.role === "User" ? "User" : "Assistant",
        content: response.messages.at(-1)!.content,
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
  console.log(messages);
  return (
    <>
      {isLoadingChatSession ? (
        <Loading />
      ) : (
        <>
          <Link className="back-link" to="/tickets">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to all tickets
          </Link>
          <PageHeading title={sessionData?.title || ""} description="" />
          <div className="detail-layout">
            <Paper
              component="section"
              elevation={0}
              aria-labelledby="story-chat-title"
            >
              <div className="story-chat-header">
                <span className="story-chat-avatar" aria-hidden="true">
                  <Sparkles size={16} />
                </span>
                <div>
                  <h2 id="story-chat-title">Gemini story assistant</h2>
                </div>
              </div>

              <div
                ref={messageListRef}
                className="story-chat-messages"
                role="log"
                aria-live="polite"
              >
                {messages.map((m, index) => (
                  <div
                    key={index}
                    className={`chat-bubble chat-bubble-${m.role.toLocaleLowerCase()}`}
                  >
                    <span className="visually-hidden">
                      {m.role === "User" ? "You:" : "Gemini:"}
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

              {!isReplying ? (
                <Stack
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ButtonGroup variant="text">
                    <Button>Accept Idea</Button>
                    <Button
                      color="error"
                      onClick={() => setIsTextBoxEnabled(true)}
                    >
                      Polish Idea
                    </Button>
                  </ButtonGroup>
                </Stack>
              ) : null}

              <form className="story-chat-composer" onSubmit={handleSend}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={8}
                  label="Your story idea"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  disabled={isReplying || !isTextBoxEnabled}
                  helperText={
                    storySetup
                      ? "Enter to send, Shift+Enter for a new line"
                      : " "
                  }
                />
                <IconButton
                  type="submit"
                  color="primary"
                  className="story-send-button"
                  disabled={isReplying || !isTextBoxEnabled}
                  aria-label="Send message"
                >
                  <SendHorizontal size={20} />
                </IconButton>
              </form>
            </Paper>
          </div>
        </>
      )}
    </>
  );
};
