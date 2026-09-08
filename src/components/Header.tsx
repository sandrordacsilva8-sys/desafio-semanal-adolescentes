import { useAppStore } from '../store/AppStore';
import { BookOpen, Shield, ChevronDown, ArrowLeft, BookMarked, SquarePen } from 'lucide-react';
import { useState } from 'react';

export function Header({ onOpenAuth, onOpenAdminAuth }: { onOpenAuth: () => void, onOpenAdminAuth: () => void }) {
  const { currentView, setCurrentView, currentUser, isAdminAuthenticated } = useAppStore();

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      if (currentView === 'admin') {
        setCurrentView('teen');
      } else {
        setCurrentView('admin');
      }
    } else {
      onOpenAdminAuth();
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/90 border-b border-slate-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setCurrentView('teen')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">Youth Challenge</span>
            <h1 className="text-sm sm:text-base font-extrabold leading-none text-white">Bíblia &gt; Celular</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentView === 'admin' ? (
            <>
              <div className="hidden sm:inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-white">Líder (Admin)</span>
              </div>
              <button 
                onClick={handleAdminClick} 
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-500 bg-indigo-600 text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setCurrentView('library')} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                  currentView === 'library' 
                    ? 'border-indigo-500 bg-indigo-600 text-white' 
                    : 'border-slate-700 bg-slate-800 text-indigo-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Biblioteca</span>
              </button>

              <button 
                onClick={() => setCurrentView('devotionals')} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                  currentView === 'devotionals' 
                    ? 'border-indigo-500 bg-indigo-600 text-white' 
                    : 'border-slate-700 bg-slate-800 text-indigo-300 hover:text-white'
                }`}
              >
                <SquarePen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Devocionais</span>
              </button>

              <button 
                onClick={() => setCurrentView('bible')} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                  currentView === 'bible' 
                    ? 'border-indigo-500 bg-indigo-600 text-white' 
                    : 'border-slate-700 bg-slate-800 text-indigo-300 hover:text-white'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bíblia NVI</span>
              </button>

              <div className="flex items-center gap-2">
                {currentUser ? (
                  <button 
                    onClick={onOpenAuth} 
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block leading-none">
                      <div className="text-xs font-bold text-white max-w-[100px] truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-400 max-w-[100px] truncate">@{currentUser.username}</div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-1 hidden sm:block" />
                  </button>
                ) : (
                  <button 
                    onClick={onOpenAuth} 
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                  >
                    Entrar
                  </button>
                )}
              </div>
              <button 
                onClick={handleAdminClick} 
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Shield className="text-indigo-400 w-3.5 h-3.5" />
                <span className="hidden sm:inline">Líder</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
