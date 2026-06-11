/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { hiveAudio } from "../utils/audio";

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Stap 1: De Buzzi app downloaden 📥",
      sub: "Bestand downloaden (naam eindigt op .._11)",
      text: "Klik op de downloadknop hieronder om de officiële Buzzi Messenger APK (v1.2) te downloaden op je Android telefoon. Je browser vraagt mogelijk: 'Bestand is mogelijk schadelijk'. Klik zonder zorgen op 'Toch downloaden'.",
      actionLabel: "Direct APK Downloaden ⚡",
      actionUrl: "https://sin1.contabostorage.com/127726bae0334a7b8a8425a4789fb816:appsonair-prod/70b7d4cc-9bc7-478b-ae16-e8b58392a72d/CPoIEsVItxddA7MStU5hp.apk",
      icon: "📥",
      color: "bg-sky-500",
      number: "11"
    },
    {
      title: "Stap 2: Onbekende bronnen openen ⚙️",
      sub: "Toegang verlenen melder (stap .._50)",
      text: "Zodra het downloaden klaar is, open je de melding. Android geeft nu een pop-up die zegt: 'Om veiligheidsredenen kan je telefoon geen onbekende apps uit deze bron installeren'. Geen paniek! Klik direct op de knop 'Instellingen'.",
      icon: "⚙️",
      color: "bg-orange-500",
      number: "50"
    },
    {
      title: "Stap 3: Browser installatie toestaan 🔓",
      sub: "Schakelaar aanzetten (stap .._13)",
      text: "In het instellingenvenster dat nu opent, zie je een schakelaar met de tekst: 'Toestaan van deze bron' of 'Onbekende apps installeren' voor jouw browser (bijvoorbeeld Chrome). Zet deze schuifregelaar op AAN (groen/blauw).",
      icon: "🔓",
      color: "bg-amber-500",
      number: "13"
    },
    {
      title: "Stap 4: CPoIEsVItxddA7MStU5hp.apk openen 📦",
      sub: "Pakketinstallatie selecteren (stap .._38)",
      text: "Ga nu een stap terug in je telefoon of open je downloads map via de app 'Bestanden'. Klik hier op de echte APK: 'CPoIEsVItxddA7MStU5hp.apk'. Selecteer 'Pakketinstallatie' om de installatie te starten.",
      icon: "📦",
      color: "bg-blue-500",
      number: "38"
    },
    {
      title: "Stap 5: Buzzi Messenger installeren 🛠️",
      sub: "Installatie starten (stap .._57)",
      text: "Er verschijnt nu een systeemvenster: 'Wilt u deze app installeren?'. Druk rechtsonderin op de handige knop 'Installeren'. Je telefoon is nu bezig Buzzi Messenger voor je in te laden!",
      icon: "🛠️",
      color: "bg-teal-500",
      number: "57"
    },
    {
      title: "Stap 6: Play Protect omzeilen 🦖",
      sub: "Melding 'Toch installeren' (stap .._25)",
      text: "Geef Google Play Protect een duwtje als er een venster getoond wordt dat de app niet herkend is. Klik onderin op de kleine tekst 'Meer details' en selecteer dan direct de knop: 'Toch installeren'. Dit is 100% veilig!",
      icon: "🛡️",
      color: "bg-red-500",
      number: "25"
    },
    {
      title: "Stap 7: Klaar om in te bellen! 🎉",
      sub: "App geïnstalleerd en bruikbaar! (stap .._12)",
      text: "Hoor je de inbelgeluiden al? De applicatie is nu succesvol geïnstalleerd op je Android startscherm! Open de app, vul je screennaam in en je chat direct live mee met de rest! Veel plezier! (H)",
      actionLabel: "Buzzi app nu starten! 🐝",
      icon: "🎉",
      color: "bg-emerald-500",
      number: "12"
    }
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      hiveAudio.playHoneyPop();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      hiveAudio.playHoneyPop();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] select-none font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#f0f4f9] w-full max-w-xl rounded-2xl border-4 border-[#3b82f6] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Buzzi style blue header */}
        <div className="bg-[#1e3a8a] bg-gradient-to-r from-[#1e40af] to-[#3b82f6] px-4 py-3 flex items-center justify-between border-b-2 border-[#1d4ed8]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-extrabold text-white text-sm tracking-wide shadow-xs uppercase font-sans">
              Android App Installatie Wegwijzer (.APK)
            </span>
          </div>
          <button
            onClick={() => {
              hiveAudio.playHoneyPop();
              onClose();
            }}
            className="bg-red-500 hover:bg-red-650 text-white font-extrabold rounded-lg px-2.5 py-1 border border-red-700 shadow-xs active:scale-95 text-xs transition-colors cursor-pointer"
          >
            Sluiter X
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="bg-[#e0f2fe] border border-sky-200 rounded-xl p-3 flex items-center gap-3">
            <div className="text-3xl bg-white p-2.5 rounded-xl shadow-xs shrink-0">📱</div>
            <div className="text-[11.5px] text-slate-700 leading-normal">
              In tegenstelling tot de weblink, geeft de Android app live push-notificaties, draait sneller op de mobiele motor en geeft de ultieme retro chatbuzzi-beleving! Volg deze eenvoudige diashow:
            </div>
          </div>

          {/* Slider Step Container */}
          <div className="bg-white border-2 border-[#adc4df] rounded-xl p-4.5 shadow-sm space-y-4 relative overflow-hidden flex flex-col md:flex-row gap-5 items-center">
            {/* Step Visual Counter Sphere */}
            <div className="absolute top-2.5 right-2.5 bg-sky-100 border border-sky-300 rounded-full px-2.5 py-0.5 text-[10px] uppercase font-black text-sky-800 tracking-wider">
              Stap {currentStep + 1} / {steps.length}
            </div>

            {/* Step illustration/number icon */}
            <div className={`w-18 h-18 md:w-24 md:h-24 ${current.color} rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-md border-3 border-white`}>
              <span className="text-3xl md:text-4xl">{current.icon}</span>
              <span className="text-[9px] font-black uppercase mt-1 tracking-widest bg-black/20 px-1.5 rounded-md">
                Step_{current.number}
              </span>
            </div>

            {/* Description Area */}
            <div className="text-left space-y-2.5 flex-1">
              <span className="text-[10px] font-extrabold text-[#3a5885] uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                {current.sub}
              </span>
              <h2 className="text-sm md:text-base font-extrabold text-slate-900 leading-none">
                {current.title}
              </h2>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-normal">
                {current.text}
              </p>

              {/* Direct APK Button for Step 1 */}
              {(currentStep === 0 || currentStep === steps.length - 1) && (
                <div className="pt-2">
                  <a
                    href="https://sin1.contabostorage.com/127726bae0334a7b8a8425a4789fb816:appsonair-prod/70b7d4cc-9bc7-478b-ae16-e8b58392a72d/CPoIEsVItxddA7MStU5hp.apk"
                    onClick={() => hiveAudio.playNotification()}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-[11px] px-4 py-2 rounded-xl border-2 border-emerald-700 shadow-md active:scale-95 transition-all text-center"
                  >
                    🚀 DOWNLOAD Buzzi Messenger APK (v1.2)
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Progress Indicators */}
          <div className="flex justify-center items-center gap-1.5 py-1">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  hiveAudio.playHoneyPop();
                }}
                className={`h-2.5 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${
                  currentStep === idx ? "w-7 bg-sky-600" : "w-2.5 bg-slate-300 hover:bg-sky-300"
                }`}
                title={`Stap ${idx+1}: Step_${s.number}`}
              />
            ))}
          </div>
        </div>

        {/* Buzzi Bottom Toolbar */}
        <div className="bg-[#e9f2fc] border-t-2 border-[#bad0e3] px-5 py-4 flex items-center justify-between select-none">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs cursor-pointer ${
              currentStep === 0
                ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                : "bg-white hover:bg-slate-50 text-slate-700 border-[#adc4df] hover:border-[#9dbbda] active:scale-95 transition-all"
            }`}
          >
            ◀ Vorige stap
          </button>

          <div className="text-center font-mono text-[9px] text-slate-400">
            Buzzi Messenger Android app .APK (CPoIEsVItxddA7MStU5hp)
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={() => {
                hiveAudio.playHoneyPop();
                onClose();
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-3.5 py-1.5 rounded-lg border border-sky-800 shadow-xs active:scale-95 transition-all cursor-pointer text-xs"
            >
              Ga chatten! 🐝 ▶
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-3.5 py-1.5 rounded-lg border border-sky-800 shadow-xs active:scale-95 transition-all cursor-pointer text-xs"
            >
              Volgende stap ▶
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
