import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/AppStore';
import { AdminSettingsModal, ChallengeModal, DeleteUserModal, ConfirmModal } from './AdminModals';
import { Lock, Plus, Key, LogOut, Check, Users, RotateCcw, List, SquarePen, Trash2, BookOpen, Upload, Link as LinkIcon } from 'lucide-react';
import { set, del } from 'idb-keyval';

export function AdminView() {
  const { challenges, users, books, devotionals, verseOfTheDay, deleteChallenge, deleteUser, resetAllProgress, logoutAdmin, addBook, deleteBook, setVerseOfTheDay, addDevotional, updateDevotional, deleteDevotional } = useAppStore();
  const [activeTab, setActiveTab] = useState<'challenges' | 'users' | 'books' | 'devotionals'>('challenges');
  
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookUrl, setNewBookUrl] = useState('');
  const [newBookPdf, setNewBookPdf] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'link' | 'pdf'>('link');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<any>(null);
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const [devotionalToDelete, setDevotionalToDelete] = useState<any>(null);

  const [verseText, setVerseText] = useState(verseOfTheDay?.text || '');
  const [verseRef, setVerseRef] = useState(verseOfTheDay?.reference || '');
  const [isEditingVerse, setIsEditingVerse] = useState(!verseOfTheDay);

  useEffect(() => {
    if (verseOfTheDay) {
      setVerseText(verseOfTheDay.text || '');
      setVerseRef(verseOfTheDay.reference || '');
    } else {
      setVerseText('');
      setVerseRef('');
      setIsEditingVerse(true);
    }
  }, [verseOfTheDay]);

  const [devotionalTitle, setDevotionalTitle] = useState('');
  const [devotionalContent, setDevotionalContent] = useState('');
  const [isAddingDevotional, setIsAddingDevotional] = useState(false);

  const totalXP = challenges.reduce((sum, c) => sum + c.xp, 0);

  const handleEdit = (c: any) => {
    setEditingChallenge(c);
    setIsChallengeOpen(true);
  };

  const handleCreate = () => {
    setEditingChallenge(null);
    setIsChallengeOpen(true);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    if (uploadMode === 'pdf' && newBookPdf) {
      setIsUploading(true);
      const bookId = 'b_' + Date.now();
      try {
        await set(`pdf_${bookId}`, newBookPdf);
        addBook({ id: bookId, title: newBookTitle.trim(), isPdf: true });
        setNewBookTitle('');
        setNewBookPdf(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error(err);
        alert('Falha ao salvar PDF.');
      }
      setIsUploading(false);
    } else if (uploadMode === 'link' && newBookUrl.trim()) {
      addBook({ title: newBookTitle.trim(), url: newBookUrl.trim(), isPdf: false });
      setNewBookTitle('');
      setNewBookUrl('');
    }
  };

  const handlePdfDelete = async (id: string, isPdf?: boolean) => {
    if (isPdf) {
      await del(`pdf_${id}`);
    }
    deleteBook(id);
    setBookToDelete(null);
  };

  const handleSaveVerse = () => {
    if (verseText.trim() && verseRef.trim()) {
      setVerseOfTheDay({ text: verseText.trim(), reference: verseRef.trim() });
      setIsEditingVerse(false);
    }
  };

  const handleDeleteVerse = () => {
    setVerseOfTheDay(null);
    setVerseText('');
    setVerseRef('');
    setIsEditingVerse(true);
  };

  const handleAddDevotional = (e: React.FormEvent) => {
    e.preventDefault();
    if (devotionalTitle.trim() && devotionalContent.trim()) {
      addDevotional({
        title: devotionalTitle.trim(),
        content: devotionalContent.trim(),
        date: new Date().toISOString()
      });
      setDevotionalTitle('');
      setDevotionalContent('');
      setIsAddingDevotional(false);
    }
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
          <div className="flex flex-wrap items-center gap-2">
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
            <button 
              onClick={() => setActiveTab('books')} 
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 ${activeTab === 'books' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" /> Livros
            </button>
            <button 
              onClick={() => setActiveTab('devotionals')} 
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 ${activeTab === 'devotionals' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <SquarePen className="w-4 h-4" /> Estudos & Versículo
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
                  const xp = u.totalXP ?? (u.completedChallenges.reduce((sum, id) => sum + (challenges.find(c => c.id === id)?.xp || 0), 0) + (u.bonusXP || 0));

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

        {activeTab === 'books' && (
          <div className="space-y-6">
            <form onSubmit={handleAddBook} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Adicionar Livro
                </h3>
                <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
                  <button type="button" onClick={() => setUploadMode('link')} className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${uploadMode === 'link' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <LinkIcon className="w-3.5 h-3.5" /> Link (Canva)
                  </button>
                  <button type="button" onClick={() => setUploadMode('pdf')} className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${uploadMode === 'pdf' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Upload className="w-3.5 h-3.5" /> Enviar PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Título do Livro"
                  value={newBookTitle || ''}
                  onChange={e => setNewBookTitle(e.target.value)}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none w-full"
                  required
                />
                
                {uploadMode === 'link' ? (
                  <input
                    type="url"
                    placeholder="Link Público do Canva (ex: /view)"
                    value={newBookUrl || ''}
                    onChange={e => setNewBookUrl(e.target.value)}
                    className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none w-full"
                    required
                  />
                ) : (
                  <input
                    type="file"
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={e => setNewBookPdf(e.target.files?.[0] || null)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:border-indigo-500 focus:outline-none w-full file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                    required
                  />
                )}
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isUploading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50">
                  <Plus className="w-4 h-4" /> {isUploading ? 'Salvando...' : 'Adicionar Livro'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books && books.length > 0 ? (
                books.map(book => (
                  <div key={book.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {book.isPdf ? (
                          <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded">PDF</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">Link</span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-base mb-1 line-clamp-1">{book.title}</h4>
                      {!book.isPdf && <p className="text-xs text-slate-400 truncate">{book.url}</p>}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => setBookToDelete(book)} 
                        className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                  Nenhum livro cadastrado.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'devotionals' && (
          <div className="space-y-8">
            {/* Versículo do Dia Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" /> Versículo do Dia
                </h3>
                {!isEditingVerse && verseOfTheDay && (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingVerse(true)} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition">
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button onClick={handleDeleteVerse} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {isEditingVerse ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Texto do Versículo</label>
                    <textarea
                      value={verseText || ''}
                      onChange={e => setVerseText(e.target.value)}
                      placeholder='"Não se amoldem ao padrão deste mundo..."'
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Referência</label>
                    <input
                      type="text"
                      value={verseRef || ''}
                      onChange={e => setVerseRef(e.target.value)}
                      placeholder="Romanos 12:2"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {verseOfTheDay && (
                      <button onClick={() => {
                        setVerseText(verseOfTheDay?.text || '');
                        setVerseRef(verseOfTheDay?.reference || '');
                        setIsEditingVerse(false);
                      }} className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm">
                        Cancelar
                      </button>
                    )}
                    <button onClick={handleSaveVerse} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition">
                      <Check className="w-4 h-4" /> Salvar Versículo
                    </button>
                  </div>
                </div>
              ) : verseOfTheDay ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <p className="text-slate-300 italic mb-3 text-lg leading-relaxed">"{verseOfTheDay.text}"</p>
                  <p className="font-bold text-emerald-400 text-sm">{verseOfTheDay.reference}</p>
                </div>
              ) : null}
            </div>

            <hr className="border-slate-800" />

            {/* Estudos Devocionais Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-white text-xl flex items-center gap-2">
                  <SquarePen className="w-6 h-6 text-indigo-400" /> Estudos Devocionais
                </h3>
                <button 
                  onClick={() => setIsAddingDevotional(!isAddingDevotional)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> {isAddingDevotional ? 'Cancelar' : 'Novo Estudo'}
                </button>
              </div>

              {isAddingDevotional && (
                <form onSubmit={handleAddDevotional} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Título do Estudo</label>
                    <input
                      type="text"
                      value={devotionalTitle || ''}
                      onChange={e => setDevotionalTitle(e.target.value)}
                      placeholder="Tema do devocional..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Conteúdo</label>
                    <textarea
                      value={devotionalContent || ''}
                      onChange={e => setDevotionalContent(e.target.value)}
                      placeholder="Escreva o estudo aqui..."
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none resize-y"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition">
                      <Check className="w-4 h-4" /> Publicar Estudo
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {devotionals && devotionals.length > 0 ? (
                  devotionals.map(dev => (
                    <div key={dev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-white text-lg">{dev.title}</h4>
                          <span className="text-xs text-slate-500">{new Date(dev.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <button 
                          onClick={() => setDevotionalToDelete(dev)}
                          className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{dev.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                    Nenhum devocional publicado ainda.
                  </div>
                )}
              </div>
            </div>
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
      <ConfirmModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        title="Excluir Livro"
        message={`Tem certeza que deseja excluir o livro "${bookToDelete?.title}"?`}
        onConfirm={() => handlePdfDelete(bookToDelete?.id, bookToDelete?.isPdf)}
        isDestructive={true}
      />
      <ConfirmModal
        isOpen={!!devotionalToDelete}
        onClose={() => setDevotionalToDelete(null)}
        title="Excluir Estudo Devocional"
        message={`Tem certeza que deseja excluir o estudo "${devotionalToDelete?.title}"?`}
        onConfirm={() => deleteDevotional(devotionalToDelete?.id)}
        isDestructive={true}
      />
    </section>
  );
}
