import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { EventSelector } from './components/EventSelector';
import { TableEditor } from './components/TableEditor';
import { LandingPage } from './components/LandingPage';
import { RotateCcw, Heart, LogIn, LogOut, User, Sparkles } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function AuthButtons() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {currentUser ? (
        <>
          <span className="text-[#4A3B52] flex items-center gap-2 font-serif">
            <User size={16} className="text-[#D3A6B8]" />
            Hi, {currentUser.displayName?.split(' ')[0] || 'there'}!
          </span>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white/80 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300 font-serif border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
          >
            <LogOut size={16} className="text-[#D3A6B8]" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white/80 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300 font-serif border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
        >
          <LogIn size={16} className="text-[#D3A6B8]" />
          <span className="hidden md:inline">Login</span>
        </button>
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

function AppContent() {
  const { currentEvent, setCurrentEvent } = useStore();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showPlanner, setShowPlanner] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? This will clear all data.')) {
      localStorage.clear();
      setCurrentEvent(null);
      setShowPlanner(false);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-white">
      <header className="fixed top-0 left-0 right-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4E1B2]/80 via-[#E5C594]/80 to-[#D3A6B8]/50 backdrop-blur-md"></div>
        <div className="relative max-w-7xl mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-[#D3A6B8]/20">
                <Heart className="w-5 h-5 text-[#D3A6B8]" />
                <h1 className="text-xl md:text-2xl font-serif text-[#4A3B52] tracking-wide">
                  Wedding Seating Chart
                </h1>
                <Sparkles className="w-4 h-4 text-[#E5C594]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AuthButtons />
              {(showPlanner || currentEvent) && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-[#4A3B52] bg-white/80 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300 font-serif border border-[#D3A6B8]/20 shadow-sm hover:shadow-md"
                  title="Reset Application"
                >
                  <RotateCcw className="w-4 h-4 text-[#D3A6B8]" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="pt-24">
        {!showPlanner && !currentEvent ? (
          <LandingPage onGetStarted={() => setShowPlanner(true)} />
        ) : !currentEvent ? (
          <EventSelector />
        ) : (
          <TableEditor isMobileView={isMobileView} />
        )}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}