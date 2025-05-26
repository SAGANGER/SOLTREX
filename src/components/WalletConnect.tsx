import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Copy, ExternalLink, Shield, AlertCircle } from 'lucide-react';
import { truncateAddress } from '../utils/truncateAddress';
import { useAuth } from '../context/AuthContext';

export const WalletConnect: React.FC = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { isVerified, isLoading, error, verifyWallet, disconnect: disconnectAuth } = useAuth();

  const openWalletModal = async () => {
    if (!connected) {
      setVisible(true);
    }
  };

  const handleDisconnect = () => {
    disconnectAuth();
    localStorage.removeItem('verificationAttempted');
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

  // Automatically verify wallet when connected, but only once per session
  React.useEffect(() => {
    if (connected && publicKey && !isVerified) {
      const verificationAttempted = localStorage.getItem('verificationAttempted');
      if (!verificationAttempted) {
        localStorage.setItem('verificationAttempted', 'true');
        verifyWallet();
      }
    }
  }, [connected, publicKey, isVerified, verifyWallet]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-md w-full mx-auto p-8 rounded-xl bg-space-light/40 backdrop-blur-xl border border-space-accent/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-space-accent"></div>
        <p className="mt-4 text-space-text">Verifying wallet...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-md w-full mx-auto p-8 rounded-xl bg-space-light/40 backdrop-blur-xl border border-space-accent/10 shadow-[0_0_50px_-12px_rgba(153,69,255,0.15)] animate-slide-up">
      <h2 className="text-3xl font-bold mb-6 text-space-text-light">
        {connected ? 'Wallet Connected' : 'Connect Your Wallet'}
      </h2>
      
      {connected && publicKey ? (
        <div className="w-full space-y-6">
          <div className="bg-space-dark/60 p-4 rounded-lg border border-space-accent/5">
            <p className="text-sm text-space-text opacity-70 mb-1">Connected Address</p>
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

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isVerified ? (
            <button
              onClick={verifyWallet}
              disabled={isLoading}
              className="wallet-button w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Wallet Ownership'}
            </button>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
              <Shield className="h-5 w-5" />
              <span>Wallet Verified</span>
            </div>
          )}
          
          <button
            onClick={handleDisconnect}
            className="wallet-button wallet-button-connected w-full"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="w-full space-y-6">
          <p className="text-center text-space-text opacity-80 mb-4">
            Connect with Phantom or Solflare to access to Flappy Blimpy
          </p>
          
          <button
            onClick={openWalletModal}
            className="wallet-button wallet-button-disconnected w-full animate-float text-black"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};
