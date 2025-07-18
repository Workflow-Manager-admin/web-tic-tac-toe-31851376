import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color theme variables for use in inline styles
 */
const COLORS = {
  primary: "#1976D2",
  secondary: "#C2185B",
  accent: "#FFEB3B",
  // Could be extended for more styling
};

const PLAYER_X = "X";
const PLAYER_O = "O";
const MODES = {
  TWO_PLAYER: "TWO_PLAYER",
  SINGLE_PLAYER: "SINGLE_PLAYER",
};

function getInitialBoard() {
  return Array(9).fill(null);
}

// PUBLIC_INTERFACE
function App() {
  // Game mode
  const [mode, setMode] = useState(MODES.TWO_PLAYER);

  // Board state
  const [board, setBoard] = useState(getInitialBoard());
  // Whose turn is it (always X first)
  const [xIsNext, setXIsNext] = useState(true);
  // Game status message
  const [status, setStatus] = useState("Choose a mode & start the game.");
  // Has the game started or been reset?
  const [gameStarted, setGameStarted] = useState(false);
  // To lock board when finished
  const [gameOver, setGameOver] = useState(false);

  // Score tracking (optional, extendable)
  const [score, setScore] = useState({ X: 0, O: 0, Draw: 0 });

  // Single-player: make computer move
  useEffect(() => {
    if (
      mode === MODES.SINGLE_PLAYER &&
      gameStarted &&
      !gameOver &&
      !xIsNext
    ) {
      // Delay for realism
      const moveTimeout = setTimeout(() => {
        makeAIMove();
      }, 600);
      return () => clearTimeout(moveTimeout);
    }
    // eslint-disable-next-line
  }, [board, xIsNext, mode, gameStarted, gameOver]);

  // PUBLIC_INTERFACE
  function startGame(selectedMode) {
    setMode(selectedMode);
    setBoard(getInitialBoard());
    setGameStarted(true);
    setXIsNext(true);
    setGameOver(false);
    setStatus(`Your move: X${selectedMode===MODES.SINGLE_PLAYER ? " (You)" : ""}`);
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    setBoard(getInitialBoard());
    setGameOver(false);
    setXIsNext(true);
    setStatus(
      `Game reset. ${
        mode === MODES.SINGLE_PLAYER ? "Your move: X (You)" : "X's turn"
      }`
    );
  }

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (!gameStarted || board[idx] || gameOver) return;
    if (mode === MODES.SINGLE_PLAYER && !xIsNext) {
      // Not your turn
      return;
    }
    const newBoard = [...board];
    newBoard[idx] = xIsNext ? PLAYER_X : PLAYER_O;
    setBoard(newBoard);
    handleBoardUpdate(newBoard, !xIsNext);
  }

  // Handles player vs computer move
  function makeAIMove() {
    // Find all empty squares
    const available = board
      .map((val, idx) => (val === null ? idx : null))
      .filter((v) => v !== null);
    if (available.length === 0) return;
    // Simple AI: random move (could implement better algorithm)
    const move = available[Math.floor(Math.random() * available.length)];
    const newBoard = [...board];
    newBoard[move] = PLAYER_O;
    setBoard(newBoard);
    handleBoardUpdate(newBoard, true); // after AI, it's player's turn
  }

  // Updates game state after any move
  function handleBoardUpdate(newBoard, xTurnNext) {
    const winner = calculateWinner(newBoard);
    if (winner) {
      // Someone won
      setStatus(
        mode === MODES.SINGLE_PLAYER
          ? winner === PLAYER_X
            ? "You win! 🎉"
            : "Computer wins! 😞"
          : `Player ${winner} wins! 🎉`
      );
      setGameOver(true);
      setScore((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
    } else if (newBoard.every((cell) => cell !== null)) {
      setStatus("It's a draw!");
      setGameOver(true);
      setScore((prev) => ({
        ...prev,
        Draw: prev.Draw + 1,
      }));
    } else {
      // Continue
      if (mode === MODES.SINGLE_PLAYER) {
        setStatus(
          xTurnNext
            ? "Your move: X (You)"
            : "Computer is thinking..."
        );
      } else {
        setStatus(`${xTurnNext ? "X" : "O"}'s turn`);
      }
      setXIsNext(xTurnNext);
    }
  }

  /**
   * Renders the game board.
   */
  function renderBoard() {
    return (
      <div style={styles.board}>
        {board.map((val, idx) => (
          <button
            key={idx}
            style={{
              ...styles.square,
              color:
                val === PLAYER_X
                  ? COLORS.primary
                  : val === PLAYER_O
                  ? COLORS.secondary
                  : undefined,
              background:
                boardWinnerSquares(board).includes(idx) && gameOver
                  ? COLORS.accent
                  : "#fff",
              boxShadow:
                boardWinnerSquares(board).includes(idx) && gameOver
                  ? `0 0 12px 0 ${COLORS.accent}`
                  : "none",
            }}
            onClick={() => handleSquareClick(idx)}
            aria-label={`cell ${idx + 1}`}
            data-testid={`cell-${idx}`}
            disabled={!!val || !gameStarted || gameOver}
          >
            {val}
          </button>
        ))}
      </div>
    );
  }

  /**
   * Renders score/status (minimal style).
   */
  function renderScoreAndStatus() {
    return (
      <div style={styles.statusArea}>
        <div style={styles.statusMsg}>{status}</div>
        <div style={styles.scores}>
          <span>
            X: <b>{score.X}</b>
          </span>
          <span>
            O: <b>{score.O}</b>
          </span>
          <span>
            Draw: <b>{score.Draw}</b>
          </span>
        </div>
      </div>
    );
  }

  /**
   * Renders game controls (mode selectors, start, restart).
   */
  function renderControls() {
    return (
      <div style={styles.controls}>
        <button
          style={{
            ...styles.button,
            background: mode === MODES.SINGLE_PLAYER ? COLORS.secondary : COLORS.primary,
            color: "#fff",
            marginRight: 12,
          }}
          onClick={() => startGame(MODES.SINGLE_PLAYER)}
          disabled={gameStarted && mode === MODES.SINGLE_PLAYER}
        >
          Single Player
        </button>
        <button
          style={{
            ...styles.button,
            background: mode === MODES.TWO_PLAYER ? COLORS.secondary : COLORS.primary,
            color: "#fff",
          }}
          onClick={() => startGame(MODES.TWO_PLAYER)}
          disabled={gameStarted && mode === MODES.TWO_PLAYER}
        >
          Two Player
        </button>
        <button
          style={{
            ...styles.button,
            background: COLORS.accent,
            color: "#666",
            marginLeft: 16,
            fontWeight: 600,
          }}
          onClick={restartGame}
          disabled={!gameStarted}
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="App" style={styles.appWrap}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span style={{ color: COLORS.primary }}>Tic</span>
          <span style={{ color: COLORS.secondary }}>Tac</span>
          <span style={{ color: COLORS.accent }}>Toe</span>
        </h1>
        <p style={styles.subtitle}>
          {`A minimal web Tic Tac Toe game`}
        </p>
      </header>
      <main style={styles.centerArea}>
        {renderBoard()}
        {renderScoreAndStatus()}
        {renderControls()}
      </main>
      <footer style={styles.footer}>
        <span style={{ color: "#bbb", fontSize: 13 }}>{`© ${new Date().getFullYear()} Minimal Tic Tac Toe`}</span>
      </footer>
    </div>
  );
}

/**
 * Returns winning player symbol (X or O), or null.
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

/**
 * Returns array of winning square indices (to highlight), or [].
 */
function boardWinnerSquares(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return line;
    }
  }
  return [];
}

