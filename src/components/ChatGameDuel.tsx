/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Buzzi Chat Spelletjes Duel Component (Nostalgische MSN Games 2004 Clone)
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Trophy, RotateCcw, X, Gamepad2, User, Smile, MessageSquare } from "lucide-react";

interface ChatGameDuelProps {
  activeContactId: string;
  activeContactName: string;
  activeContactAvatar: string;
  onClose: () => void;
  onSendGameStatusMessage: (text: string) => void;
}

type BoardState = (string | null)[];
type GameType = "tictactoe" | "connect4" | "rps";

export const ChatGameDuel: React.FC<ChatGameDuelProps> = ({
  activeContactId,
  activeContactName,
  activeContactAvatar,
  onClose,
  onSendGameStatusMessage
}) => {
  const [activeGame, setActiveGame] = useState<GameType>("tictactoe");
  const [gameState, setGameState] = useState<"inviting" | "playing" | "ended">("inviting");
  
  // Scores
  const [myWins, setMyWins] = useState(0);
  const [theirWins, setTheirWins] = useState(0);
  const [draws, setDraws] = useState(0);

  // Tic-Tac-Toe States
  const [tttBoard, setTttBoard] = useState<BoardState>(Array(9).fill(null));
  const [tttTurn, setTttTurn] = useState<"me" | "bot">("me");
  const [tttWinner, setTttWinner] = useState<"me" | "bot" | "draw" | null>(null);

  // Connect 4 States
  const [c4Board, setC4Board] = useState<(string | null)[][]>(
    Array(6).fill(null).map(() => Array(7).fill(null))
  );
  const [c4Turn, setC4Turn] = useState<"me" | "bot">("me");
  const [c4Winner, setC4Winner] = useState<"me" | "bot" | "draw" | null>(null);

  // Steen, Papier, Schaar (RPS) States
  const [rpsMyChoice, setRpsMyChoice] = useState<"steen" | "papier" | "schaar" | null>(null);
  const [rpsTheirChoice, setRpsTheirChoice] = useState<"steen" | "papier" | "schaar" | null>(null);
  const [rpsWinner, setRpsWinner] = useState<"me" | "bot" | "draw" | null>(null);
  const [rpsIsCalculating, setRpsIsCalculating] = useState(false);

  const [opponentChatter, setOpponentChatter] = useState<string>("");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound Synth Helper
  const playRetroTone = (freqs: number[], duration: number, type: OscillatorType = "sine") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + duration);
      });
    } catch (e) {
      console.warn("Audio Synth failed:", e);
    }
  };

  // Bot Chatter Comments
  const triggerBotChatter = (event: "start" | "my_turn" | "win" | "lose" | "draw") => {
    const comments: Record<string, Record<string, string[]>> = {
      queen: {
        start: ["Boter-kaas-en-eieren is mathematisch gestructureerd... Bereid je voor!", "Duel geopend. Veel plezier."],
        my_turn: ["Bezig met bepalen optimaal rastervlak...", "Interessante zet. Mijn reactie..."],
        win: ["Systeem overwinning behaald! Probeer het nog eens.", "Buzzi Bot AI zegeviert! 🤖"],
        lose: ["Rapport: Robbin heeft gewonnen. Knap gedaan!", "Foutmarge gedetecteerd... Gefeliciteerd!"],
        draw: ["Synthese voltooid: Gelijkspel.", "Beide systemen zijn in balans!"]
      },
      kelly: {
        start: ["Oh leuk! Ik kies de gele bloemetjes hoor! 🌼", "Let op, ik ben hier super goed in!"],
        my_turn: ["Hmm... even kijken.", "Wacht hoor, waar zal ik hem zetten?"],
        win: ["Haha yes! Gewonnen! (dance)", "Ieee, ik ben te goed! Snel nog een keer!"],
        lose: ["Ahhh griebels, je hebt gewonnen! :-P", "Oeps, niet opgelet! Goed gespeeld!"],
        draw: ["Haha, gelijke stand! Gezellig zo.", "We zijn even slim blijkbaar!"]
      },
      wouter: {
        start: ["Vet cool! Rock en Roll op het speelveld! 🎸", "Zet je schrap, ik zet mijn troeven in!"],
        my_turn: ["In de aanval!", "Let op deze tactiek..."],
        win: ["BOOM! Gewonnen! \m/", "Heerlijke overwinning, rockte de pan uit!"],
        lose: ["Balen! Goed gespeeld man.", "Ah, je defensie zat goed in elkaar!"],
        draw: ["Gelijkspel! Snel nog een potje.", "Niemand geeft op, respect!"]
      },
      danny: {
        start: ["Ik activeer mijn gaming muis! Dit wordt e-sports.", "Tic-Tac-Toe op LAN-party snelheid!"],
        my_turn: ["Bezig met micro-control...", "Snelle counterzet!"],
        win: ["GG EZ! Gewonnen! 😎", "Mijn tactiek was perfect. Next level!"],
        lose: ["Wat een lag! ;) Gefeliciteerd.", "Netjes! Jij hebt gewonnen."],
        draw: ["Draw! Goede game hoor.", "No-winner! Snel een rematch."]
      },
      sanne: {
        start: ["Gezellig! Spelen we met vlinders en sterren? ✨", "Heel veel succes! Leuk duel."],
        my_turn: ["Uhm, waar zal ik...", "Deze lijkt me slim!"],
        win: ["Ooh leuk, ik heb gewonnen! 🎉", "Yes! Hartstikke leuk duel."],
        lose: ["Wauw, jij bent snel! Gefeliciteerd!", "Super knap gedaan! Revanche?"],
        draw: ["Mooi verdeeld! Gelijkspel.", "Beiden even sterk vandaag!"]
      }
    };

    const contactMap = comments[activeContactId] || {
      start: ["Leuk! Veel plezier met spelen. 🎮", "Duel geopend!"],
      my_turn: ["Mijn beurt...", "Interessant..."],
      win: ["Gewonnen! Snel nog een keer.", "Yes, overwinning!"],
      lose: ["Gefeliciteerd! Goed gedaan.", "Ah, je bent me te snel af!"],
      draw: ["Gelijkspel!", "Leuke pot!"]
    };

    const specificList = contactMap[event];
    const randComment = specificList[Math.floor(Math.random() * specificList.length)];
    setOpponentChatter(randComment);
  };

  // Connect & Invite Flow
  useEffect(() => {
    if (gameState === "inviting") {
      playRetroTone([523.25, 659.25, 783.99], 0.25); // Triad chord up
    }
  }, [gameState]);

  const handleStartGame = (type: GameType) => {
    setActiveGame(type);
    setGameState("playing");
    setTttBoard(Array(9).fill(null));
    setC4Board(Array(6).fill(null).map(() => Array(7).fill(null)));
    setTttWinner(null);
    setC4Winner(null);
    setTttTurn("me");
    setC4Turn("me");
    setRpsMyChoice(null);
    setRpsTheirChoice(null);
    setRpsWinner(null);
    playRetroTone([392, 523.25, 659.25, 1046.50], 0.3); // Game starting sound

    // Trigger standard invite notification message in parent chat
    const DutchName = type === "tictactoe" 
      ? "Boter-Kaas-en-Eieren" 
      : type === "connect4"
      ? "Vier-op-een-rij"
      : "Steen, Papier, Schaar";
    onSendGameStatusMessage(`🎮 Heeft je uitgenodigd voor een spelletje MSN ${DutchName}! Verbinding gestart.`);
    
    setTimeout(() => {
      triggerBotChatter("start");
    }, 1200);
  };

  const handleRpsChoice = (choice: "steen" | "papier" | "schaar") => {
    if (rpsIsCalculating || rpsWinner) return;
    setRpsMyChoice(choice);
    setRpsIsCalculating(true);
    playRetroTone([523, 659], 0.1);

    setTimeout(() => {
      const choices: ("steen" | "papier" | "schaar")[] = ["steen", "papier", "schaar"];
      const botChoice = choices[Math.floor(Math.random() * choices.length)];
      setRpsTheirChoice(botChoice);
      
      let winner: "me" | "bot" | "draw" = "draw";
      if (choice === botChoice) {
        winner = "draw";
      } else if (
        (choice === "steen" && botChoice === "schaar") ||
        (choice === "papier" && botChoice === "steen") ||
        (choice === "schaar" && botChoice === "papier")
      ) {
        winner = "me";
      } else {
        winner = "bot";
      }
      
      setRpsWinner(winner);
      setRpsIsCalculating(false);
      
      if (winner === "me") {
        setMyWins(prev => prev + 1);
        playRetroTone([523, 659, 783, 1046], 0.35, "sine");
        triggerBotChatter("lose");
      } else if (winner === "bot") {
        setTheirWins(prev => prev + 1);
        playRetroTone([392, 349, 311, 261], 0.4, "triangle");
        triggerBotChatter("win");
      } else {
        setDraws(prev => prev + 1);
        playRetroTone([440, 440], 0.25, "sine");
        triggerBotChatter("draw");
      }

      onSendGameStatusMessage(
        `🎮 Steen, Papier, Schaar: Ik koos ${choice.toUpperCase()} en ${activeContactName} koos ${botChoice.toUpperCase()}. ` + 
        (winner === "me" ? "IK HEB GEWONNEN! 🏆" : winner === "bot" ? `${activeContactName.toUpperCase()} HEEFT GEWONNEN! 🤖` : "REMISE! 🤝")
      );
    }, 1200);
  };

  // ==========================================
  // TIC-TAC-TOE GAME ENGINE
  // ==========================================
  const checkTttWinner = (board: BoardState) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diag
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as "me" | "bot";
      }
    }
    if (board.every(cell => cell !== null)) {
      return "draw";
    }
    return null;
  };

  // Auto Bot trigger for Tic-Tac-Toe
  useEffect(() => {
    if (gameState !== "playing" || activeGame !== "tictactoe" || tttTurn !== "bot" || tttWinner) return;

    // Simulate bot thinking delay
    const timer = setTimeout(() => {
      triggerBotChatter("my_turn");
      
      const availableIndices = tttBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);

      if (availableIndices.length === 0) return;

      // Smart Block/Win Logic or Select Random cell
      let chosenIdx = availableIndices[0];
      
      // 1. Can bot win on this turn?
      let foundMove = false;
      for (const idx of availableIndices) {
        const testBoard = [...tttBoard];
        testBoard[idx] = "bot";
        if (checkTttWinner(testBoard) === "bot") {
          chosenIdx = idx;
          foundMove = true;
          break;
        }
      }

      // 2. Can user win next turn? Block them!
      if (!foundMove) {
        for (const idx of availableIndices) {
          const testBoard = [...tttBoard];
          testBoard[idx] = "me";
          if (checkTttWinner(testBoard) === "me") {
            chosenIdx = idx;
            foundMove = true;
            break;
          }
        }
      }

      // 3. Take middle if free
      if (!foundMove && availableIndices.includes(4)) {
        chosenIdx = 4;
        foundMove = true;
      }

      // 4. Random choice
      if (!foundMove) {
        const randomIdx = Math.floor(Math.random() * availableIndices.length);
        chosenIdx = availableIndices[randomIdx];
      }

      const nextBoard = [...tttBoard];
      nextBoard[chosenIdx] = "bot";
      setTttBoard(nextBoard);
      playRetroTone([330], 0.1, "triangle"); // dull drop tone

      const winner = checkTttWinner(nextBoard);
      if (winner) {
        setTttWinner(winner);
        if (winner === "bot") {
          setTheirWins(prev => prev + 1);
          triggerBotChatter("win");
          onSendGameStatusMessage(`🏆 Oeps! ${activeContactName} heeft de ronde Boter-Kaas-en-Eieren gewonnen!`);
        } else if (winner === "draw") {
          setDraws(prev => prev + 1);
          triggerBotChatter("draw");
          onSendGameStatusMessage(`🤝 Unieke match! Gelijkspel met Boter-Kaas-en-Eieren.`);
        }
      } else {
        setTttTurn("me");
      }
    }, 1300);

    return () => clearTimeout(timer);
  }, [tttTurn, tttBoard, activeGame, gameState]);

  const handleTttClick = (idx: number) => {
    if (tttBoard[idx] !== null || tttTurn !== "me" || tttWinner) return;

    const nextBoard = [...tttBoard];
    nextBoard[idx] = "me";
    setTttBoard(nextBoard);
    playRetroTone([587.33], 0.1, "sine"); // high bright beep

    const winner = checkTttWinner(nextBoard);
    if (winner) {
      setTttWinner(winner);
      if (winner === "me") {
        setMyWins(prev => prev + 1);
        triggerBotChatter("lose");
        onSendGameStatusMessage(`🏆 Geweldig! Jij bent de winnaar van deze ronde Boter-Kaas-en-Eieren!`);
      } else if (winner === "draw") {
        setDraws(prev => prev + 1);
        triggerBotChatter("draw");
        onSendGameStatusMessage(`🤝 Gelijkspel bij Boter-Kaas-en-Eieren.`);
      }
    } else {
      setTttTurn("bot");
    }
  };

  // ==========================================
  // CONNECT 4 GAME ENGINE
  // ==========================================
  const checkC4Winner = (board: (string | null)[][]) => {
    const rCount = 6;
    const cCount = 7;
    // Check horizontal
    for (let r = 0; r < rCount; r++) {
      for (let c = 0; c < cCount - 3; c++) {
        const val = board[r][c];
        if (val && val === board[r][c+1] && val === board[r][c+2] && val === board[r][c+3]) {
          return val as "me" | "bot";
        }
      }
    }
    // Check vertical
    for (let r = 0; r < rCount - 3; r++) {
      for (let c = 0; c < cCount; c++) {
        const val = board[r][c];
        if (val && val === board[r+1][c] && val === board[r+2][c] && val === board[r+3][c]) {
          return val as "me" | "bot";
        }
      }
    }
    // Check positive slope diagonal
    for (let r = 3; r < rCount; r++) {
      for (let c = 0; c < cCount - 3; c++) {
        const val = board[r][c];
        if (val && val === board[r-1][c+1] && val === board[r-2][c+2] && val === board[r-3][c+3]) {
          return val as "me" | "bot";
        }
      }
    }
    // Check negative slope diagonal
    for (let r = 0; r < rCount - 3; r++) {
      for (let c = 0; c < cCount - 3; c++) {
        const val = board[r][c];
        if (val && val === board[r+1][c+1] && val === board[r+2][c+2] && val === board[r+3][c+3]) {
          return val as "me" | "bot";
        }
      }
    }

    // Check Draw
    let isFull = true;
    for (let c = 0; c < cCount; c++) {
      if (board[0][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) return "draw";

    return null;
  };

  // Auto Bot trigger for Connect 4
  useEffect(() => {
    if (gameState !== "playing" || activeGame !== "connect4" || c4Turn !== "bot" || c4Winner) return;

    const timer = setTimeout(() => {
      triggerBotChatter("my_turn");
      
      const colsWithSpace = [];
      for (let c = 0; c < 7; c++) {
        if (c4Board[0][c] === null) {
          colsWithSpace.push(c);
        }
      }

      if (colsWithSpace.length === 0) return;

      // Bot picks moves - check for winning or blockable moves
      let chosenCol = colsWithSpace[Math.floor(Math.random() * colsWithSpace.length)];
      let foundMove = false;

      // Helper to drop token in hypothetical board
      const getNextFreeRow = (col: number, board: (string | null)[][]) => {
        for (let r = 5; r >= 0; r--) {
          if (board[r][col] === null) return r;
        }
        return -1;
      };

      // 1. Can bot win?
      for (const col of colsWithSpace) {
        const testBoard = c4Board.map(row => [...row]);
        const rIndex = getNextFreeRow(col, testBoard);
        testBoard[rIndex][col] = "bot";
        if (checkC4Winner(testBoard) === "bot") {
          chosenCol = col;
          foundMove = true;
          break;
        }
      }

      // 2. Can player win? Block them!
      if (!foundMove) {
        for (const col of colsWithSpace) {
          const testBoard = c4Board.map(row => [...row]);
          const rIndex = getNextFreeRow(col, testBoard);
          testBoard[rIndex][col] = "me";
          if (checkC4Winner(testBoard) === "me") {
            chosenCol = col;
            foundMove = true;
            break;
          }
        }
      }

      // 3. Prefer center-ish column
      if (!foundMove && colsWithSpace.includes(3)) {
        chosenCol = 3;
      }

      const rowToPlace = getNextFreeRow(chosenCol, c4Board);
      const nextBoard = c4Board.map(row => [...row]);
      nextBoard[rowToPlace][chosenCol] = "bot";
      
      setC4Board(nextBoard);
      playRetroTone([290], 0.12, "triangle");

      const winner = checkC4Winner(nextBoard);
      if (winner) {
        setC4Winner(winner);
        if (winner === "bot") {
          setTheirWins(prev => prev + 1);
          triggerBotChatter("win");
          onSendGameStatusMessage(`🏆 Oeps! ${activeContactName} heeft de Vier-op-een-rij match gewonnen!`);
        } else if (winner === "draw") {
          setDraws(prev => prev + 1);
          triggerBotChatter("draw");
          onSendGameStatusMessage(`🤝 Connect 4 eindigt in een gelijkspel.`);
        }
      } else {
        setC4Turn("me");
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [c4Turn, c4Board, activeGame, gameState]);

  const handleC4Click = (colIdx: number) => {
    if (c4Turn !== "me" || c4Winner) return;

    // Find deepest free slot in column
    let targetRowIdx = -1;
    for (let r = 5; r >= 0; r--) {
      if (c4Board[r][colIdx] === null) {
        targetRowIdx = r;
        break;
      }
    }

    if (targetRowIdx === -1) return; // Column is full

    const nextBoard = c4Board.map(row => [...row]);
    nextBoard[targetRowIdx][colIdx] = "me";
    setC4Board(nextBoard);
    playRetroTone([493.88], 0.1, "sine");

    const winner = checkC4Winner(nextBoard);
    if (winner) {
      setC4Winner(winner);
      if (winner === "me") {
        setMyWins(prev => prev + 1);
        triggerBotChatter("lose");
        onSendGameStatusMessage(`🏆 Geweldig! Jij hebt Vier-op-een-rij gewonnen van ${activeContactName}!`);
      } else if (winner === "draw") {
        setDraws(prev => prev + 1);
        triggerBotChatter("draw");
        onSendGameStatusMessage(`🤝 Connect 4 gelijkspel.`);
      }
    } else {
      setC4Turn("bot");
    }
  };

  // Reset Board Round
  const restartRound = () => {
    playRetroTone([523.25, 783.99, 1046.5], 0.2, "sine");
    setTttBoard(Array(9).fill(null));
    setC4Board(Array(6).fill(null).map(() => Array(7).fill(null)));
    setTttWinner(null);
    setC4Winner(null);
    setTttTurn("me");
    setC4Turn("me");
    setRpsMyChoice(null);
    setRpsTheirChoice(null);
    setRpsWinner(null);
    triggerBotChatter("start");
  };

  const getWinnerEmoji = () => {
    if (activeGame === "tictactoe") {
      if (tttWinner === "me") return "👑";
      if (tttWinner === "bot") return "🤖";
    } else if (activeGame === "connect4") {
      if (c4Winner === "me") return "👑";
      if (c4Winner === "bot") return "🤖";
    } else if (activeGame === "rps") {
      if (rpsWinner === "me") return "👑";
      if (rpsWinner === "bot") return "🤖";
    }
    return "🤝";
  };

  return (
    <div className="absolute inset-x-4 top-16 bottom-[140px] z-40 bg-[#cbdcf0] border-2 border-[#15a13c] rounded-lg shadow-2xl flex flex-col overflow-hidden font-sans select-none animate-fade-in">
      
      {/* Title Bar MSN Spelletjes */}
      <div className="bg-gradient-to-r from-[#15a13c] via-[#21bf4a] to-[#0f842d] px-3.5 py-2 flex items-center justify-between text-white border-b border-[#0f7d2a]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-emerald-100 animate-bounce" />
          <span className="text-xs font-black tracking-wide drop-shadow-xs font-mono">
            Buzzi Messenger Duel Zone v1.1
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-stone-900/30 hover:bg-red-500 text-white rounded font-bold text-[10px] flex items-center justify-center cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Duel Layout splits column */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Games Selector or Live Board */}
        <div className="flex-1 p-4 bg-white flex flex-col justify-center items-center overflow-y-auto">
          
          {gameState === "inviting" ? (
            /* Invite Dashboard */
            <div className="text-center max-w-sm space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-4xl mx-auto shadow-sm">
                🎮
              </div>
              <h3 className="text-sm font-black text-slate-800">
                Speel MSN Retro Spelletjes met {activeContactName}!
              </h3>
              <p className="text-[10.5px] text-slate-500 max-w-xs leading-normal">
                Kies een nostalgisch turn-based mini-game. De chat-buddy reageert direct live na elke beurt!
              </p>
              
              <div className="grid grid-cols-1 gap-2.5 pt-2 w-full">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStartGame("tictactoe")}
                    className="bg-sky-50 hover:bg-sky-100 border border-sky-300 p-2.5 rounded-lg text-center cursor-pointer hover:shadow-xs transition-all active:scale-95 flex flex-col items-center gap-1"
                  >
                    <span className="text-xl filter drop-shadow">❌</span>
                    <span className="text-[10px] font-extrabold text-sky-800 leading-none">Boter-Kaas-Eieren</span>
                    <span className="text-[8px] text-slate-400 font-mono">Tic-Tac-Toe Classic</span>
                  </button>

                  <button
                    onClick={() => handleStartGame("connect4")}
                    className="bg-pink-50 hover:bg-pink-100 border border-pink-300 p-2.5 rounded-lg text-center cursor-pointer hover:shadow-xs transition-all active:scale-95 flex flex-col items-center gap-1"
                  >
                    <span className="text-xl filter drop-shadow">🟡</span>
                    <span className="text-[10px] font-extrabold text-pink-800 leading-none">Vier-op-een-rij</span>
                    <span className="text-[8px] text-slate-400 font-mono">Connect 4 Rules</span>
                  </button>
                </div>

                <button
                  onClick={() => handleStartGame("rps")}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 p-3 rounded-lg text-center cursor-pointer hover:shadow-xs transition-all active:scale-95 flex flex-col items-center gap-1 w-full"
                >
                  <span className="text-2xl filter drop-shadow">🪨 📄 ✂️</span>
                  <span className="text-[11px] font-extrabold text-emerald-800 leading-none">Steen, Papier, Schaar</span>
                  <span className="text-[9px] text-slate-500 font-mono font-medium">MSN Retro Classic Rock-Paper-Scissors</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Game Field */
            <div className="w-full max-w-[290px] flex flex-col items-center py-2">
              
              {/* Tic-Tac-Toe Board layout */}
              {activeGame === "tictactoe" ? (
                <div className="space-y-4 w-full">
                  <div className="text-center font-mono text-[10px] bg-sky-50 border border-sky-200 py-1 rounded text-sky-800 font-bold">
                    {tttWinner ? "Match voorbij!" : tttTurn === "me" ? "🔴 JOUW BEURT (Selecteer vakje)" : `🤖 ${activeContactName} is aan de beurt...`}
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full max-w-[190px] mx-auto">
                    {tttBoard.map((cell, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTttClick(idx)}
                        disabled={cell !== null || tttTurn !== "me" || tttWinner !== null}
                        className={`aspect-square bg-slate-50 border-2 rounded-lg flex items-center justify-center text-3xl transition-transform active:scale-90 relative ${
                          cell === null && tttTurn === "me" && !tttWinner 
                            ? "hover:bg-amber-50 cursor-pointer border-[#9ebcd1]" 
                            : "border-slate-200"
                        }`}
                      >
                        {cell === "me" && (
                          <span className="filter drop-shadow-sm select-none animate-fade-in text-red-500 font-black">🦋</span>
                        )}
                        {cell === "bot" && (
                          <span className="filter drop-shadow-sm select-none animate-fade-in text-sky-500 font-black">🐝</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeGame === "connect4" ? (
                /* Connect 4 Board layout */
                <div className="space-y-3 w-full">
                  <div className="text-center font-mono text-[10px] bg-pink-50 border border-pink-200 py-1 rounded text-pink-800 font-bold">
                    {c4Winner ? "Match voorbij!" : c4Turn === "me" ? "🟡 JOUW BEURT (Klik op een kolom)" : `🤖 ${activeContactName} laat een munt zakken...`}
                  </div>

                  {/* Connect 4 Grid */}
                  <div className="bg-[#154a7c] p-2 border-4 border-b-8 border-[#0c2f52] rounded-xl shadow-lg w-full max-w-[270px] mx-auto">
                    
                    {/* Interactive Drop Arrow Triggers */}
                    <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                      {Array(7).fill(0).map((_, colIdx) => (
                        <button
                          key={colIdx}
                          onClick={() => handleC4Click(colIdx)}
                          disabled={c4Turn !== "me" || c4Winner !== null || c4Board[0][colIdx] !== null}
                          className={`w-full py-0.5 rounded text-[10px] font-bold text-center border transition-all ${
                            c4Board[0][colIdx] === null && c4Turn === "me" && !c4Winner
                              ? "bg-amber-400 hover:bg-amber-500 border-amber-500 text-[#1a0a54] cursor-pointer animate-pulse"
                              : "bg-slate-700/50 text-slate-400 border-transparent cursor-not-allowed"
                          }`}
                          title="Gooi munt hierin"
                        >
                          ↓
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-rows-6 gap-1.5">
                      {c4Board.map((row, rIdx) => (
                        <div key={rIdx} className="grid grid-cols-7 gap-1.5 h-6">
                          {row.map((cell, cIdx) => (
                            <div
                              key={cIdx}
                              className={`rounded-full h-full w-full border-2 border-stone-950/25 flex items-center justify-center transition-all ${
                                cell === "me" ? "bg-amber-400 text-[10px]" : 
                                cell === "bot" ? "bg-red-500 text-[10px]" : 
                                "bg-[#cbdcf0] inset-shadow-inner"
                              }`}
                            >
                              {cell === "me" && "🟡"}
                              {cell === "bot" && "🔴"}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Rock Paper Scissors (RPS) Layout */
                <div className="space-y-4 w-full">
                  <div className="text-center font-mono text-[10px] bg-emerald-50 border border-emerald-200 py-1 rounded text-emerald-800 font-bold uppercase">
                    {rpsWinner 
                      ? "Ronde afgelopen!" 
                      : rpsIsCalculating 
                      ? "🤖 Buddy onthult keuze..." 
                      : "🫵 Maak je keuze hieronder!"}
                  </div>

                  {!rpsMyChoice ? (
                    <div className="flex flex-col gap-2.5 w-full max-w-[220px] mx-auto">
                      {(["steen", "papier", "schaar"] as const).map((choice) => (
                        <button
                          key={choice}
                          onClick={() => handleRpsChoice(choice)}
                          className="bg-white hover:bg-emerald-50 border-2 border-[#adc3d6] hover:border-emerald-500 rounded-xl p-3 flex items-center justify-between transition-all active:scale-95 cursor-pointer shadow-sm group"
                        >
                          <span className="text-sm font-bold capitalize text-stone-800 group-hover:text-emerald-700">
                            {choice === "steen" ? "✊ Steen" : choice === "papier" ? "✋ Papier" : "✌️ Schaar"}
                          </span>
                          <span className="text-xl">
                            {choice === "steen" ? "🪨" : choice === "papier" ? "📄" : "✂️"}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/80 border border-[#adc3d6] rounded-xl p-4 w-full text-center space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                          <span className="block text-[9px] font-bold text-stone-400 uppercase leading-none">Jij koos</span>
                          <div className="text-4xl my-2 animate-pulse">
                            {rpsMyChoice === "steen" ? "✊" : rpsMyChoice === "papier" ? "✋" : "✌️"}
                          </div>
                          <span className="text-[10.5px] font-black uppercase text-stone-700">{rpsMyChoice}</span>
                        </div>

                        <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                          <span className="block text-[9px] font-bold text-stone-400 uppercase leading-none">{activeContactName}</span>
                          <div className="text-4xl my-2">
                            {rpsIsCalculating ? (
                              <span className="inline-block animate-spin text-3xl">🪩</span>
                            ) : (
                              rpsTheirChoice === "steen" ? "✊" : rpsTheirChoice === "papier" ? "✋" : "✌️"
                            )}
                          </div>
                          <span className="text-[10.5px] font-black uppercase text-stone-700">
                            {rpsIsCalculating ? "Kiezen..." : rpsTheirChoice || "?"}
                          </span>
                        </div>
                      </div>

                      {rpsWinner && (
                        <div className={`p-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 ${
                          rpsWinner === "me" 
                            ? "bg-emerald-100 border-emerald-500 text-emerald-800 animate-pulse" 
                            : rpsWinner === "bot"
                            ? "bg-red-100 border-red-400 text-red-800"
                            : "bg-amber-100 border-amber-400 text-amber-800"
                        }`}>
                          {rpsWinner === "me" ? "🏆 GEWONNEN! 🎉" : rpsWinner === "bot" ? "🤖 BUDDY WINT!" : "🤝 REMISE!"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reset or Replay Controls */}
              {(tttWinner || c4Winner || rpsWinner) && (
                <div className="pt-4 flex flex-col items-center gap-1.5">
                  <div className="text-[12.5px] text-[#2c6e1e] font-extrabold flex items-center gap-1 animate-bounce">
                    <span>{getWinnerEmoji()}</span>
                    <span>
                      {tttWinner === "me" || c4Winner === "me" || rpsWinner === "me"
                        ? "Uitstekende overwinning!"
                        : tttWinner === "draw" || c4Winner === "draw" || rpsWinner === "draw"
                        ? "Eervolle remise!"
                        : "Volgende beurt versla je hem!"}
                    </span>
                  </div>
                  <button
                    onClick={restartRound}
                    className="mt-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10.5px] font-black px-4 py-2 rounded-lg border-2 border-green-700 hover:to-emerald-600 transition-all active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nog een potje spelen!</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Retro Score Panel & Chatter */}
        <div className="w-[110px] border-l border-[#bad0e3] bg-[#e1edf9] p-3 flex flex-col justify-between select-none shrink-0 text-slate-800">
          
          {/* Dashboard Leaderboard scores */}
          <div className="space-y-3.5">
            <div className="text-[9.5px] font-black text-slate-400 border-b border-dashed border-slate-300 pb-1.5 uppercase leading-none flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>Scoreboard</span>
            </div>
            
            <div className="space-y-2 font-mono">
              <div className="bg-white border rounded p-1.5 flex flex-col text-center">
                <span className="text-[8.5px] text-emerald-700 font-extrabold">JIJ (X)</span>
                <span className="text-xl font-bold text-slate-800">{myWins}</span>
              </div>

              <div className="bg-white border rounded p-1.5 flex flex-col text-center">
                <span className="text-[8.5px] text-pink-700 font-extrabold">OPP (O)</span>
                <span className="text-xl font-bold text-slate-800">{theirWins}</span>
              </div>

              <div className="text-[8.5px] text-slate-500 text-center font-bold">
                Gelijkspelen: {draws}
              </div>
            </div>
          </div>

          {/* MSN Chatter balloons */}
          {gameState !== "inviting" && (
            <div className="bg-white border border-slate-300 rounded p-2 text-[9.5px] leading-normal text-slate-600 relative mt-2 shrink-0">
              <div className="absolute -left-1.5 top-5 w-0 h-0 border-t-4 border-r-4 border-b-4 border-transparent border-r-white z-10" />
              <div className="font-bold text-slate-400 pb-0.5 border-b border-dashed border-slate-100 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-sky-500" />
                <span>{activeContactName}</span>
              </div>
              <p className="italic text-slate-700 leading-tight pt-1">
                {opponentChatter || "Veel succes!"}
              </p>
            </div>
          )}

          {/* Button back */}
          <button
            onClick={() => {
              playRetroTone([330, 261.63], 0.15, "sine");
              if (gameState === "playing") {
                setGameState("inviting");
              } else {
                onClose();
              }
            }}
            className="w-full bg-slate-200 hover:bg-slate-300 border border-slate-400 text-slate-700 py-1 px-2 rounded font-extrabold text-[9px] cursor-pointer"
          >
            {gameState === "playing" ? "Spel verlaten" : "Sluit Spelletjes"}
          </button>
        </div>

      </div>

    </div>
  );
};
