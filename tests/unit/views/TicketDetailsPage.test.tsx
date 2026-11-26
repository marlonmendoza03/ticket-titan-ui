import { fireEvent, render, screen } from '@testing-library/react';
import { TicketDetailsPage } from '@/views/TicketDetailsPage';

jest.mock('@/api/storyApi', () => {
  const actual = jest.requireActual('@/api/storyApi');
  return {
    ...actual,
    useGetChatSessionQuery: () => ({
      data: {
        id: '123',
        title: 'Test Session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 1,
        messages: [{ role: 'User', content: 'Hello' }],
        storySetup: { category: 'Horror', episodeCount: 3, episodeDurationInSec: 60 },
        status: 0, // Draft
      },
      isLoading: false,
      messageCount: 1,
    }),
    useSendMessageMutation: () => [jest.fn(), { isLoading: false }],
    useApproveSessionMutation: () => [jest.fn(), { isLoading: false }],
    useUploadAttachmentMutation: () => [jest.fn(), { isLoading: false }],
    useGetAttachmentsQuery: () => ({ data: [], refetch: jest.fn() }),
    useDeleteAttachmentMutation: () => [jest.fn(), { isLoading: false }],
  };
});

describe('TicketDetailsPage', () => {
  it('renders session title and chat assistant header', () => {
    render(<TicketDetailsPage />);
    expect(screen.getByText('Gemini story assistant')).toBeInTheDocument();
  });

  it('renders Accept Story and Polish Idea buttons in draft status', () => {
    render(<TicketDetailsPage />);
    expect(screen.getByRole('button', { name: 'Accept Story' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Polish Idea' })).toBeInTheDocument();
  });

  it('renders only one Cancel button in the accept confirmation', () => {
    render(<TicketDetailsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept Story' }));
    expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(1);
  });

  it('renders chat message', () => {
    render(<TicketDetailsPage />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});