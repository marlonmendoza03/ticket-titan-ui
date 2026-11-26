import type { AuthUser, AuthContextValue } from '@/hooks/authContext';

describe('Auth types', () => {
  it('AuthUser has required fields', () => {
    const user: AuthUser = {
      email: 'test@example.com',
      isLoggedIn: true,
      csrfToken: 'token123',
    };
    expect(user.email).toBe('test@example.com');
    expect(user.isLoggedIn).toBe(true);
    expect(user.csrfToken).toBe('token123');
  });

  it('AuthUser allows additional properties', () => {
    const user: AuthUser = {
      email: 'test@example.com',
      isLoggedIn: true,
      customField: 'custom',
    };
    expect(user.customField).toBe('custom');
  });

  it('AuthContextValue has correct structure', () => {
    const context: AuthContextValue = {
      user: { email: 'test@example.com', isLoggedIn: true },
      isAuthenticated: true,
      isLoading: false,
    };
    expect(context.user?.email).toBe('test@example.com');
    expect(context.isAuthenticated).toBe(true);
    expect(context.isLoading).toBe(false);
  });

  it('AuthContextValue allows null user', () => {
    const context: AuthContextValue = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
    };
    expect(context.user).toBeNull();
    expect(context.isAuthenticated).toBe(false);
    expect(context.isLoading).toBe(true);
  });
});