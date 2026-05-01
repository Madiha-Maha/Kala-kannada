/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Trophy, 
  User, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Volume2,
  X,
  Flame,
  Heart,
  LayoutGrid,
  Settings,
  Search,
  ChevronLeft,
  Share2,
  Library
} from 'lucide-react';
import { generatePracticeSentence, speakText, chatWithAi, generateStory, generateCultureFact } from './services/geminiService';

// --- Types ---
interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}
interface CultureItem {
  id: string;
  title: string;
  description: string;
  image: string;
  kannada_fact: string;
}
interface Level {
  level_id: string;
  category: string;
  status: 'locked' | 'unlocked' | 'completed';
  score: number;
}

interface UserStats {
  xp: number;
  streak: number;
  hearts: number;
}

interface LessonItem {
  q: string;
  a: string;
  t: string;
}

interface Lesson {
  title: string;
  items: LessonItem[];
}

interface Story {
  id: string;
  title: string;
  level: string;
}

interface StoryScene {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  image: string;
  choices: { text: string; next: string }[];
}

interface StoryContent {
  title: string;
  scenes: StoryScene[];
}

// --- Components ---

import { INITIAL_PROGRESS, LESSONS, STORIES, STORY_CONTENT, CULTURE } from './data';

// --- Components ---

