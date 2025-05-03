import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  score: number;
  users: {
    username: string;
    avatar_url: string;
  };
}

// Fonctions pour gérer les références
export const createReferral = async (referrerAddress: string, referredAddress: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .insert([
      {
        referrer_address: referrerAddress,
        referred_address: referredAddress
      }
    ]);

  if (error) throw error;
  return data;
};

export const getReferralCount = async (referrerAddress: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_address', referrerAddress);

  if (error) throw error;
  return data?.length || 0;
};

export const getReferrer = async (referredAddress: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('referrer_address')
    .eq('referred_address', referredAddress)
    .single();

  if (error) throw error;
  return data?.referrer_address;
};

export const updateHighScore = async (walletAddress: string, score: number) => {
  const { data, error } = await supabase
    .from('high_scores')
    .upsert(
      {
        wallet_address: walletAddress,
        score: score
      },
      {
        onConflict: 'wallet_address',
        ignoreDuplicates: false
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getHighScore = async (walletAddress: string) => {
  const { data, error } = await supabase
    .from('high_scores')
    .select('score')
    .eq('wallet_address', walletAddress)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  return data?.score || 0;
};

export const getLeaderboard = async (limit: number = 100): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from('high_scores')
    .select(`
      score,
      users!inner (
        username,
        avatar_url
      )
    `)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  // Assurez-vous que les données sont correctement typées
  return (data as unknown as LeaderboardEntry[]).map(entry => ({
    score: entry.score,
    users: {
      username: entry.users.username,
      avatar_url: entry.users.avatar_url
    }
  }));
}; 

export const getCoins = async (walletAddress: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('coins')
    .eq('wallet_address', walletAddress)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.coins || 0;
};

export const updateCoins = async (walletAddress: string, coins: number) => {
  const { data, error } = await supabase
    .from('users')
    .update({ coins })
    .eq('wallet_address', walletAddress);
  if (error) throw error;
  return data;
}; 