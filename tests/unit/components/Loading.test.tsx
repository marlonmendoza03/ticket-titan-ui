import { render, screen } from '@testing-library/react';
import Loading from '@/components/Loading';

describe('Loading', () => {
  it('renders CircularProgress with aria-label', () => {
    render(<Loading />);
    const circularProgress = screen.getByRole('progressbar');
    expect(circularProgress).toBeInTheDocument();
    expect(circularProgress).toHaveAttribute('aria-label', 'Loading…');
  });

  it('renders flex container', () => {
    render(<Loading />);
    const container = screen.getByRole('progressbar').parentElement;
    expect(container).toHaveStyle({ display: 'flex' });
  });
});