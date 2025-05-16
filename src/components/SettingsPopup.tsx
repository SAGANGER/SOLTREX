import React, { useState, useEffect } from 'react';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  onSoundChange: (sound: SoundSetting) => void;
  onXLinked?: () => void;
}

const languageOptions: { code: string; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'ro', label: 'Română' },
  { code: 'ru', label: 'Русский' },
  { code: 'sv', label: 'Svenska' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'uk', label: 'Українська' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
];

type SoundSetting = 'on' | 'off';
type GraphicsQuality = 'low' | 'medium' | 'high';
type NotificationSetting = 'enable' | 'disable';
type ControlSetting = 'space' | 'arrow' | 'click';

export const SettingsPopup: React.FC<SettingsPopupProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  onSoundChange,
  onXLinked,
}) => {
  const [sound, setSound] = useState<SoundSetting>('on');
  const [graphics, setGraphics] = useState<GraphicsQuality>('medium');
  const [notifications, setNotifications] = useState<NotificationSetting>('enable');
  const [controls, setControls] = useState<ControlSetting[]>(['click']);
  const [activeControl, setActiveControl] = useState<ControlSetting>('click');
  const [showAddControl, setShowAddControl] = useState(false);
  const [isXLinked, setIsXLinked] = useState(false);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSound = localStorage.getItem('sound') as SoundSetting;
    const savedGraphics = localStorage.getItem('graphics') as GraphicsQuality;
    const savedNotifications = localStorage.getItem('notifications') as NotificationSetting;
    const savedControls = localStorage.getItem('controls');
    const savedActiveControl = localStorage.getItem('activeControl') as ControlSetting;

    if (savedSound) setSound(savedSound);
    if (savedGraphics) setGraphics(savedGraphics);
    if (savedNotifications) setNotifications(savedNotifications);
    if (savedControls) {
      try {
        const parsedControls = JSON.parse(savedControls) as ControlSetting[];
        setControls(parsedControls);
      } catch (e) {
        setControls(['click']);
      }
    }
    if (savedActiveControl) {
      setActiveControl(savedActiveControl);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('sound', sound);
    localStorage.setItem('graphics', graphics);
    localStorage.setItem('notifications', notifications);
    localStorage.setItem('controls', JSON.stringify(controls));
    localStorage.setItem('activeControl', activeControl);
  }, [sound, graphics, notifications, controls, activeControl]);

  const handleSoundChange = (newSound: SoundSetting) => {
    setSound(newSound);
    onSoundChange(newSound);
    if (newSound === 'on') {
      const audio = new Audio('/sounds/click.mp3');
      audio.play().catch(() => {});
    }
  };

  const handleGraphicsChange = (newGraphics: GraphicsQuality) => {
    setGraphics(newGraphics);
    const canvas = document.querySelector('canvas');
    if (canvas) {
      switch (newGraphics) {
        case 'low':
          canvas.style.filter = 'blur(1px)';
          break;
        case 'medium':
          canvas.style.filter = 'none';
          break;
        case 'high':
          canvas.style.filter = 'brightness(1.1) contrast(1.1)';
          break;
      }
    }
  };

  const handleNotificationsChange = (newNotifications: NotificationSetting) => {
    setNotifications(newNotifications);
    if (newNotifications === 'enable') {
      if (Notification.permission === 'granted') {
        new Notification('Notifications enabled!');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  const handleControlChange = (newControl: ControlSetting) => {
    if (controls.includes(newControl)) {
      // If control is already selected, make it active
      setActiveControl(newControl);
    } else if (controls.length < 3) {
      // If less than 3 controls are selected, add the new one
      setControls([...controls, newControl]);
      setActiveControl(newControl);
    }
  };

  const handleAddControl = () => {
    setShowAddControl(true);
  };

  const handleRemoveControl = (controlToRemove: ControlSetting) => {
    if (controlToRemove === 'click') return; // Prevent removing the default click control
    setControls(controls.filter(c => c !== controlToRemove));
    if (activeControl === controlToRemove) {
      setActiveControl('click'); // Switch to click if removing the active control
    }
  };

  const handleLinkX = () => {
    console.log('handleLinkX called');
    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_TWITTER_CALLBACK_URL;
    
    console.log('Twitter Client ID:', clientId);
    console.log('Twitter Callback URL:', redirectUri);
    
    if (!clientId || !redirectUri) {
      console.error('Twitter configuration is missing');
      return;
    }

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.read%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;
    
    console.log('Opening auth URL:', authUrl);
    window.open(authUrl, '_blank');
    // Simule la réussite après 2s
    setTimeout(() => {
      setIsXLinked(true);
      // Appelle le callback pour la récompense
      if (typeof onXLinked === 'function') onXLinked();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-space-light/90 p-6 rounded-xl border border-space-accent/20 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-space-text-light">Settings</h2>
          <button
            onClick={onClose}
            className="text-space-text-light hover:text-space-accent transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <div>
            <label className="block text-sm font-medium text-space-text-light mb-2">
              Language
            </label>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-space-dark/80 border border-space-accent/20 rounded-lg px-4 py-2 text-space-text-light focus:outline-none focus:ring-2 focus:ring-space-accent"
            >
              {languageOptions.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Settings */}
          <div>
            <label className="block text-sm font-medium text-space-text-light mb-2">
              Sound Effects
            </label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleSoundChange('on')}
                className={`flex-1 py-2 px-4 rounded-lg border border-space-accent/20 text-space-text-light transition-colors ${
                  sound === 'on' ? 'bg-space-accent' : 'bg-space-dark/80 hover:bg-space-dark/90'
                }`}
              >
                On
              </button>
              <button 
                onClick={() => handleSoundChange('off')}
                className={`flex-1 py-2 px-4 rounded-lg border border-space-accent/20 text-space-text-light transition-colors ${
                  sound === 'off' ? 'bg-space-accent' : 'bg-space-dark/80 hover:bg-space-dark/90'
                }`}
              >
                Off
              </button>
            </div>
          </div>

          {/* Graphics Quality */}
          <div>
            <label className="block text-sm font-medium text-space-text-light mb-2">
              Graphics Quality
            </label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleGraphicsChange('low')}
                className={`flex-1 py-2 px-4 rounded-lg border border-space-accent/20 text-space-text-light transition-colors ${
                  graphics === 'low' ? 'bg-space-accent' : 'bg-space-dark/80 hover:bg-space-dark/90'
                }`}
              >
                Low
              </button>
              <button 
                onClick={() => handleGraphicsChange('medium')}
                className={`flex-1 py-2 px-4 rounded-lg border border-space-accent/20 text-space-text-light transition-colors ${
                  graphics === 'medium' ? 'bg-space-accent' : 'bg-space-dark/80 hover:bg-space-dark/90'
                }`}
              >
                Medium
              </button>
              <button 
                onClick={() => handleGraphicsChange('high')}
                className={`flex-1 py-2 px-4 rounded-lg border border-space-accent/20 text-space-text-light transition-colors ${
                  graphics === 'high' ? 'bg-space-accent' : 'bg-space-dark/80 hover:bg-space-dark/90'
                }`}
              >
                High
              </button>
            </div>
          </div>

          {/* Notifications */}
          

          {/* Controls */}
          

          {/* Compte X (Twitter) */}
          
        </div>
      </div>
    </div>
  );
};
