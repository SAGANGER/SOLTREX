import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getLeaderboard } from '../lib/supabaseClient';

interface LeaderboardEntry {
  score: number;
  users: {
    username: string;
    avatar_url: string;
  };
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getLeaderboard(10);
        setLeaderboard(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-space-dark/60 p-6 rounded-lg border border-space-accent/10">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-6 w-6 text-space-accent" />
          <h2 className="text-xl font-bold text-space-text-light">Loading Leaderboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-space-dark/60 p-6 rounded-lg border border-space-accent/10">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="h-6 w-6 text-space-accent" />
        <h2 className="text-xl font-bold text-space-text-light">Leaderboard</h2>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-space-dark/40 border border-space-accent/5"
          >
            <div className="flex items-center space-x-3">
              <span className="text-space-text-light font-bold w-6 text-center">
                {index + 1}
              </span>
              {entry.users.avatar_url && (
                <img
                  src={entry.users.avatar_url}
                  alt={entry.users.username}
                  className="w-8 h-8 rounded-full object-cover border-2 border-space-accent/20"
                />
              )}
              <span className="text-space-text-light">{entry.users.username}</span>
            </div>
            <span className="text-space-accent font-bold">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 