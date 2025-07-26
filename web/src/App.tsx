import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';

function App() {
  return (
    <ToastProvider>
      <Layout />
    </ToastProvider>
  );
}

export default App;
