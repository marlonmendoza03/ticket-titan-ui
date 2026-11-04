export interface TicketResponseDto {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: number;
  createdAt: string;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  category: string;
  priority: number;
}

export interface TicketNotificationDto {
  ticketId: number;
  title: string;
  message: string;
  type: string;
  timeStamp: string;
}
