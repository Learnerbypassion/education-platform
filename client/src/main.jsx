import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import App from './App';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontSize: 'var(--font-size-sm)',
            borderRadius: 'var(--radius-md)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--bg-secondary)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-accent)',
              secondary: 'var(--bg-secondary)',
            },
          },
        }}
      />
    </Provider>
  </React.StrictMode>
);
