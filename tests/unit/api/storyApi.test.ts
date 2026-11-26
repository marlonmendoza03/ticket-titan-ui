import { storyApi } from '@/api/storyApi';

describe('storyApi', () => {
  it('exports the API reducer path', () => {
    expect(storyApi.reducerPath).toBe('storyApi');
  });

  it('has correct endpoints', () => {
    expect(typeof storyApi.endpoints.getChatSessions).toBe('object');
    expect(typeof storyApi.endpoints.getChatSession).toBe('object');
    expect(typeof storyApi.endpoints.createSession).toBe('object');
    expect(typeof storyApi.endpoints.sendMessage).toBe('object');
    expect(typeof storyApi.endpoints.sendInitialMessage).toBe('object');
  });
});