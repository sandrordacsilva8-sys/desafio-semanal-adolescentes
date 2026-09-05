import { useState, useEffect } from 'react';
import { X, SmartphoneNfc, Play, Pause, RotateCcw } from 'lucide-react';
import * as Tone from 'tone';

export function FocusModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [duration, setDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playTimerBell();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playTimerBell = async () => {
    try {
      await Tone.start();
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      synth.triggerAttackRelease(["E5", "B5"], "2n");
    } catch (e) {
      console.log(e);
    }
  };

  if (!isOpen) return null;

  const toggle = async () => {
    if (!isRunning) await Tone.start();
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const setDurationAndReset = (mins: number) => {
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative">
        <button onClick={() => { reset(); onClose(); }} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-2xl animate-pulse">
          <SmartphoneNfc className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white">Momento Desconexão Digital</h3>
          <p className="text-xs text-slate-300 mt-1">Coloque o celular longe ou em 'Não Perturbe'.</p>
        </div>

        <div className="py-3">
          <div className="text-5xl font-black text-amber-400 font-mono tracking-wider">{timeStr}</div>
          <span className="text-xs text-slate-400 block mt-2">
            {isRunning ? 'Bíblia aberta, mente calma...' : (timeLeft === 0 ? 'Concluído!' : 'Selecione o tempo e inicie o cronômetro')}
          </span>
          {!isRunning && timeLeft === duration * 60 && (
            <div className="flex justify-center gap-2 mt-4">
              {[5, 10, 15].map(m => (
                <button 
                  key={m}
                  onClick={() => setDurationAndReset(m)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                    duration === m 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={toggle} 
            className={`px-6 py-3 font-black rounded-2xl shadow-lg text-xs sm:text-sm transition flex items-center gap-2 ${
              isRunning 
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isRunning ? <><Pause className="w-4 h-4" /> Pausar Foco</> : <><Play className="w-4 h-4" /> Iniciar Cronômetro</>}
          </button>
          <button 
            onClick={reset} 
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs sm:text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 italic">"Aquietai-vos e sabei que eu sou Deus." — Salmos 46:10</p>
      </div>
    </div>
  );
}
