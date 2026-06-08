import React, { useState, useEffect, useRef } from "react";
import { Smile, RefreshCw, X, Play, RotateCcw } from "lucide-react";
import { hiveAudio } from "../utils/audio";

import { translateUI } from "../translations";

interface MinesweeperProps {
  onClose: () => void;
  siteLanguage?: string;
}

type Cell = {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export function Minesweeper({ onClose, siteLanguage = "NL" }: MinesweeperProps) {
  const t = (key: string) => {
    return translateUI(siteLanguage, key);
  };

  const [activeTab, setActiveTab ] = useState<"minesweeper" | "tictactoe" | "snake" | "memory">("minesweeper");

  // ==========================================
  // 💣 MINESWEEPER STATE & LOGIC
  // ==========================================
  const [gridSize, setGridSize] = useState({ rows: 9, cols: 9, minesCount: 10 });
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [minesweeperStarted, setMinesweeperStarted] = useState(false);
  const [minesweeperGameOver, setMinesweeperGameOver] = useState(false);
  const [minesweeperWin, setMinesweeperWin] = useState(false);
  const [minesweeperTimer, setMinesweeperTimer] = useState(0);
  const [minesLeft, setMinesLeft] = useState(10);
  const [faceEmoji, setFaceEmoji] = useState("😀");
  const [isFlagMode, setIsFlagMode] = useState(false);

  const minesTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initMinesweeper = () => {
    const { rows, cols, minesCount } = gridSize;
    let newGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }

    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (newGrid[nr][nc].isMine) count++;
            }
          }
        }
        newGrid[r][c].neighborMines = count;
      }
    }

    setGrid(newGrid);
    setMinesweeperStarted(false);
    setMinesweeperGameOver(false);
    setMinesweeperWin(false);
    setMinesweeperTimer(0);
    setMinesLeft(minesCount);
    setFaceEmoji("😀");
    stopMinesTimer();
  };

  useEffect(() => {
    initMinesweeper();
    return () => stopMinesTimer();
  }, [gridSize]);

  useEffect(() => {
    if (minesweeperStarted && !minesweeperGameOver && !minesweeperWin) {
      minesTimerRef.current = setInterval(() => {
        setMinesweeperTimer((t) => (t >= 999 ? 999 : t + 1));
      }, 1000);
    } else {
      stopMinesTimer();
    }
    return () => stopMinesTimer();
  }, [minesweeperStarted, minesweeperGameOver, minesweeperWin]);

  const stopMinesTimer = () => {
    if (minesTimerRef.current) {
      clearInterval(minesTimerRef.current);
      minesTimerRef.current = null;
    }
  };

  const revealCell = (r: number, c: number) => {
    if (minesweeperGameOver || minesweeperWin) return;
    const currentCell = grid[r][c];
    if (currentCell.isRevealed || currentCell.isFlagged) return;

    if (!minesweeperStarted) {
      setMinesweeperStarted(true);
    }

    setFaceEmoji("😮");
    setTimeout(() => {
      if (!minesweeperGameOver && !minesweeperWin) setFaceEmoji("😀");
    }, 150);

    const nextGrid = [...grid.map((row) => [...row])];

    if (currentCell.isMine) {
      revealAllMines(nextGrid, r, c);
      setMinesweeperGameOver(true);
      setFaceEmoji("😵");
      hiveAudio.playNudge(0.4);
      return;
    }

    hiveAudio.playNotification();
    floodReveal(nextGrid, r, c);
    setGrid(nextGrid);
    checkMinesWin(nextGrid);
  };

  const floodReveal = (g: Cell[][], r: number, c: number) => {
    const rows = g.length;
    const cols = g[0].length;
    const stack: [number, number][] = [[r, c]];

    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      const cell = g[currR][currC];
      if (cell.isRevealed) continue;
      
      cell.isRevealed = true;

      if (cell.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = g[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isMine && !neighbor.isFlagged) {
                stack.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  };

  const revealAllMines = (g: Cell[][], clickedR: number, clickedC: number) => {
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g[0].length; c++) {
        if (g[r][c].isMine) {
          g[r][c].isRevealed = true;
        }
      }
    }
    setGrid(g);
  };

  const checkMinesWin = (g: Cell[][]) => {
    let unrevealedSafeCount = 0;
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g[0].length; c++) {
        const cell = g[r][c];
        if (!cell.isMine && !cell.isRevealed) {
          unrevealedSafeCount++;
        }
      }
    }

    if (unrevealedSafeCount === 0) {
      setMinesweeperWin(true);
      setFaceEmoji("😎");
      hiveAudio.playCrazyWink();
      const finalGrid = g.map((row) =>
        row.map((cell) => (cell.isMine ? { ...cell, isFlagged: true } : cell))
      );
      setGrid(finalGrid);
      setMinesLeft(0);
    }
  };

  const toggleFlag = (r: number, c: number) => {
    if (minesweeperGameOver || minesweeperWin) return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    hiveAudio.playNotification();
    const nextGrid = [...grid.map((row) => [...row])];
    const isNowFlagged = !cell.isFlagged;
    nextGrid[r][c].isFlagged = isNowFlagged;

    setGrid(nextGrid);
    setMinesLeft((prev) => (isNowFlagged ? prev - 1 : prev + 1));
  };

  const handleCellClick = (r: number, c: number) => {
    if (isFlagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  const getNumberColorClass = (n: number) => {
    switch (n) {
      case 1: return "text-blue-600 font-bold";
      case 2: return "text-green-600 font-bold";
      case 3: return "text-red-600 font-bold";
      case 4: return "text-purple-800 font-bold";
      case 5: return "text-red-800 font-bold";
      case 6: return "text-cyan-700 font-bold";
      case 7: return "text-black font-bold";
      case 8: return "text-gray-600 font-bold";
      default: return "";
    }
  };

  // ==========================================
  // ❌ TIC-TAC-TOE STATE & LOGIC
  // ==========================================
  const [tttBoard, setTttBoard] = useState<string[]>(Array(9).fill(""));
  const [tttWinner, setTttWinner] = useState<string | null>(null); // "X", "O", "TIE"
  const [tttTurn, setTttTurn] = useState<"player" | "bot">("player");
  const [tttStatus, setTttStatus] = useState("Jouw beurt! Zet een X.");

  const tttWinningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const resetTicTacToe = () => {
    setTttBoard(Array(9).fill(""));
    setTttWinner(null);
    setTttTurn("player");
    setTttStatus("Jouw beurt! Zet een X.");
  };

  const checkWinner = (board: string[]): string | null => {
    for (const combo of tttWinningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every(cell => cell !== "")) return "TIE";
    return null;
  };

  const handleTttClick = (index: number) => {
    if (tttBoard[index] !== "" || tttWinner || tttTurn !== "player") return;

    hiveAudio.playNotification();
    const newBoard = [...tttBoard];
    newBoard[index] = "X";
    setTttBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setTttWinner(winner);
      if (winner === "X") {
        setTttStatus("🎉 Je hebt gewonnen! Te gek!");
        hiveAudio.playCrazyWink();
      } else {
        setTttStatus("🤝 Gelijkspel! Nog een potje?");
      }
      return;
    }

    setTttTurn("bot");
    setTttStatus("🤖 Buzzi Bot denkt na...");

    // Bot response delay
    setTimeout(() => {
      makeBotMove(newBoard);
    }, 600);
  };

  const makeBotMove = (currentBoard: string[]) => {
    const updatedBoard = [...currentBoard];
    
    // 1. Can bot win?
    for (const combo of tttWinningCombos) {
      const [a, b, c] = combo;
      const vals = [updatedBoard[a], updatedBoard[b], updatedBoard[c]];
      const oCount = vals.filter(v => v === "O").length;
      const emptyCount = vals.filter(v => v === "").length;
      if (oCount === 2 && emptyCount === 1) {
        const emptyIdx = combo[vals.indexOf("")];
        updatedBoard[emptyIdx] = "O";
        triggerBotFinish(updatedBoard);
        return;
      }
    }

    // 2. Can bot block player win?
    for (const combo of tttWinningCombos) {
      const [a, b, c] = combo;
      const vals = [updatedBoard[a], updatedBoard[b], updatedBoard[c]];
      const xCount = vals.filter(v => v === "X").length;
      const emptyCount = vals.filter(v => v === "").length;
      if (xCount === 2 && emptyCount === 1) {
        const emptyIdx = combo[vals.indexOf("")];
        updatedBoard[emptyIdx] = "O";
        triggerBotFinish(updatedBoard);
        return;
      }
    }

    // 3. Take center if available
    if (updatedBoard[4] === "") {
      updatedBoard[4] = "O";
      triggerBotFinish(updatedBoard);
      return;
    }

    // 4. Random move
    const emptyIndices = updatedBoard.map((val, idx) => val === "" ? idx : null).filter(val => val !== null) as number[];
    if (emptyIndices.length > 0) {
      const randIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      updatedBoard[randIdx] = "O";
    }

    triggerBotFinish(updatedBoard);
  };

  const triggerBotFinish = (finalBoard: string[]) => {
    setTttBoard(finalBoard);
    hiveAudio.playNotification();

    const winner = checkWinner(finalBoard);
    if (winner) {
      setTttWinner(winner);
      if (winner === "O") {
        setTttStatus("🤖 Oef... Buzzi Bot wint dit keer!");
        hiveAudio.playNudge(0.5);
      } else {
        setTttStatus("🤝 Gelijkspel! Wel spannend.");
      }
      setTttTurn("player");
      return;
    }

    setTttTurn("player");
    setTttStatus("Jouw beurt! Zet een X.");
  };

  // ==========================================
  // 🐍 SNAKE STATE & LOGIC
  // ==========================================
  const [snake, setSnake] = useState<{r: number, c: number}[]>([
    { r: 7, c: 7 },
    { r: 7, c: 8 },
    { r: 7, c: 9 }
  ]);
  const [food, setFood] = useState<{r: number, c: number}>({ r: 4, c: 4 });
  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("LEFT");
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeAlive, setSnakeAlive] = useState(true);
  const [snakeActive, setSnakeActive] = useState(false);

  const snakeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDirectionRef = useRef(direction);

  useEffect(() => {
    currentDirectionRef.current = direction;
  }, [direction]);

  const initSnake = () => {
    setSnake([
      { r: 7, c: 7 },
      { r: 7, c: 8 },
      { r: 7, c: 9 }
    ]);
    setFood({ r: 3, c: 4 });
    setDirection("LEFT");
    setSnakeScore(0);
    setSnakeAlive(true);
    setSnakeActive(false);
  };

  const startSnake = () => {
    setSnakeActive(true);
    hiveAudio.playNotification();
  };

  // Game Tic tick handler
  useEffect(() => {
    if (!snakeActive || !snakeAlive) return;

    snakeTimerRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const dir = currentDirectionRef.current;

        if (dir === "UP") head.r -= 1;
        else if (dir === "DOWN") head.r += 1;
        else if (dir === "LEFT") head.c -= 3; // larger steps for easy layout grid columns
        else if (dir === "RIGHT") head.c += 1; // standard
        
        // Custom wrap or boundary collision checks
        const colsBound = 15;
        const rowsBound = 12;

        // Custom step offsets normalized to simplify
        let nextR = head.r;
        let nextC = head.c;

        if (dir === "UP") { nextR = head.r; nextC = head.c; }
        else if (dir === "DOWN") { nextR = head.r; nextC = head.c; }
        else if (dir === "LEFT") { nextR = head.r; nextC = head.c - 1; } // adjust stepping
        else if (dir === "RIGHT") { nextR = head.r; nextC = head.c + 1; }

        let adjustedHead = { r: head.r, c: head.c };
        if (dir === "UP") adjustedHead = { r: prevSnake[0].r - 1, c: prevSnake[0].c };
        else if (dir === "DOWN") adjustedHead = { r: prevSnake[0].r + 1, c: prevSnake[0].c };
        else if (dir === "LEFT") adjustedHead = { r: prevSnake[0].r, c: prevSnake[0].c - 1 };
        else if (dir === "RIGHT") adjustedHead = { r: prevSnake[0].r, c: prevSnake[0].c + 1 };

        // Test wall collision
        if (
          adjustedHead.r < 0 || 
          adjustedHead.r >= rowsBound || 
          adjustedHead.c < 0 || 
          adjustedHead.c >= colsBound
        ) {
          setSnakeAlive(false);
          setSnakeActive(false);
          hiveAudio.playNudge(0.6);
          return prevSnake;
        }

        // Test self collision
        for (const segment of prevSnake) {
          if (segment.r === adjustedHead.r && segment.c === adjustedHead.c) {
            setSnakeAlive(false);
            setSnakeActive(false);
            hiveAudio.playNudge(0.6);
            return prevSnake;
          }
        }

        const newSnake = [adjustedHead, ...prevSnake];

        // Eat food check
        if (adjustedHead.r === food.r && adjustedHead.c === food.c) {
          setSnakeScore((s) => s + 10);
          hiveAudio.playNotification();
          
          // Respawn food
          let newFood = { r: 0, c: 0 };
          let onSnake = true;
          while (onSnake) {
            newFood = {
              r: Math.floor(Math.random() * rowsBound),
              c: Math.floor(Math.random() * colsBound)
            };
            onSnake = newSnake.some(s => s.r === newFood.r && s.c === newFood.c);
          }
          setFood(newFood);
        } else {
          newSnake.pop(); // remove tail
        }

        return newSnake;
      });
    }, 180);

    return () => {
      if (snakeTimerRef.current) clearInterval(snakeTimerRef.current);
    };
  }, [snakeActive, snakeAlive, food]);

  const changeSnakeDir = (newDir: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    const opp = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT"
    };
    if (opp[newDir] !== direction) {
      setDirection(newDir);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (activeTab !== "snake") return;
      if (["ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        changeSnakeDir("UP");
      } else if (["ArrowDown", "KeyS"].includes(e.code)) {
        e.preventDefault();
        changeSnakeDir("DOWN");
      } else if (["ArrowLeft", "KeyA"].includes(e.code)) {
        e.preventDefault();
        changeSnakeDir("LEFT");
      } else if (["ArrowRight", "KeyD"].includes(e.code)) {
        e.preventDefault();
        changeSnakeDir("RIGHT");
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [direction, activeTab]);

  // ==========================================
  // 🧠 MEMORY GAME STATE & LOGIC
  // ==========================================
  const MEMORY_EMOJIS = ["🐶", "🐱", "🍕", "🚀", "👑", "🎮", "👾", "💎"];
  const [memoryGrid, setMemoryGrid] = useState<{ id: number; char: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWin, setMemoryWin] = useState(false);

  const initMemoryGame = () => {
    const doubled = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS];
    const shuffled = doubled
      .map((char, idx) => ({ id: idx, char, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    setMemoryGrid(shuffled);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryWin(false);
  };

  useEffect(() => {
    if (activeTab === "memory") {
      initMemoryGame();
    }
  }, [activeTab]);

  const handleCardClick = (index: number) => {
    if (memoryWin || flippedIndices.length >= 2 || memoryGrid[index].isFlipped || memoryGrid[index].isMatched) return;

    hiveAudio.playNotification();
    const nextGrid = [...memoryGrid];
    nextGrid[index].isFlipped = true;
    setMemoryGrid(nextGrid);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      if (nextGrid[firstIdx].char === nextGrid[secondIdx].char) {
        // Match!
        setTimeout(() => {
          const matchedGrid = nextGrid.map((card, idx) => {
            if (idx === firstIdx || idx === secondIdx) {
              return { ...card, isMatched: true };
            }
            return card;
          });
          setMemoryGrid(matchedGrid);
          setFlippedIndices([]);
          
          const isGameOver = matchedGrid.every(card => card.isMatched);
          if (isGameOver) {
            setMemoryWin(true);
            hiveAudio.playCrazyWink();
          } else {
            hiveAudio.playNotification();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetGrid = nextGrid.map((card, idx) => {
            if (idx === firstIdx || idx === secondIdx) {
              return { ...card, isFlipped: false };
            }
            return card;
          });
          setMemoryGrid(resetGrid);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-sm bg-[#eedcc0] border-4 border-[#1c5c8a] shadow-2xl rounded-md flex flex-col overflow-hidden animate-scale-up">
        
        {/* Retro Header Bar */}
        <div className="bg-gradient-to-r from-[#2178b8] via-[#1c5c8a] to-[#124264] text-white px-3 py-2 flex items-center justify-between border-b-2 border-[#124264] shrink-0 select-none">
          <div className="flex items-center gap-1.5 font-sans font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow">
            🎮 Buzzi Arcade Spellen Center
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-inner cursor-pointer"
            title="Sluiten"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Windows-style XP Tab selector bar */}
        <div className="flex bg-[#cbdcf0] border-b border-gray-300 p-1 shrink-0 overflow-x-auto text-[10.5px]">
          <button
            onClick={() => { hiveAudio.playNotification(); setActiveTab("minesweeper"); }}
            className={`px-3 py-1 mr-1 rounded-t-md font-sans border-t border-x transition-all ${
              activeTab === "minesweeper"
                ? "bg-[#eedcc0] border-[#1c5c8a] font-bold text-[#1c5c8a] md:border-b-transparent"
                : "bg-stone-200 border-transparent text-slate-600 hover:bg-stone-300"
            }`}
          >
            💣 {t("Mijnenveger")}
          </button>
          <button
            onClick={() => { hiveAudio.playNotification(); setActiveTab("tictactoe"); }}
            className={`px-3 py-1 mr-1 rounded-t-md font-sans border-t border-x transition-all ${
              activeTab === "tictactoe"
                ? "bg-[#eedcc0] border-[#1c5c8a] font-bold text-[#1c5c8a]"
                : "bg-stone-200 border-transparent text-slate-600 hover:bg-stone-300"
            }`}
          >
            ❌ Tic-Tac-Toe
          </button>
          <button
            onClick={() => { hiveAudio.playNotification(); setActiveTab("snake"); }}
            className={`px-3 py-1 mr-1 rounded-t-md font-sans border-t border-x transition-all ${
              activeTab === "snake"
                ? "bg-[#eedcc0] border-[#1c5c8a] font-bold text-[#1c5c8a]"
                : "bg-stone-200 border-transparent text-slate-600 hover:bg-stone-300"
            }`}
          >
            🐍 Nokia Snake
          </button>
          <button
            onClick={() => { hiveAudio.playNotification(); setActiveTab("memory"); }}
            className={`px-3 py-1 rounded-t-md font-sans border-t border-x transition-all ${
              activeTab === "memory"
                ? "bg-[#eedcc0] border-[#1c5c8a] font-bold text-[#1c5c8a]"
                : "bg-stone-200 border-transparent text-slate-600 hover:bg-stone-300"
            }`}
          >
            🧠 {t("Memory")}
          </button>
        </div>

        {/* Main scrollable view */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center">
          
          {/* TAB 1: MINESWEEPER */}
          {activeTab === "minesweeper" && (
            <div className="w-full flex flex-col items-center">
              
              {/* Minesweeper Header stats row */}
              <div className="bg-[#cbdcf0] border border-[#a2b5cd] w-fit px-4 py-2 flex items-center justify-between gap-6 rounded-lg shadow-inner mb-4">
                {/* Remainder display digits */}
                <div className="bg-black text-red-500 font-mono text-lg px-2 py-0.5 rounded border border-gray-600 w-12 text-center select-all">
                  {String(Math.max(0, minesLeft)).padStart(3, "0")}
                </div>
                
                {/* Reset smiley trigger */}
                <button
                  type="button"
                  onClick={() => {
                    hiveAudio.playNotification();
                    initMinesweeper();
                  }}
                  className="bg-[#cbdcf0] border-2 border-t-white border-l-white border-r-[#7b7b7b] border-b-[#7b7b7b] hover:bg-slate-200 active:border-t-[#7b7b7b] active:border-l-[#7b7b7b] active:border-r-white active:border-b-white p-1 rounded transition-all cursor-pointer text-xl flex items-center justify-center shadow-sm shrink-0"
                >
                  {faceEmoji}
                </button>

                {/* Duration timer */}
                <div className="bg-black text-red-500 font-mono text-lg px-2 py-0.5 rounded border border-gray-600 w-12 text-center">
                  {String(minesweeperTimer).padStart(3, "0")}
                </div>
              </div>

              {/* Grid cell matrix */}
              <div className="border-4 border-[#7b7b7b] shadow-inner p-1.5 bg-[#a3a3a3]">
                <div 
                  className="grid gap-[1px]"
                  style={{ gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))` }}
                >
                  {grid.map((row) =>
                    row.map((cell) => {
                      let cellStyle = "w-7 h-7 flex items-center justify-center text-xs font-bold transition-all select-none focus:outline-none ";
                      let cellContent = "";

                      if (cell.isRevealed) {
                        cellStyle += "bg-[#bdbdbd] border border-[#7b7b7b] ";
                        if (cell.isMine) {
                          cellContent = "💣";
                          cellStyle += "bg-red-500/70 ";
                        } else if (cell.neighborMines > 0) {
                          cellContent = String(cell.neighborMines);
                        }
                      } else {
                        cellStyle += "bg-[#bdbdbd] border-3 border-t-white border-l-white border-r-[#7b7b7b] border-b-[#7b7b7b] hover:bg-[#d0d0d0] ";
                        if (cell.isFlagged) {
                          cellContent = "🚩";
                        }
                      }

                      return (
                        <button
                          key={`${cell.r}-${cell.c}`}
                          type="button"
                          onClick={() => handleCellClick(cell.r, cell.c)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            toggleFlag(cell.r, cell.c);
                          }}
                          className={cellStyle}
                        >
                          <span className={cell.isRevealed && !cell.isMine ? getNumberColorClass(cell.neighborMines) : "leading-none"}>
                            {cellContent}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Status block warnings */}
              {minesweeperGameOver && (
                <div className="w-full mt-3 p-2 bg-red-100 border border-red-300 text-red-950 text-center font-bold text-[11px] rounded-lg animate-bounce leading-relaxed">
                  💥 BOEM! Je hebt een mijn geraakt! <br/>
                  <span className="text-[9.5px] font-normal text-red-800">Klik op de smiley 😀 om opnieuw te proberen.</span>
                </div>
              )}

              {minesweeperWin && (
                <div className="w-full mt-3 p-2 bg-emerald-100 border border-emerald-300 text-emerald-950 text-center font-bold text-[11px] rounded-lg animate-bounce leading-relaxed">
                  🎉 SUPER! Je hebt de Mijnenveger overleefd! <br/>
                  <span className="text-[9.5px] font-normal text-emerald-800">Gefeliciteerd op het Buzzi Netwerk! 😎</span>
                </div>
              )}

              {/* Touch Helper Option */}
              <div className="w-full mt-4 bg-white/40 border border-[#bad0e3] rounded-xl p-2 flex items-center justify-between gap-1 shrink-0">
                <span className="text-[10px] text-[#1c5c8a] font-bold">
                  {isFlagMode ? "Vlag plaatsen actief 🚩" : "Normaal graven ⛏️"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    hiveAudio.playNotification();
                    setIsFlagMode(!isFlagMode);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all border ${
                    isFlagMode 
                      ? "bg-red-500 text-white border-red-700 shadow-inner" 
                      : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-sm"
                  }`}
                >
                  🚩 Vlag Modus
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: TIC-TAC-TOE */}
          {activeTab === "tictactoe" && (
            <div className="w-full flex flex-col items-center">
              <div className="bg-[#cbdcf0] border border-[#a2b5cd] px-4 py-2 w-full text-center rounded-lg shadow-inner mb-4 text-[#1c5c8a] font-bold text-xs">
                {tttStatus}
              </div>

              {/* Grid 3x3 */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-[#7b7b7b] rounded-lg border-2 border-stone-800 shadow-md">
                {tttBoard.map((cell, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTttClick(idx)}
                    className="w-20 h-20 bg-[#ececec] border-4 border-t-white border-l-white border-r-stone-400 border-b-stone-400 hover:bg-stone-100 flex items-center justify-center font-sans font-black text-3xl text-stone-800 select-none focus:outline-none transition-all active:border-inner"
                  >
                    <span className={cell === "X" ? "text-indigo-600" : "text-red-500"}>
                      {cell}
                    </span>
                  </button>
                ))}
              </div>

              {/* Clear button */}
              <button
                onClick={() => {
                  hiveAudio.playNotification();
                  resetTicTacToe();
                }}
                className="mt-4 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Opnieuw Beginnen</span>
              </button>
            </div>
          )}

          {/* TAB 3: NOKIA SNAKE */}
          {activeTab === "snake" && (
            <div className="w-full flex flex-col items-center">
              
              <div className="bg-stone-950 border-4 border-[#7b7b7b] p-1 shadow-inner flex flex-col items-center">
                {/* Top header stats bar */}
                <div className="w-full px-2 py-0.5 bg-green-500 text-xs text-stone-950 font-black font-mono flex items-center justify-between mb-1 select-none">
                  <span>PUNTEN: {snakeScore}</span>
                  <span>{snakeAlive ? (snakeActive ? "🏃 REN!" : "⏸️ GESTOPT") : "💀 CRASH!"}</span>
                </div>

                {/* Snake Grid display */}
                <div className="grid grid-cols-15 gap-[1px] bg-[#8cc63f]/30 border border-[#8cc63f] relative overflow-hidden" style={{ width: "242px", height: "194px" }}>
                  {/* Grid squares rendering overlay */}
                  {Array.from({ length: 12 }).map((_, rIdx) => 
                    Array.from({ length: 15 }).map((_, cIdx) => {
                      const isSnakeSegment = snake.some(s => s.r === rIdx && s.c === cIdx);
                      const isHead = snake[0] && snake[0].r === rIdx && snake[0].c === cIdx;
                      const isFoodSquare = food.r === rIdx && food.c === cIdx;

                      let cellColor = "bg-stone-900/10";
                      if (isHead) cellColor = "bg-stone-950";
                      else if (isSnakeSegment) cellColor = "bg-stone-800";
                      else if (isFoodSquare) cellColor = "bg-red-600 animate-pulse";

                      return (
                        <div 
                          key={`${rIdx}-${cIdx}`} 
                          className={`w-[15px] h-[15px] border-[0.5px] border-emerald-950/5 flex items-center justify-center text-[8px] ${cellColor}`}
                        >
                          {isFoodSquare && "🍎"}
                          {isHead && "👀"}
                        </div>
                      );
                    })
                  )}

                  {/* GameOver Screen overlay */}
                  {!snakeAlive && (
                    <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center font-mono text-[#8cc63f] gap-1 z-10">
                      <div className="text-sm font-black uppercase text-red-400">💀 GAME OVER! 💀</div>
                      <div className="text-[10px]">EIND SCORE: {snakeScore}</div>
                      <button
                        onClick={() => { hiveAudio.playNotification(); initSnake(); }}
                        className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] rounded uppercase select-none transition-all active:scale-95"
                      >
                        Nieuwe Poging
                      </button>
                    </div>
                  )}

                  {/* Ready Screen Overlay */}
                  {snakeAlive && !snakeActive && (
                    <div className="absolute inset-0 bg-stone-950/70 flex flex-col items-center justify-center font-mono text-emerald-300 gap-1 z-10">
                      <div className="text-[11px] text-center px-4">Gebruik pijltoetsen of knoppen links-rechts-boven-onder!</div>
                      <button
                        onClick={startSnake}
                        className="mt-2 text-stone-950 font-black bg-[#8cc63f] px-4 py-1.5 text-xs rounded-xl flex items-center gap-1 hover:scale-105 active:scale-95 transition-all select-none uppercase cursor-pointer shadow border-2 border-green-800"
                      >
                        <Play className="w-3 h-3 fill-stone-950" />
                        <span>Starten</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* D-PAD arrow touch controllers block for amazing device responsiveness! */}
              <div className="mt-3 flex flex-col items-center gap-1 select-none">
                <button
                  type="button"
                  onClick={() => changeSnakeDir("UP")}
                  disabled={!snakeActive || !snakeAlive}
                  className="w-10 h-10 bg-[#cbdcf0] hover:bg-slate-200 disabled:opacity-40 border border-[#a2b5cd] font-black rounded-lg text-[#1c5c8a] flex items-center justify-center focus:outline-none transition-all active:scale-95 cursor-pointer"
                >
                  ▲
                </button>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => changeSnakeDir("LEFT")}
                    disabled={!snakeActive || !snakeAlive}
                    className="w-10 h-10 bg-[#cbdcf0] hover:bg-slate-200 disabled:opacity-40 border border-[#a2b5cd] font-black rounded-lg text-[#1c5c8a] flex items-center justify-center focus:outline-none transition-all active:scale-95 cursor-pointer"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => { hiveAudio.playNotification(); initSnake(); }}
                    className="w-10 h-10 bg-red-100 hover:bg-red-200 border border-red-300 font-bold rounded-lg text-red-600 text-[10px] flex items-center justify-center focus:outline-none transition-all active:scale-95 cursor-pointer"
                    title="Herstarten"
                  >
                    🔄
                  </button>
                  <button
                    type="button"
                    onClick={() => changeSnakeDir("RIGHT")}
                    disabled={!snakeActive || !snakeAlive}
                    className="w-10 h-10 bg-[#cbdcf0] hover:bg-slate-200 disabled:opacity-40 border border-[#a2b5cd] font-black rounded-lg text-[#1c5c8a] flex items-center justify-center focus:outline-none transition-all active:scale-95 cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => changeSnakeDir("DOWN")}
                  disabled={!snakeActive || !snakeAlive}
                  className="w-10 h-10 bg-[#cbdcf0] hover:bg-slate-200 disabled:opacity-40 border border-[#a2b5cd] font-black rounded-lg text-[#1c5c8a] flex items-center justify-center focus:outline-none transition-all active:scale-95 cursor-pointer"
                >
                  ▼
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: RETRO MEMORY */}
          {activeTab === "memory" && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex justify-between items-center text-xs font-bold text-slate-700 mb-3 px-1">
                <span className="bg-sky-100 text-[#1c5c8a] border border-sky-300 rounded px-2 py-0.5 font-mono">Zetten: {memoryMoves}</span>
                {memoryWin ? (
                  <span className="bg-green-100 text-green-800 border border-green-300 rounded px-2 py-0.5 animate-bounce font-black">🥇 Gewonnen! 🎉</span>
                ) : (
                  <button
                    onClick={initMemoryGame}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded px-2 py-0.5 shadow-sm cursor-pointer text-[10px] uppercase font-sans shrink-0"
                  >
                    Herstart
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
                {memoryGrid.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`h-14 rounded-lg flex items-center justify-center text-2xl font-bold transition-all shadow-sm select-none border-2 active:scale-95 cursor-pointer ${
                      card.isFlipped || card.isMatched
                        ? "bg-amber-100 border-amber-400 rotate-y-180"
                        : "bg-gradient-to-br from-[#1c5c8a] to-[#2178b8] border-[#124264] hover:brightness-110"
                    }`}
                  >
                    {(card.isFlipped || card.isMatched) ? card.char : "❓"}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 italic text-center mt-3 max-w-[240px] font-sans">
                Vind alle 8 paren vintage symbolen met zo min mogelijk zetten!
              </div>

              {memoryWin && (
                <button
                  onClick={initMemoryGame}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded px-4 py-2 text-xs uppercase animate-pulse shadow duration-200 cursor-pointer w-full text-center"
                >
                  Nog een keer Spelen! 🔄
                </button>
              )}
            </div>
          )}

        </div>

        {/* Status bar base info section */}
        <div className="px-4 py-2 bg-[#cbdcf0] border-t border-[#bad0e3] flex justify-between items-center text-[10.5px] select-none text-slate-500 shrink-0 font-sans">
          <span>Retro Spellen</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#bdbdbd] border border-[#7b7b7b] hover:bg-white text-slate-800 font-bold active:scale-95 transition-all cursor-pointer shadow-sm text-[10px]"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
}
