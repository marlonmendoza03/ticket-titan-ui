import { render, screen } from '@testing-library/react';
import { OverviewPage } from '@/views/OverviewPage';

describe('OverviewPage', () => {
  it('renders page heading and metrics', () => {
    render(<OverviewPage />);
    expect(screen.getByText('Your content tickets, at a glance.')).toBeInTheDocument();
    expect(screen.getByText('Open tickets')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('Need attention')).toBeInTheDocument();
  });

  it('renders recent tickets section', () => {
    render(<OverviewPage />);
    expect(screen.getByText('Recent tickets')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all tickets' })).toBeInTheDocument();
  });
});