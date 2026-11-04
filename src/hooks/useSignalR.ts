import { useDispatch } from "react-redux";
import type { TicketNotificationDto, TicketResponseDto } from "../types/ticket";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { ticketsApi } from "../api/ticketsApi";
import type { AppDispatch } from "../middleware/store";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

export const useSignalR = (
  onHighPriorityAlert?: (alert: TicketNotificationDto) => void,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!apiBaseUrl) {
      console.error(
        "VITE_API_BASE_URL is not defined in the environment variables.",
      );
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/tickets`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (!connection) return;

    connection
      .start()
      .then(() => {
        setIsConnected(true);

        connection.on("TicketCreated", (newTicket: TicketResponseDto) => {
          dispatch(
            ticketsApi.util.updateQueryData(
              "getTickets",
              undefined,
              (draft) => {
                draft.unshift(newTicket);
              },
            ),
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
      })
      .catch((error) => console.error("SignalR Connection Error: ", error));

    return () => {
      connection.stop();
    };
  }, [connection, dispatch, onHighPriorityAlert]);

  return { isConnected };
};