/**
 * Minimal modern styles for board and controls
 */
const styles = {
  appWrap: {
    minHeight: "100vh",
    minWidth: "100vw",
    background: "#fafbfc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
  },
  header: {
    marginTop: 30,
    textAlign: "center",
    color: "#2a2c2e",
    letterSpacing: 1,
  },
  title: {
    fontWeight: 900,
    fontSize: "2.25rem",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 2,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
  subtitle: {
    fontWeight: 400,
    fontSize: "1.05rem",
    color: "#666",
    margin: "10px 0 0 0",
    letterSpacing: 1,
  },
  centerArea: {
    margin: "auto",
    padding: "16px 0",
    width: "100%",
    maxWidth: 370,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: 440,
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(3,60px)",
    gridTemplateRows: "repeat(3,60px)",
    gap: 7,
    margin: "30px 0 20px 0",
    justifyContent: "center",
    alignItems: "center",
    background: "#eee",
    borderRadius: 14,
    boxShadow: "0 6px 18px 1px #1976D213",
    padding: 12,
  },
  square: {
    width: 60,
    height: 60,
    fontSize: "2.2rem",
    border: "2px solid #e4e8ef",
    borderRadius: 10,
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    outline: "none",
    transition: "background 0.25s, box-shadow 0.3s",
    userSelect: "none",
  },
  statusArea: {
    margin: "12px 0 3px 0",
    textAlign: "center",
  },
  statusMsg: {
    fontWeight: 600,
    fontSize: "1.02rem",
    minHeight: 30,
    marginBottom: 7,
    letterSpacing: 0.2,
    color: "#444",
  },
  scores: {
    fontSize: 14,
    color: "#888",
    display: "flex",
    justifyContent: "center",
    gap: 19,
    marginBottom: 8,
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  button: {
    padding: "9px 20px",
    margin: 0,
    border: "none",
    borderRadius: 7,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 2px 6px rgba(32,32,32,.06)",
    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
  },
  footer: {
    marginTop: "auto",
    marginBottom: 8,
    textAlign: "center",
  },
};

export default App;
