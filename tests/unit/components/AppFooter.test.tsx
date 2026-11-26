import { render, screen } from '@testing-library/react';
import { AppFooter } from '@/components/AppFooter';

describe('AppFooter', () => {
  it('renders footer with Ticket Titan text', () => {
    render(<AppFooter />);
    expect(screen.getByText('Ticket Titan')).toBeInTheDocument();
  });

  it('renders help and support link', () => {
    render(<AppFooter />);
    expect(screen.getByText('Help & support')).toBeInTheDocument();
  });

  it('renders footer with correct class', () => {
    render(<AppFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('app-footer');
  });
});