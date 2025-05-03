import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabase';

interface User {
  wallet_address: string;
  username: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  isVerified: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  verifyWallet: () => Promise<void>;
  registerUser: (username: string) => Promise<void>;
  checkRegistration: () => Promise<void>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, connected, disconnect: disconnectWallet, signMessage } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      checkRegistration();
    } else {
      resetState();
    }
  }, [connected, publicKey]);

  const resetState = () => {
    setUser(null);
    setIsVerified(false);
    setIsRegistered(false);
    setIsLoading(false);
    setError(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isVerified');
    localStorage.removeItem('registrationComplete');
  };

  const checkRegistration = async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUser(data);
        setIsRegistered(true);
        setIsVerified(true);
        localStorage.setItem('registrationComplete', 'true');
      } else {
        setIsRegistered(false);
        const storedWalletAddress = localStorage.getItem('walletAddress');
        const storedIsVerified = localStorage.getItem('isVerified') === 'true';
        setIsVerified(storedWalletAddress === publicKey.toString() && storedIsVerified);
      }
    } catch (error: any) {
      console.error('Error checking registration:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyWallet = async () => {
    if (!publicKey || !signMessage) return;

    try {
      setIsLoading(true);
      setError(null);

      const message = new TextEncoder().encode(
        `Verify wallet ownership\nTimestamp: ${Date.now()}`
      );

      const signature = await signMessage(message);
      
      if (signature) {
        localStorage.setItem('walletAddress', publicKey.toString());
        localStorage.setItem('isVerified', 'true');
        setIsVerified(true);
        await checkRegistration();
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      if (error.message?.includes('User rejected')) {
        setError('Please approve the signature request in your wallet to verify ownership.');
      } else {
        setError('Failed to verify wallet ownership. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const truncateWalletAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const registerUser = async (username: string) => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      setError(null);

      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        setUser(existingUser);
        setIsRegistered(true);
        setIsVerified(true);
        localStorage.setItem('registrationComplete', 'true');
        return;
      }

      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            wallet_address: publicKey.toString(),
            username: username.trim() ? username.trim().slice(0, 12) : truncateWalletAddress(publicKey.toString()),
            avatar_url: 'https://i.imgur.com/Ac52bK1.png'
          }
        ])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          await checkRegistration();
          return;
        }
        throw insertError;
      }

      if (newUser) {
        setUser(newUser);
        setIsRegistered(true);
        setIsVerified(true);
        localStorage.setItem('registrationComplete', 'true');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to create user profile. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    disconnectWallet();
    resetState();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isVerified,
        isRegistered,
        isLoading,
        error,
        verifyWallet,
        registerUser,
        checkRegistration,
        disconnect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 