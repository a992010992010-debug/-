import React from 'react';
import { BookOpenCheck, BrainCircuit, BellRing } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="sticky top-0 z-50 transition-all duration-300 mb-4 md:mb-8">
      <div className="glass-panel shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-20 py-3 md:py-0 gap-3 md:gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 md:p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <BookOpenCheck size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">المتفوق</h1>
                <p className="text-[10px] md:text-xs text-gray-600 font-medium opacity-80">رفيقك الذكي للمذاكرة</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 backdrop-blur-sm w-full md:w-auto justify-center">
              <button
                onClick={() => onViewChange('reminder')}
                className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none ${
                  currentView === 'reminder'
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <BellRing size={16} />
                ذكّرني
              </button>
              <button
                onClick={() => onViewChange('summarizer')}
                className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none ${
                  currentView === 'summarizer'
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <BrainCircuit size={16} />
                لخص دروسك بالـ AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;