import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UsernamePopup } from './UsernamePopup';

interface HeaderProps {
  profile?: {
    username: string;
    avatar_url: string;
  };
  onOpenAffiliation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onOpenAffiliation }) => {
  const { disconnect } = useWallet();
  const navigate = useNavigate();
  const [isUsernamePopupOpen, setIsUsernamePopupOpen] = useState(false);

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  const handleUsernameChange = (newUsername: string) => {
    if (profile) {
      profile.username = newUsername;
    }
  };

  return (
    <header className="w-full py-6 px-4 md:px-8 flex justify-between items-center animate-fade-in">
      <div className="flex items-center space-x-3 text-space-text-light">
        <img 
          src="https://i.imgur.com/0hUbkK2.png" 
          alt="Solana Logo" 
          className="h-8 w-8"
        />
        <button
          onClick={() => navigate('/')}
          className="text-xl font-bold hover:text-space-accent transition-colors"
        >
          Blimpy
        </button>
      </div>
      
      {profile && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {profile.avatar_url && (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border-2 border-space-accent/20"
              />
            )}
            <button
              onClick={() => setIsUsernamePopupOpen(true)}
              className="text-space-text-light hover:text-space-accent transition-colors"
            >
              {profile.username}
            </button>
          </div>
          
          <button
            onClick={onOpenAffiliation}
            className="flex items-center space-x-2 py-2 px-4 rounded-lg text-white bg-space-accent hover:bg-space-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-accent transition-all duration-200"
          >
            <Users className="h-5 w-5" />
            <span>Open Affiliation Program</span>
          </button>

          <button
            onClick={handleDisconnect}
            className="py-2 px-4 rounded-lg text-space-text-light bg-space-dark/60 hover:bg-space-dark/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-accent transition-all duration-200"
          >
            Disconnect
          </button>
        </div>
      )}

      {profile && (
        <UsernamePopup
          isOpen={isUsernamePopupOpen}
          onClose={() => setIsUsernamePopupOpen(false)}
          currentUsername={profile.username}
          onUsernameChange={handleUsernameChange}
        />
      )}
    </header>
  );
};
