import { useState, useEffect } from 'react';
import { Button } from 'react95';
import soundManager from '../../utils/sounds';

const TaskManager = ({ windows = [], onCloseWindow, onFocusWindow }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [activeTab, setActiveTab] = useState('applications');

  // Simulate changing CPU and memory usage
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 5);
      setMemoryUsage(Math.floor(Math.random() * 20) + 40);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleEndTask = () => {
    if (selectedTask && onCloseWindow) {
      soundManager.click();
      onCloseWindow(selectedTask);
      setSelectedTask(null);
    }
  };

  const handleSwitchTo = () => {
    if (selectedTask && onFocusWindow) {
      soundManager.click();
      onFocusWindow(selectedTask);
    }
  };

  const processes = [
    { name: 'Explorer.exe', pid: 1024, cpu: '0%', memory: '4,256 K' },
    { name: 'System', pid: 4, cpu: '0%', memory: '256 K' },
    { name: 'Kernel32.dll', pid: 8, cpu: '0%', memory: '1,024 K' },
    { name: 'User32.dll', pid: 12, cpu: '0%', memory: '512 K' },
    ...windows.map((win, idx) => ({
      name: `${win.title.split(' ')[0]}.exe`,
      pid: 2000 + idx,
      cpu: `${Math.floor(Math.random() * 5)}%`,
      memory: `${Math.floor(Math.random() * 8000) + 1000} K`
    }))
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontSize: '12px'
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #808080',
        backgroundColor: '#c0c0c0'
      }}>
        <button
          onClick={() => {
            soundManager.click();
            setActiveTab('applications');
          }}
          style={{
            padding: '4px 12px',
            border: 'none',
            backgroundColor: activeTab === 'applications' ? '#fff' : '#c0c0c0',
            borderBottom: activeTab === 'applications' ? 'none' : '1px solid #808080',
            cursor: 'pointer',
            fontWeight: activeTab === 'applications' ? 'bold' : 'normal'
          }}
        >
          Applications
        </button>
        <button
          onClick={() => {
            soundManager.click();
            setActiveTab('processes');
          }}
          style={{
            padding: '4px 12px',
            border: 'none',
            backgroundColor: activeTab === 'processes' ? '#fff' : '#c0c0c0',
            borderBottom: activeTab === 'processes' ? 'none' : '1px solid #808080',
            cursor: 'pointer',
            fontWeight: activeTab === 'processes' ? 'bold' : 'normal'
          }}
        >
          Processes
        </button>
        <button
          onClick={() => {
            soundManager.click();
            setActiveTab('performance');
          }}
          style={{
            padding: '4px 12px',
            border: 'none',
            backgroundColor: activeTab === 'performance' ? '#fff' : '#c0c0c0',
            borderBottom: activeTab === 'performance' ? 'none' : '1px solid #808080',
            cursor: 'pointer',
            fontWeight: activeTab === 'performance' ? 'bold' : 'normal'
          }}
        >
          Performance
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {activeTab === 'applications' && (
          <>
            {/* Task List Header */}
            <div style={{
              display: 'flex',
              padding: '4px 8px',
              backgroundColor: '#c0c0c0',
              borderBottom: '1px solid #808080',
              fontWeight: 'bold'
            }}>
              <span style={{ flex: 1 }}>Task</span>
              <span style={{ width: '80px' }}>Status</span>
            </div>

            {/* Task List */}
            <div style={{
              border: '2px inset #808080',
              backgroundColor: '#fff',
              minHeight: '150px'
            }}>
              {windows.length === 0 ? (
                <div style={{ padding: '8px', color: '#808080' }}>
                  No running applications
                </div>
              ) : (
                windows.map(win => (
                  <div
                    key={win.id}
                    onClick={() => {
                      soundManager.select();
                      setSelectedTask(win.id);
                    }}
                    onDoubleClick={handleSwitchTo}
                    style={{
                      padding: '4px 8px',
                      display: 'flex',
                      cursor: 'pointer',
                      backgroundColor: selectedTask === win.id ? '#000080' : 'transparent',
                      color: selectedTask === win.id ? '#fff' : '#000'
                    }}
                  >
                    <span style={{ flex: 1 }}>{win.title}</span>
                    <span style={{ width: '80px' }}>
                      {win.state === 'minimized' ? 'Not Responding' : 'Running'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'processes' && (
          <>
            {/* Process List Header */}
            <div style={{
              display: 'flex',
              padding: '4px 8px',
              backgroundColor: '#c0c0c0',
              borderBottom: '1px solid #808080',
              fontWeight: 'bold'
            }}>
              <span style={{ flex: 1 }}>Image Name</span>
              <span style={{ width: '60px', textAlign: 'right' }}>PID</span>
              <span style={{ width: '60px', textAlign: 'right' }}>CPU</span>
              <span style={{ width: '80px', textAlign: 'right' }}>Mem Usage</span>
            </div>

            {/* Process List */}
            <div style={{
              border: '2px inset #808080',
              backgroundColor: '#fff',
              minHeight: '150px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {processes.map((proc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '2px 8px',
                    display: 'flex',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <span style={{ flex: 1 }}>{proc.name}</span>
                  <span style={{ width: '60px', textAlign: 'right' }}>{proc.pid}</span>
                  <span style={{ width: '60px', textAlign: 'right' }}>{proc.cpu}</span>
                  <span style={{ width: '80px', textAlign: 'right' }}>{proc.memory}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <div style={{ padding: '8px' }}>
            {/* CPU Usage */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>CPU Usage</div>
              <div style={{
                border: '2px inset #808080',
                height: '60px',
                backgroundColor: '#000',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${cpuUsage}%`,
                  backgroundColor: '#00ff00',
                  transition: 'height 0.3s'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#00ff00',
                  fontWeight: 'bold'
                }}>
                  {cpuUsage}%
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Memory Usage</div>
              <div style={{
                border: '2px inset #808080',
                height: '60px',
                backgroundColor: '#000',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${memoryUsage}%`,
                  backgroundColor: '#00ff00',
                  transition: 'height 0.3s'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#00ff00',
                  fontWeight: 'bold'
                }}>
                  {memoryUsage}%
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              backgroundColor: '#f0f0f0',
              border: '1px solid #808080',
              padding: '8px',
              fontSize: '11px'
            }}>
              <div>Total Physical Memory: 64 MB</div>
              <div>Available Physical Memory: {Math.floor(64 * (100 - memoryUsage) / 100)} MB</div>
              <div>Processes: {processes.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      {activeTab === 'applications' && (
        <div style={{
          padding: '8px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          borderTop: '1px solid #808080'
        }}>
          <Button
            onClick={handleEndTask}
            disabled={!selectedTask}
            style={{ width: '80px' }}
          >
            End Task
          </Button>
          <Button
            onClick={handleSwitchTo}
            disabled={!selectedTask}
            style={{ width: '80px' }}
          >
            Switch To
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
