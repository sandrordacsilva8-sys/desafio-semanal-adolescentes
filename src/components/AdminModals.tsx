import React, { useState, useEffect } from 'react';
import { X, Shield, SquarePen, Trash2, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import { Challenge } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen, onClose, title, message, onConfirm, isDestructive = true
}: ModalProps & { title: string, message: string, onConfirm: () => void, isDestructive?: boolean }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-xl mb-1 ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
          {isDestructive ? <Trash2 className="w-6 h-6" /> : <RotateCcw className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-xl">Cancelar</button>
          <button type="button" onClick={() => { onConfirm(); onClose(); }} className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md ${isDestructive ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'}`}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsModal({ isOpen, onClose }: ModalProps) {
  const { changeAdminPassword } = useAppStore();
  const [curr, setCurr] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 4) {
      setError('A nova senha deve ter pelo menos 4 dígitos.');
      return;
    }
    const success = changeAdminPassword(curr, next);
    if (success) {
      onClose();
      setCurr('');
      setNext('');
      setError('');
    } else {
      setError('Senha atual incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-base font-extrabold text-white">Alterar Senha de Líder</h3>
          <p className="text-xs text-slate-400 mt-0.5">Atualize a senha mestre de acesso.</p>
        </div>

        {error && <div className="text-xs font-bold text-rose-400 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Senha Atual</label>
            <input 
              type="password" required value={curr} onChange={e => setCurr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nova Senha</label>
            <input 
              type="password" required minLength={4} value={next} onChange={e => setNext(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ChallengeModal({ 
  isOpen, onClose, challenge 
}: ModalProps & { challenge?: Challenge }) {
  const { addChallenge, updateChallenge } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('detox');
  const [xp, setXp] = useState(50);
  const [ref, setRef] = useState('');

  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title || '');
      setDescription(challenge.description || '');
      setCategory(challenge.category || 'detox');
      setXp(challenge.xp ?? 50);
      setRef(challenge.ref || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('detox');
      setXp(50);
      setRef('');
    }
  }, [challenge, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (challenge) {
      updateChallenge(challenge.id, { title, description, category, xp, ref });
    } else {
      addChallenge({ title, description, category, xp, ref });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-lg text-white">
            {challenge ? 'Editar Desafio' : 'Cadastrar Novo Desafio'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Título do Desafio</label>
            <input 
              type="text" required placeholder="Ex: Deixar o celular na sala" 
              value={title || ''} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Descrição</label>
            <textarea 
              required rows={2} placeholder="Explique a instrução..." 
              value={description || ''} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Categoria</label>
              <select 
                value={category || 'detox'} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="detox">📵 Detox de Celular</option>
                <option value="biblia">📖 Leitura da Bíblia</option>
                <option value="comunhao">🙏 Oração & Louvor</option>
                <option value="social">🤝 Ação & Vida Real</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">XP</label>
              <input 
                type="number" min="10" max="200" step="5" required
                value={isNaN(xp) ? '' : xp} onChange={e => setXp(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Versículo Base (Opcional)</label>
            <input 
              type="text" placeholder="Ex: Salmos 119:105" 
              value={ref || ''} onChange={e => setRef(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm" 
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold">Cancelar</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md">
              Salvar Desafio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteUserModal({ 
  isOpen, onClose, user, onConfirm 
}: ModalProps & { user: any, onConfirm: () => void }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center text-xl mb-1">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white">Excluir Adolescente</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Tem certeza de que deseja remover <strong className="text-rose-400">{user.name}</strong>? Todo o histórico será apagado.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-xl">Cancelar</button>
          <button type="button" onClick={() => { onConfirm(); onClose(); }} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30">
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
