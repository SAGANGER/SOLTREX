import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WalletConnect } from './components/WalletConnect';
import { UserRegistration } from './components/UserRegistration';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { ParticleBackground } from './components/ParticleBackground';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { connected } = useWallet();
  const { isVerified, isRegistered, isLoading } = useAuth();
  const isHomePage = !connected || !isVerified || !isRegistered;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-space-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-space-gradient relative overflow-hidden">
      <ParticleBackground />
      <div className="flex-1 flex flex-col z-10">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Routes>
            <Route path="/" element={
              !connected ? (
                <WalletConnect />
              ) : !isVerified ? (
                <WalletConnect />
              ) : !isRegistered ? (
                <UserRegistration />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />
            <Route 
              path="/dashboard" 
              element={
                connected && isVerified && isRegistered ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                connected && isVerified && isRegistered ? (
                  <Leaderboard />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>
        {isHomePage && <Footer />}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App