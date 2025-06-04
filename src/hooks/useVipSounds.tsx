
import { useEffect, useRef } from 'react';

export const useVipSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playGrandMasterSound = () => {
    try {
      const audioContext = initAudioContext();
      
      // Create a complex celebration sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure first oscillator (main melody)
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator1.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator1.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      oscillator1.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.3); // C6
      
      // Configure second oscillator (harmony)
      oscillator2.type = 'triangle';
      oscillator2.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
      oscillator2.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1); // E4
      oscillator2.frequency.setValueAtTime(392.00, audioContext.currentTime + 0.2); // G4
      oscillator2.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.3); // C5
      
      // Configure gain (volume envelope)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.4);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
      
      // Start and stop oscillators
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.6);
      oscillator2.stop(audioContext.currentTime + 0.6);
      
      console.log('🔊 Grand Master VIP sound played!');
    } catch (error) {
      console.warn('Could not play VIP sound:', error);
    }
  };

  const playVipLevelUpSound = () => {
    try {
      const audioContext = initAudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // C#5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔊 VIP level up sound played!');
    } catch (error) {
      console.warn('Could not play VIP sound:', error);
    }
  };

  useEffect(() => {
    // Cleanup audio context on unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playGrandMasterSound,
    playVipLevelUpSound
  };
};
