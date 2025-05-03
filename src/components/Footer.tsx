import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 md:px-8 mt-auto">
      <div className="container mx-auto flex justify-center">
        <p className="text-space-text/40 text-sm">
          Built on Solana
        </p>
      </div>
    </footer>
  );
};