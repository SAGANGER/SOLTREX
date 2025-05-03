import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabase';
import { Copy, Users, X } from 'lucide-react';

interface AffiliationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AffiliationPopup: React.FC<AffiliationPopupProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet();
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchReferralCount = async () => {
      if (!publicKey) return;

      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_address', publicKey.toString());

        if (error) throw error;
        setReferralCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching referral count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchReferralCount();
    }
  }, [isOpen, publicKey]);

  const referralLink = publicKey 
    ? `${window.location.origin}/?ref=${publicKey.toString()}`
    : '';

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-space-dark/95 p-6 rounded-lg border border-space-accent/10 max-w-md w-full mx-4 transform transition-all duration-200 ease-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-space-text-light flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Affiliation Program
          </h2>
          <button
            onClick={onClose}
            className="text-space-text/60 hover:text-space-text-light transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-space-dark/60 p-4 rounded-lg border border-space-accent/10">
            <p className="text-sm text-space-text/60 mb-1">Your Referrals</p>
            <p className="text-2xl font-bold text-space-text-light">
              {isLoading ? '...' : referralCount}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-space-text/60">Your Referral Link</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-space-dark/60 border border-space-accent/10 rounded-lg px-4 py-2 text-space-text-light focus:outline-none focus:ring-2 focus:ring-space-accent"
              />
              <button
                onClick={handleCopy}
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-space-accent hover:bg-space-accent/90 text-white transition-colors"
              >
                {isCopied ? 'Copied!' : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <p className="text-sm text-space-text/60">
            Share your referral link with friends. When they register using your link, they'll be added to your referral count.
          </p>
        </div>
      </div>
    </div>
  );
}; 