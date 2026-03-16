import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import { ProgressProvider } from './contexts/ProgressContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProgressProvider>
          <Layout />
        </ProgressProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
