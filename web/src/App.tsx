import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import { ProgressProvider } from './contexts/ProgressContext';
import { AuthProvider } from './contexts/AuthContext';
import { ResourceProvider } from './contexts/ResourceContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ResourceProvider>
          <ProgressProvider>
            <Layout />
          </ProgressProvider>
        </ResourceProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
