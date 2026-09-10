import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Challenge, ViewState, LibraryBook, VerseOfTheDay, Devotional } from '../types';

interface AppState {
  users: User[];
  challenges: Challenge[];
  books: LibraryBook[];
  devotionals: Devotional[];
  verseOfTheDay: VerseOfTheDay | null;
  currentUserId: string | null;
  adminPassword: string;
  isAdminAuthenticated: boolean;
  currentView: ViewState;
}

interface AppContextType extends AppState {
  loginTeen: (username: string, pass: string) => boolean;
  registerTeen: (name: string, username: string, pass: string) => boolean;
  logoutTeen: () => void;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => boolean;
  setCurrentView: (view: ViewState) => void;
  completeChallenge: (challengeId: string, reflection?: string, bonusXP?: number) => void;
  addBonusXP: (amount: number) => void;
  uncompleteChallenge: (challengeId: string) => void;
  startChallengeTimer: (challengeId: string) => void;
  addChallenge: (challenge: Omit<Challenge, 'id'>) => void;
  updateChallenge: (id: string, challenge: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  deleteUser: (id: string) => void;
  addBook: (book: Omit<LibraryBook, 'id'> | LibraryBook) => void;
  deleteBook: (id: string) => void;
  setVerseOfTheDay: (verse: VerseOfTheDay | null) => void;
  addDevotional: (devotional: Omit<Devotional, 'id'>) => void;
  updateDevotional: (id: string, devotional: Partial<Devotional>) => void;
  deleteDevotional: (id: string) => void;
  resetAllProgress: () => void;
  currentUser: User | null;
}

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Primeira Hora: Deus antes do Feed',
    description: 'Não encoste em redes sociais antes de abrir sua Bíblia física e ler 1 capítulo do dia.',
    category: 'detox',
    xp: 60,
    ref: 'Salmos 5:3'
  },
  {
    id: 'c2',
    title: 'Troca da Notificação por Sabedoria',
    description: 'Sentiu tédio e vontade impulsiva de pegar o celular? Abra Provérbios e leia 5 versículos.',
    category: 'biblia',
    xp: 50,
    ref: 'Provérbios 3:5-6'
  },
  {
    id: 'c3',
    title: 'Cesta do Celular na Refeição',
    description: 'Jante com sua família com o celular totalmente guardado em outro cômodo e puxe um bom papo.',
    category: 'social',
    xp: 40,
    ref: 'Hebreus 10:24'
  },
  {
    id: 'c4',
    title: 'Quarto em Silêncio Sagrado',
    description: 'Pelo menos 10 minutos de oração sincera com o quarto escuro e celular em Modo Avião.',
    category: 'comunhao',
    xp: 50,
    ref: 'Mateus 6:6'
  },
  {
    id: 'c5',
    title: 'Bíblia de Papel no Culto ou Encontro Teen',
    description: 'Vá ao próximo culto ou célula carregando e lendo sua Bíblia física em vez da tela.',
    category: 'biblia',
    xp: 70,
    ref: '2 Timóteo 3:16'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('conecta_teen_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isAdminAuthenticated: false,
          currentView: 'teen', // Always reset view on load
        };
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return {
      users: [],
      challenges: INITIAL_CHALLENGES,
      books: [],
      devotionals: [],
      verseOfTheDay: null,
      currentUserId: null,
      adminPassword: 'lider123',
      isAdminAuthenticated: false,
      currentView: 'teen',
    };
  });

  useEffect(() => {
    localStorage.setItem('conecta_teen_state', JSON.stringify({
      users: state.users,
      challenges: state.challenges,
      books: state.books || [],
      devotionals: state.devotionals || [],
      verseOfTheDay: state.verseOfTheDay || null,
      currentUserId: state.currentUserId,
      adminPassword: state.adminPassword,
    }));
  }, [state.users, state.challenges, state.books, state.devotionals, state.verseOfTheDay, state.currentUserId, state.adminPassword]);

  const currentUser = state.users.find(u => u.id === state.currentUserId) || null;

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const loginTeen = (username: string, pass: string) => {
    const u = state.users.find(u => u.username === username);
    if (u && u.password === pass) {
      updateState({ currentUserId: u.id, currentView: 'teen' });
      return true;
    }
    return false;
  };

  const registerTeen = (name: string, username: string, pass: string) => {
    if (state.users.some(u => u.username === username)) return false;
    const newUser: User = {
      id: 'u_' + Date.now(),
      name,
      username,
      password: pass,
      streak: 1,
      completedChallenges: [],
      reflections: {}
    };
    updateState({ users: [...state.users, newUser], currentUserId: newUser.id, currentView: 'teen' });
    return true;
  };

  const logoutTeen = () => {
    updateState({ currentUserId: null });
  };

  const loginAdmin = (pass: string) => {
    if (pass === state.adminPassword) {
      updateState({ isAdminAuthenticated: true, currentView: 'admin' });
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    updateState({ isAdminAuthenticated: false, currentView: 'teen' });
  };

  const changeAdminPassword = (oldPass: string, newPass: string) => {
    if (oldPass === state.adminPassword) {
      updateState({ adminPassword: newPass });
      return true;
    }
    return false;
  };

  const setCurrentView = (view: 'teen' | 'admin') => updateState({ currentView: view });

  const completeChallenge = (challengeId: string, reflection?: string, bonusXP: number = 0) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const challenge = prev.challenges.find(c => c.id === challengeId);
      const xpEarned = (challenge?.xp || 0) + bonusXP;

      const users = prev.users.map(u => {
        if (u.id === prev.currentUserId) {
          // Calcula XP atual se ainda não estiver definido no totalXP
          const currentTotalXP = u.totalXP ?? (u.completedChallenges.reduce((acc, id) => {
            const ch = prev.challenges.find(c => c.id === id);
            return acc + (ch ? ch.xp : 0);
          }, 0) + (u.bonusXP || 0));

          const newCompleted = [...u.completedChallenges, challengeId];
          const newReflections = reflection ? { ...u.reflections, [challengeId]: reflection } : u.reflections;
          
          let finalCompleted = newCompleted;
          let finalReflections = newReflections;
          
          const newActiveTimers = { ...(u.activeTimers || {}) };
          delete newActiveTimers[challengeId];

          // Condição de ciclo: checa se todos os desafios disponíveis foram concluídos
          const activeChallengeIds = prev.challenges.map(c => c.id);
          const hasAll = activeChallengeIds.length > 0 && activeChallengeIds.every(id => newCompleted.includes(id));
          
          if (hasAll) {
            // Volta status para não concluído destravando tudo
            finalCompleted = []; 
            // Mantém ou reseta reflexões? Melhor limpar para a nova rodada
            finalReflections = {};
          }

          return {
            ...u,
            completedChallenges: finalCompleted,
            reflections: finalReflections,
            totalXP: currentTotalXP + xpEarned,
            bonusXP: 0, // migrado para totalXP
            activeTimers: newActiveTimers
          };
        }
        return u;
      });
      return { ...prev, users };
    });
  };

  const startChallengeTimer = (challengeId: string) => {
    if (!state.currentUserId) return;
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === prev.currentUserId) {
          return {
            ...u,
            activeTimers: { ...(u.activeTimers || {}), [challengeId]: Date.now() }
          };
        }
        return u;
      })
    }));
  };

  const addBonusXP = (amount: number) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const users = prev.users.map(u => {
        if (u.id === prev.currentUserId) {
          const currentTotalXP = u.totalXP ?? (u.completedChallenges.reduce((acc, id) => {
            const ch = prev.challenges.find(c => c.id === id);
            return acc + (ch ? ch.xp : 0);
          }, 0) + (u.bonusXP || 0));
          return { ...u, totalXP: currentTotalXP + amount, bonusXP: 0 };
        }
        return u;
      });
      return { ...prev, users };
    });
  };

  const uncompleteChallenge = (challengeId: string) => {
    // Retirado a pedido do usuário (ficam desativados/bloqueados após concluídos)
    // Mantemos a função por compatibilidade, mas sem remover XP
    if (!state.currentUserId) return;
    setState(prev => {
      const users = prev.users.map(u => {
        if (u.id === prev.currentUserId) {
          const { [challengeId]: removedRef, ...restRefs } = u.reflections;
          return {
            ...u,
            completedChallenges: u.completedChallenges.filter(id => id !== challengeId),
            reflections: restRefs
          };
        }
        return u;
      });
      return { ...prev, users };
    });
  };

  const addChallenge = (challenge: Omit<Challenge, 'id'>) => {
    const newChallenge: Challenge = { ...challenge, id: 'c_' + Date.now() };
    updateState({ challenges: [newChallenge, ...state.challenges] });
  };

  const updateChallenge = (id: string, updates: Partial<Challenge>) => {
    updateState({
      challenges: state.challenges.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const deleteChallenge = (id: string) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.filter(c => c.id !== id),
      users: prev.users.map(u => {
        const { [id]: removedRef, ...restRefs } = u.reflections;
        return {
          ...u,
          completedChallenges: u.completedChallenges.filter(cId => cId !== id),
          reflections: restRefs
        };
      })
    }));
  };

  const deleteUser = (id: string) => {
    setState(prev => {
      const newUsers = prev.users.filter(u => u.id !== id);
      return {
        ...prev,
        users: newUsers,
        currentUserId: prev.currentUserId === id ? (newUsers[0]?.id || null) : prev.currentUserId
      };
    });
  };

  const addBook = (book: Omit<LibraryBook, 'id'> | LibraryBook) => {
    const newBook: LibraryBook = { id: 'b_' + Date.now(), ...book };
    updateState({ books: [newBook, ...(state.books || [])] });
  };

  const deleteBook = (id: string) => {
    updateState({ books: (state.books || []).filter(b => b.id !== id) });
  };

  const setVerseOfTheDay = (verse: VerseOfTheDay | null) => {
    updateState({ verseOfTheDay: verse });
  };

  const addDevotional = (devotional: Omit<Devotional, 'id'>) => {
    const newDevotional: Devotional = { ...devotional, id: 'd_' + Date.now() };
    updateState({ devotionals: [newDevotional, ...(state.devotionals || [])] });
  };

  const updateDevotional = (id: string, updates: Partial<Devotional>) => {
    updateState({
      devotionals: (state.devotionals || []).map(d => d.id === id ? { ...d, ...updates } : d)
    });
  };

  const deleteDevotional = (id: string) => {
    updateState({ devotionals: (state.devotionals || []).filter(d => d.id !== id) });
  };

  const resetAllProgress = () => {
    updateState({
      users: state.users.map(u => ({ ...u, completedChallenges: [], reflections: {}, totalXP: 0, bonusXP: 0, activeTimers: {} }))
    });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      currentUser,
      loginTeen,
      registerTeen,
      logoutTeen,
      loginAdmin,
      logoutAdmin,
      changeAdminPassword,
      setCurrentView,
      completeChallenge,
      addBonusXP,
      uncompleteChallenge,
      startChallengeTimer,
      addChallenge,
      updateChallenge,
      deleteChallenge,
      deleteUser,
      addBook,
      deleteBook,
      setVerseOfTheDay,
      addDevotional,
      updateDevotional,
      deleteDevotional,
      resetAllProgress
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
