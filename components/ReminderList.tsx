import React, { useEffect, useState } from 'react';
import { StudySession } from '../types';
import { Clock, Trash2, Send, Bell } from 'lucide-react';

interface ReminderListProps {
  sessions: StudySession[];
  onDelete: (id: string) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({ sessions, onDelete }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (targetTime: number) => {
    const diff = targetTime - now;
    if (diff <= 0) return 'انتهى الوقت';
    
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) return `${days} يوم و ${hours} ساعة`;
    if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/50">
        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300 shadow-inner">
          <Clock size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">لا توجد تنبيهات</h3>
        <p className="text-gray-600 mt-2 max-w-xs mx-auto">أضف الدروس التي تريد مراجعتها ليتم تذكيرك بها.</p>
      </div>
    );
  }

  const sortedSessions = [...sessions].sort((a, b) => a.scheduledFor - b.scheduledFor);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 drop-shadow-sm">
        <Clock className="text-yellow-300"/>
        التنبيهات النشطة
        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{sessions.length}</span>
      </h2>
      
      <div className="grid gap-4">
        {sortedSessions.map((session) => {
          const isDue = now >= session.scheduledFor;
          
          return (
            <div 
              key={session.id} 
              className={`relative overflow-hidden glass-panel rounded-2xl transition-all duration-300 ${
                isDue 
                  ? 'border-l-8 border-l-green-500 shadow-lg shadow-green-500/10 bg-green-50/50' 
                  : 'border-l-8 border-l-indigo-300'
              }`}
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{session.topic}</h3>
                    {isDue && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold flex items-center gap-1 animate-pulse">
                        <Bell size={10} /> حان الوقت
                      </span>
                    )}
                  </div>
                  
                  {session.notes && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{session.notes}</p>
                  )}

                  <div className={`text-xs font-bold flex items-center gap-1.5 ${
                    isDue ? 'text-green-600' : 'text-indigo-600'
                  }`}>
                    <Clock size={12} />
                    {isDue ? 'الموعد الآن!' : `متبقي: ${getTimeRemaining(session.scheduledFor)}`}
                  </div>
                </div>

                <div className="mr-4">
                  <button 
                    onClick={() => onDelete(session.id)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                    title="حذف التنبيه"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReminderList;
