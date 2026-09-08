import { useAppStore } from '../store/AppStore';
import { SquarePen, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Devotional } from '../types';

export function DevotionalsView() {
  const { devotionals } = useAppStore();
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);

  if (selectedDevotional) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button 
          onClick={() => setSelectedDevotional(null)}
          className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2 mb-4"
        >
          &larr; Voltar para Estudos
        </button>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="mb-6 border-b border-slate-800 pb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{selectedDevotional.title}</h1>
            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-medium">
              <Calendar className="w-4 h-4" />
              {new Date(selectedDevotional.date).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {selectedDevotional.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0">
          <SquarePen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Estudos Devocionais</h2>
          <p className="text-xs sm:text-sm text-slate-400">Leia e reflita sobre os estudos publicados pela liderança.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {devotionals && devotionals.length > 0 ? (
          devotionals.map(dev => (
            <button
              key={dev.id}
              onClick={() => setSelectedDevotional(dev)}
              className="text-left bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all group"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{dev.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                {dev.content}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(dev.date).toLocaleDateString('pt-BR')}
              </div>
            </button>
          ))
        ) : (
          <div className="py-16 text-center text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <SquarePen className="w-8 h-8 mx-auto mb-3 text-slate-600 opacity-50" />
            <p className="font-medium">Nenhum estudo devocional disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
