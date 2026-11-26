import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  SendHorizontal,
  Sparkles,
  CheckCircle,
  Upload,
  Delete,
  Image,
  FileText,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { PageHeading } from "../components/PageHeading";
import { useGetCsrfTokenQuery } from "../api/login";
import {
  useGetChatSessionQuery,
  useSendMessageMutation,
  useApproveSessionMutation,
  useUploadAttachmentMutation,
  useGetAttachmentsQuery,
  useDeleteAttachmentMutation,
} from "../api/storyApi";
import { useAuth } from "../hooks/authContext";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type {
  StoryChatMessageDto,
} from "../types/story";
import { SessionStatus } from "../types/story";
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

const MAX_CHARACTERS = 5;
const MAX_SETTINGS = 5;

export const TicketDetailsPage = () => {
  const { isFetching: isFetchingCsrfToken, refetch: refreshCsrfToken } =
    useGetCsrfTokenQuery();
  const [sendMessage, { isLoading: isSendingMessage }] =
    useSendMessageMutation();
  const [approveSession, { isLoading: isApproving }] = useApproveSessionMutation();
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();
  const [deleteAttachment, { isLoading: isDeleting }] = useDeleteAttachmentMutation();
  const { id: sessionId } = useParams();
  const { data: sessionData, isLoading: isLoadingChatSession } =
    useGetChatSessionQuery(sessionId!);
  const { data: attachments = [], refetch: refetchAttachments } = useGetAttachmentsQuery(sessionId!);
  const { user } = useAuth();
  const isReplying = isFetchingCsrfToken || isSendingMessage;
  const [messages, setMessages] = useState<StoryChatMessageDto[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [isTextBoxEnabled, setIsTextBoxEnabled] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [characterFiles, setCharacterFiles] = useState<File[]>([]);
  const [settingFiles, setSettingFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

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
  const sessionStatus = sessionData?.status ?? SessionStatus.Draft;
  const isAwaitingReferences = sessionStatus === SessionStatus.AwaitingReferences;
  const isApproved = sessionStatus === SessionStatus.Approved;

  // Filter attachments by type
  const characterAttachments = attachments.filter(
    (a) => a.type === "Character"
  );
  const settingAttachments = attachments.filter((a) => a.type === "Setting");

  const canUploadMoreCharacters = characterAttachments.length < MAX_CHARACTERS;
  const canUploadMoreSettings = settingAttachments.length < MAX_SETTINGS;
  const canSubmitAttachments =
    characterAttachments.length > 0 || settingAttachments.length > 0;

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
        role:
          response.messages.at(-1)?.role === "User" ? "User" : "Assistant",
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

  const handleApprove = async () => {
    const token = user?.csrfToken?.trim();
    if (!sessionId || !token) return;

    try {
      await approveSession({ sessionId, token }).unwrap();
      setShowAcceptConfirm(false);
      setShowAttachmentUpload(true);
    } catch (error) {
      console.error("Failed to approve session:", error);
      setChatError(
        isAntiforgeryTokenError(error)
          ? "Couldn't verify your request. Please try again."
          : "Failed to accept the story. Please try again.",
      );
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "Character" | "Setting"
  ) => {
    const files = Array.from(event.target.files || []);
    const currentAttachments =
      type === "Character" ? characterAttachments : settingAttachments;
    const maxAllowed = type === "Character" ? MAX_CHARACTERS : MAX_SETTINGS;
    const availableSlots = maxAllowed - currentAttachments.length;

    if (files.length > availableSlots) {
      setUploadErrors((prev) => ({
        ...prev,
        [type]: `Maximum ${maxAllowed} ${type.toLowerCase()}(s) allowed. You have ${availableSlots} slot(s) remaining.`,
      }));
      return;
    }

    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });

    if (type === "Character") {
      setCharacterFiles((prev) => [...prev, ...files.slice(0, availableSlots)]);
    } else {
      setSettingFiles((prev) => [...prev, ...files.slice(0, availableSlots)]);
    }
  };

  const removeLocalFile = (index: number, type: "Character" | "Setting") => {
    if (type === "Character") {
      setCharacterFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSettingFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUploadAttachments = async () => {
    const token = user?.csrfToken?.trim();
    if (!sessionId || !token) return;

    const allFiles = [
      ...characterFiles.map((file) => ({ file, type: "Character" as const })),
      ...settingFiles.map((file) => ({ file, type: "Setting" as const })),
    ];

    if (allFiles.length === 0) return;

    try {
      for (const { file, type } of allFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        await uploadAttachment({ sessionId, token, formData }).unwrap();
      }
      setCharacterFiles([]);
      setSettingFiles([]);
      await refetchAttachments();
      setShowAttachmentUpload(false);
    } catch (error) {
      console.error("Failed to upload attachments:", error);
      setUploadErrors((prev) => ({
        ...prev,
        upload: "Failed to upload some files. Please try again.",
      }));
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    const token = user?.csrfToken?.trim();
    if (!sessionId || !token) return;

    try {
      await deleteAttachment({ sessionId, attachmentId, token }).unwrap();
      await refetchAttachments();
    } catch (error) {
      console.error("Failed to delete attachment:", error);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case SessionStatus.Draft:
        return "Draft";
      case SessionStatus.AwaitingReferences:
        return "Awaiting References";
      case SessionStatus.Approved:
        return "Approved";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case SessionStatus.Draft:
        return "default";
      case SessionStatus.AwaitingReferences:
        return "warning";
      case SessionStatus.Approved:
        return "success";
      default:
        return "default";
    }
  };

  if (isLoadingChatSession) {
    return <Loading />;
  }

  return (
    <>
      <Link className="back-link" to="/tickets">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to all tickets
      </Link>
      <PageHeading
        title={sessionData?.title || ""}
        description={
          <Chip
            label={getStatusLabel(sessionStatus)}
            color={getStatusColor(sessionStatus) as any}
            size="small"
          />
        }
      />
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

          {/* Accept / Polish Buttons - Only show when not replying and not already approved */}
          {!isReplying && !isApproved && !isAwaitingReferences && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: "center",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Button
                startIcon={<CheckCircle size={18} />}
                onClick={() => setShowAcceptConfirm(true)}
                variant="contained"
                color="success"
              >
                Accept Story
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={18} />}
                onClick={() => setIsTextBoxEnabled(true)}
              >
                Polish Idea
              </Button>
            </Stack>
          )}

          {/* Accept Confirmation Modal */}
          {showAcceptConfirm && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle size={20} color="success" />
                <Typography>
                  Are you sure you want to accept this story? Once accepted, you'll be
                  prompted to upload reference characters and settings (up to 5 each).
                </Typography>
              </Box>
              <Box sx={{ mt: 1, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowAcceptConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApprove}
                  disabled={isApproving}
                  startIcon={isApproving ? <CircularProgress size={16} /> : <CheckCircle size={18} />}
                >
                  {isApproving ? "Accepting..." : "Yes, Accept"}
                </Button>
              </Box>
            </Alert>
          )}

          {/* Attachment Upload Section */}
          {showAttachmentUpload && (
            <Box
              sx={{
                p: 3,
                mb: 2,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                backgroundColor: "action.hover",
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" gutterBottom>
                  Upload Reference Assets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload up to {MAX_CHARACTERS} character references and up to {MAX_SETTINGS} setting
                  references. These will be used for story generation.
                </Typography>

                <Divider />

                {/* Characters Upload */}
                <Box>
                  <Stack spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="subtitle1">
                      Character References ({characterAttachments.length + characterFiles.length}/{MAX_CHARACTERS})
                    </Typography>
                    {canUploadMoreCharacters && (
                      <Box>
                        <input
                          type="file"
                          accept="image/*,.pdf,.txt"
                          multiple
                          onChange={(e) => handleFileSelect(e, "Character")}
                          style={{ display: "none" }}
                          id="character-upload"
                          disabled={!canUploadMoreCharacters}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Upload size={16} />}
                          onClick={() => document.getElementById("character-upload")?.click()}
                          disabled={!canUploadMoreCharacters}
                        >
                          Add Characters
                        </Button>
                      </Box>
                    )}
                  </Stack>

                  {characterFiles.length > 0 && (
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      {characterFiles.map((file, index) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`char-${index}`}>
                          <Paper
                            elevation={1}
                            sx={{ p: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}
                          >
                            <Image size={32} color="primary" />
                            <Typography variant="caption" sx={{ textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                              {file.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeLocalFile(index, "Character")}
                              aria-label="Remove file"
                            >
                              <XCircle size={16} />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {uploadErrors.Character && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {uploadErrors.Character}
                    </Alert>
                  )}
                </Box>

                {/* Settings Upload */}
                <Box>
                  <Stack spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="subtitle1">
                      Setting References ({settingAttachments.length + settingFiles.length}/{MAX_SETTINGS})
                    </Typography>
                    {canUploadMoreSettings && (
                      <Box>
                        <input
                          type="file"
                          accept="image/*,.pdf,.txt"
                          multiple
                          onChange={(e) => handleFileSelect(e, "Setting")}
                          style={{ display: "none" }}
                          id="setting-upload"
                          disabled={!canUploadMoreSettings}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Upload size={16} />}
                          onClick={() => document.getElementById("setting-upload")?.click()}
                          disabled={!canUploadMoreSettings}
                        >
                          Add Settings
                        </Button>
                      </Box>
                    )}
                  </Stack>

                  {settingFiles.length > 0 && (
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      {settingFiles.map((file, index) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`setting-${index}`}>
                          <Paper
                            elevation={1}
                            sx={{ p: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}
                          >
                            <FileText size={32} color="primary" />
                            <Typography variant="caption" sx={{ textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                              {file.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeLocalFile(index, "Setting")}
                              aria-label="Remove file"
                            >
                              <XCircle size={16} />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {uploadErrors.Setting && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {uploadErrors.Setting}
                    </Alert>
                  )}
                </Box>

                {/* Existing Attachments */}
                {(characterAttachments.length > 0 || settingAttachments.length > 0) && (
                  <Box sx={{ mt: 2 }}>
                    <Divider />
                    <Typography variant="subtitle1" gutterBottom>
                      Uploaded Assets
                    </Typography>
                    <Grid container spacing={2}>
                      {characterAttachments.map((attachment) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`existing-char-${attachment.id}`}>
                          <Paper elevation={1} sx={{ p: 1 }}>
                            <Stack sx={{ alignItems: "center", gap: 0.5 }}>
                              <Image size={32} color="primary" />
                              <Typography variant="caption" sx={{ textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                                {attachment.fileName}
                              </Typography>
                              <Chip
                                label="Character"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                disabled={isDeleting}
                                aria-label="Delete attachment"
                              >
                                <Delete size={16} />
                              </IconButton>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                      {settingAttachments.map((attachment) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`existing-setting-${attachment.id}`}>
                          <Paper elevation={1} sx={{ p: 1 }}>
                            <Stack sx={{ alignItems: "center", gap: 0.5 }}>
                              <FileText size={32} color="primary" />
                              <Typography variant="caption" sx={{ textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                                {attachment.fileName}
                              </Typography>
                              <Chip
                                label="Setting"
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                disabled={isDeleting}
                                aria-label="Delete attachment"
                              >
                                <Delete size={16} />
                              </IconButton>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {uploadErrors.upload && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {uploadErrors.upload}
                  </Alert>
                )}

                <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowAttachmentUpload(false);
                      setCharacterFiles([]);
                      setSettingFiles([]);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUploadAttachments}
                    disabled={isUploading || (!canSubmitAttachments && characterFiles.length === 0 && settingFiles.length === 0)}
                    startIcon={isUploading ? <CircularProgress size={18} /> : <Upload size={18} />}
                  >
                    {isUploading ? "Uploading..." : "Upload All"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Approved State */}
          {isApproved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle size={20} />
                <Typography>
                  Story has been approved and references uploaded. Ready for generation!
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Composer */}
          {!isApproved && (
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
                disabled={isReplying || !isTextBoxEnabled || isAwaitingReferences}
                helperText={
                  isAwaitingReferences
                    ? "Story accepted. Please upload reference assets."
                    : storySetup
                    ? "Enter to send, Shift+Enter for a new line"
                    : " "
                }
              />
              <IconButton
                type="submit"
                color="primary"
                className="story-send-button"
                disabled={isReplying || !isTextBoxEnabled || isAwaitingReferences}
                aria-label="Send message"
              >
                <SendHorizontal size={20} />
              </IconButton>
            </form>
          )}
        </Paper>
      </div>
    </>
  );
};