import { useState, useCallback, useEffect } from 'react';
import soundManager from '../utils/sounds';

// Hook for using sound effects in components
const useSound = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sound on first user interaction
  const init = useCallback(() => {
    if (!isInitialized) {
      soundManager.init();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Set volume
  const setVolume = useCallback((value) => {
    soundManager.setVolume(value);
    setVolumeState(value);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  }, []);

  // Set mute state
  const setMute = useCallback((muted) => {
    soundManager.setMute(muted);
    setIsMuted(muted);
  }, []);

  // Sound effect functions
  const playClick = useCallback(() => {
    init();
    soundManager.click();
  }, [init]);

  const playWindowOpen = useCallback(() => {
    init();
    soundManager.windowOpen();
  }, [init]);

  const playWindowClose = useCallback(() => {
    init();
    soundManager.windowClose();
  }, [init]);

  const playMenuOpen = useCallback(() => {
    init();
    soundManager.menuOpen();
  }, [init]);

  const playError = useCallback(() => {
    init();
    soundManager.error();
  }, [init]);

  const playWarning = useCallback(() => {
    init();
    soundManager.warning();
  }, [init]);

  const playNotification = useCallback(() => {
    init();
    soundManager.notification();
  }, [init]);

  const playQuestion = useCallback(() => {
    init();
    soundManager.question();
  }, [init]);

  const playStartup = useCallback(() => {
    init();
    soundManager.startup();
  }, [init]);

  const playShutdown = useCallback(() => {
    init();
    soundManager.shutdown();
  }, [init]);

  const playMinimize = useCallback(() => {
    init();
    soundManager.minimize();
  }, [init]);

  const playMaximize = useCallback(() => {
    init();
    soundManager.maximize();
  }, [init]);

  const playSelect = useCallback(() => {
    init();
    soundManager.select();
  }, [init]);

  const playEmptyTrash = useCallback(() => {
    init();
    soundManager.emptyTrash();
  }, [init]);

  return {
    // State
    isMuted,
    volume,
    isInitialized,

    // Controls
    init,
    setVolume,
    toggleMute,
    setMute,

    // Sound effects
    playClick,
    playWindowOpen,
    playWindowClose,
    playMenuOpen,
    playError,
    playWarning,
    playNotification,
    playQuestion,
    playStartup,
    playShutdown,
    playMinimize,
    playMaximize,
    playSelect,
    playEmptyTrash
  };
};

export default useSound;
