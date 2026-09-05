import { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { FocusModal } from './FocusModal';
import { ReflectionModal } from './Modals';
import { Play, Hourglass, Quote, ListChecks, Trophy, Award, BookOpen, CircleCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as Tone from 'tone';

const BADGES = [
  { id: 'first_win', name: 'Primeiro Passo', desc: 'Completou o 1º desafio', icon: Trophy, condition: (p: any) => p.completedCount >= 1 },
  { id: 'halfway', name: 'Guerreiro Focado', desc: 'Atingiu 50% dos desafios', icon: Trophy, condition: (p: any) => p.percent >= 50 },
  { id: 'master', name: 'Mente Renovada', desc: 'Concluiu 100% dos desafios', icon: Award, condition: (p: any) => p.percent === 100 }
];

export function TeenView() {
  const { currentUser, challenges, completeChallenge, uncompleteChallenge, users } = useAppStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState<any>(null);

  if (!currentUser) return null;

  const completedCount = currentUser.completedChallenges.filter(id => challenges.some(c => c.id === id)).length;
  const totalCount = challenges.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const totalXP = currentUser.completedChallenges.reduce((total, id) => {
    const ch = challenges.find(c => c.id === id);
    return total + (ch ? ch.xp : 0);
  }, 0);

  const getRankBadge = () => {
    if (percentage === 100) return { label: '🌟 Mestre da Palavra', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (percentage >= 60) return { label: '⚔️ Guerreiro Focado', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (percentage >= 25) return { label: '📖 Em Desconexão', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    return { label: '🌱 Iniciante', color: 'bg-slate-700 text-slate-300 border-slate-600' };
  };
  const rank = getRankBadge();

  const handleChallengeToggle = (id: string) => {
    const isDone = currentUser.completedChallenges.includes(id);
    if (isDone) {
      uncompleteChallenge(id);
    } else {
      setPendingChallenge(challenges.find(c => c.id === id));
    }
  };

  const handleComplete = async (note: string) => {
    if (pendingChallenge) {
      completeChallenge(pendingChallenge.id, note);
      
      try {
        await Tone.start();
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const now = Tone.now();
        synth.triggerAttackRelease(["C5", "E5", "G5"], "8n", now);
        synth.triggerAttackRelease(["C6"], "4n", now + 0.15);
      } catch (e) {}

      if (completedCount + 1 === totalCount && totalCount > 0) {
        confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } });
      }
      setPendingChallenge(null);
    }
  };

  const filteredChallenges = challenges.filter(c => activeFilter === 'all' || c.category === activeFilter);
  const sortedUsers = [...users].sort((a, b) => {
    const xpB = a.completedChallenges.reduce((acc, id) => acc + (challenges.find(c => c.id === id)?.xp || 0), 0);
    const xpA = b.completedChallenges.reduce((acc, id) => acc + (challenges.find(c => c.id === id)?.xp || 0), 0);
    return xpA - xpB;
  });

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Semana Ativa: Menos Notificação, Mais Unção
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              E aí, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-300">{currentUser.name}</span>!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Troque o algoritmo de rolagem pelas promessas eternas. Cada desafio completado aproxima você de Deus e limpa as distrações da mente!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-center min-w-[90px] shadow-sm">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center justify-center gap-1">
                Ofensiva
              </div>
              <div className="text-2xl font-black text-amber-400">{currentUser.streak || 1} <span className="text-xs font-normal">dia</span></div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-center min-w-[90px] shadow-sm">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center justify-center gap-1">
                Total XP
              </div>
              <div className="text-2xl font-black text-indigo-400">{totalXP}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Seu Progresso Semanal</span>
              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${rank.color}`}>
                {rank.label}
              </span>
            </div>
            <span className="font-extrabold text-emerald-400 text-base">{percentage}%</span>
          </div>
          
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-sm shadow-emerald-500/30" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            <span>{completedCount} de {totalCount} concluídos</span>
            <span>Meta: 100% até Domingo</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0">
            <Hourglass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Modo Santo Foco (Silêncio Digital)</h3>
            <p className="text-xs sm:text-sm text-slate-400">Ative o cronômetro, guarde o celular e mergulhe na Bíblia física por 15 minutos.</p>
          </div>
        </div>
        <button onClick={() => setIsFocusOpen(true)} className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm">
          <Play className="w-4 h-4" /> Iniciar Desconexão
        </button>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
          <Quote className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs sm:text-sm italic text-slate-200">
            "Não se amoldem ao padrão deste mundo, mas transformem-se pela renovação da sua mente..."
          </p>
          <span className="text-[11px] font-semibold text-emerald-400 block mt-1">Romanos 12:2</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <ListChecks className="text-emerald-400 w-5 h-5" /> Missões da Semana
              </h3>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'biblia', label: '📖 Bíblia' },
                { id: 'detox', label: '📵 Detox' },
                { id: 'comunhao', label: '🙏 Oração' },
                { id: 'social', label: '🤝 Vida Real' },
              ].map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeFilter === cat.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredChallenges.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                <p className="font-medium text-sm">Nenhum desafio encontrado nessa categoria.</p>
              </div>
            ) : (
              filteredChallenges.map(ch => {
                const isDone = currentUser.completedChallenges.includes(ch.id);
                const reflection = currentUser.reflections[ch.id];
                return (
                  <div key={ch.id} className={`bg-slate-900/90 border ${isDone ? 'border-emerald-500/40 bg-gradient-to-r from-slate-900 to-emerald-950/20' : 'border-slate-800 hover:border-slate-700'} rounded-2xl p-4 sm:p-5 transition-all shadow-md`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[11px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                            +{ch.xp} XP
                          </span>
                          {ch.ref && (
                            <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center">
                              <BookOpen className="w-3 h-3 mr-1" /> {ch.ref}
                            </span>
                          )}
                        </div>
                        <h4 className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                          {ch.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ch.description}</p>
                        
                        {reflection && (
                          <div className="mt-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-emerald-300/90 italic flex">
                            <Quote className="w-3 h-3 mr-1 mt-0.5 shrink-0" /> {reflection}
                          </div>
                        )}
                      </div>
                      <div className="sm:shrink-0 pt-2 sm:pt-0">
                        <button 
                          onClick={() => handleChallengeToggle(ch.id)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isDone 
                              ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30' 
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                          }`}>
                          {isDone ? <Check className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
                          {isDone ? 'Concluído' : 'Marcar Feito'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Trophy className="text-amber-400 w-4 h-4" /> Ranking da Galera
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Semanal</span>
            </div>
            <div className="space-y-2.5">
              {sortedUsers.slice(0, 5).map((u, idx) => {
                const isCurrent = u.id === currentUser.id;
                const xp = u.completedChallenges.reduce((acc, id) => acc + (challenges.find(c => c.id === id)?.xp || 0), 0);
                const position = idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`;
                
                return (
                  <div key={u.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${isCurrent ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-slate-950/60 border-slate-800'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-slate-400 w-5 text-center">{position}</span>
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isCurrent ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {u.name} {isCurrent && <span className="text-[10px] text-emerald-400 font-normal">(Você)</span>}
                        </div>
                        <div className="text-[10px] text-slate-400">@{u.username}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400">{xp} XP</span>
                      <div className="text-[10px] text-slate-500">{u.completedChallenges.length} missões</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Award className="text-amber-400 w-4 h-4" /> Conquistas
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {BADGES.map(badge => {
                const unlocked = badge.condition({ completedCount, percent: percentage });
                return (
                  <div key={badge.id} className={`p-2.5 rounded-xl border ${unlocked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950 border-slate-800 opacity-40'} flex items-center gap-2`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${unlocked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                      <badge.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-[11px] font-bold ${unlocked ? 'text-amber-300' : 'text-slate-400'}`}>{badge.name}</div>
                      <div className="text-[9px] text-slate-400 leading-tight">{badge.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <FocusModal isOpen={isFocusOpen} onClose={() => setIsFocusOpen(false)} />
      <ReflectionModal 
        isOpen={!!pendingChallenge} 
        onClose={() => setPendingChallenge(null)} 
        challenge={pendingChallenge}
        onComplete={handleComplete}
      />
    </section>
  );
}
