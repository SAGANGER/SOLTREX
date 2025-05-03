import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Medal, ExternalLink } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabase';
import { AffiliationPopup } from '../components/AffiliationPopup';
import { truncateAddress } from '../utils/truncateAddress';
import { getLeaderboard, LeaderboardEntry } from '../lib/supabaseClient';

interface UserProfile {
  username: string;
  avatar_url: string;
}

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, disconnect } = useWallet();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isAffiliationOpen, setIsAffiliationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      fetchUserProfile();
    }
    loadLeaderboard();
  }, [publicKey]);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard(100);
      const typedData: LeaderboardEntry[] = data.map((entry: any) => ({
        score: entry.score,
        users: {
          username: entry.users.username,
          avatar_url: entry.users.avatar_url
        }
      }));
      setLeaderboard(typedData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!publicKey) return;
    
    try {
      setError(null);
      const { data, error: profileError } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('wallet_address', publicKey.toString())
        .single();

      if (profileError) throw profileError;
      if (data) {
        setCurrentUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-700';
      default:
        return 'text-space-text';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-space-text font-mono">{rank}</span>;
    }
  };

  const copyToClipboard = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
    setCopiedWallet(wallet);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  const openSolscan = (wallet: string) => {
    window.open(`https://solscan.io/account/${wallet}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute top-6 left-8">
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 text-space-text-light cursor-pointer hover:text-space-accent transition-colors"
        >
          
          
        </div>
      </div>

      <div className="absolute top-6 right-8">
        {currentUserProfile && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <img 
                  src={currentUserProfile.avatar_url} 
                  alt="Profile" 
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-space-accent/20"
                />
                <span className="text-sm sm:text-base text-space-text-light">{currentUserProfile.username}</span>
              </div>
              
              <button
                onClick={() => setIsAffiliationOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-white bg-space-accent hover:bg-space-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-space-accent transition-all duration-200"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Open Affiliation Program</span>
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

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 mt-16 sm:mt-0">
        <div className="w-full max-w-4xl bg-space-light/40 rounded-xl backdrop-blur-xl border border-space-accent/10 p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-space-text-light mb-6 sm:mb-8 text-center">Global Leaderboard</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-accent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full">
                  <thead className="sticky top-0 bg-space-light/95 backdrop-blur-sm z-10">
                    <tr className="border-b border-space-accent/10">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-space-text/60">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-space-text/60">Player</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-space-text/60">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = publicKey && entry.users.username === currentUserProfile?.username;
                      return (
                        <tr 
                          key={index}
                          className={`border-b border-space-accent/5 hover:bg-space-accent/5 transition-colors ${
                            index < 3 ? 'bg-space-dark/20' : ''
                          } ${isCurrentUser ? 'bg-space-accent/10' : ''}`}
                        >
                          <td className="px-4 py-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankStyle(index + 1)}`}>
                              {getRankIcon(index + 1)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              {entry.users.avatar_url && (
                                <img
                                  src={entry.users.avatar_url}
                                  alt={entry.users.username}
                                  className="w-8 h-8 rounded-full border-2 border-space-accent/20"
                                />
                              )}
                              <span className={`text-space-text-light ${isCurrentUser ? 'text-yellow-400 font-bold' : ''}`}>
                                {isCurrentUser ? 'ME' : entry.users.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`font-bold ${isCurrentUser ? 'text-yellow-400' : 'text-space-accent'}`}>
                              {entry.score}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <AffiliationPopup
        isOpen={isAffiliationOpen}
        onClose={() => setIsAffiliationOpen(false)}
      />
    </div>
  );
};