import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import LoginForm from './components/LoginForm';
import SetupForm from './components/SetupForm';

export default function App() {
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'form' | 'list'>('form');

  useEffect(() => {
    async function checkSetupStatus() {
      try {
        const res = await fetch('/api/setup/status');
        const data = await res.json();
        setIsSetupDone(data.done);
      } catch (err) {
        console.error("Failed to check setup status:", err);
      }
    }
    checkSetupStatus();
  }, []);

  if (!isSetupDone) {
    return <SetupForm onDone={() => setIsSetupDone(true)} />;
  }

  if (!isLoggedIn) {
    return <LoginForm onSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout>
      {currentView === 'form' && <OrderForm />}
      {currentView === 'list' && <OrderList />}
    </Layout>
  );
}
