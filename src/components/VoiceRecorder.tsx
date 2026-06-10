/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Buzzi Voice Recorder Component - Retro Microfoon Opname
 */

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Square, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hiveAudio } from "../utils/audio";

interface VoiceRecorderProps {
  onSendVoice: (audioDataUrl: string, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for visual feedback
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start level monitoring
      const updateLevel = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
      
      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") 
          ? "audio/webm;codecs=opus" 
          : "audio/webm"
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          setAudioDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setElapsedTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      hiveAudio.playNotification();
    } catch (err) {
      console.warn("Microfoon toegang geweigerd:", err);
      alert("Kan geen microfoon vinden! Controleer je browserinstellingen.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRecording(false);
    setAudioLevel(0);
    hiveAudio.playHoneyPop();
  };

  const handleSend = () => {
    if (audioDataUrl) {
      onSendVoice(audioDataUrl, elapsedTime);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#e8f0f8] border-2 border-[#1d5c8a] rounded-lg p-3 mx-2 mb-2 animate-fade-in">
      <div className="flex items-center gap-3">
        {!audioDataUrl ? (
          <>
            <div className="flex items-center gap-2 flex-1">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-lg border-2 border-red-800 animate-pulse"
                  title="Start opname"
                >
                  <Mic className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-lg border-2 border-red-900"
                  title="Stop opname"
                >
                  <Square className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex-1">
                <div className="text-[11px] font-bold text-[#1d5c8a] font-mono">
                  {isRecording ? "🔴 OPNAME..." : audioDataUrl ? "✅ Opname gereed" : "🎤 Klik om op te nemen"}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatTime(elapsedTime)}
                  </span>
                  {isRecording && (
                    <div className="flex items-end gap-[2px] h-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[3px] bg-red-500 rounded-sm transition-all duration-75"
                          style={{
                            height: `${Math.max(2, audioLevel * 16 * (0.5 + Math.random() * 0.5))}px`,
                            opacity: 0.6 + audioLevel * 0.4
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              className="text-[10px] text-slate-500 hover:text-red-600 font-bold cursor-pointer px-2 py-1 rounded hover:bg-red-50 transition-all"
            >
              Annuleren
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="text-[11px] font-bold text-emerald-700 font-mono">
                  ✅ Opname gereed ({formatTime(elapsedTime)})
                </div>
                <audio controls src={audioDataUrl} className="h-6 mt-0.5" style={{ width: "200px" }} />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setAudioDataUrl(null);
                  setElapsedTime(0);
                }}
                className="text-[10px] text-slate-500 hover:text-orange-600 font-bold cursor-pointer px-2 py-1 rounded hover:bg-orange-50 transition-all"
              >
                🔄 Opnieuw
              </button>
              
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-[#1d5fb0] to-[#2473cf] hover:from-[#164a8c] hover:to-[#1d5fb0] text-white font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow border border-[#0f3c7a]"
              >
                <Send className="w-3 h-3" />
                Versturen
              </button>
              
              <button
                onClick={handleCancel}
                className="text-[10px] text-slate-400 hover:text-red-600 font-bold cursor-pointer px-1.5 py-1 rounded hover:bg-red-50 transition-all"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};