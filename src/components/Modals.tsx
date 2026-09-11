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
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const success = await loginTeen(username.toLowerCase(), password);
        if (success) {
          onClose();
        } else {
          setError('Usuário ou senha incorretos.');
        }
      } else {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setLoading(false);
          return;
        }
        const success = await registerTeen(name, username.toLowerCase(), password);
        if (success) {
          onClose();
        } else {
          setError('Usuário já existe ou ocorreu um erro.');
        }
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique a internet.');
    } finally {
      setLoading(false);
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
            type="button"
            onClick={() => { setMode('login'); setError(''); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Já Tenho Conta
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setError(''); }} 
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
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50" 
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
                disabled={loading}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none text-sm disabled:opacity-50 ${mode === 'login' ? 'focus:border-indigo-500' : 'focus:border-emerald-500'}`} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Senha</label>
            <input 
              type="password" required placeholder="Digite sua senha" minLength={4}
              value={password || ''} onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none text-sm disabled:opacity-50 ${mode === 'login' ? 'focus:border-indigo-500' : 'focus:border-emerald-500'}`} 
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Confirme a Senha</label>
              <input 
                type="password" required placeholder="Repita a senha" minLength={4}
                value={confirmPassword || ''} onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50" 
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 font-bold rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              mode === 'login' 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Conectando...</span>
            ) : (
              <>
                {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {mode === 'login' ? 'Entrar na Minha Conta' : 'Concluir Cadastro & Começar'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminAuthModal({ isOpen, onClose }: ModalProps) {
  const { loginAdmin, loginAdminWithGoogle } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const ok = await loginAdmin(password);
      if (ok) {
        onClose();
        setPassword('');
      } else {
        setError('Senha incorreta.');
      }
    } catch {
      setError('Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const ok = await loginAdminWithGoogle();
      if (ok) {
        onClose();
      } else {
        setError('Não foi possível entrar com o Google.');
      }
    } catch {
      setError('Erro ao autenticar com Google.');
    } finally {
      setLoading(false);
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
          <p className="text-xs text-slate-400 mt-1">Digite a senha administrativa ou use sua conta Google.</p>
        </div>

        {error && <div className="text-xs font-bold text-rose-400 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Senha de Administrador</label>
            <input 
              type="password" required placeholder="Digite a senha" 
              value={password || ''} onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-50" 
            />
            <p className="text-[11px] text-slate-500 mt-1 italic">Dica: <strong className="text-indigo-400">lider123</strong></p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-semibold">Cancelar</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Desbloquear Painel'}
            </button>
          </div>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">ou</span></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.4-.4-2.2 0-.8.2-1.5.4-2.2L1.9 7.4C.7 9.8 0 12.3 0 15s.7 5.2 1.9 7.6l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"/>
          </svg>
          Entrar com Google (Líder)
        </button>
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
