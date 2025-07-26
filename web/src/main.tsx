import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App';
import './main.css';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Setting from './pages/Setting';
import About from './pages/About';
import { FIRST_VISIT_KEY } from './storage-key.constant';

// 首次访问检查组件
const FirstVisitCheck = () => {
    const isFirstVisit = localStorage.getItem(FIRST_VISIT_KEY) !== 'false';
    return isFirstVisit ? <Navigate to="/about" replace /> : <Home />;
};

// 路由
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <FirstVisitCheck />
            },
            {
                path: "chat",
                element: <Chat />
            },
            {
                path: "setting",
                element: <Setting />
            },
        ]
    },
    {
        path: "/about",
        element: <About />
    }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
