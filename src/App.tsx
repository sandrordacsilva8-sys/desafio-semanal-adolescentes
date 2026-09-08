/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppProvider, useAppStore } from './store/AppStore';
import { Header } from './components/Header';
import { TeenView } from './components/TeenView';
import { AdminView } from './components/AdminView';
import { BibleView } from './components/BibleView';
import { LibraryView } from './components/LibraryView';
import { DevotionalsView } from './components/DevotionalsView';
import { AuthModal, AdminAuthModal } from './components/Modals';

function AppContent() {
  const { currentView, currentUser } = useAppStore();
  const [authOpen, setAuthOpen] = useState(!currentUser);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      <Header 
        onOpenAuth={() => setAuthOpen(true)} 
        onOpenAdminAuth={() => setAdminAuthOpen(true)} 
      />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-20">
        {currentView === 'teen' && <TeenView />}
        {currentView === 'admin' && <AdminView />}
        {currentView === 'bible' && <BibleView />}
        {currentView === 'library' && <LibraryView />}
        {currentView === 'devotionals' && <DevotionalsView />}
      </main>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <AdminAuthModal isOpen={adminAuthOpen} onClose={() => setAdminAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
