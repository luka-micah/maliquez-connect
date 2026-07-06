import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              style: { background: '#22C55E', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#22C55E' },
            },
            error: {
              style: { background: '#EF4444', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#EF4444' },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
