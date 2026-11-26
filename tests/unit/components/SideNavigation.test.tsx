import { render, screen } from '@testing-library/react';
import { SideNavigation } from '@/components/SideNavigation';

describe('SideNavigation', () => {
  it('renders Overview link', () => {
    render(<SideNavigation />);
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
  });

  it('renders All tickets link', () => {
    render(<SideNavigation />);
    expect(screen.getByRole('link', { name: 'All tickets' })).toBeInTheDocument();
  });

  it('renders New story link', () => {
    render(<SideNavigation />);
    expect(screen.getByRole('link', { name: 'New story' })).toBeInTheDocument();
  });

  it('does not render Ticket link when no sessionId', () => {
    render(<SideNavigation />);
    expect(screen.queryByRole('link', { name: 'Ticket' })).not.toBeInTheDocument();
  });

  it('has correct navigation structure', () => {
    render(<SideNavigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('side-navigation');
  });
});