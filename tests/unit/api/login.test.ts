import { loginApi } from '@/api/login';

describe('loginApi', () => {
  it('exports the API reducer path', () => {
    expect(loginApi.reducerPath).toBe('loginApi');
  });

  it('has correct endpoints', () => {
    expect(typeof loginApi.endpoints.googleLogin).toBe('object');
    expect(typeof loginApi.endpoints.getCsrfToken).toBe('object');
    expect(typeof loginApi.endpoints.getSession).toBe('object');
    expect(typeof loginApi.endpoints.logout).toBe('object');
  });
});