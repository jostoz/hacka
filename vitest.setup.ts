import { vi } from 'vitest';

// Setup fetch mock
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Reset all mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
}); 