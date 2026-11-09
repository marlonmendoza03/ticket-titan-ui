import { useDispatch } from "react-redux";
import type { TicketNotificationDto, TicketResponseDto } from "../types/ticket";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { ticketsApi } from "../api/ticketsApi";
import type { AppDispatch } from "../middleware/store";
import { API_BASE_URL } from "../api/api";

export const useSignalR = (
  onHighPriorityAlert?: (alert: TicketNotificationDto) => void,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isActive = true;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/tickets`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("TicketCreated", (newTicket: TicketResponseDto) => {
      dispatch(
        ticketsApi.util.updateQueryData("getTickets", undefined, (draft) => {
          draft.unshift(newTicket);
        }),
      );
    });

    connection.on(
      "ReceiveHighPriorityNotification",
      (alert: TicketNotificationDto) => {
        if (onHighPriorityAlert) {
          onHighPriorityAlert(alert);
        }
      },
    );

    void connection
      .start()
      .then(() => {
        if (!isActive) return;
        setIsConnected(true);
      })
      .catch((error: unknown) => {
        if (isActive) {
          console.error("SignalR Connection Error: ", error);
        }
      });

    return () => {
      isActive = false;
      void connection.stop();
    };
  }, [dispatch, onHighPriorityAlert]);

  return { isConnected };
};
