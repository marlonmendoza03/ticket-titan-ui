import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

type TicketTitanModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  acceptButtonText?: string;
  cancelButtonText?: string;
  onAccept?: () => void;
  onCancel?: () => void;
  children?: ReactNode;
};

export const TicketTitanModal = ({
  open,
  onClose,
  title,
  acceptButtonText,
  cancelButtonText,
  onAccept,
  onCancel,
  children,
}: TicketTitanModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="ticket-titan-modal-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="ticket-titan-modal-title">
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>
      {(acceptButtonText || cancelButtonText) && (
        <DialogActions>
          {cancelButtonText && (
            <Button onClick={onCancel ?? onClose}>{cancelButtonText}</Button>
          )}
          {acceptButtonText && (
            <Button onClick={onAccept} variant="contained">
              {acceptButtonText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};
