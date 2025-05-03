import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, Copy, ExternalLink } from 'lucide-react';
import { truncateAddress } from '../utils/truncateAddress';
import { createReferral } from '../lib/supabaseClient';

export const UserRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registerUser, isLoading, error } = useAuth();
  const { publicKey } = useWallet();
  const [showNotification, setShowNotification] = useState(false);

  const handleSubmit = async () => {
    if (!publicKey) return;

    try {
      // Enregistrer l'utilisateur
      await registerUser('');

      // Vérifier s'il y a un code de parrainage
      const referrerAddress = searchParams.get('ref');
      if (referrerAddress && referrerAddress !== publicKey.toString()) {
        // Créer la référence
        await createReferral(referrerAddress, publicKey.toString());
      }

      setShowNotification(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      alert('Address copied to clipboard!');
    }
  };

  const openExplorer = () => {
    if (publicKey) {
      window.open(
        `https://explorer.solana.com/address/${publicKey.toString()}`,
        '_blank'
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center max-w-md w-full mx-auto p-8 rounded-xl bg-space-light/40 backdrop-blur-xl border border-space-accent/10 shadow-[0_0_50px_-12px_rgba(153,69,255,0.15)]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-space-text-light mb-2">
            Complete Registration
          </h2>
          <p className="text-sm text-space-text/80">
            One last step to access your dashboard
          </p>
        </div>

        {publicKey && (
          <div className="w-full mt-6 bg-space-dark/60 p-4 rounded-lg border border-space-accent/5">
            <p className="text-sm text-space-text opacity-70 mb-1">Connected Wallet</p>
            <div className="flex items-center justify-between">
              <p className="text-space-text-light font-mono font-medium">
                {truncateAddress(publicKey.toString())}
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={copyAddress}
                  className="p-1.5 rounded-md hover:bg-space-accent/20 transition-colors"
                  aria-label="Copy address"
                >
                  <Copy className="h-4 w-4 text-space-text-light" />
                </button>
                <button 
                  onClick={openExplorer}
                  className="p-1.5 rounded-md hover:bg-space-accent/20 transition-colors"
                  aria-label="View on explorer"
                >
                  <ExternalLink className="h-4 w-4 text-space-text-light" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-space-accent hover:bg-space-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-space-accent/20"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Complete Registration'
            )}
          </button>

          {error && (
            <div className="mt-4 text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-space-dark/90 backdrop-blur-sm text-space-text-light px-6 py-3 rounded-lg shadow-lg border border-space-accent/20">
            <p className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Account created successfully!</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};