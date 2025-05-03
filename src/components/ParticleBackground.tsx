import React, { useEffect, useState } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
};

export const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 1,
        speed: Math.random() * 15 + 10,
        opacity: Math.random() * 0.3 + 0.05
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.speed}s`,
          }}
        />
      ))}
    </div>
  );
};