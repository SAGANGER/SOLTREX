import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '@solana/wallet-adapter-react';

interface UsernamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onUsernameChange: (newUsername: string) => void;
}

export const UsernamePopup: React.FC<UsernamePopupProps> = ({
  isOpen,
  onClose,
  currentUsername,
  onUsernameChange
}) => {
  const { publicKey } = useWallet();
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    if (newUsername.length > 10) {
      setError('Username must be 10 characters or less');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', newUsername)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        setError('Username is already taken');
        setIsLoading(false);
        return;
      }

      // Update username
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('wallet_address', publicKey.toString());

      if (updateError) throw updateError;

      onUsernameChange(newUsername);
      handleClose();
    } catch (error) {
      console.error('Error updating username:', error);
      setError('Failed to update username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-space-dark/95 p-6 rounded-lg border border-space-accent/10 max-w-md w-full mx-4 transform transition-all duration-200 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-space-text-light">
            Change Username
          </h2>
          <button
            onClick={handleClose}
            className="text-space-text/60 hover:text-space-text-light transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-space-text/60 mb-1">
              Current Username
            </label>
            <div className="bg-space-dark/60 p-3 rounded-lg border border-space-accent/10">
              <span className="text-space-text-light">{currentUsername}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-space-text/60 mb-1">
              New Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              maxLength={10}
              className="w-full bg-space-dark/60 border border-space-accent/10 rounded-lg px-4 py-2 text-space-text-light focus:outline-none focus:ring-2 focus:ring-space-accent"
              placeholder="Enter new username"
            />
            <p className="text-xs text-space-text/60 mt-1">
              Maximum 10 characters
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !newUsername.trim()}
            className="w-full flex justify-center items-center py-2 px-4 rounded-lg text-white bg-space-accent hover:bg-space-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'Updating...' : 'Update Username'}
          </button>
        </form>
      </div>
    </div>
  );
}; 