/**
 * MSW Mock Service Worker Registration
 * Entry point for Playwright E2E tests to initialize MSW
 * For Digital-Nervous project
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index.js';

const worker = setupWorker(...handlers);

worker.start({
  onUnhandledRequest: 'bypass',
});

export { worker };

