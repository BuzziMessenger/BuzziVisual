/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Buzzi Direct File Transfer Simulation Component (Retro ADSL Direct Connect Clone)
 */

import React, { useState, useEffect, useRef } from "react";
import { Download, File, FolderOpen, Loader2, X, CheckCircle, AlertTriangle, FileText, Image as ImageIcon, Music, Archive } from "lucide-react";

interface FileTransferProps {
  fileName: string;
  fileSize: string;
  isMe: boolean;
  onFinished: (dataUrl?: string) => void;
  senderName: string;
  dataUrl?: string;
}

export const FileTransfer: React.FC<FileTransferProps> = ({
  fileName,
  fileSize,
  isMe,
  onFinished,
  senderName,
  dataUrl
}) => {
  const [status, setStatus] = useState<"pending" | "transferring" | "success" | "declined">("pending");
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState("0 KB/s");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play direct transfer feedback beats
  const playPulsebeep = (freq: number, duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  };

  // Auto trigger transfer for sent files (sent by me)
  useEffect(() => {
    if (isMe && status === "pending") {
      setStatus("transferring");
    }
  }, [isMe, status]);

  // Simulate progress bar ticking on 2004 broadband rate
  useEffect(() => {
    if (status !== "transferring") return;

    let totalProgress = 0;
    const interval = setInterval(() => {
      // Custom nostalgic random MB increments
      totalProgress += Math.floor(Math.random() * 15) + 5;
      
      if (totalProgress >= 100) {
        totalProgress = 100;
        setProgress(100);
        setStatus("success");
        playPulsebeep(987.77, 0.25); // Success high bell
        onFinished(dataUrl);
        clearInterval(interval);
      } else {
        setProgress(totalProgress);
        // Play soft rhythmic ticks
        if (totalProgress % 4 === 0) {
          playPulsebeep(523.25, 0.05);
        }
        // MSN style random KB transfer calculation
        const randSpeed = (Math.random() * 45 + 12).toFixed(1);
        setSpeed(`${randSpeed} KB/s`);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [status, dataUrl]);

  // Determine File Icon type
  const getFileIcon = () => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const styleSuffix = "w-7 h-7 shrink-0 text-[#2c659e]";
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext || "")) {
      return <ImageIcon className={`${styleSuffix} text-emerald-600`} />;
    }
    if (["mp3", "wma", "wav", "m4a"].includes(ext || "")) {
      return <Music className={`${styleSuffix} text-pink-600 animate-pulse`} />;
    }
    if (["zip", "rar", "tar", "7z"].includes(ext || "")) {
      return <Archive className={`${styleSuffix} text-yellow-600`} />;
    }
    return <File className={styleSuffix} />;
  };

  const handleAccept = () => {
    playPulsebeep(698.46, 0.15);
    setStatus("transferring");
  };

  const handleDecline = () => {
    playPulsebeep(349.23, 0.2);
    setStatus("declined");
  };

  // Allow down files natively
  const handleDownload = () => {
    playPulsebeep(880, 0.15);
    if (dataUrl) {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback text download simulation
      const textVal = `Nostalgisch Buzzi bestand: ${fileName}\nIngevlogen via inbelverbinding vanuit direct chat logs.\nBedankt voor de retro sfeer!`;
      const blob = new Blob([textVal], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="my-2.5 max-w-sm bg-stone-50 border border-[#89adcf] rounded-lg p-3 font-sans text-xs text-slate-800 shadow-sm focus:outline-none select-none relative animate-fade-in mx-1.5 hover:shadow-xs transition-shadow">
      
      {/* File direct properties banner */}
      <div className="flex items-start gap-2.5">
        <div className="bg-[#cbdcf0]/50 border border-[#abc4df] rounded-lg p-1.5 shadow-inner">
          {getFileIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-slate-900 truncate" title={fileName}>
            {fileName}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">
            Bestandsgrootte: <strong className="text-slate-600">{fileSize}</strong>
          </p>
        </div>
      </div>

      {/* State Renderers */}
      <div className="mt-3 border-t border-slate-200/65 pt-2 font-mono text-[10.5px]">
        {status === "pending" && (
          <div className="space-y-2">
            <p className="text-slate-500 italic leading-snug">
              🚨 <strong>{senderName}</strong> wil het bestand verzenden via een directe Buzzi verbinding.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={handleAccept}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:to-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-md border border-green-700 shadow-xs cursor-pointer hover:shadow active:scale-95 transition-all text-[10px]"
              >
                Accepteren
              </button>
              <button
                onClick={handleDecline}
                className="bg-white hover:bg-slate-50 text-slate-500 font-bold px-3 py-1.5 rounded-md border border-slate-300 shadow-xs cursor-pointer active:scale-95 transition-all text-[10px]"
              >
                Dienst weigeren
              </button>
            </div>
          </div>
        )}

        {status === "transferring" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 text-[#2c659e] animate-spin" />
                {isMe ? "Bezig met direct streamen..." : "Bestand direct downloaden..."}
              </span>
              <span className="font-extrabold text-[#2c659e]">{progress}%</span>
            </div>

            {/* Simulated MSN progress bar */}
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner flex border border-slate-300">
              <div 
                className="bg-gradient-to-r from-[#20aa44] via-[#7fe05f] to-[#20aa44] h-full shadow-inner transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Snelheid: {speed}</span>
              <span>Modem ADSL DirectConnect</span>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[10.5px]">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Overdracht voltooid!</span>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-snug">
              Het bestand is succesvol binnengehaald op uw lokale schijf.
            </p>

            <button
              onClick={handleDownload}
              className="mt-1 bg-gradient-to-r from-sky-500 via-[#1d5fb0] to-[#01408f] text-white font-extrabold px-3 py-1.5 rounded-md border-2 border-[#124d8f] shadow-sm hover:shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer max-w-[140px] text-[10px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Opslaan / Openen</span>
            </button>
          </div>
        )}

        {status === "declined" && (
          <div className="flex items-center gap-1.5 text-red-500 font-extrabold leading-tight">
            <X className="w-4 h-4 shrink-0" />
            <span>Bestandsoverdracht geannuleerd.</span>
          </div>
        )}
      </div>

    </div>
  );
};
