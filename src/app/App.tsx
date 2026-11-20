import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from '../features/auth/AuthProvider';
import { AppRoutes } from './routes';

export function App() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1, networkMode: 'always' } } }));
  return <QueryClientProvider client={client}>
    <AuthProvider queryClient={client}>
      <MotionConfig reducedMotion="user"><BrowserRouter basename={import.meta.env.BASE_URL}><AppRoutes /></BrowserRouter></MotionConfig>
    </AuthProvider>
  </QueryClientProvider>;
}
