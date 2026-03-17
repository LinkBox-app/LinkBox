import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './contexts/I18nContext';
import About from './pages/About';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Setting from './pages/Setting';
import { FIRST_VISIT_KEY } from './storage-key.constant';

const FirstVisitCheck = () => {
  const isFirstVisit = localStorage.getItem(FIRST_VISIT_KEY) !== 'false';
  return isFirstVisit ? <Navigate to="/about" replace /> : <Home />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <FirstVisitCheck />,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
      {
        path: 'setting',
        element: <Setting />,
      },
    ],
  },
  {
    path: '/about',
    element: <About />,
  },
]);

export const mountApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </StrictMode>
  );
};
