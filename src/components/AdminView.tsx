import { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { AdminSettingsModal, ChallengeModal, DeleteUserModal, ConfirmModal } from './AdminModals';
import { Lock, Plus, Key, LogOut, Check, Users, RotateCcw, List, SquarePen, Trash2 } from 'lucide-react';

export function AdminView() {
  const { challenges, users, deleteChallenge, deleteUser, resetAllProgress, logoutAdmin } = useAppStore();
  const [activeTab, setActiveTab] = useState<'challenges' | 'users'>('challenges');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<any>(null);

  const totalXP = challenges.reduce((sum, c) => sum + c.xp, 0);

  const handleEdit = (c: any) => {
    setEditingChallenge(c);
    setIsChallengeOpen(true);
  };

  const handleCreate = () => {
    setEditingChallenge(null);
    setIsChallengeOpen(true);
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Lock className="w-3 h-3" /> Sessão Administrativa Ativa
          </div>
          <h2 className="text-2xl font-black text-white">Painel do Líder Teen</h2>
          <p className="text-xs sm:text-sm text-slate-400">Gerencie os desafios e acompanhe a evolução de cada jovem.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleCreate} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> Novo Desafio
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 text-xs sm:text-sm flex items-center gap-1.5">
            <Key className="w-4 h-4" /> Alterar Senha
          </button>
          <button onClick={logoutAdmin} className="px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold rounded-2xl border border-rose-500/30 text-xs sm:text-sm flex items-center gap-1.5">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400">Desafios Ativos</span>
          <div className="text-3xl font-black text-white mt-1">{challenges.length}</div>
          <span className="text-[11px] text-emerald-400 mt-2 flex items-center font-medium"><Check className="w-3 h-3 mr-1" /> Prontos para uso</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400">XP Total da Semana</span>
          <div className="text-3xl font-black text-indigo-400 mt-1">{totalXP} XP</div>
          <span className="text-[11px] text-slate-400 mt-2 block font-medium">Recompensa total disponível</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400">Jovens Cadastrados</span>
          <div className="text-3xl font-black text-amber-400 mt-1">{users.length}</div>
          <span className="text-[11px] text-amber-400/80 mt-2 flex items-center font-medium"><Users className="w-3 h-3 mr-1" /> Participando ativamente</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('challenges')} 
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 ${activeTab === 'challenges' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" /> Desafios
            </button>
            <button 
              onClick={() => setActiveTab('users')} 
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> Adolescentes
            </button>
          </div>
          <button onClick={() => setConfirmResetOpen(true)} className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition">
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Progresso de Todos
          </button>
        </div>

        {activeTab === 'challenges' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-800/70 text-[11px] uppercase text-slate-400 rounded-xl">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Desafio</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5">XP</th>
                  <th className="p-3.5">Ref</th>
                  <th className="p-3.5 text-right rounded-r-xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {challenges.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{c.title}</div>
                      <div className="text-xs text-slate-400 max-w-sm line-clamp-1">{c.description}</div>
                    </td>
                    <td className="p-3.5 capitalize">{c.category}</td>
                    <td className="p-3.5 font-bold text-amber-400 text-xs">+{c.xp} XP</td>
                    <td className="p-3.5 text-xs text-indigo-300 font-mono">{c.ref || '—'}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <button onClick={() => handleEdit(c)} className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition">
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button onClick={() => setChallengeToDelete(c)} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-800/70 text-[11px] uppercase text-slate-400 rounded-xl">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Adolescente</th>
                  <th className="p-3.5">Usuário (@)</th>
                  <th className="p-3.5">Desafios Feitos</th>
                  <th className="p-3.5">Progresso</th>
                  <th className="p-3.5 text-right">Total XP</th>
                  <th className="p-3.5 text-right rounded-r-xl">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => {
                  const completed = u.completedChallenges.filter(id => challenges.some(c => c.id === id)).length;
                  const pct = challenges.length > 0 ? Math.round((completed / challenges.length) * 100) : 0;
                  const xp = u.completedChallenges.reduce((sum, id) => sum + (challenges.find(c => c.id === id)?.xp || 0), 0) + (u.bonusXP || 0);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{u.name}</div>
                        <div className="text-[10px] text-slate-400">Ofensiva: {u.streak} dias</div>
                      </td>
                      <td className="p-3.5 font-mono text-xs text-slate-300">@{u.username}</td>
                      <td className="p-3.5 text-xs font-semibold text-slate-200">{completed} de {challenges.length}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-black text-amber-400 text-xs">{xp} XP</td>
                      <td className="p-3.5 text-right">
                        <button onClick={() => { setUserToDelete(u); setDeleteUserOpen(true); }} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ChallengeModal isOpen={isChallengeOpen} onClose={() => setIsChallengeOpen(false)} challenge={editingChallenge} />
      <DeleteUserModal isOpen={deleteUserOpen} onClose={() => setDeleteUserOpen(false)} user={userToDelete} onConfirm={() => deleteUser(userToDelete?.id)} />
      <ConfirmModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reiniciar a semana"
        message="Tem certeza que deseja reiniciar o progresso de TODOS os adolescentes? Esta ação não pode ser desfeita."
        onConfirm={resetAllProgress}
        isDestructive={false}
      />
      <ConfirmModal
        isOpen={!!challengeToDelete}
        onClose={() => setChallengeToDelete(null)}
        title="Excluir Desafio"
        message={`Tem certeza que deseja excluir o desafio "${challengeToDelete?.title}"?`}
        onConfirm={() => deleteChallenge(challengeToDelete?.id)}
        isDestructive={true}
      />
    </section>
  );
}
