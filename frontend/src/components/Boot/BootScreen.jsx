import { useState, useEffect } from 'react';
import soundManager from '../../utils/sounds';

const BootScreen = ({ onBootComplete }) => {
  const [stage, setStage] = useState(0); // 0: BIOS, 1: Windows Logo, 2: Complete
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Starting Windows 98...');

  const bootSequence = [
    { progress: 0, message: 'Starting Windows 98...', duration: 500 },
    { progress: 20, message: 'Loading system files...', duration: 800 },
    { progress: 40, message: 'Initializing hardware...', duration: 700 },
    { progress: 60, message: 'Loading desktop...', duration: 600 },
    { progress: 80, message: 'Starting services...', duration: 500 },
    { progress: 100, message: 'Ready', duration: 300 },
  ];

  useEffect(() => {
    // BIOS 단계
    const biosTimer = setTimeout(() => {
      setStage(1);
    }, 1000);

    return () => clearTimeout(biosTimer);
  }, []);

  useEffect(() => {
    if (stage !== 1) return;

    let currentStep = 0;

    const runBootSequence = () => {
      if (currentStep >= bootSequence.length) {
        setTimeout(() => {
          setStage(2);
          // Initialize and play startup sound
          soundManager.init();
          soundManager.startup();
          onBootComplete();
        }, 300);
        return;
      }

      const step = bootSequence[currentStep];
      setProgress(step.progress);
      setMessage(step.message);

      setTimeout(() => {
        currentStep++;
        runBootSequence();
      }, step.duration);
    };

    runBootSequence();
  }, [stage, onBootComplete]);

  if (stage === 0) {
    // BIOS 화면
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <div>Phoenix BIOS v4.0 Release 6.0</div>
        <div style={{ marginTop: '10px' }}>Copyright 1985-1998 Phoenix Technologies Ltd.</div>
        <div style={{ marginTop: '20px' }}>Intel Pentium II 400MHz Processor</div>
        <div>Memory Test: 64MB OK</div>
        <div style={{ marginTop: '30px' }}>Starting Windows 98...</div>
      </div>
    );
  }

  if (stage === 1) {
    // Windows 98 로고 화면
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Windows 98 로고 */}
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <img
            src="https://win98icons.alexmeub.com/icons/png/windows-0.png"
            alt="Windows"
            style={{ width: '48px', height: '48px' }}
          />
          <span>Windows <span style={{ color: '#00a8ff' }}>98</span></span>
        </div>

        {/* 브랜딩 */}
        <div style={{
          color: '#c0c0c0',
          fontSize: '18px',
          marginBottom: '60px'
        }}>
          OnePaperHoon.com
        </div>

        {/* 로딩바 */}
        <div style={{
          width: '300px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#222',
            border: '2px solid #555',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#00a8ff',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* 로딩 메시지 */}
        <div style={{
          color: '#fff',
          fontSize: '14px',
          minHeight: '20px'
        }}>
          {message}
        </div>
      </div>
    );
  }

  return null;
};

export default BootScreen;
