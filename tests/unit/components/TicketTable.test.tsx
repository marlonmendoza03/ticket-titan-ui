import { render, screen } from '@testing-library/react';
import { TicketTable } from '@/components/TicketTable';

describe('TicketTable', () => {
  it('renders DataGrid component', () => {
    render(<TicketTable />);
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<TicketTable />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Episodes')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Created On')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Open Session')).toBeInTheDocument();
  });
});