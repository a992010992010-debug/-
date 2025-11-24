import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudyForm from './components/StudyForm';
import ReminderList from './components/ReminderList';
import Summarizer from './components/Summarizer';
import { StudySession, ViewMode, StudySessionPrefill } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [view, setView] = useState<ViewMode>('reminder');
  const [prefillData, setPrefillData] = useState<StudySessionPrefill | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('thakir_sessions_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSessions(parsed);
        }
      } catch (e) {
        console.error("Failed to parse sessions from local storage", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('thakir_sessions_v2', JSON.stringify(sessions));
  }, [sessions]);

  // Check for due sessions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setSessions(currentSessions => {
        let hasChanges = false;
        
        const updatedSessions = currentSessions.map(session => {
          if (session.scheduledFor <= now && !session.notified) {
            hasChanges = true;
            triggerAlert(session);
            return { ...session, notified: true };
          }
          return session;
        });

        return hasChanges ? updatedSessions : currentSessions;
      });
      
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const triggerAlert = (session: StudySession) => {
    // 1. Play Sound
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(() => {});
    } catch (e) { console.error(e); }

    // 2. Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`حان وقت المذاكرة!`, {
            body: `الدرس: ${session.topic}\n${session.notes}`,
            icon: "https://cdn-icons-png.flaticon.com/512/3209/3209265.png"
        });
    }

    // 3. App Toast
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-r-8 border-indigo-500`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center animate-bounce">
                <Bell className="text-indigo-600" />
              </div>
            </div>
            <div className="mr-3 flex-1">
              <p className="text-sm font-bold text-gray-900">
                تنبيه المذاكرة
              </p>
              <p className="mt-1 text-sm text-gray-800 font-medium">
                {session.topic}
              </p>
              {session.notes && <p className="text-xs text-gray-500 mt-1">{session.notes}</p>}
            </div>
          </div>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-lg transition"
          >
            حسناً، سأبدأ الآن
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleAddSession = (newSession: StudySession) => {
    setSessions(prev => [...prev, newSession]);
    setPrefillData(null);
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    toast.success('تم ضبط المؤقت بنجاح');
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('تم حذف التنبيه');
  };

  const handleScheduleFromSummarizer = (data: StudySessionPrefill) => {
    setPrefillData(data);
    setView('reminder');
    toast.success('تم نقل البيانات لصفحة التنبيهات');
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <Toaster position="top-left" reverseOrder={false} />
      <Header currentView={view} onViewChange={setView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {view === 'reminder' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
               <StudyForm onAddSession={handleAddSession} prefillData={prefillData} />
            </div>
            <div className="lg:col-span-1">
               <ReminderList sessions={sessions} onDelete={handleDeleteSession} />
            </div>
          </div>
        ) : (
          <Summarizer onSchedule={handleScheduleFromSummarizer} />
        )}
      </main>
    </div>
  );
};

export default App;