import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AppRoutes } from './routes';
export function App() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }));
  return <QueryClientProvider client={client}><MotionConfig reducedMotion="user"><BrowserRouter><AppRoutes /></BrowserRouter></MotionConfig></QueryClientProvider>;
}
