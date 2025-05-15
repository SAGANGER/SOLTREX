import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users } from 'lucide-react';
import { AffiliationPopup } from '../components/AffiliationPopup';
import { FlappyBird } from '../components/game/FlappyBird';
import { UsernamePopup } from '../components/UsernamePopup';
import { SettingsPopup } from '../components/SettingsPopup';
import { Language, translations } from '../lib/translations';

interface UserProfile {
  username: string;
  avatar_url: string;
}

export const Dashboard: React.FC = () => {
  const { publicKey, disconnect } = useWallet();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAffiliationOpen, setIsAffiliationOpen] = useState(false);
  const [isUsernamePopupOpen, setIsUsernamePopupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (publicKey) {
      fetchUserProfile();
    }
  }, [publicKey]);

  useEffect(() => {
    const savedSoundSetting = localStorage.getItem('soundSetting');
    if (savedSoundSetting) {
      setSoundEnabled(savedSoundSetting === 'on');
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('wallet_address', publicKey!.toString())
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProfile(data[0]);
      } else {
        setError('User profile not found. Please complete registration.');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again later.');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  const handleUsernameChange = (newUsername: string) => {
    if (profile) {
      setProfile({ ...profile, username: newUsername });
    }
  };

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleXLinked = async () => {
    try {
      // Mettre à jour le profil utilisateur pour indiquer que X est lié
      const { error } = await supabase
        .from('users')
        .update({ twitter_linked: true })
        .eq('wallet_address', publicKey!.toString());

      if (error) throw error;

      // Ajouter 100 coins
      const { error: coinsError } = await supabase
        .from('users')
        .update({ coins: supabase.rpc('increment_coins', { amount: 100 }) })
        .eq('wallet_address', publicKey!.toString());

      if (coinsError) throw coinsError;

      // Rafraîchir le profil
      fetchUserProfile();
    } catch (error) {
      console.error('Error linking X account:', error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="absolute top-6 right-8">
        {profile && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {profile.avatar_url && (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="focus:outline-none"
                  >
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-space-accent/20 hover:border-space-accent transition-colors"
                    />
                  </button>
                )}
                <button
                  onClick={() => setIsUsernamePopupOpen(true)}
                  className="text-sm sm:text-base text-space-text-light hover:text-space-accent transition-colors"
                >
                  {profile.username}
                </button>
              </div>
              
              <button
  onClick={() => setIsAffiliationOpen(true)}
  className="flex items-center space-x-1 sm:space-x-2 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-accent transition-all duration-200"
>
  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
  <span className="hidden sm:inline text-black">Open Affiliation Program</span>
</button>


              <button
                onClick={handleDisconnect}
                className="py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-space-text-light bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-accent transition-all duration-200"
              >
                <span className="hidden sm:inline">Disconnect</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <FlappyBird language={currentLanguage} soundEnabled={soundEnabled} />
      </div>

      <AffiliationPopup
        isOpen={isAffiliationOpen}
        onClose={() => setIsAffiliationOpen(false)}
      />

      {profile && (
        <UsernamePopup
          isOpen={isUsernamePopupOpen}
          onClose={() => setIsUsernamePopupOpen(false)}
          currentUsername={profile.username}
          onUsernameChange={handleUsernameChange}
        />
      )}

      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onSoundChange={(newSound) => {
          setSoundEnabled(newSound === 'on');
          localStorage.setItem('soundSetting', newSound);
        }}
        onXLinked={handleXLinked}
      />
    </div>
  );
};
