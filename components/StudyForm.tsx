import React, { useState, useEffect } from 'react';
import { DurationUnit, StudySession, StudySessionPrefill } from '../types';
import { Sparkles, CalendarClock, BookText } from 'lucide-react';

interface StudyFormProps {
  onAddSession: (session: StudySession) => void;
  prefillData?: StudySessionPrefill | null;
}

const StudyForm: React.FC<StudyFormProps> = ({ onAddSession, prefillData }) => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [durationValue, setDurationValue] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(DurationUnit.MINUTES);

  useEffect(() => {
    if (prefillData) {
      setTopic(prefillData.topic);
      setNotes(prefillData.notes);
    }
  }, [prefillData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    const now = Date.now();
    let durationInMs = 0;
    
    switch (durationUnit) {
      case DurationUnit.MINUTES: durationInMs = durationValue * 60 * 1000; break;
      case DurationUnit.HOURS: durationInMs = durationValue * 60 * 60 * 1000; break;
      case DurationUnit.DAYS: durationInMs = durationValue * 24 * 60 * 60 * 1000; break;
      case DurationUnit.MONTHS: durationInMs = durationValue * 30 * 24 * 60 * 60 * 1000; break;
    }

    const newSession: StudySession = {
      id: crypto.randomUUID(),
      topic,
      notes,
      durationValue,
      durationUnit,
      createdAt: now,
      scheduledFor: now + durationInMs,
      notified: false
    };

    onAddSession(newSession);
    
    setTopic('');
    setNotes('');
  };

  return (
    <div className="glass-panel rounded-3xl shadow-xl overflow-hidden relative mb-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white relative z-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookText className="text-blue-200" />
          جدولة تنبيه جديد
        </h2>
        <p className="text-blue-100 mt-2 text-sm opacity-90 leading-relaxed">
          أدخل تفاصيل الدرس وسيتم تنبيهك على هذا الجهاز عندما يحين الوقت.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الدرس</label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass-input focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            placeholder="مثال: مراجعة الوحدة الأولى رياضيات"
          />
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات صغيرة (اختياري)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl glass-input focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
            placeholder="مثال: التركيز على المسائل اللفظية..."
          />
        </div>

        {/* Timing Inputs */}
        <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CalendarClock size={20} className="text-indigo-600"/>
            ذكرني بعد:
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              min="1"
              required
              value={durationValue}
              onChange={(e) => setDurationValue(Number(e.target.value))}
              className="w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-center font-bold text-gray-700 text-xl"
            />
            <select
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
              className="w-2/3 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white font-medium"
            >
              {Object.values(DurationUnit).map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all transform hover:translate-y-[-2px] active:translate-y-[0px] bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700"
        >
          <Sparkles className="text-yellow-300 fill-current" />
          بدء المؤقت
        </button>
      </form>
    </div>
  );
};

export default StudyForm;