const CultureView = () => {
  const [items, setItems] = useState<CultureItem[]>(CULTURE);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const fact = await generateCultureFact();
      const newItem: CultureItem = {
        id: `ai-${Date.now()}`,
        title: fact.title,
        description: fact.description,
        image: `https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80`, // Placeholder fallback
        kannada_fact: fact.kanTitle || fact.title
      };
      setItems(prev => [newItem, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 mb-20">
      <div className="flex justify-center mb-12">
        <button 
          onClick={loadMore}
          disabled={isLoading}
          className="px-10 py-5 bg-kannada-red text-white rounded-[2rem] font-serif font-black text-xl flex items-center gap-4 hover:scale-105 transition-all disabled:opacity-50 shadow-xl shadow-kannada-red/10"
        >
          {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-6 h-6" />}
          Discover More Hidden Facts
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -10 }}
            className="glass-card overflow-hidden flex flex-col"
          >
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-2xl font-serif font-black mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm mb-4 flex-1">{item.description}</p>
              <div className="bg-kannada-gold/5 p-4 rounded-xl border border-kannada-gold/10">
                <p className="text-kannada-ink font-kannada text-lg mb-2">{item.kannada_fact}</p>
                <button 
                  onClick={() => speakText(item.kannada_fact)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-kannada-gold hover:text-kannada-red transition-colors"
                >
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ChatView = ({ history, onSendMessage, isLoading }: { history: Message[], onSendMessage: (msg: string) => void, isLoading: boolean }) => {
  const [input, setInput] = useState('');
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col glass-card bg-white/60">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-kannada-red/10 rounded-[2rem] flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-kannada-red" />
            </div>
            <h3 className="text-3xl font-serif font-black mb-4 uppercase tracking-widest text-kannada-ink">Chat with Kala</h3>
            <p className="text-stone-400 max-w-sm font-medium">Ask me anything about Kannada! I can translate, explain grammar, or just chat.</p>
          </div>
        )}
        {history.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-5 rounded-[2rem] ${
              msg.role === 'user' 
                ? 'bg-kannada-ink text-white rounded-tr-none' 
                : 'bg-white border border-stone-100 text-kannada-ink shadow-sm rounded-tl-none'
            }`}>
              <p className="text-lg leading-relaxed">{msg.parts[0].text}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-100 p-5 rounded-[2rem] rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-kannada-gold rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-kannada-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-kannada-gold rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-6 border-t border-stone-100 bg-white/40 flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-8 py-5 bg-white border border-stone-100 rounded-[1.5rem] focus:border-kannada-gold outline-none transition-all font-medium text-lg"
        />
        <button 
          disabled={!input.trim() || isLoading}
          className="w-16 h-16 bg-kannada-red text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-kannada-red/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </form>
    </div>
  );
};

const StatBadge = ({ icon: Icon, value, color }: { icon: any, value: number | string, color: string }) => (
  <div className={`flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-stone-100 shadow-sm`}>
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="text-sm font-bold font-mono">{value}</span>
  </div>
);

const MandalaMap = ({ progress, onSelectLevel }: { progress: Level[], onSelectLevel: (id: string) => void }) => {
  const categories = Array.from(new Set(progress.map(p => p.category)));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {categories.map((cat, catIdx) => (
        <div key={`category-${catIdx}`} className="mb-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-stone-200" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">{cat}</h3>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-12">
            {progress.filter(p => p.category === cat).map((level, idx) => (
              <motion.div
                key={`level-${level.level_id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <button
                  onClick={() => level.status !== 'locked' && onSelectLevel(level.level_id)}
                  className={`mandala-node ${level.status}`}
                >
                  {level.status === 'completed' ? (
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  ) : level.status === 'locked' ? (
                    <BookOpen className="w-10 h-10 opacity-30" />
                  ) : (
                    <motion.div 
                      key="active-indicator"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [0.8, 1.1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="relative"
                    >
                      <Sparkles className="w-12 h-12 text-kannada-gold" />
                      <div className="absolute -inset-6 bg-kannada-gold/20 rounded-full animate-ping opacity-60" />
                    </motion.div>
                  )}
                </button>
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                    Level {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-stone-700">
                    {level.level_id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const LessonView = ({ lessonId, onComplete, onBack, onAddXp }: { lessonId: string, onComplete: () => void, onBack: () => void, onAddXp: (amt: number) => void }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);

  useEffect(() => {
    const data = LESSONS[lessonId];
    if (data) setLesson(data);
  }, [lessonId]);

  if (!lesson) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const currentItem = lesson.items[currentIndex];

  const getAiHelp = async () => {
    setIsTipLoading(true);
    try {
      const tip = await chatWithAi(`Give me a short, friendly tip/hint for translating the Kannada letter/word "${currentItem.q}" (which sounds like "${currentItem.t}"). Keep it very brief.`, []);
      setAiTip(tip);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTipLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;

    const isCorrect = userInput.toLowerCase().trim() === currentItem.a.toLowerCase().trim();
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      onAddXp(10);
    }

    setTimeout(() => {
      if (isCorrect) {
        if (currentIndex < lesson.items.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setUserInput('');
          setFeedback(null);
        } else {
          setIsFinished(true);
        }
      } else {
        setFeedback(null);
        setUserInput('');
      }
    }, 1200);
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full p-8 text-center"
      >
        <div className="w-32 h-32 bg-kannada-gold rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-kannada-gold/30">
          <Trophy className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-5xl font-serif font-black mb-4">Shubhashayagalu!</h2>
        <p className="text-stone-500 text-lg mb-12 max-w-md">You've successfully mastered the {lesson.title} module.</p>
        <div className="flex gap-4">
          <button onClick={onComplete} className="btn-primary">Continue Path</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col p-8">
      <div className="flex items-center justify-between mb-16">
        <button onClick={onBack} className="p-3 hover:bg-stone-100 rounded-2xl transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 mx-12 h-4 bg-stone-100 rounded-full overflow-hidden p-1 shadow-inner">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / lesson.items.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black font-mono text-stone-400">{currentIndex + 1} / {lesson.items.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <span className="text-xs font-black uppercase tracking-[0.2em] text-kannada-gold mb-6 block">Translate the character</span>
          <h1 className="text-9xl font-kannada mb-8 text-kannada-ink">{currentItem.q}</h1>
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="glass-card p-6 inline-block">
              <p className="text-stone-500 font-medium italic">"{currentItem.t}"</p>
            </div>
            <button 
              onClick={() => speakText(currentItem.q)}
              className="w-16 h-16 bg-white border border-stone-200 rounded-full flex items-center justify-center text-kannada-gold hover:bg-stone-50 transition-colors shadow-sm"
            >
              <Volume2 className="w-8 h-8" />
            </button>
            <button 
              onClick={getAiHelp}
              disabled={isTipLoading}
              className="w-16 h-16 bg-kannada-gold/10 border border-kannada-gold/20 rounded-full flex items-center justify-center text-kannada-gold hover:bg-kannada-gold/20 transition-colors shadow-sm"
              title="Get AI Tip"
            >
              <Sparkles className={`w-8 h-8 ${isTipLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {aiTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="max-w-md mx-auto mb-10 overflow-hidden"
              >
                <div className="bg-kannada-cream p-6 rounded-[2rem] border border-kannada-gold/20 relative">
                  <button onClick={() => setAiTip(null)} className="absolute top-4 right-4 text-stone-300 hover:text-kannada-ink">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex gap-4 items-start text-left">
                    <div className="w-10 h-10 bg-kannada-gold rounded-2xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-kannada-gold mb-1">Kala's Tip</p>
                      <p className="text-stone-600 font-medium leading-relaxed">{aiTip}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative">
            <input
              autoFocus
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type in English..."
              className={`w-full p-6 text-center text-2xl font-bold border-b-4 bg-transparent outline-none transition-all ${
                feedback === 'correct' ? 'border-green-500 text-green-600' : 
                feedback === 'wrong' ? 'border-red-500 text-red-600' : 
                'border-stone-200 focus:border-kannada-gold'
              }`}
              disabled={!!feedback}
            />
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-2"
                >
                  {feedback === 'correct' ? (
                    <div className="flex items-center gap-2 px-6 py-2 bg-green-50 text-green-600 rounded-full font-bold">
                      <CheckCircle2 className="w-5 h-5" /> Correct! +10 XP
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-full font-bold">
                      <XCircle className="w-5 h-5" /> Try again
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      <div className="py-12 flex justify-center">
        <button 
          onClick={handleSubmit}
          disabled={!userInput || !!feedback}
          className="btn-primary w-full max-w-md"
        >
          Check Answer
        </button>
      </div>
    </div>
  );
};

const StoryPlayer = ({ storyId, content, onComplete, onBack, isLoading }: { storyId?: string, content?: StoryContent | null, onComplete: () => void, onBack: () => void, isLoading?: boolean }) => {
  const [story, setStory] = useState<StoryContent | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState('start');

  useEffect(() => {
    if (content) {
      setStory(content);
    } else if (storyId) {
      const data = STORY_CONTENT[storyId];
      if (data) setStory(data);
    }
  }, [storyId, content]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <div className="w-20 h-20 border-4 border-kannada-red border-t-transparent rounded-full animate-spin" />
      <h3 className="text-2xl font-serif font-black animate-pulse">Kala is composing a new tale...</h3>
    </div>
  );

  if (!story) return <div className="flex items-center justify-center h-screen">Loading Story...</div>;

  const scene = story.scenes.find(s => s.id === currentSceneId);
  if (!scene) return <div>Scene not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 hover:bg-stone-100 rounded-2xl transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-serif font-black">{story.title}</h2>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <motion.div
          key={currentSceneId}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card overflow-hidden"
        >
          <img src={scene.image} alt="Scene" className="w-full h-80 object-cover" referrerPolicy="no-referrer" />
          <div className="p-10">
            <div className="flex gap-4 items-center mb-8">
              <h3 className="text-5xl font-kannada leading-tight text-kannada-ink flex-1">{scene.text}</h3>
              <button 
                onClick={() => speakText(scene.text)}
                className="w-16 h-16 bg-kannada-gold/10 rounded-full flex items-center justify-center text-kannada-gold shrink-0 hover:bg-kannada-gold/20 transition-all"
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>
            <div className="flex flex-col gap-2 mb-12">
              <p className="text-xl text-kannada-gold font-bold">{scene.transliteration}</p>
              <p className="text-stone-400 italic text-lg">"{scene.translation}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scene.choices.length > 0 ? (
                scene.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSceneId(choice.next)}
                    className="p-6 text-left border-2 border-stone-100 rounded-3xl hover:border-kannada-gold hover:bg-kannada-gold/5 transition-all group"
                  >
                    <span className="text-xl font-bold text-stone-700 group-hover:text-kannada-gold">{choice.text}</span>
                  </button>
                ))
              ) : (
                <button
                  onClick={onComplete}
                  className="btn-primary w-full"
                >
                  Complete Story
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StoryList = ({ onSelectStory, onAiStory }: { onSelectStory: (id: string) => void, onAiStory: () => void }) => {
  return (
    <div className="max-w-5xl mx-auto p-8 mb-20">
      <div className="flex justify-center mb-16">
        <button 
          onClick={onAiStory}
          className="px-12 py-6 bg-kannada-ink text-white rounded-[2.5rem] font-serif font-black text-2xl flex items-center gap-6 hover:scale-105 transition-all shadow-2xl shadow-kannada-ink/20"
        >
          <Sparkles className="w-8 h-8 text-kannada-gold" />
          Tell Me an Infinite Story
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {STORIES.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ y: -8 }}
            className="glass-card p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-stone-200 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 bg-kannada-gold/10 text-kannada-gold text-[10px] font-black rounded-full uppercase tracking-widest">
                  {story.level}
                </span>
                <BookOpen className="w-6 h-6 text-stone-200" />
              </div>
              <h3 className="text-3xl font-serif font-black mb-4">{story.title}</h3>
              <p className="text-stone-500 leading-relaxed mb-8">Dive into an immersive narrative experience designed to build your vocabulary naturally.</p>
            </div>
            <button
              onClick={() => onSelectStory(story.id)}
              className="btn-primary w-full flex items-center justify-center gap-3"
            >
              Begin Journey <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'map' | 'lesson' | 'stories' | 'story-player' | 'culture' | 'chat'>('map');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [progress, setProgress] = useState<Level[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ xp: 0, streak: 0, hearts: 5 });
  const [aiPractice, setAiPractice] = useState<{kannada: string, english: string, transliteration: string, explanation: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // AI Story state
  const [aiStory, setAiStory] = useState<StoryContent | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState(false);

  useEffect(() => {
    // Splash screen effect
    const timer = setTimeout(() => setIsAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = () => {
    const savedProgress = localStorage.getItem('kala-kannada-progress');
    const savedStats = localStorage.getItem('kala-kannada-stats');

    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    } else {
      setProgress(INITIAL_PROGRESS);
      localStorage.setItem('kala-kannada-progress', JSON.stringify(INITIAL_PROGRESS));
    }

    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    } else {
      const initialStats = { xp: 0, streak: 0, hearts: 5 };
      setUserStats(initialStats);
      localStorage.setItem('kala-kannada-stats', JSON.stringify(initialStats));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addXp = (amt: number) => {
    setUserStats(prev => {
      const newStats = { ...prev, xp: prev.xp + amt };
      localStorage.setItem('kala-kannada-stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const startAiPractice = async () => {
    setShowAiModal(true);
    setIsAiLoading(true);
    try {
      const sentence = await generatePracticeSentence(selectedLevel || 'General Greetings');
      setAiPractice(sentence);
    } catch (error) {
      console.error("AI Practice Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (msg: string) => {
    const userMsg: Message = { role: 'user', parts: [{ text: msg }] };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const aiResponse = await chatWithAi(msg, chatHistory);
      const modelMsg: Message = { role: 'model', parts: [{ text: aiResponse }] };
      setChatHistory(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAiStory = async () => {
    setView('story-player');
    setIsStoryLoading(true);
    setAiStory(null);
    setSelectedStory(null);
    try {
      const storyData = await generateStory();
      const formatted: StoryContent = {
        title: storyData.title || "A New Tale",
        scenes: [{
          id: 'start',
          text: storyData.content,
          transliteration: storyData.transliteration,
          translation: storyData.translation,
          image: `https://images.unsplash.com/photo-1544413155-257a44f77259?w=800&q=80`,
          choices: []
        }]
      };
      setAiStory(formatted);
    } catch (error) {
      console.error("AI Story Error:", error);
    } finally {
      setIsStoryLoading(false);
    }
  };

  const handleSelectLevel = (id: string) => {
    setSelectedLevel(id);
    setView('lesson');
  };

  const handleLessonComplete = () => {
    if (selectedLevel) {
      const newProgress = [...progress];
      const currentIndex = newProgress.findIndex(p => p.level_id === selectedLevel);
      newProgress[currentIndex].status = 'completed';
      
      const nextLevel = newProgress[currentIndex + 1];
      if (nextLevel && nextLevel.status === 'locked') {
        nextLevel.status = 'unlocked';
      }
      
      setProgress(newProgress);
      localStorage.setItem('kala-kannada-progress', JSON.stringify(newProgress));
      
      setView('map');
      setSelectedLevel(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kala Kannada',
          text: 'Master Kannada with art and immersive stories!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-kannada-cream selection:bg-kannada-gold/30">
      <AnimatePresence>
        {isAppLoading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-kannada-red flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8"
            >
              <span className="text-kannada-red text-6xl font-serif font-black">K</span>
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white text-3xl font-serif font-black tracking-widest uppercase mb-2"
            >
              Kala Kannada
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              className="h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-white"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-stone-100 z-[100] flex items-center justify-around px-6 pb-safe">
        {[
          { id: 'map', label: 'Path', icon: LayoutGrid },
          { id: 'chat', label: 'Chat', icon: Sparkles },
          { id: 'stories', label: 'Stories', icon: BookOpen },
          { id: 'culture', label: 'Culture', icon: Library },
        ].map(item => (
          <button 
            key={`mobile-${item.id}`}
            onClick={() => setView(item.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${
              view === item.id || (view === 'lesson' && item.id === 'map') || (view === 'story-player' && item.id === 'stories')
                ? 'text-kannada-red' 
                : 'text-stone-300'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 pt-safe pb-4 lg:py-6 flex items-center justify-between bg-kannada-cream/80 backdrop-blur-xl border-b border-stone-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-kannada-red rounded-2xl flex items-center justify-center text-white font-serif font-black text-2xl shadow-lg shadow-kannada-red/20">
            ಕ
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-2xl font-black tracking-tight block leading-none">Kala</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Kannada</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-10">
          {[
            { id: 'map', label: 'Path', icon: LayoutGrid },
            { id: 'chat', label: 'Kala Chat', icon: Sparkles },
            { id: 'stories', label: 'Stories', icon: BookOpen },
            { id: 'culture', label: 'Culture', icon: Library },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                view === item.id || (view === 'lesson' && item.id === 'map') || (view === 'story-player' && item.id === 'stories')
                  ? 'text-kannada-ink' 
                  : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <item.icon className={`w-4 h-4 ${view === item.id ? 'text-kannada-gold' : ''}`} />
              {item.label}
              {(view === item.id || (view === 'lesson' && item.id === 'map') || (view === 'story-player' && item.id === 'stories')) && (
                <motion.div layoutId="nav" className="absolute -bottom-6 left-0 right-0 h-1 bg-kannada-gold rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <StatBadge icon={Flame} value={userStats.streak} color="text-orange-500" />
            <StatBadge icon={Sparkles} value={userStats.xp} color="text-kannada-gold" />
          </div>
          <StatBadge icon={Heart} value={userStats.hearts} color="text-kannada-red" />
          
          <button 
            onClick={handleShare}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white flex items-center justify-center hover:bg-stone-50 transition-colors border border-stone-200"
            title="Share App"
          >
            <Share2 className="w-5 h-5 text-stone-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-32 lg:pb-10 min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-16 px-6">
                <h2 className="text-6xl font-serif font-black mb-4 text-kannada-ink">Learning Path</h2>
                <p className="text-stone-400 text-lg max-w-lg mx-auto font-medium">Master the language of Karnataka through our curated artistic curriculum.</p>
              </div>
              <MandalaMap progress={progress} onSelectLevel={handleSelectLevel} />
            </motion.div>
          ) : view === 'lesson' ? (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-[calc(100vh-8rem)]"
            >
              {selectedLevel && (
                <LessonView 
                  lessonId={selectedLevel} 
                  onComplete={handleLessonComplete}
                  onBack={() => setView('map')}
                  onAddXp={addXp}
                />
              )}
            </motion.div>
          ) : view === 'stories' ? (
            <motion.div
              key="stories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-16 px-6">
                <h2 className="text-6xl font-serif font-black mb-4 text-kannada-ink">Katha Sangama</h2>
                <p className="text-stone-400 text-lg max-w-lg mx-auto font-medium">Immerse yourself in interactive tales and shape your own narrative.</p>
              </div>
              <StoryList 
                onSelectStory={(id) => { setSelectedStory(id); setAiStory(null); setView('story-player'); }} 
                onAiStory={handleAiStory}
              />
            </motion.div>
          ) : view === 'culture' ? (
            <motion.div
              key="culture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-16 px-6">
                <h2 className="text-6xl font-serif font-black mb-4 text-kannada-ink">Kavi & Kale</h2>
                <p className="text-stone-400 text-lg max-w-lg mx-auto font-medium">Explore the rich heritage, literature, and arts of Karnataka.</p>
              </div>
              <CultureView />
            </motion.div>
          ) : view === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-6"
            >
              <ChatView 
                history={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="story-player"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-[calc(100vh-8rem)]"
            >
              {view === 'story-player' && (
                <StoryPlayer 
                  storyId={selectedStory || undefined} 
                  content={aiStory}
                  onComplete={() => setView('stories')}
                  onBack={() => setView('stories')}
                  isLoading={isStoryLoading}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Practice Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-kannada-ink/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-kannada-gold/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-kannada-gold" />
                  </div>
                  <h3 className="text-xl font-black">AI Practice</h3>
                </div>
                <button onClick={() => setShowAiModal(false)} className="p-3 hover:bg-stone-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                {isAiLoading ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-kannada-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Gemini is thinking...</p>
                  </div>
                ) : aiPractice ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-center gap-6 mb-8">
                      <h4 className="text-7xl font-kannada text-kannada-ink leading-tight">{aiPractice.kannada}</h4>
                      <button 
                        onClick={() => speakText(aiPractice.kannada)}
                        className="w-16 h-16 bg-kannada-gold/10 rounded-full flex items-center justify-center text-kannada-gold hover:bg-kannada-gold/20 transition-colors"
                      >
                        <Volume2 className="w-8 h-8" />
                      </button>
                    </div>
                    <p className="text-2xl text-kannada-gold font-black mb-4">{aiPractice.transliteration}</p>
                    <p className="text-stone-400 italic text-xl mb-10">"{aiPractice.english}"</p>
                    <div className="bg-stone-50 p-8 rounded-[32px] text-left border border-stone-100">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-kannada-gold" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Grammar Insight</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed font-medium">{aiPractice.explanation}</p>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-red-500 font-bold">Something went wrong. Please try again.</p>
                )}
              </div>

              <div className="p-8 bg-stone-50/50 flex gap-4">
                <button 
                  onClick={startAiPractice}
                  className="btn-secondary flex-1"
                >
                  New Challenge
                </button>
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Floating Action */}
      {view === 'map' && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] lg:w-auto">
          <button 
            onClick={startAiPractice}
            className="group flex items-center justify-center gap-4 w-full lg:w-auto px-10 py-5 bg-kannada-ink text-white rounded-[2rem] shadow-2xl shadow-kannada-ink/30 hover:bg-stone-800 hover:scale-105 transition-all active:scale-95"
          >
            <Sparkles className="w-6 h-6 text-kannada-gold" />
            <span className="font-black uppercase tracking-widest text-sm">AI Practice Session</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
