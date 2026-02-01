import { useState, useEffect, useCallback } from 'react';
import { Button } from 'react95';
import soundManager from '../../utils/sounds';

// Difficulty presets
const DIFFICULTIES = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
};

// Cell states
const CELL_STATE = {
  HIDDEN: 'hidden',
  REVEALED: 'revealed',
  FLAGGED: 'flagged'
};

// Game states
const GAME_STATE = {
  READY: 'ready',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

const Minesweeper = () => {
  const [difficulty, setDifficulty] = useState('beginner');
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState(GAME_STATE.READY);
  const [mineCount, setMineCount] = useState(DIFFICULTIES.beginner.mines);
  const [flagCount, setFlagCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Initialize board
  const initBoard = useCallback(() => {
    const { rows, cols } = DIFFICULTIES[difficulty];
    const newBoard = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          state: CELL_STATE.HIDDEN,
          adjacentMines: 0
        });
      }
      newBoard.push(row);
    }

    return newBoard;
  }, [difficulty]);

  // Place mines (after first click to ensure first click is safe)
  const placeMines = useCallback((board, safeRow, safeCol) => {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Don't place mine on safe cell or adjacent cells
      const isSafeZone = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;

      if (!newBoard[r][c].isMine && !isSafeZone) {
        newBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].adjacentMines = count;
        }
      }
    }

    return newBoard;
  }, [difficulty]);

  // Start new game
  const newGame = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setBoard(initBoard());
    setGameState(GAME_STATE.READY);
    setMineCount(DIFFICULTIES[difficulty].mines);
    setFlagCount(0);
    setTimer(0);
    soundManager.click();
  }, [difficulty, initBoard, timerInterval]);

  // Initialize on mount or difficulty change
  useEffect(() => {
    newGame();
  }, [difficulty]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Reveal cell
  const revealCell = useCallback((row, col) => {
    if (gameState === GAME_STATE.WON || gameState === GAME_STATE.LOST) return;

    let currentBoard = board;

    // First click - place mines
    if (gameState === GAME_STATE.READY) {
      currentBoard = placeMines(board, row, col);
      setGameState(GAME_STATE.PLAYING);
      const interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      setTimerInterval(interval);
    }

    const cell = currentBoard[row][col];
    if (cell.state !== CELL_STATE.HIDDEN) return;

    soundManager.click();

    // Hit a mine
    if (cell.isMine) {
      soundManager.error();
      setGameState(GAME_STATE.LOST);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // Reveal all mines
      const newBoard = currentBoard.map(r =>
        r.map(c => ({
          ...c,
          state: c.isMine ? CELL_STATE.REVEALED : c.state
        }))
      );
      setBoard(newBoard);
      return;
    }

    // Reveal cells recursively
    const reveal = (b, r, c) => {
      const { rows, cols } = DIFFICULTIES[difficulty];
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if (b[r][c].state !== CELL_STATE.HIDDEN) return;

      b[r][c] = { ...b[r][c], state: CELL_STATE.REVEALED };

      if (b[r][c].adjacentMines === 0 && !b[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
              reveal(b, r + dr, c + dc);
            }
          }
        }
      }
    };

    const newBoard = currentBoard.map(r => r.map(c => ({ ...c })));
    reveal(newBoard, row, col);
    setBoard(newBoard);

    // Check win condition
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    let hiddenCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newBoard[r][c].state === CELL_STATE.HIDDEN || newBoard[r][c].state === CELL_STATE.FLAGGED) {
          hiddenCount++;
        }
      }
    }

    if (hiddenCount === mines) {
      soundManager.notification();
      setGameState(GAME_STATE.WON);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [board, gameState, placeMines, difficulty, timerInterval]);

  // Toggle flag
  const toggleFlag = useCallback((e, row, col) => {
    e.preventDefault();
    if (gameState === GAME_STATE.WON || gameState === GAME_STATE.LOST) return;
    if (gameState === GAME_STATE.READY) return;

    const cell = board[row][col];
    if (cell.state === CELL_STATE.REVEALED) return;

    soundManager.click();

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    if (cell.state === CELL_STATE.HIDDEN) {
      newBoard[row][col].state = CELL_STATE.FLAGGED;
      setFlagCount(f => f + 1);
    } else {
      newBoard[row][col].state = CELL_STATE.HIDDEN;
      setFlagCount(f => f - 1);
    }
    setBoard(newBoard);
  }, [board, gameState]);

  // Get cell display
  const getCellContent = (cell) => {
    if (cell.state === CELL_STATE.FLAGGED) return '🚩';
    if (cell.state === CELL_STATE.HIDDEN) return '';
    if (cell.isMine) return '💣';
    if (cell.adjacentMines === 0) return '';
    return cell.adjacentMines;
  };

  // Get cell color based on adjacent mines
  const getNumberColor = (num) => {
    const colors = ['', '#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
    return colors[num] || '#000';
  };

  const { rows, cols } = DIFFICULTIES[difficulty];
  const cellSize = difficulty === 'expert' ? 18 : 24;

  return (
    <div style={{
      padding: '4px',
      backgroundColor: '#c0c0c0',
      userSelect: 'none'
    }}>
      {/* Menu bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '4px 8px',
        marginBottom: '4px',
        fontSize: '12px'
      }}>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ fontSize: '11px' }}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Status bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 8px',
        backgroundColor: '#c0c0c0',
        border: '2px inset #808080',
        marginBottom: '4px'
      }}>
        {/* Mine counter */}
        <div style={{
          backgroundColor: '#000',
          color: '#ff0000',
          fontFamily: 'Courier New, monospace',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '2px 6px',
          minWidth: '50px',
          textAlign: 'center'
        }}>
          {String(Math.max(0, mineCount - flagCount)).padStart(3, '0')}
        </div>

        {/* Reset button */}
        <Button
          onClick={newGame}
          style={{
            width: '30px',
            height: '30px',
            padding: 0,
            fontSize: '18px'
          }}
        >
          {gameState === GAME_STATE.WON ? '😎' : gameState === GAME_STATE.LOST ? '😵' : '🙂'}
        </Button>

        {/* Timer */}
        <div style={{
          backgroundColor: '#000',
          color: '#ff0000',
          fontFamily: 'Courier New, monospace',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '2px 6px',
          minWidth: '50px',
          textAlign: 'center'
        }}>
          {String(Math.min(999, timer)).padStart(3, '0')}
        </div>
      </div>

      {/* Game board */}
      <div style={{
        border: '3px inset #808080',
        display: 'inline-block',
        backgroundColor: '#c0c0c0'
      }}>
        {board.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => (
              <div
                key={c}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  border: cell.state === CELL_STATE.REVEALED
                    ? '1px solid #808080'
                    : '2px outset #fff',
                  backgroundColor: cell.state === CELL_STATE.REVEALED
                    ? (cell.isMine && gameState === GAME_STATE.LOST ? '#ff0000' : '#c0c0c0')
                    : '#c0c0c0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: difficulty === 'expert' ? '11px' : '14px',
                  fontWeight: 'bold',
                  color: cell.state === CELL_STATE.REVEALED && !cell.isMine
                    ? getNumberColor(cell.adjacentMines)
                    : '#000'
                }}
              >
                {getCellContent(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Game over message */}
      {(gameState === GAME_STATE.WON || gameState === GAME_STATE.LOST) && (
        <div style={{
          textAlign: 'center',
          padding: '8px',
          fontWeight: 'bold',
          color: gameState === GAME_STATE.WON ? '#008000' : '#ff0000'
        }}>
          {gameState === GAME_STATE.WON ? 'Congratulations! You Win!' : 'Game Over!'}
        </div>
      )}
    </div>
  );
};

export default Minesweeper;
