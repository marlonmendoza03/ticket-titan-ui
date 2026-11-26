import { render, screen } from '@testing-library/react';
import { TicketsPage } from '@/views/TicketsPage';

describe('TicketsPage', () => {
  it('renders page heading with title', () => {
    render(<TicketsPage />);
    expect(screen.getByText('All Content Tickets')).toBeInTheDocument();
  });

  it('renders filter note and table', () => {
    render(<TicketsPage />);
    expect(screen.getByText('Most recently updated')).toBeInTheDocument();
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });
});