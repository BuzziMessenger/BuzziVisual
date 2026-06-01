import React, { useState, useEffect, useRef } from "react";
import { Smile, RefreshCw, X, Shield, Info, HelpCircle } from "lucide-react";
import { hiveAudio } from "../utils/audio";

interface MinesweeperProps {
  onClose: () => void;
}

type Cell = {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export function Minesweeper({ onClose }: MinesweeperProps) {
  const [gridSize, setGridSize] = useState({ rows: 9, cols: 9, minesCount: 10 });
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [timer, setTimer] = useState(0);
  const [minesLeft, setMinesLeft] = useState(10);
  const [faceEmoji, setFaceEmoji] = useState("😀");
  const [isFlagMode, setIsFlagMode] = useState(false); // Mobile flag placing helper toggle

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize/Reset Board
  const initBoard = () => {
    const { rows, cols, minesCount } = gridSize;
    
    // Create empty cells
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

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighboring mines numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].isMine) continue;
        let count = 0;
        // Check 8 directions
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
    setGameStarted(false);
    setGameOver(false);
    setWin(false);
    setTimer(0);
    setMinesLeft(minesCount);
    setFaceEmoji("😀");
  };

  // Run initial setup on mount
  useEffect(() => {
    initBoard();
    return () => stopTimer();
  }, [gridSize]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver && !win) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t >= 999) return 999;
          return t + 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [gameStarted, gameOver, win]);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reveal Cell Logic
  const revealCell = (r: number, c: number) => {
    if (gameOver || win) return;
    const currentCell = grid[r][c];
    if (currentCell.isRevealed || currentCell.isFlagged) return;

    // First click triggers timer and guarantees safety if desired (optional, let's keep it classic and simple)
    if (!gameStarted) {
      setGameStarted(true);
    }

    setFaceEmoji("😮");
    setTimeout(() => {
      if (!gameOver && !win) setFaceEmoji("😀");
    }, 150);

    const nextGrid = [...grid.map((row) => [...row])];

    // Hit a mine!
    if (currentCell.isMine) {
      // Reveal all mines and trigger end
      revealAllMines(nextGrid, r, c);
      setGameOver(true);
      setFaceEmoji("😵");
      hiveAudio.playNudge(0.4); // play retro rattle/exploded sound!
      return;
    }

    // Normal safe move
    hiveAudio.playNotification(); // soft click sound!
    floodReveal(nextGrid, r, c);
    setGrid(nextGrid);
    checkWinCondition(nextGrid);
  };

  // Recurse / flood fill for empty cells
  const floodReveal = (g: Cell[][], r: number, c: number) => {
    const rows = g.length;
    const cols = g[0].length;
    const stack: [number, number][] = [[r, c]];

    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      const cell = g[currR][currC];
      if (cell.isRevealed) continue;
      
      cell.isRevealed = true;

      // If cell has 0 neighboring mines, flood reveal its neighbors
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

  // Reveal all when game lost
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

  // Check if player won
  const checkWinCondition = (g: Cell[][]) => {
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
      setWin(true);
      setFaceEmoji("😎");
      hiveAudio.playCrazyWink(); // play win sound!
      
      // Auto-flag all mines
      const finalGrid = g.map((row) =>
        row.map((cell) => {
          if (cell.isMine) {
            return { ...cell, isFlagged: true };
          }
          return cell;
        })
      );
      setGrid(finalGrid);
      setMinesLeft(0);
    }
  };

  // Right Click / Flag Toggle Logic
  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    toggleFlag(r, c);
  };

  const toggleFlag = (r: number, c: number) => {
    if (gameOver || win) return;
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

  // Get color depending on mine number
  const getNumberColorClass = (n: number) => {
    switch (n) {
      case 1: return "text-blue-600 font-extrabold";
      case 2: return "text-emerald-600 font-extrabold";
      case 3: return "text-red-600 font-extrabold";
      case 4: return "text-purple-800 font-extrabold";
      case 5: return "text-amber-800 font-extrabold";
      case 6: return "text-cyan-700 font-extrabold";
      case 7: return "text-stone-900 font-extrabold";
      case 8: return "text-zinc-500 font-extrabold";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      
      {/* 2004-style XP Window Shell for Games */}
      <div className="bg-gradient-to-b from-[#f2f6fb] via-[#e2eef9] to-[#d3e5f4] w-full max-w-[340px] rounded-t-xl rounded-b-lg border-2 border-[#1c5c8a] shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
        
        {/* XP Style Header blue strap */}
        <div className="bg-gradient-to-r from-[#1d5c8a] via-[#3a8bca] to-[#1d5c8a] px-3 py-2 flex items-center justify-between text-white border-b border-[#0f3c5e] shrink-0">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-sm">🎮</span>
            <span className="text-xs font-black tracking-wide uppercase">Buzzi Mijnenveger 2004</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-5 h-5 rounded-md bg-[#e43a3a] hover:bg-[#ff5555] active:scale-95 border border-[#8b1a1a] flex items-center justify-center text-white font-extrabold text-[10px] cursor-pointer"
          >
            &#10005;
          </button>
        </div>

        {/* Windows Menu options helper */}
        <div className="px-3 py-1 bg-[#efebd8]/30 border-b border-[#bad0e3] flex justify-between items-center text-[11px] font-bold text-[#1C427F]">
          <div className="flex gap-3">
            <button onClick={initBoard} className="hover:underline">Bestand / Reset</button>
            <button 
              onClick={() => {
                alert("ℹ️ DOEL VAN HET SPEL:\nKlik op de vakjes om ze te onthullen. Het getal laat zien hoeveel mijnen er omheen liggen.\n\nGebruik de rechtermuisknop of zet de Vlag Modus aan om vlaggen (🚩) te plaatsen en de mijnen te markeren. Ontwijk alle 10 mijnen om te winnen!");
              }} 
              className="hover:underline"
            >
              Uitleg
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Grid: 9x9</span>
        </div>

        {/* The Game Console Body */}
        <div className="p-4 flex flex-col items-center justify-center">

          {/* Minesweeper Classic Gray Board Box */}
          <div className="bg-[#bdbdbd] p-3 rounded-lg border-4 border-t-white border-l-white border-r-[#7b7b7b] border-b-[#7b7b7b] shadow-inner w-full flex flex-col gap-3">
            
            {/* Upper Info Row: Mine Counter, Smile Button, Timer */}
            <div className="bg-[#bdbdbd] px-2 py-1.5 border-3 border-t-[#7b7b7b] border-l-[#7b7b7b] border-r-white border-b-white flex items-center justify-between">
              
              {/* Mine Left Counter (Classic LCD styling mockup) */}
              <div className="bg-black text-[13px] font-mono text-[#ff0707] px-2.5 py-0.5 rounded border border-[#2b2525] font-black w-14 text-center select-all tracking-wider">
                {String(Math.max(0, minesLeft)).padStart(3, "0")}
              </div>

              {/* Smiley Face Interactive Button */}
              <button 
                onClick={initBoard}
                className="w-9 h-9 text-2xl flex items-center justify-center bg-[#bdbdbd] active:border-t-[#7b7b7b] active:border-l-[#7b7b7b] active:border-r-white active:border-b-white border-3 border-t-white border-l-white border-r-[#7b7b7b] border-b-[#7b7b7b] rounded cursor-pointer select-none transition-all"
              >
                {faceEmoji}
              </button>

              {/* Digital Timer Counter */}
              <div className="bg-black text-[13px] font-mono text-[#ff0707] px-2.5 py-0.5 rounded border border-[#2b2525] font-black w-14 text-center tracking-wider">
                {String(timer).padStart(3, "0")}
              </div>

            </div>

            {/* Grid Container Board */}
            <div className="bg-[#7b7b7b] p-1 border-3 border-t-[#7b7b7b] border-l-[#7b7b7b] border-r-white border-b-white flex items-center justify-center overflow-auto">
              <div 
                className="grid gap-0.5"
                style={{ gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))` }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    // Decide display visual
                    let cellContent = "";
                    let cellStyle = "w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors select-none text-center cursor-pointer ";
                    
                    if (cell.isRevealed) {
                      cellStyle += "bg-[#bdbdbd] border border-[#7b7b7b] ";
                      if (cell.isMine) {
                        cellContent = "💣";
                        cellStyle += "bg-red-500/70 ";
                      } else if (cell.neighborMines > 0) {
                        cellContent = String(cell.neighborMines);
                      }
                    } else {
                      // Unrevealed state
                      cellStyle += "bg-[#bdbdbd] border-3 border-t-white border-l-white border-r-[#7b7b7b] border-b-[#7b7b7b] hover:bg-[#d0d0d0] ";
                      if (cell.isFlagged) {
                        cellContent = "🚩";
                      }
                    }

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleCellClick(r, c)}
                        onContextMenu={(e) => handleRightClick(e, r, c)}
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

          </div>

          {/* Win / Loss overlay text banners */}
          {gameOver && (
            <div className="w-full mt-3 p-2 bg-red-100 border border-red-300 text-red-950 text-center font-bold text-xs rounded-lg animate-bounce leading-relaxed">
              💥 BOEM! Je hebt een mijn geraakt! <br/>
              <span className="text-[10px] font-normal text-red-850">Klik op de smiley 😀 om opnieuw te proberen.</span>
            </div>
          )}

          {win && (
            <div className="w-full mt-3 p-2 bg-emerald-100 border border-emerald-300 text-emerald-950 text-center font-bold text-xs rounded-lg animate-bounce leading-relaxed">
              🎉 SUPER! Je hebt de Mijnenveger overleefd! <br/>
              <span className="text-[10px] font-normal text-emerald-850">Gefeliciteerd op het Buzzi Netwerk! 😎</span>
            </div>
          )}

          {/* Touch controller flagship toggle (Extremely high usability for phones and laptops!) */}
          <div className="w-full mt-4 bg-white/40 border border-[#bad0e3] rounded-xl p-2 flex items-center justify-between gap-1">
            <span className="text-[10px] text-[#1c5c8a] font-bold">
              {isFlagMode ? "Vlag plaatsen actief 🚩" : "Normaal graven ⛏️"}
            </span>
            <button
              type="button"
              onClick={() => {
                hiveAudio.playNotification();
                setIsFlagMode(!isFlagMode);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                isFlagMode 
                  ? "bg-red-500 text-white border-red-700 shadow-inner" 
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-sm"
              }`}
            >
              🚩 Vlag Modus
            </button>
          </div>

        </div>

        {/* Footer actions bar */}
        <div className="px-4 py-3 bg-[#e1ecf7] border-t border-[#bad0e3] flex justify-between items-center text-[11.5px] select-none text-slate-500 shrink-0">
          <span className="font-mono text-[9px] uppercase tracking-wide">Mijnen: 10</span>
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
