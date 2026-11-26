import { ROUTES, type RouteKeys } from '@/routes/paths';

describe('ROUTES', () => {
  it('has correct route paths', () => {
    expect(ROUTES.Home).toBe('/');
    expect(ROUTES.Login).toBe('/login');
    expect(ROUTES.Tickets).toBe('/tickets');
    expect(ROUTES.CreateStory).toBe('/stories/create');
  });

  it('TicketDetails generates correct path with id', () => {
    expect(ROUTES.TicketDetails('123')).toBe('/tickets/123');
    expect(ROUTES.TicketDetails('abc-def')).toBe('/tickets/abc-def');
  });

  it('RouteKeys type includes all route keys', () => {
    const keys: RouteKeys[] = ['Home', 'Login', 'Tickets', 'TicketDetails', 'CreateStory'];
    expect(keys).toHaveLength(5);
  });
});