import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/AppStore';
import { X, Shield, LogIn, UserPlus, Play, RotateCcw, CheckCheck, Trash2, SmartphoneNfc } from 'lucide-react';
import { Challenge } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: ModalProps) {
  const { loginTeen, registerTeen } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'login') {
      const success = loginTeen(username.toLowerCase(), password);
      if (success) {
        onClose();
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } else {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      const success = registerTeen(name, username.toLowerCase(), password);
      if (success) {
        onClose();
      } else {
        setError('Usuário já existe.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mx-auto flex items-center justify-center text-xl mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Conta do Adolescente</h3>
          <p className="text-xs text-slate-400 mt-1">Acompanhe seu progresso e suba de nível na Palavra!</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4">
          <button 
            onClick={() => setMode('login')} 
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Já Tenho Conta
          </button>
          <button 
            onClick={() => setMode('register')} 
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Criar Nova Conta
          </button>
        </div>

        {error && <div className="mb-4 text-xs font-bold text-rose-400 bg-rose-500/10 p-2 rounded-lg text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Seu Nome / Apelido</label>
              <input 
                type="text" required placeholder="Ex: Lucas Silva" 
                value={name || ''} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm" 
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Usuário (@)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">@</span>
              <input 
                type="text" required placeholder={mode === 'login' ? "lucas_focado" : "lucas_silva"}
                value={username || ''} onChange={e => setUsername(e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none text-sm ${mode === 'login' ? 'focus:border-indigo-500' : 'focus:border-emerald-500'}`} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Senha</label>
            <input 
              type="password" required placeholder="Digite sua senha" minLength={4}
              value={password || ''} onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none text-sm ${mode === 'login' ? 'focus:border-indigo-500' : 'focus:border-emerald-500'}`} 
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Confirme a Senha</label>
              <input 
                type="password" required placeholder="Repita a senha" minLength={4}
                value={confirmPassword || ''} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm" 
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full py-3 font-bold rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'login' 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {mode === 'login' ? 'Entrar na Minha Conta' : 'Concluir Cadastro & Começar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminAuthModal({ isOpen, onClose }: ModalProps) {
  const { loginAdmin } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      onClose();
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mx-auto flex items-center justify-center text-xl mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-white">Acesso Restrito ao Líder</h3>
          <p className="text-xs text-slate-400 mt-1">Digite a senha administrativa para continuar.</p>
        </div>

        {error && <div className="text-xs font-bold text-rose-400 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Senha de Administrador</label>
            <input 
              type="password" required placeholder="Digite a senha" 
              value={password || ''} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm" 
            />
            <p className="text-[11px] text-slate-500 mt-1 italic">Dica: <strong className="text-indigo-400">lider123</strong></p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-semibold">Cancelar</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md">
              Desbloquear Painel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReflectionModal({ 
  isOpen, onClose, challenge, onComplete 
}: ModalProps & { challenge: Challenge | null, onComplete: (note: string, minutes: number) => void }) {
  const [note, setNote] = useState('');
  const [openTime, setOpenTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOpenTime(Date.now());
      setErrorMsg('');
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen || !challenge) return null;

  const handleConfirm = () => {
    const elapsed = Date.now() - openTime;
    if (elapsed < 3 * 60 * 1000) {
      setErrorMsg('Não concluiu: Não Desista, Perto está o Senhor');
      return;
    }
    onComplete(note, Math.floor(elapsed / 60000));
    setNote('');
  };

  const handleSkip = () => {
    const elapsed = Date.now() - openTime;
    if (elapsed < 3 * 60 * 1000) {
      setErrorMsg('Não concluiu: Não Desista, Perto está o Senhor');
      return;
    }
    onComplete('', Math.floor(elapsed / 60000));
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Registrar Vitória</h3>
            <p className="text-xs text-slate-400">{challenge.title}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Como foi trocar a tela pela Bíblia nesta missão? (Opcional)</label>
          <textarea 
            rows={3} 
            placeholder="Ex: Deixar o celular fora do quarto me deu paz..." 
            value={note || ''} onChange={e => setNote(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
          ></textarea>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl text-sm font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-in fade-in">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={handleSkip} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold">Pular nota</button>
          <button onClick={handleConfirm} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20">
            Confirmar Conclusão (+XP)
          </button>
        </div>
      </div>
    </div>
  );
}
