import { render, screen } from '@testing-library/react';
import { LoginLogout } from '@/views/LoginLogout';

describe('LoginLogout', () => {
  // The auth context mock provides an authenticated user
  it('renders Logout button when authenticated', () => {
    render(<LoginLogout />);
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('Logout button is a button element', () => {
    render(<LoginLogout />);
    const button = screen.getByRole('button', { name: 'Logout' });
    expect(button.tagName).toBe('BUTTON');
  });
});