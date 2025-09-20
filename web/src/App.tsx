import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import { ProgressProvider } from './contexts/ProgressContext';

function App() {
  return (
    <ToastProvider>
      <ProgressProvider>
        <Layout />
      </ProgressProvider>
    </ToastProvider>
  );
}

export default App;
