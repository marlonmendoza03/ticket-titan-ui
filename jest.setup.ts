import '@testing-library/jest-dom';
import React from 'react';

// Fix matchMedia polyfill
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Fix ResizeObserver polyfill
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Fix canvas getContext
HTMLCanvasElement.prototype.getContext = jest.fn();

// Mock @mui/x-data-grid
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns, loading }: any) => {
    return React.createElement('table', { 'data-testid': 'data-grid' },
      React.createElement('thead', null,
        React.createElement('tr', null,
          columns?.map((col: any) => React.createElement('th', { key: col.field }, col.headerName))
        )
      ),
      React.createElement('tbody', null,
        loading
          ? React.createElement('tr', null, React.createElement('td', { colSpan: columns?.length }, 'Loading...'))
          : rows?.map((row: any, i: number) => React.createElement('tr', { key: i },
              columns?.map((col: any) => React.createElement('td', { key: col.field },
                col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]
              ))
            ))
      )
    );
  },
}));

// Mock dayjs
jest.mock('dayjs', () => {
  return (date: string | Date) => ({ format: () => 'Jan 01-2024 12:00 PM' });
});

// Mock auth context
jest.mock('@/hooks/authContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { email: 'test@example.com', isLoggedIn: true, csrfToken: 'test-csrf-token' },
    isLoading: false,
  }),
}));

// Mock API base URL
jest.mock('@/api/api', () => ({
  API_BASE_URL: 'http://localhost:3000',
}));

// Mock login API
jest.mock('@/api/login', () => ({
  loginApi: { reducerPath: 'loginApi', endpoints: { googleLogin: {}, getCsrfToken: {}, getSession: {}, logout: {} } },
  useGetCsrfTokenQuery: () => ({ data: { token: 'test-csrf-token' }, isFetching: false, refetch: jest.fn() }),
  useLazyGetCsrfTokenQuery: () => [jest.fn(), { data: { token: 'test-csrf-token' } }],
  useGetSessionQuery: () => ({ data: null, isLoading: false }),
  useLogoutMutation: () => [jest.fn(), { isLoading: false }],
  useGoogleLoginMutation: () => [jest.fn(), { isLoading: false }],
}));

// Mock story API
jest.mock('@/api/storyApi', () => ({
  storyApi: { reducerPath: 'storyApi', endpoints: { getChatSessions: {}, getChatSession: {}, createSession: {}, sendMessage: {}, sendInitialMessage: {} } },
  useGetChatSessionsQuery: () => ({ data: [], isLoading: false }),
  useGetChatSessionQuery: () => ({ data: null, isLoading: false, messageCount: 0 }),
  useCreateSessionMutation: () => [jest.fn(), { isLoading: false }],
  useSendMessageMutation: () => [jest.fn(), { isLoading: false }],
  useSendInitialMessageMutation: () => [jest.fn(), { isLoading: false }],
}));

// Mock tickets API
jest.mock('@/api/ticketsApi', () => ({
  ticketsApi: { reducerPath: 'ticketsApi', endpoints: { getTickets: {}, createTicket: {}, updateTicket: {}, deleteTicket: {} } },
  useGetTicketsQuery: () => ({ data: [], isLoading: false }),
  useCreateTicketMutation: () => [jest.fn(), { isLoading: false }],
  useUpdateTicketMutation: () => [jest.fn(), { isLoading: false }],
  useDeleteTicketMutation: () => [jest.fn(), { isLoading: false }],
}));

// Mock routes/paths
jest.mock('@/routes/paths', () => ({
  ROUTES: {
    Home: '/',
    Login: '/login',
    Tickets: '/tickets',
    TicketDetails: (id: string) => `/tickets/${id}`,
    CreateStory: '/stories/create',
  },
}));

// Mock react-router hooks BEFORE any tests import them
jest.mock('react-router', () => {
  // Mock NavLink that renders as a simple link
  const NavLink = ({ to, children, end, className, ...props }: any) => {
    const isActive = typeof className === 'function' ? className({ isActive: false }) : className;
    return React.createElement('a', {
      href: to,
      className: isActive,
      ...props
    }, children);
  };

  return {
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
      React.createElement('a', { href: to, ...props }, children)
    ),
    NavLink,
    MemoryRouter: ({ children }: { children: React.ReactNode }) => (
      React.createElement('div', { 'data-testid': 'memory-router' }, children)
    ),
    Routes: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Route: ({ element }: { element: React.ReactNode }) => element,
  };
});