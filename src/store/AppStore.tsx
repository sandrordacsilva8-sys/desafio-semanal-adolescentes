import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Challenge, ViewState } from '../types';

interface AppState {
  users: User[];
  challenges: Challenge[];
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
  completeChallenge: (challengeId: string, reflection?: string) => void;
  uncompleteChallenge: (challengeId: string) => void;
  addChallenge: (challenge: Omit<Challenge, 'id'>) => void;
  updateChallenge: (id: string, challenge: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  deleteUser: (id: string) => void;
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
      currentUserId: state.currentUserId,
      adminPassword: state.adminPassword,
    }));
  }, [state.users, state.challenges, state.currentUserId, state.adminPassword]);

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

  const completeChallenge = (challengeId: string, reflection?: string) => {
    if (!state.currentUserId) return;
    setState(prev => {
      const users = prev.users.map(u => {
        if (u.id === prev.currentUserId) {
          return {
            ...u,
            completedChallenges: [...u.completedChallenges, challengeId],
            reflections: reflection ? { ...u.reflections, [challengeId]: reflection } : u.reflections
          };
        }
        return u;
      });
      return { ...prev, users };
    });
  };

  const uncompleteChallenge = (challengeId: string) => {
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

  const resetAllProgress = () => {
    updateState({
      users: state.users.map(u => ({ ...u, completedChallenges: [], reflections: {} }))
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
      uncompleteChallenge,
      addChallenge,
      updateChallenge,
      deleteChallenge,
      deleteUser,
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
