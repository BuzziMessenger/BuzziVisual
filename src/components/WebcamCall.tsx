/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Buzzi Webcamgesprek Component (MSN Messenger 2004 Videobellen Clone)
 */

import React, { useEffect, useRef, useState } from "react";
import { Laptop, Smartphone, Video, VideoOff, Mic, MicOff, Maximize2, PhoneOff, RefreshCw, Disc } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WebcamCallProps {
  activeContactId: string;
  activeContactName: string;
  activeContactAvatar: string;
  myUserId?: string;
  onClose: () => void;
}

export const WebcamCall: React.FC<WebcamCallProps> = ({
  activeContactId,
  activeContactName,
  activeContactAvatar,
  myUserId,
  onClose
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"dialing" | "connecting" | "active" | "ended">("dialing");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFpsDrop, setIsFpsDrop] = useState(false);
  const [remoteCaption, setRemoteCaption] = useState("");
  const [roomId, setRoomId] = useState<string>("");
  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const isAIBot = ["queen", "kelly", "wouter", "danny", "sanne"].includes(activeContactId);

  // Synthesize dialing or calling sounds retro style
  const playBeep = (freq: number, duration: number, type: OscillatorType = "sine") => {
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
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration - 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Synth audio failed", e);
    }
  };

  // Play continuous ringing tone during dialing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "dialing") {
      // Retro telephone dial chime
      playBeep(440, 0.5);
      setTimeout(() => playBeep(480, 0.5), 100);

      interval = setInterval(() => {
        playBeep(440, 0.6);
        setTimeout(() => playBeep(480, 0.6), 100);
      }, 2000);
    }

    if (callStatus === "connecting") {
      // Static "white noise" glitch sound when establishing peer to peer
      playBeep(220, 0.2, "triangle");
      setTimeout(() => playBeep(880, 0.1, "sawtooth"), 150);
    }

    if (callStatus === "active") {
      // Happy Buzzi connecting chime
      playBeep(880, 0.15);
      setTimeout(() => playBeep(1109, 0.15), 100);
      setTimeout(() => playBeep(1318, 0.25), 200);
    }

    return () => clearInterval(interval);
  }, [callStatus]);

  // Handle call timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === "active") {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        if (Math.random() < 0.08) {
          setIsFpsDrop(true);
          setTimeout(() => setIsFpsDrop(false), 900);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Simulate contact chat captions based on contact during call
  useEffect(() => {
    if (callStatus !== "active") return;
    
    const captions: Record<string, string[]> = {
      queen: [
        "Bezig met analyseren van retro-feeds...",
        "Webcam verbonden op breedband ISDN!",
        "Stuur eens een duwtje als de FPS hapert! 💻",
        "Buzzi Bot is live! Vraag gerust om hulp."
      ],
      kelly: [
        "OMG Robbin, hoor je me? :-D",
        "Mijn mascara zit hopelijk goed...",
        "Britney Spears staat kei hard hier! 🎵",
        "Wacht, mijn zus roept dat ze op de inbelverbinding wil!"
      ],
      wouter: [
        "Vet cool dit man! \\m/",
        "Ik neem dit op via een echte VHS-band!",
        "Numb van Linkin Park staat op herhaling!",
        "Mijn SoundBlaster audio kraakt een beetje..."
      ],
      danny: [
        "DirectX 9.0c is vereist voor deze FPS haha!",
        "Mijn CRT-monitor flikkert enorm op camera.",
        "Yo! Heb je CS 1.6 al gedownload?",
        "Tandem-modem aangesloten voor extra bandwidth!"
      ],
      sanne: [
        "Heeeeeey! Wat leuk dit! ✨",
        "Mijn webcam was super goedkoop (10 euro)!",
        "Er zit stof op mijn webcam lens geloof ik.",
        "Kopje thee erbij en Buzzi'en maar!"
      ]
    };

    const contactCaps = captions[activeContactId] || [
      "In verbinding via directe koppeling...",
      "SoundBlaster Live-geluidskaart geselecteerd!",
      "Nostalgie ten top!",
      "Chatting live op Buzzi Webcampopp!"
    ];

    setRemoteCaption(contactCaps[0]);
    const capInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * contactCaps.length);
      setRemoteCaption(contactCaps[idx]);
    }, 7000);

    return () => clearInterval(capInterval);
  }, [callStatus, activeContactId]);

  // Connect local camera stream
  useEffect(() => {
    let active = true;

    // Phase 1 fallback (only for bot mode. For WebTC, we transition on connection!)
    let dialTimer: NodeJS.Timeout;
    if (isAIBot) {
      dialTimer = setTimeout(() => {
        setCallStatus("connecting");
        
        const connectTimer = setTimeout(() => {
          setCallStatus("active");
        }, 1800);

        return () => clearTimeout(connectTimer);
      }, 3200);
    }

    // Initialize media capture
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: "user" },
            audio: true
          });
          if (active) {
            setLocalStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } else {
          if (active) setCameraError("Browser ondersteunt geen webcam media APIs.");
        }
      } catch (err: any) {
        console.warn("Could not start local camera", err);
        if (active) {
          setCameraError(
            "Webcam niet gevonden of toegang geweigerd. We tonen een vintage webcam-simulatie!"
          );
        }
      }
    };

    startCamera();

    // Cleanup on unmount
    return () => {
      active = false;
      if (dialTimer) clearTimeout(dialTimer);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // WebRTC Real-Time Signaling Handshake Hook
  useEffect(() => {
    if (isAIBot || !myUserId || !localStream) {
      return;
    }

    const calculatedRoomId = [myUserId, activeContactId].sort().join("-");
    setRoomId(calculatedRoomId);

    let active = true;
    let pc: RTCPeerConnection | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let localCandidatesUploaded: string[] = [];
    let remoteCandidatesAdded: string[] = [];

    const initializeWebRTC = async () => {
      pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      });
      pcRef.current = pc;

      // Add local audio and video tracks to WebRTC
      localStream.getTracks().forEach(track => {
        if (pc) pc.addTrack(track, localStream);
      });

      // Handle receiving remote media stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0] && active) {
          setRemoteStream(event.streams[0]);
          setCallStatus("active");
        }
      };

      let isCaller = false;
      try {
        setCallStatus("connecting");
        const res = await fetch(`/api/db/calls/signal?roomId=${calculatedRoomId}`);
        const signalData = await res.json();
        
        if (signalData && signalData.offer) {
          // Callee Mode: Set offer and create answer
          isCaller = false;
          await pc.setRemoteDescription(new RTCSessionDescription(signalData.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await fetch("/api/db/calls/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: calculatedRoomId, type: "answer", data: answer })
          });
        } else {
          // Caller Mode: Reset room and create initial offer
          isCaller = true;
          await fetch("/api/db/calls/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: calculatedRoomId, type: "reset" })
          });

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          await fetch("/api/db/calls/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: calculatedRoomId, type: "offer", data: offer })
          });
        }
      } catch (err) {
        console.warn("WebRTC Initial handshake failed:", err);
      }

      // Candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate && active) {
          const candStr = JSON.stringify(event.candidate);
          if (!localCandidatesUploaded.includes(candStr)) {
            localCandidatesUploaded.push(candStr);
            fetch("/api/db/calls/signal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roomId: calculatedRoomId,
                type: isCaller ? "caller_candidate" : "callee_candidate",
                data: event.candidate
              })
            }).catch(err => console.warn("ICE upload skipped:", err));
          }
        }
      };

      // Periodic poller for answer and remote ICE candidates
      pollInterval = setInterval(async () => {
        if (!active || !pc) return;
        try {
          const res = await fetch(`/api/db/calls/signal?roomId=${calculatedRoomId}`);
          const signalInfo = await res.json();
          if (!signalInfo) return;

          // If caller, get callee's answer
          if (isCaller && signalInfo.answer && pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signalInfo.answer));
            setCallStatus("active");
          }

          // Gather ICE candidates from peer
          const foreignCandidates = isCaller ? signalInfo.calleeCandidates : signalInfo.callerCandidates;
          if (foreignCandidates && foreignCandidates.length > 0) {
            for (const item of foreignCandidates) {
              const itemStr = JSON.stringify(item);
              if (!remoteCandidatesAdded.includes(itemStr)) {
                remoteCandidatesAdded.push(itemStr);
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(item));
                } catch (candidateErr) {
                  console.warn("ICE remote input problem", candidateErr);
                }
              }
            }
          }
        } catch (pollErr) {
          console.warn("Signal poller error:", pollErr);
        }
      }, 1250);
    };

    initializeWebRTC();

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      if (pc) {
        pc.close();
      }
    };
  }, [localStream, myUserId, activeContactId, isAIBot]);

  // Update local video element when stream is active
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  const handleEndCall = () => {
    playBeep(261.63, 0.4, "sine"); // Fall low tone
    setTimeout(() => playBeep(196, 0.5, "sine"), 150);
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
    }, 850);
  };

  const getFormattedTime = () => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute inset-x-4 top-16 bottom-[140px] z-40 bg-[#cbdcf0] border-2 border-[#1d5c8a] rounded-lg shadow-2xl flex flex-col overflow-hidden font-sans animate-fade-in select-none">
      
      {/* Title Bar Windows XP MSN design */}
      <div className="bg-gradient-to-r from-[#1d5fb0] via-[#2473cf] to-[#124d8f] px-3.5 py-1.8 flex items-center justify-between text-white border-b border-[#0f448c]">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-sky-200 animate-pulse" />
          <span className="text-xs font-extrabold tracking-wide drop-shadow-xs font-mono">
            Buzzi Videogesprek met {activeContactName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 bg-white/10 hover:bg-white/20 text-[9px] rounded flex items-center justify-center cursor-pointer transition-all">
            _
          </span>
          <button 
            type="button"
            onClick={handleEndCall}
            className="w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[10px] flex items-center justify-center cursor-pointer transition-all shadow-sm shadow-red-950/20"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main webcam layouts area */}
      <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 bg-gradient-to-b from-[#e1edf9] to-[#ccdcf0] overflow-hidden justify-center items-center">
        
        {/* Box 1: Remote Friend's Webcam (Large primary screen) */}
        <div className="relative w-full max-w-[340px] aspect-[4/3] bg-stone-900 border-2 border-[#8ba7c1] rounded p-1 shadow-lg flex flex-col overflow-hidden group">
          <div className="bg-slate-900 text-[10px] text-stone-200 py-1 px-2 border-b border-stone-800 flex items-center justify-between font-mono">
            <span>🎥 REMOTE: {activeContactName}</span>
            {callStatus === "active" && (
              <span className="flex items-center gap-1 text-emerald-400 font-extrabold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                LIVE ({isFpsDrop ? "FPS: 4" : "FPS: 15"})
              </span>
            )}
          </div>

          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {/* Call state renderers */}
            {callStatus === "dialing" && (
              <div className="text-center p-3 animate-pulse space-y-3">
                <div className="w-12 h-12 bg-sky-200/20 border-2 border-sky-400 rounded-full flex items-center justify-center mx-auto text-sky-400 border-dashed animate-spin">
                  📞
                </div>
                <div className="text-stone-300 text-xs font-mono font-bold">
                  Bezig met verbinding leggen...
                </div>
                <div className="text-[10px] text-stone-400 italic font-sans">
                  Inbellen op de Buzzi Client van {activeContactName}...
                </div>
              </div>
            )}

            {callStatus === "connecting" && (
              <div className="text-center p-3 space-y-2">
                <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
                <div className="text-amber-400 text-xs font-mono font-bold">
                  Directe TCP tunnel openen...
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                  Modem firewall omzeild [OK]
                </div>
              </div>
            )}

            {/* Simulated Live CRT webcam of friend */}
            {callStatus === "active" && (
              <div className="w-full h-full relative flex items-center justify-center bg-stone-950">
                
                {/* CRT Screen Scanline/Glitch Overlay */}
                <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-20 z-10" />
                
                {/* Glitch lag simulation */}
                <div className={`w-full h-full transition-all duration-300 ${isFpsDrop ? "blur-[1px] scale-98 brightness-110 opacity-75" : "scale-100 opacity-95"}`}>
                  {activeContactId === "queen" ? (
                    // AI bot matrix simulation
                    <div className="w-full h-full flex flex-col justify-center items-center bg-black/95 font-mono text-emerald-500 p-4 border border-emerald-900/50">
                      <div className="text-2xl animate-pulse">🧠</div>
                      <span className="text-[10px] text-emerald-400 mt-2 font-bold select-none text-center">
                        BUZZI AI NEURAAL NETWORK
                      </span>
                      <div className="mt-1 flex gap-1 items-center">
                        <Disc className="w-3 h-3 animate-spin text-emerald-500" />
                        <span className="text-[8px] text-emerald-600">RETRO-STREAM VERWERKEN...</span>
                      </div>
                    </div>
                  ) : (
                    // Regular contacts retro webcam display
                    <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden bg-slate-900">
                      {remoteStream && !isAIBot ? (
                        <video
                          ref={(el) => {
                            if (el && el.srcObject !== remoteStream) {
                              el.srcObject = remoteStream;
                            }
                          }}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover filter brightness-95 contrast-105 saturate-100"
                        />
                      ) : (
                        /* Character image with retro filters */
                        <div className="w-24 h-24 rounded border-2 border-slate-500/40 p-0.5 bg-white shadow-md relative group-hover:scale-105 transition-transform">
                          {activeContactAvatar.length > 5 ? (
                            <img src={activeContactAvatar} alt="Webcam Simulatie" className="w-full h-full object-cover filter brightness-95 contrast-105 saturate-90" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-[#1e4675] flex items-center justify-center text-4xl">
                              {activeContactAvatar}
                            </div>
                          )}
                          {/* Fake red dot recording indicator */}
                          <div className="absolute -top-1 -left-1 px-1 py-0.2 bg-red-600 rounded text-[7px] text-white font-extrabold flex items-center gap-0.5 shadow">
                            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                            <span>OPNAME</span>
                          </div>
                        </div>
                      )}

                      {/* Animated retro graphics loops */}
                      <div className="absolute bottom-1 right-2 text-[10px] font-mono text-amber-500/70 select-none flex items-center gap-1">
                        <span className="animate-pulse">●</span>
                        <span>GELUID_IN_LINKS</span>
                      </div>
                      
                      <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500 flex flex-col gap-0.5">
                        <span>XP_CAM v1.02</span>
                        <span>SENS: AUTOMATISCH</span>
                        <span>AGC: AAN</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated captions text below webcam */}
                {remoteCaption && (
                  <div className="absolute bottom-2 inset-x-2 bg-black/85 border border-[#3e668b]/40 py-1.5 px-2 rounded text-[10.5px] text-slate-100 text-center font-bold font-sans drop-shadow leading-normal animate-slide-up z-20 shadow-lg">
                    💬 {activeContactName}: <span className="font-semibold text-yellow-300 text-[10px]">{remoteCaption}</span>
                  </div>
                )}
              </div>
            )}

            {callStatus === "ended" && (
              <div className="text-center p-3 text-red-400 space-y-1">
                <span className="text-2xl">🛑</span>
                <div className="text-xs font-bold font-mono uppercase tracking-wider">
                  Gesprek Beëindigd
                </div>
                <p className="text-[9px] text-stone-500">
                  Directe lijn veilig afgesloten.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Local User's Webcam (Smaller self feed) */}
        <div className="relative w-full max-w-[280px] aspect-[4/3] bg-stone-900 border-2 border-[#8ba7c1] rounded p-1 shadow-lg flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-[10px] text-stone-200 py-1 px-2 border-b border-stone-800 flex items-center justify-between font-mono">
            <span>🎥 LOCAL: Jijzelf (Voorbeeld)</span>
            <span className="text-sky-400 text-[9px] font-bold">Kwaliteit: Hoog</span>
          </div>

          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {/* If stream is active, show visual element */}
            {!isVideoOff && localStream ? (
              <div className="w-full h-full relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover filter contrast-105 brightness-110 saturate-95 scale-x-[-1]"
                />
                
                {/* Vintage OSD text */}
                <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-400 bg-black/40 px-1 py-0.5 rounded flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>CAMERA_DIRECTE_INVOER</span>
                </div>
              </div>
            ) : (
              // Webcam not active or camera access error/fallback
              <div className="w-full h-full bg-stone-950 flex flex-col items-center justify-center text-center p-4">
                <span className="text-3xl mb-1 filter drop-shadow">👤</span>
                <span className="text-[10px] font-bold text-stone-300">
                  {isVideoOff ? "Voorbeeld Uitgeschakeld" : "Webcam Feed Simulatie"}
                </span>
                <p className="text-[8px] text-stone-500 max-w-[190px] leading-tight mt-1 select-none font-sans">
                  {cameraError || "Uw browser ondersteunt videoverbinding. Er is geen webcam ingeschakeld."}
                </p>
              </div>
            )}
            
            {/* Audio Signal meter simulated */}
            {callStatus === "active" && (
              <div className="absolute bottom-2 left-2 flex items-end gap-0.5 bg-black/50 p-1 rounded">
                <span className="w-1 h-2 bg-green-500 rounded-sm animate-bounce" style={{ animationDelay: "0.1s" }} />
                <span className="w-1 h-3 bg-green-500 rounded-sm animate-bounce" style={{ animationDelay: "0.3s" }} />
                <span className="w-1 h-1 bg-green-500 rounded-sm animate-bounce" style={{ animationDelay: "0.5s" }} />
                <span className="w-1 h-3 bg-green-500 rounded-sm animate-bounce" style={{ animationDelay: "0s" }} />
                <span className="w-1 h-1.5 bg-green-500 rounded-sm animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Controller Buttons Console at bottom */}
      <div className="bg-[#cbdcf0] p-3 border-t border-[#9ebcd1] flex items-center justify-between select-none">
        <div className="flex items-center gap-1">
          {callStatus === "active" && (
            <div className="bg-white border border-[#9ebcd1] px-2.5 py-1 rounded shadow-inner text-[10.5px] font-mono text-[#1a5a92] font-black mr-2">
              ⏱️ {getFormattedTime()}
            </div>
          )}
        </div>

        {/* Action bar and hangs buttons */}
        <div className="flex items-center gap-2">
          {/* Toggle microphone */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              playBeep(isMuted ? 587.33 : 493.88, 0.15, "triangle");
            }}
            className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-xs ${
              isMuted
                ? "bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                : "bg-white hover:bg-sky-50 text-slate-700 border-[#9ebcd1]"
            }`}
            title={isMuted ? "Geluidskaart inschakelen" : "Microfoon dempen"}
          >
            {isMuted ? <MicOff className="w-4 h-4 shrink-0" /> : <Mic className="w-4 h-4 shrink-0 text-slate-600" />}
          </button>

          {/* Toggle camera feed */}
          <button
            onClick={() => {
              setIsVideoOff(!isVideoOff);
              playBeep(isVideoOff ? 587.33 : 493.88, 0.15, "triangle");
            }}
            className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-xs ${
              isVideoOff
                ? "bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                : "bg-white hover:bg-sky-50 text-slate-700 border-[#9ebcd1]"
            }`}
            title={isVideoOff ? "Camera aanzetten" : "Video uitzetten"}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4 shrink-0" /> : <Video className="w-4 h-4 shrink-0 text-slate-600" />}
          </button>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          {/* Red Hangup button */}
          <button
            onClick={handleEndCall}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:to-red-800 text-white font-bold py-2 px-3.5 rounded-lg border-2 border-red-800 flex items-center gap-1.5 text-xs shadow hover:shadow-md cursor-pointer transition-all active:scale-95"
            title="Sessie sluiten"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Beëindigen</span>
          </button>
        </div>
      </div>

    </div>
  );
};
