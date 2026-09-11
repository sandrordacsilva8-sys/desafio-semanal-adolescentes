import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Challenge, User, LibraryBook, Devotional, VerseOfTheDay, ViewState } from '../types';
import { 
  auth, 
  db, 
  googleProvider,
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  currentUserId: string | null;
  users: User[];
  challenges: Challenge[];
  books: LibraryBook[];
  devotionals: Devotional[];
  verseOfTheDay: VerseOfTheDay | null;
  currentView: ViewState;
  isAdminAuthenticated: boolean;
  setCurrentView: (view: ViewState) => void;
  loginTeen: (username: string, pass: string) => Promise<boolean>;
  registerTeen: (name: string, username: string, pass: string) => Promise<boolean>;
  logoutTeen: () => void;
  loginAdmin: (pass: string) => Promise<boolean>;
  loginAdminWithGoogle: () => Promise<boolean>;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => boolean;
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
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('conecta_teen_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('conecta_teen_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [books, setBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem('conecta_teen_books');
    return saved ? JSON.parse(saved) : [];
  });

  const [devotionals, setDevotionals] = useState<Devotional[]>(() => {
    const saved = localStorage.getItem('conecta_teen_devotionals');
    return saved ? JSON.parse(saved) : [];
  });

  const [verseOfTheDay, setVerseOfTheDayState] = useState<VerseOfTheDay | null>(() => {
    const saved = localStorage.getItem('conecta_teen_verse');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('conecta_teen_cur_user_id');
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('conecta_teen_admin_pwd') || 'lider123';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewState>('teen');

  // Cache locally
  useEffect(() => {
    localStorage.setItem('conecta_teen_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('conecta_teen_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('conecta_teen_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('conecta_teen_devotionals', JSON.stringify(devotionals));
  }, [devotionals]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('conecta_teen_cur_user_id', currentUserId);
    } else {
      localStorage.removeItem('conecta_teen_cur_user_id');
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('conecta_teen_admin_pwd', adminPassword);
  }, [adminPassword]);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        if (fbUser.email === 'sandrordacsilva8@gmail.com' || fbUser.email === 'admin_church_leader@desafioteen.internal') {
          setIsAdminAuthenticated(true);
        } else {
          setCurrentUserId(fbUser.uid);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 1. Real-time Firestore Sync: USERS (Critical for Hostinger sync!)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const remoteUsers: User[] = [];
      snapshot.forEach(docSnap => {
        remoteUsers.push(docSnap.data() as User);
      });
      if (remoteUsers.length > 0) {
        setUsers(remoteUsers);
      }
    }, (error) => {
      console.warn('Firestore users snapshot listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Sync: CHALLENGES
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'challenges'), (snapshot) => {
      if (snapshot.empty) {
        // Seed initial challenges to Firestore if empty
        INITIAL_CHALLENGES.forEach(ch => {
          setDoc(doc(db, 'challenges', ch.id), ch).catch(() => {});
        });
      } else {
        const remoteChallenges: Challenge[] = [];
        snapshot.forEach(docSnap => {
          remoteChallenges.push(docSnap.data() as Challenge);
        });
        setChallenges(remoteChallenges);
      }
    }, (error) => {
      console.warn('Firestore challenges snapshot listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  // 3. Real-time Firestore Sync: DEVOTIONALS
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'devotionals'), (snapshot) => {
      const remote: Devotional[] = [];
      snapshot.forEach(docSnap => {
        remote.push(docSnap.data() as Devotional);
      });
      setDevotionals(remote);
    }, (error) => {
      console.warn('Firestore devotionals snapshot listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  // 4. Real-time Firestore Sync: BOOKS
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      const remote: LibraryBook[] = [];
      snapshot.forEach(docSnap => {
        remote.push(docSnap.data() as LibraryBook);
      });
      setBooks(remote);
    }, (error) => {
      console.warn('Firestore books snapshot listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  // 5. Real-time Firestore Sync: GLOBAL SETTINGS
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.verseOfTheDay !== undefined) {
          setVerseOfTheDayState(data.verseOfTheDay);
        }
      }
    }, (error) => {
      console.warn('Firestore settings snapshot listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  const loginTeen = async (username: string, pass: string): Promise<boolean> => {
    const cleanUser = username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
    const authEmail = `${cleanUser}@desafioteen.internal`;
    const authPassword = pass.length < 6 ? `${pass}_conecta_teen` : pass;

    try {
      const cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setCurrentUserId(cred.user.uid);
      setCurrentView('teen');
      return true;
    } catch (err: any) {
      // Fallback check against existing users list
      const matched = users.find(u => u.username.toLowerCase() === cleanUser);
      if (matched && matched.password === pass) {
        // Try to create/sync auth account
        try {
          const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
          setCurrentUserId(cred.user.uid);
        } catch {
          setCurrentUserId(matched.id);
        }
        setCurrentView('teen');
        return true;
      }
      return false;
    }
  };

  const registerTeen = async (name: string, username: string, pass: string): Promise<boolean> => {
    const cleanUser = username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
    if (users.some(u => u.username.toLowerCase() === cleanUser)) {
      return false;
    }

    const authEmail = `${cleanUser}@desafioteen.internal`;
    const authPassword = pass.length < 6 ? `${pass}_conecta_teen` : pass;

    try {
      let uid = '';
      try {
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        uid = cred.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
          uid = cred.user.uid;
        } else {
          throw authErr;
        }
      }

      const newUser: User = {
        id: uid,
        name: name.trim(),
        username: cleanUser,
        password: pass,
        streak: 1,
        completedChallenges: [],
        reflections: {},
        totalXP: 0,
        bonusXP: 0,
        activeTimers: {}
      };

      // Instantly update local state
      setUsers(prev => [...prev.filter(u => u.id !== uid), newUser]);
      setCurrentUserId(uid);
      setCurrentView('teen');

      // Sync to Firestore cloud database so leader immediately sees it on Hostinger!
      await setDoc(doc(db, 'users', uid), newUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logoutTeen = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUserId(null);
  };

  const loginAdmin = async (pass: string): Promise<boolean> => {
    if (pass === adminPassword) {
      try {
        const leaderEmail = 'admin_church_leader@desafioteen.internal';
        const leaderPass = 'lider123SecureChurch!';
        try {
          await signInWithEmailAndPassword(auth, leaderEmail, leaderPass);
        } catch {
          await createUserWithEmailAndPassword(auth, leaderEmail, leaderPass);
        }
      } catch (err) {
        console.warn('Firebase leader auth warning:', err);
      }
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
      return true;
    }
    return false;
  };

  const loginAdminWithGoogle = async (): Promise<boolean> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        setIsAdminAuthenticated(true);
        setCurrentView('admin');
        return true;
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
    }
    return false;
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setIsAdminAuthenticated(false);
    setCurrentView('teen');
  };

  const changeAdminPassword = (oldPass: string, newPass: string): boolean => {
    if (oldPass === adminPassword) {
      setAdminPassword(newPass);
      // Sync admin setting
      setDoc(doc(db, 'settings', 'global'), { adminPassword: newPass }, { merge: true }).catch(() => {});
      return true;
    }
    return false;
  };

  const completeChallenge = async (challengeId: string, reflection?: string, bonusXP: number = 0) => {
    if (!currentUserId) return;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return;

    const challenge = challenges.find(c => c.id === challengeId);
    const xpEarned = (challenge?.xp || 0) + bonusXP;

    const currentTotalXP = user.totalXP ?? (user.completedChallenges.reduce((acc, id) => {
      const ch = challenges.find(c => c.id === id);
      return acc + (ch ? ch.xp : 0);
    }, 0) + (user.bonusXP || 0));

    const newCompleted = [...user.completedChallenges, challengeId];
    const newReflections = reflection ? { ...user.reflections, [challengeId]: reflection } : user.reflections;

    let finalCompleted = newCompleted;
    let finalReflections = newReflections;

    const newActiveTimers = { ...(user.activeTimers || {}) };
    delete newActiveTimers[challengeId];

    // Condição de ciclo: checa se todos os desafios disponíveis foram concluídos
    const activeChallengeIds = challenges.map(c => c.id);
    const hasAll = activeChallengeIds.length > 0 && activeChallengeIds.every(id => newCompleted.includes(id));

    if (hasAll) {
      // Volta status para não concluído destravando tudo para o próximo ciclo
      finalCompleted = [];
      finalReflections = {};
    }

    const updatedUser: User = {
      ...user,
      completedChallenges: finalCompleted,
      reflections: finalReflections,
      totalXP: currentTotalXP + xpEarned,
      bonusXP: 0,
      activeTimers: newActiveTimers
    };

    setUsers(prev => prev.map(u => u.id === currentUserId ? updatedUser : u));

    try {
      await setDoc(doc(db, 'users', currentUserId), updatedUser, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}`);
    }
  };

  const startChallengeTimer = async (challengeId: string) => {
    if (!currentUserId) return;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return;

    const newActiveTimers = { ...(user.activeTimers || {}), [challengeId]: Date.now() };
    const updatedUser = { ...user, activeTimers: newActiveTimers };

    setUsers(prev => prev.map(u => u.id === currentUserId ? updatedUser : u));

    try {
      await setDoc(doc(db, 'users', currentUserId), { activeTimers: newActiveTimers }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}`);
    }
  };

  const addBonusXP = async (amount: number) => {
    if (!currentUserId) return;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return;

    const currentTotalXP = user.totalXP ?? (user.completedChallenges.reduce((acc, id) => {
      const ch = challenges.find(c => c.id === id);
      return acc + (ch ? ch.xp : 0);
    }, 0) + (user.bonusXP || 0));

    const updatedTotal = currentTotalXP + amount;
    const updatedUser = { ...user, totalXP: updatedTotal, bonusXP: 0 };

    setUsers(prev => prev.map(u => u.id === currentUserId ? updatedUser : u));

    try {
      await setDoc(doc(db, 'users', currentUserId), { totalXP: updatedTotal, bonusXP: 0 }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}`);
    }
  };

  const uncompleteChallenge = (challengeId: string) => {
    if (!currentUserId) return;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return;

    const { [challengeId]: removedRef, ...restRefs } = user.reflections;
    const updatedUser = {
      ...user,
      completedChallenges: user.completedChallenges.filter(id => id !== challengeId),
      reflections: restRefs
    };

    setUsers(prev => prev.map(u => u.id === currentUserId ? updatedUser : u));
    setDoc(doc(db, 'users', currentUserId), updatedUser, { merge: true }).catch(() => {});
  };

  const addChallenge = async (challenge: Omit<Challenge, 'id'>) => {
    const id = 'c_' + Date.now();
    const newChallenge: Challenge = { ...challenge, id };
    setChallenges(prev => [newChallenge, ...prev]);

    try {
      await setDoc(doc(db, 'challenges', id), newChallenge);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `challenges/${id}`);
    }
  };

  const updateChallenge = async (id: string, updates: Partial<Challenge>) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await setDoc(doc(db, 'challenges', id), updates, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${id}`);
    }
  };

  const deleteChallenge = async (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'challenges', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `challenges/${id}`);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUserId === id) {
      setCurrentUserId(null);
    }
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  };

  const addBook = async (book: Omit<LibraryBook, 'id'> | LibraryBook) => {
    const id = 'id' in book && book.id ? book.id : 'b_' + Date.now();
    const newBook: LibraryBook = { ...book, id };
    setBooks(prev => [newBook, ...prev]);
    try {
      await setDoc(doc(db, 'books', id), newBook);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `books/${id}`);
    }
  };

  const deleteBook = async (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'books', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `books/${id}`);
    }
  };

  const setVerseOfTheDay = async (verse: VerseOfTheDay | null) => {
    setVerseOfTheDayState(verse);
    try {
      await setDoc(doc(db, 'settings', 'global'), { verseOfTheDay: verse }, { merge: true });
    } catch (err) {
      console.warn('Error saving verse to Firestore:', err);
    }
  };

  const addDevotional = async (devotional: Omit<Devotional, 'id'>) => {
    const id = 'd_' + Date.now();
    const newDevotional: Devotional = { ...devotional, id };
    setDevotionals(prev => [newDevotional, ...prev]);
    try {
      await setDoc(doc(db, 'devotionals', id), newDevotional);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `devotionals/${id}`);
    }
  };

  const updateDevotional = async (id: string, updates: Partial<Devotional>) => {
    setDevotionals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    try {
      await setDoc(doc(db, 'devotionals', id), updates, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `devotionals/${id}`);
    }
  };

  const deleteDevotional = async (id: string) => {
    setDevotionals(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'devotionals', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `devotionals/${id}`);
    }
  };

  const resetAllProgress = async () => {
    const resetUsers = users.map(u => ({
      ...u,
      completedChallenges: [],
      reflections: {},
      totalXP: 0,
      bonusXP: 0,
      activeTimers: {}
    }));
    setUsers(resetUsers);

    for (const u of resetUsers) {
      try {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      } catch (err) {
        console.error('Error syncing reset to Firestore:', err);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentUserId,
      users,
      challenges,
      books,
      devotionals,
      verseOfTheDay,
      currentView,
      isAdminAuthenticated,
      setCurrentView,
      loginTeen,
      registerTeen,
      logoutTeen,
      loginAdmin,
      loginAdminWithGoogle,
      logoutAdmin,
      changeAdminPassword,
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
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
