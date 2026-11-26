import { render, screen } from '@testing-library/react';
import { PageHeading } from '@/components/PageHeading';

describe('PageHeading', () => {
  it('renders title and description', () => {
    render(<PageHeading title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<PageHeading title="Test" description="Desc" action={<button>Action</button>} />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('does not render action div when action is not provided', () => {
    render(<PageHeading title="Test" description="Desc" />);
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });
});