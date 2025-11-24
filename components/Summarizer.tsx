import React, { useState, useRef, useEffect } from 'react';
import { generateLessonSummary } from '../services/geminiService';
import { LessonSummaryResponse } from '../types';
import { BrainCircuit, Book, GraduationCap, School, Loader2, Sparkles, Copy, Check, Lightbulb, BookOpen, Share2, MessageCircle, CalendarPlus, Settings2, AlignLeft, ListOrdered, Moon, Sun, Palette, Type, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SummarizerProps {
  onSchedule: (data: { topic: string; notes: string }) => void;
}

type ColorPalette = 'indigo' | 'rose' | 'emerald' | 'sky' | 'amber';
type FontSize = 'small' | 'medium' | 'large';

const Summarizer: React.FC<SummarizerProps> = ({ onSchedule }) => {
  const [lessonName, setLessonName] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  
  // Options
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [conceptsCount, setConceptsCount] = useState<number>(3);
  
  // Display Settings
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colorPalette, setColorPalette] = useState<ColorPalette>('indigo');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LessonSummaryResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Ref for scrolling
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [result]);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName || !subject || !gradeLevel) {
      toast.error('يرجى تعبئة جميع الحقول الأساسية');
      return;
    }

    setLoading(true);
    setResult(null);
    setShowDisplaySettings(false); // Hide settings on new search
    
    const summary = await generateLessonSummary(lessonName, subject, gradeLevel, summaryLength, conceptsCount);
    
    if (summary) {
        setResult(summary);
    } else {
        toast.error('حدث خطأ أثناء التلخيص، حاول مرة أخرى');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (result) {
      const concepts = result.keyConcepts || [];
      const terms = result.terminology || [];
      
      const textToCopy = `
*${result.title || ''}*
${result.introduction || ''}

*المفاهيم الرئيسية:*
${concepts.map((c, i) => `${i+1}. ${c.concept}:\n ${c.explanation}`).join('\n\n')}

*المصطلحات:*
${terms.map(t => `- ${t.term}: ${t.definition}`).join('\n')}
      `;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('تم نسخ النص');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (result) {
        const concepts = result.keyConcepts || [];
        const text = `*ملخص درس: ${result.title}*\n\n${result.introduction}\n\n*أهم النقاط:*\n${concepts.map(c => `• ${c.concept}`).join('\n')}\n\nتم إنشاؤه عبر تطبيق المتفوق 🎓`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
  };

  const handleSchedule = () => {
      if (result) {
          const concepts = result.keyConcepts || [];
          const notes = `المفاهيم: ${concepts.map(c => c.concept).join(', ')}`;
          onSchedule({
              topic: result.title,
              notes: notes.substring(0, 100) + (notes.length > 100 ? '...' : '')
          });
      }
  };

  // --- Dynamic Style Helpers ---

  const getPaletteClasses = () => {
    const isDark = theme === 'dark';
    
    const colors = {
      indigo: {
        gradientText: 'from-indigo-500 to-purple-600',
        bgLight: 'bg-indigo-50 hover:bg-indigo-100',
        textLight: 'text-indigo-600',
        textDark: 'text-indigo-300',
        conceptIconBg: 'bg-indigo-600',
        termBorder: 'border-indigo-200',
        termBorderDark: 'border-indigo-500/50',
        termTitleLight: 'text-indigo-800',
        termTitleDark: 'text-indigo-300',
        btnPrimary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
        conceptColors: ['bg-indigo-600', 'bg-violet-600', 'bg-blue-600', 'bg-purple-700'],
      },
      rose: {
        gradientText: 'from-rose-500 to-pink-600',
        bgLight: 'bg-rose-50 hover:bg-rose-100',
        textLight: 'text-rose-600',
        textDark: 'text-rose-300',
        conceptIconBg: 'bg-rose-600',
        termBorder: 'border-rose-200',
        termBorderDark: 'border-rose-500/50',
        termTitleLight: 'text-rose-800',
        termTitleDark: 'text-rose-300',
        btnPrimary: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700',
        conceptColors: ['bg-rose-600', 'bg-pink-600', 'bg-fuchsia-600', 'bg-red-600'],
      },
      emerald: {
        gradientText: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50 hover:bg-emerald-100',
        textLight: 'text-emerald-600',
        textDark: 'text-emerald-300',
        conceptIconBg: 'bg-emerald-600',
        termBorder: 'border-emerald-200',
        termBorderDark: 'border-emerald-500/50',
        termTitleLight: 'text-emerald-800',
        termTitleDark: 'text-emerald-300',
        btnPrimary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
        conceptColors: ['bg-emerald-600', 'bg-teal-600', 'bg-green-600', 'bg-cyan-700'],
      },
      sky: {
        gradientText: 'from-sky-500 to-blue-600',
        bgLight: 'bg-sky-50 hover:bg-sky-100',
        textLight: 'text-sky-600',
        textDark: 'text-sky-300',
        conceptIconBg: 'bg-sky-600',
        termBorder: 'border-sky-200',
        termBorderDark: 'border-sky-500/50',
        termTitleLight: 'text-sky-800',
        termTitleDark: 'text-sky-300',
        btnPrimary: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700',
        conceptColors: ['bg-sky-600', 'bg-cyan-600', 'bg-blue-600', 'bg-indigo-500'],
      },
      amber: {
        gradientText: 'from-amber-500 to-orange-600',
        bgLight: 'bg-amber-50 hover:bg-amber-100',
        textLight: 'text-amber-600',
        textDark: 'text-amber-300',
        conceptIconBg: 'bg-amber-600',
        termBorder: 'border-amber-200',
        termBorderDark: 'border-amber-500/50',
        termTitleLight: 'text-amber-800',
        termTitleDark: 'text-amber-300',
        btnPrimary: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
        conceptColors: ['bg-amber-600', 'bg-orange-600', 'bg-red-500', 'bg-yellow-700'],
      },
    };

    return colors[colorPalette];
  };

  const getFontSizeClasses = (element: 'title' | 'body' | 'small' | 'heading') => {
    const sizes = {
      small: { title: 'text-xl md:text-2xl', body: 'text-sm', small: 'text-xs', heading: 'text-base font-bold' },
      medium: { title: 'text-2xl md:text-3xl', body: 'text-base', small: 'text-sm', heading: 'text-lg md:text-xl font-bold' },
      large: { title: 'text-3xl md:text-4xl', body: 'text-lg', small: 'text-base', heading: 'text-xl md:text-2xl font-bold' },
    };
    return sizes[fontSize][element];
  };

  const p = getPaletteClasses();

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        
        {/* Input Form - Takes 4 columns on desktop */}
        <div className="md:col-span-4">
          <div className="glass-panel rounded-3xl p-5 md:p-6 shadow-xl sticky top-4 md:top-24 transition-all">
            <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
              <BrainCircuit className="text-indigo-600" />
              بيانات الدرس
            </h2>
            
            <form onSubmit={handleSummarize} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الدرس</label>
                <div className="relative group">
                  <Book className="absolute right-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl glass-input focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                    placeholder="مثال: الفاعل ونائب الفاعل"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المادة</label>
                <div className="relative group">
                  <School className="absolute right-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl glass-input focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                    placeholder="مثال: لغة عربية"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الصف الدراسي</label>
                <div className="relative group">
                  <GraduationCap className="absolute right-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl glass-input focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                    placeholder="مثال: الأول المتوسط"
                  />
                </div>
              </div>

              {/* Advanced Options Divider */}
              <div className="pt-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold mb-3">
                  <Settings2 size={16} />
                  خيارات التلخيص
                </div>
                
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                   {/* Summary Length */}
                   <div>
                     <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                       <AlignLeft size={14} />
                       طول التلخيص
                     </label>
                     <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                       {(['short', 'medium', 'long'] as const).map((l) => (
                         <button
                           key={l}
                           type="button"
                           onClick={() => setSummaryLength(l)}
                           className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                             summaryLength === l 
                               ? 'bg-indigo-600 text-white shadow-sm' 
                               : 'text-gray-500 hover:bg-gray-100'
                           }`}
                         >
                           {l === 'short' ? 'موجز' : l === 'medium' ? 'متوسط' : 'مفصل'}
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Key Concepts Count */}
                   <div>
                     <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                       <ListOrdered size={14} />
                       عدد المفاهيم الرئيسية
                     </label>
                     <input 
                        type="range" 
                        min="1" 
                        max="8" 
                        value={conceptsCount} 
                        onChange={(e) => setConceptsCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                     />
                     <div className="flex justify-between text-xs text-gray-500 font-medium mt-1">
                       <span>1</span>
                       <span className="text-indigo-600 font-bold">{conceptsCount}</span>
                       <span>8</span>
                     </div>
                   </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="text-yellow-300 fill-current"/>}
                {loading ? 'جاري التحليل...' : 'شرح الدرس'}
              </button>
            </form>
          </div>
        </div>

        {/* Result Display - Takes 8 columns on desktop */}
        <div className="md:col-span-8" ref={resultRef}>
          {result ? (
            <div className={`rounded-3xl p-5 md:p-8 animate-blob relative shadow-2xl transition-all duration-500 border ${
                theme === 'light' 
                ? 'glass-panel border-white/60 text-gray-800' 
                : 'bg-[#1e1e2e]/95 backdrop-blur-xl border-white/10 text-white shadow-slate-900/50'
            }`}>
              
              {/* Header & Settings */}
              <div className={`relative mb-6 md:mb-8 border-b ${theme === 'light' ? 'border-gray-200/50' : 'border-white/10'}`}>
                <div className="flex justify-between items-start pb-4 md:pb-6">
                  <div>
                      <h3 className={`${getFontSizeClasses('title')} font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${p.gradientText} mb-2`}>
                          {result.title}
                      </h3>
                      <p className={`font-medium leading-relaxed max-w-2xl ${getFontSizeClasses('body')} ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                          {result.introduction}
                      </p>
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setShowDisplaySettings(!showDisplaySettings)}
                        className={`p-3 rounded-xl transition-colors shadow-sm flex-shrink-0 ${
                            theme === 'light' ? p.bgLight + ' ' + p.textLight : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title="تخصيص العرض"
                      >
                         {showDisplaySettings ? <X size={20} /> : <Palette size={20} />}
                      </button>
                      <button 
                      onClick={handleCopy}
                      className={`p-3 rounded-xl transition-colors shadow-sm flex-shrink-0 ${
                          theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/10 hover:bg-white/20 text-gray-300'
                      }`}
                      title="نسخ النص"
                      >
                         {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                  </div>
                </div>

                {/* Collapsible Settings Panel */}
                {showDisplaySettings && (
                  <div className={`mb-6 p-4 rounded-xl border animate-enter ${
                    theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                      
                      {/* Theme Toggle */}
                      <div>
                        <label className={`block text-xs font-bold mb-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>الوضع</label>
                        <div className={`inline-flex rounded-lg p-1 border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/20 border-white/10'}`}>
                           <button onClick={() => setTheme('light')} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-gray-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                             <Sun size={18} />
                           </button>
                           <button onClick={() => setTheme('dark')} className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-gray-700 text-yellow-300 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                             <Moon size={18} />
                           </button>
                        </div>
                      </div>

                      {/* Font Size */}
                      <div>
                         <label className={`block text-xs font-bold mb-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>حجم الخط</label>
                         <div className={`inline-flex rounded-lg p-1 border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/20 border-white/10'}`}>
                            {(['small', 'medium', 'large'] as const).map(size => (
                              <button 
                                key={size}
                                onClick={() => setFontSize(size)}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                                  fontSize === size 
                                  ? (theme === 'light' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-indigo-900') 
                                  : (theme === 'light' ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-white/10')
                                }`}
                              >
                                {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* Color Palette */}
                      <div>
                        <label className={`block text-xs font-bold mb-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>لون التمييز</label>
                        <div className="flex gap-3">
                           {[
                             { id: 'indigo', color: 'bg-indigo-500' },
                             { id: 'rose', color: 'bg-rose-500' },
                             { id: 'emerald', color: 'bg-emerald-500' },
                             { id: 'sky', color: 'bg-sky-500' },
                             { id: 'amber', color: 'bg-amber-500' }
                           ].map((item) => (
                             <button
                               key={item.id}
                               onClick={() => setColorPalette(item.id as ColorPalette)}
                               className={`w-8 h-8 rounded-full ${item.color} transition-transform hover:scale-110 flex items-center justify-center ring-2 ring-offset-2 ${
                                 colorPalette === item.id 
                                 ? (theme === 'light' ? 'ring-gray-400' : 'ring-white ring-offset-slate-900') 
                                 : 'ring-transparent'
                               }`}
                             />
                           ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
              
              {/* Key Concepts */}
              {result.keyConcepts && result.keyConcepts.length > 0 && (
                <div className="mb-8 md:mb-10">
                    <h4 className={`${getFontSizeClasses('heading')} mb-4 md:mb-5 flex items-center gap-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                        <span className={`${p.conceptIconBg} text-white p-1.5 rounded-lg`}><Lightbulb size={fontSize === 'small' ? 16 : 20} /></span>
                        المفاهيم الأساسية
                    </h4>
                    <div className="space-y-4 md:space-y-6">
                        {result.keyConcepts?.map((item, index) => {
                            const colorClass = p.conceptColors[index % p.conceptColors.length];
                            return (
                                <div 
                                    key={index}
                                    className={`relative overflow-hidden rounded-2xl ${colorClass} text-white shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    
                                    <div className="relative z-10 p-5 md:p-6 flex flex-col gap-3 md:gap-4">
                                        {/* Concept Title */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-base md:text-lg border border-white/30 shadow-inner flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <h5 className={`${fontSize === 'large' ? 'text-2xl md:text-3xl' : fontSize === 'small' ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-black tracking-wide drop-shadow-md break-words`}>
                                                {item.concept}
                                            </h5>
                                        </div>
                                        
                                        {/* Explanation Box */}
                                        <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-indigo-50 font-medium leading-relaxed ${getFontSizeClasses('body')}`}>
                                            {item.explanation}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
              )}

              {/* Terminology Grid */}
              {result.terminology && result.terminology.length > 0 && (
                <div className="mb-8 md:mb-10">
                  <h4 className={`${getFontSizeClasses('heading')} mb-4 md:mb-5 flex items-center gap-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                      <span className="bg-gray-600 text-white p-1.5 rounded-lg"><BookOpen size={fontSize === 'small' ? 16 : 20} /></span>
                      مصطلحات هامة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.terminology?.map((item, idx) => (
                          <div key={idx} className={`border p-4 rounded-xl transition-colors shadow-sm hover:shadow-md ${
                              theme === 'light' 
                              ? `bg-white/50 ${p.termBorder} hover:bg-white/80` 
                              : `bg-white/5 ${p.termBorderDark} hover:bg-white/10`
                          }`}>
                              <span className={`block font-extrabold mb-2 ${theme === 'light' ? p.termTitleLight : p.termTitleDark} ${fontSize === 'large' ? 'text-xl' : fontSize === 'small' ? 'text-base' : 'text-lg'}`}>
                                  {item.term}
                              </span>
                              <div className={`h-px w-10 mb-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-white/20'}`}></div>
                              <span className={`font-medium leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} ${getFontSizeClasses('small')}`}>
                                  {item.definition}
                              </span>
                          </div>
                      ))}
                  </div>
                </div>
              )}

               {/* Study Tips */}
               {result.studyTips && result.studyTips.length > 0 && (
                 <div className={`border rounded-2xl p-5 md:p-6 mb-8 ${
                     theme === 'light' 
                     ? 'bg-amber-50/80 border-amber-100' 
                     : 'bg-amber-900/20 border-amber-800/30'
                 }`}>
                      <h4 className={`${getFontSizeClasses('heading')} mb-3 flex items-center gap-2 ${theme === 'light' ? 'text-amber-800' : 'text-amber-200'}`}>
                          <Sparkles size={18} className="fill-current" />
                          نصائح للمذاكرة
                      </h4>
                      <ul className="space-y-2">
                          {result.studyTips?.map((tip, i) => (
                              <li key={i} className={`flex items-start gap-2 font-medium ${theme === 'light' ? 'text-amber-900' : 'text-amber-100'} ${getFontSizeClasses('body')}`}>
                                  <span className="mt-2 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                                  {tip}
                              </li>
                          ))}
                      </ul>
                 </div>
               )}

               {/* Action Buttons Footer */}
               <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${theme === 'light' ? 'border-gray-200/60' : 'border-white/10'}`}>
                    <button 
                        onClick={handleWhatsAppShare}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-green-500/20 order-1 sm:order-none"
                    >
                        <MessageCircle size={18} />
                        إرسال واتساب
                    </button>
                    
                    <button 
                        onClick={handleSchedule}
                        className={`flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md order-2 sm:order-none ${p.btnPrimary}`}
                    >
                        <CalendarPlus size={18} />
                        جدولة مذاكرة
                    </button>

                    <button 
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: result.title,
                                    text: `ملخص درس ${result.title}\n\n${result.introduction}`,
                                });
                            } else {
                                handleCopy();
                            }
                        }}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-colors order-3 sm:order-none ${
                            theme === 'light' 
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                            : 'bg-white/10 hover:bg-white/20 text-gray-200'
                        }`}
                    >
                        <Share2 size={18} />
                    </button>
               </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center text-center p-6 md:p-8 glass-panel rounded-3xl bg-white/30 border border-dashed border-white/50 group hover:border-indigo-300 transition-colors">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <BrainCircuit size={48} className="text-indigo-500 opacity-80 md:w-14 md:h-14" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">مساعدك الذكي جاهز</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-sm md:text-base">
                أدخل تفاصيل الدرس في القائمة الجانبية وسيقوم الذكاء الاصطناعي بتوليد شرح مبسط، مفاهيم رئيسية، ومصطلحات هامة بتصميم رائع.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;