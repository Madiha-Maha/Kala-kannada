/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  User,
  Bell, 
  Menu, 
  Hash, 
  BookOpen, 
  GitPullRequest, 
  CheckCircle2, 
  Play, 
  Shield, 
  BarChart3, 
  Settings, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  Star, 
  GitFork, 
  Eye,
  Info,
  Clock,
  ArrowUpRight,
  Filter,
  MoreHorizontal,
  Layout,
  Code2,
  ListTodo,
  Workflow,
  Globe,
  Database,
  Cpu,
  Lock,
  MessageSquare,
  Zap,
  X,
  Trash2,
  Users,
  Heart
} from 'lucide-react';

// --- Types ---

type RepoVisibility = 'Public' | 'Private';

interface Repository {
  id: string;
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  visibility: RepoVisibility;
  language: string;
  languageColor: string;
  updatedAt: string;
  size: string;
  likes: number;
  comments: number;
  commentList?: { user: string, text: string, time: string }[];
}

interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isFriend: boolean;
}

interface ForgeNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'push';
  user: string;
  target: string;
  time: string;
  read: boolean;
}

interface SocialActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  likes: number;
  hasLiked: boolean;
  comments: { user: string, text: string }[];
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  size?: string;
}

interface Issue {
  id: number;
  title: string;
  status: 'open' | 'closed';
  label: string;
  author: string;
  createdAt: string;
  comments: number;
}

interface ContributionDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
}

interface PullRequest {
  id: number;
  title: string;
  status: 'open' | 'closed' | 'merged';
  author: string;
  createdAt: string;
  branch: string;
}

interface WorkflowRun {
  id: string;
  name: string;
  status: 'success' | 'in_progress' | 'failure';
  conclusion: string;
  event: string;
  branch: string;
  createdAt: string;
}

// --- Mock Data ---

const MOCK_PULLS: PullRequest[] = [
  { id: 456, title: 'Feat: Add multi-threaded support for solver', status: 'open', author: 'alix-dev', createdAt: '1 day ago', branch: 'feat/multithread' },
  { id: 454, title: 'Fix: Corrected bounding box intersections', status: 'merged', author: 'sarah-code', createdAt: '3 days ago', branch: 'fix/bbox' },
];

const MOCK_WORKFLOWS: WorkflowRun[] = [
  { id: 'wf1', name: 'Rust CI / build', status: 'success', conclusion: 'success', event: 'push', branch: 'main', createdAt: '2 hours ago' },
  { id: 'wf2', name: 'Lint & Audit', status: 'success', conclusion: 'success', event: 'push', branch: 'main', createdAt: '2 hours ago' },
  { id: 'wf3', name: 'Rust CI / test', status: 'failure', conclusion: 'failure', event: 'pull_request', branch: 'feat/multithread', createdAt: '1 day ago' },
];

const MOCK_REPOS: Repository[] = [
  {
    id: '1',
    name: 'nebula-engine',
    owner: 'alix-dev',
    description: 'A high-performance WASM-based physics engine for the spatial web.',
    stars: 12400,
    forks: 890,
    visibility: 'Public',
    language: 'Rust',
    languageColor: 'bg-orange-500',
    updatedAt: '2 hours ago',
    size: '24.5 MB',
    likes: 156,
    comments: 24,
    commentList: [
      { user: 'sarah-code', text: 'This physics optimization is insane!', time: '2h ago' },
      { user: 'mike-writes', text: 'Need better docs on the spatial hashing part.', time: '1d ago' }
    ]
  },
  {
    id: '2',
    name: 'quantum-ui',
    owner: 'sarah-code',
    description: 'Design system primitives for building reactive, glassmorphic interfaces.',
    stars: 8200,
    forks: 430,
    visibility: 'Public',
    language: 'TypeScript',
    languageColor: 'bg-blue-500',
    updatedAt: '5 hours ago',
    size: '1.2 MB',
    likes: 89,
    comments: 12,
    commentList: [
      { user: 'alix-dev', text: 'The glassmorphic blur works so well on mobile.', time: '5h ago' }
    ]
  },
  {
    id: '3',
    name: 'sentinel-auth',
    owner: 'mike-writes',
    description: 'Zero-trust authentication middleware for distributed systems.',
    stars: 3400,
    forks: 120,
    visibility: 'Private',
    language: 'Go',
    languageColor: 'bg-cyan-400',
    updatedAt: '1 day ago',
    size: '8.4 MB',
    likes: 45,
    comments: 8,
    commentList: []
  }
];

const MOCK_USERS: UserProfile[] = [
  { id: 'u1', username: 'alix-dev', avatar: 'https://i.pravatar.cc/150?u=alix', bio: 'Low-level systems architect. Rust & Go.', followers: 2400, following: 430, isFriend: true },
  { id: 'u2', username: 'sarah-code', avatar: 'https://i.pravatar.cc/150?u=sarah', bio: 'Performance engineer at SpatialLabs.', followers: 1800, following: 120, isFriend: true },
  { id: 'u3', username: 'mike-writes', avatar: 'https://i.pravatar.cc/150?u=mike', bio: 'Documentation is my code.', followers: 900, following: 800, isFriend: false }
];

const MOCK_NOTIFICATIONS: ForgeNotification[] = [
  { id: 'n1', type: 'like', user: 'alix-dev', target: 'nebula-engine', time: '12m ago', read: false },
  { id: 'n2', type: 'push', user: 'sarah-code', target: 'quantum-ui', time: '2h ago', read: false },
  { id: 'n3', type: 'follow', user: 'mike-writes', target: 'you', time: '5h ago', read: true }
];

const MOCK_FILES: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'main.rs', type: 'file', content: 'fn main() {\n  println!("Hello Forge!");\n}', size: '1.2 KB' },
      { name: 'lib.rs', type: 'file', content: 'pub mod core;\npub mod types;', size: '4.5 KB' },
      { 
        name: 'core', 
        type: 'folder', 
        children: [
          { name: 'engine.rs', type: 'file', content: '// Core physics logic\nstruct Engine {\n  gravity: f32\n}', size: '12.8 KB' }
        ] 
      }
    ]
  },
  { name: 'Cargo.toml', type: 'file', content: '[package]\nname = "nebula-engine"\nversion = "0.1.0"', size: '400 B' },
  { name: 'README.md', type: 'file', content: '# Nebula Engine\n\nA physics engine built for high performance.', size: '1.1 KB' },
  { name: '.gitignore', type: 'file', content: 'target/\nCargo.lock', size: '55 B' }
];

const MOCK_ISSUES: Issue[] = [
  { id: 452, title: 'Memory leak in spatial hash calculation', status: 'open', label: 'Bug', author: 'alix-dev', createdAt: '2 days ago', comments: 12 },
  { id: 450, title: 'Support for Apple Silicon hardware acceleration', status: 'open', label: 'Enhancement', author: 'sarah-code', createdAt: '4 days ago', comments: 34 },
  { id: 448, title: 'Update documentation for v0.4.2 API changes', status: 'closed', label: 'Docs', author: 'mike-writes', createdAt: '1 week ago', comments: 5 }
];

// --- Sub-components ---

const contributionData: ContributionDay[] = Array.from({ length: 365 }, (_, i) => ({
  date: `2024-${Math.floor(i/30)+1}-${(i%30)+1}`,
  level: Math.floor(Math.random() * 5) as 0|1|2|3|4
}));

import { analyzeCode, chatWithForgeAI } from './services/geminiService';

// --- Sub-components ---

const ForgeIntelligence = ({ fileName, content, onClose }: { fileName: string, content: string, onClose: () => void }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      setIsLoading(true);
      const result = await analyzeCode(content, fileName);
      setAnalysis(result);
      setIsLoading(false);
    };
    runAnalysis();
  }, [fileName, content]);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed top-16 right-0 bottom-0 w-96 bg-stone-900/90 backdrop-blur-2xl border-l border-white/10 z-[200] p-8 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white font-mono">Neural Audit</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Decompressing Logic Grids...</p>
          </div>
        ) : analysis ? (
          <>
            <section>
              <div className="flex items-end justify-between mb-2">
                <span className="text-[10px] font-black font-mono text-stone-500 uppercase tracking-widest">Efficiency Rating</span>
                <span className="text-3xl font-serif font-black italic text-emerald-400">{analysis.score}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  className="h-full bg-emerald-500" 
                />
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black border-l-2 border-emerald-500 pl-3 uppercase tracking-widest text-white/40 font-mono">Executive Summary</h4>
              <p className="text-sm text-stone-400 leading-relaxed font-medium italic">"{analysis.summary}"</p>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black border-l-2 border-indigo-500 pl-3 uppercase tracking-widest text-white/40 font-mono">Linguistic Insights</h4>
              <div className="space-y-3">
                {analysis.insights.map((insight: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase text-indigo-400 font-mono tracking-tighter">{insight.type}</span>
                    </div>
                    <h5 className="text-sm font-bold text-white mb-1">{insight.title}</h5>
                    <p className="text-xs text-stone-500 leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black border-l-2 border-amber-500 pl-3 uppercase tracking-widest text-white/40 font-mono">Refinement Protocol</h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex gap-3 text-xs text-stone-400 font-medium">
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <div className="text-center p-8 text-stone-500 font-mono text-xs">Analysis context corrupted.</div>
        )}
      </div>

      <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
        <p className="text-[10px] text-emerald-400/80 font-mono uppercase tracking-widest mb-2">Diagnostic Mode</p>
        <button className="w-full py-2 bg-emerald-500 text-stone-950 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
          Commit Refinements
        </button>
      </div>
    </motion.div>
  );
};

const ForgeChat = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await chatWithForgeAI(input, [...messages, userMsg]);
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiResponse }] }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[70vh] flex flex-col glass-card bg-stone-900/40 border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">Neural Terminal</h3>
        </div>
        <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
            <Cpu className="w-12 h-12 text-stone-600 mb-4" />
            <p className="text-xs font-mono uppercase tracking-widest text-stone-500">Awaiting technical queries...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-white/5 border border-white/5 text-stone-300'
            }`}>
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl animate-pulse">
               <div className="flex gap-1.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query Forge Intelligence..."
            className="w-full bg-stone-950 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-30">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </form>
    </div>
  );
};

const ContributionGraph = () => (
  <div className="flex flex-col gap-2">
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {Array.from({ length: 52 }).map((_, weekIdx) => (
        <div key={weekIdx} className="flex flex-col gap-1">
          {Array.from({ length: 7 }).map((_, dayIdx) => {
            const level = contributionData[weekIdx * 7 + dayIdx]?.level || 0;
            return (
              <div 
                key={dayIdx} 
                className={`w-3 h-3 rounded-[2px] transition-colors duration-500
                  ${level === 0 ? 'bg-white/5' : 
                    level === 1 ? 'bg-emerald-900/40' : 
                    level === 2 ? 'bg-emerald-700/60' : 
                    level === 3 ? 'bg-emerald-500/80' : 
                    'bg-emerald-400'}`} 
              />
            );
          })}
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono uppercase tracking-widest">
      <span>Jan — Dec</span>
      <div className="flex items-center gap-1.5">
        <span>Less</span>
        <div className="w-2.5 h-2.5 bg-white/5 rounded-[2px]" />
        <div className="w-2.5 h-2.5 bg-emerald-900/40 rounded-[2px]" />
        <div className="w-2.5 h-2.5 bg-emerald-700/60 rounded-[2px]" />
        <div className="w-2.5 h-2.5 bg-emerald-500/80 rounded-[2px]" />
        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-[2px]" />
        <span>More</span>
      </div>
    </div>
  </div>
);

const Navbar = ({ onHome, onNewRepo, onProfile, notifications, currentUser }: { 
  onHome: () => void, 
  onNewRepo: () => void, 
  onProfile: () => void,
  notifications: ForgeNotification[],
  currentUser: UserProfile 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="h-16 border-b border-white/5 bg-stone-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-[100]">
      <div className="flex items-center gap-8">
        <button onClick={onHome} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
            <Hash className="w-5 h-5 text-stone-950 stroke-[3px]" />
          </div>
          <span className="font-serif font-black text-xl tracking-tight text-white uppercase italic">
            Forge
          </span>
        </button>

        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-emerald-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search network, repos, commands..." 
            className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 w-80 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:bg-white/10 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-stone-400 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-stone-950" />
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-80 bg-stone-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[500]"
              >
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono">Notifications</span>
                  {unreadCount > 0 && <span className="text-[9px] bg-emerald-500 text-stone-950 px-1.5 py-0.5 rounded-full font-bold">New</span>}
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-emerald-500/5' : ''}`}>
                        <p className="text-xs text-stone-300 leading-snug">
                          <span className="text-white font-bold">{n.user}</span> {n.type === 'like' ? 'liked your repository' : n.type === 'push' ? 'pushed to' : n.type === 'follow' ? 'followed you' : 'commented on'} <span className="text-emerald-400 font-mono">{n.target}</span>
                        </p>
                        <span className="text-[9px] font-mono text-stone-600 mt-1 block uppercase">{n.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[10px] font-mono text-stone-600 uppercase tracking-widest">Quiet Sector</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={onNewRepo}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors group"
        >
          <Plus className="w-4 h-4 text-stone-400 group-hover:text-emerald-400" />
          <ChevronDown className="w-3 h-3 text-stone-400" />
        </button>
        <button 
          onClick={onProfile}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 cursor-pointer hover:scale-105 transition-transform"
        >
          <img src={currentUser.avatar} className="w-full h-full rounded-full border-2 border-stone-950 bg-stone-900 object-cover" alt="" />
        </button>
      </div>
    </nav>
  );
};

const RepoCard: React.FC<{ repo: Repository, onClick: () => void, onLike: (e: React.MouseEvent) => void }> = ({ repo, onClick, onLike }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    onClick={onClick}
    className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-stone-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
            {repo.name}
            <span className="text-[10px] font-mono font-black uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-full text-stone-500 border border-white/5">
              {repo.visibility}
            </span>
          </h3>
          <p className="text-white/40 text-[10px] font-medium tracking-wide uppercase">by {repo.owner}</p>
        </div>
      </div>
      <button className="text-stone-500 hover:text-white"><Star className="w-5 h-5" /></button>
    </div>
    
    <p className="text-stone-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
      {repo.description}
    </p>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${repo.languageColor}`} />
          <span className="text-xs font-mono text-stone-500">{repo.language}</span>
        </div>
        <div 
          onClick={(e) => { e.stopPropagation(); onLike(e); }}
          className="flex items-center gap-1.5 text-stone-500 hover:text-pink-500 transition-colors"
        >
          <Heart className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{repo.likes}</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500 hover:text-emerald-500 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{repo.comments}</span>
        </div>
      </div>
      <span className="text-[10px] text-stone-600 font-mono italic uppercase tracking-widest">{repo.updatedAt}</span>
    </div>
  </motion.div>
);

const Dashboard = ({ repos, onSelectRepo, onNewRepo, users, onFollow, onLike }: { 
  repos: Repository[], 
  onSelectRepo: (r: Repository) => void, 
  onNewRepo: () => void,
  users: UserProfile[],
  onFollow: (id: string) => void,
  onLike: (id: string) => void
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
    <div className="lg:col-span-8 space-y-8">
      {/* Welcome Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            Repositories 
            <span className="bg-white/5 text-[10px] px-2 py-1 rounded-md font-mono text-emerald-400 border border-emerald-500/20">{repos.length} ACTIVE</span>
          </h2>
          <div className="flex gap-2">
            <button className="p-2 border border-white/5 rounded-lg text-stone-400 hover:bg-white/5 transition-colors"><Filter className="w-4 h-4" /></button>
            <button className="p-2 border border-white/5 rounded-lg text-stone-400 hover:bg-white/5 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map(repo => (
            <RepoCard key={repo.id} repo={repo} onClick={() => onSelectRepo(repo)} onLike={() => onLike(repo.id)} />
          ))}
          <motion.div 
            whileHover={{ scale: 0.99 }}
            onClick={onNewRepo}
            className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-stone-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-all cursor-pointer group min-h-[160px]"
          >
            <Plus className="w-8 h-8 mb-2 group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-mono text-xs font-black uppercase tracking-widest">Construct New Workspace</span>
          </motion.div>
        </div>
      </section>

      {/* Global Activity Feed */}
      <section className="bg-white/[0.01] border border-white/5 rounded-3xl p-8">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-500 mb-8 font-mono flex items-center justify-between">
          Network Pulse (Friends)
          <Zap className="w-4 h-4 text-emerald-400" />
        </h3>
        <div className="space-y-12">
           {[
             { user: 'alix-dev', action: 'pushed to', target: 'nebula-engine', time: '12m ago', likes: 24, comments: 2, avatar: 'https://i.pravatar.cc/150?u=alix' },
             { user: 'sarah-code', action: 'merged PR', target: 'quantum-ui', time: '2h ago', likes: 12, comments: 5, avatar: 'https://i.pravatar.cc/150?u=sarah' },
             { user: 'mike-writes', action: 'started following', target: 'your node', time: '5h ago', likes: 2, comments: 0, avatar: 'https://i.pravatar.cc/150?u=mike' }
           ].map((activity, i) => (
             <div key={i} className="flex gap-4">
               <img src={activity.avatar} className="w-10 h-10 rounded-xl border border-white/10" alt="" />
               <div className="flex-1">
                 <p className="text-sm text-stone-300">
                    <span className="text-white font-bold hover:text-emerald-400 cursor-pointer">{activity.user}</span> {activity.action} <span className="text-emerald-400 font-mono italic">{activity.target}</span>
                 </p>
                 <span className="text-[10px] font-mono text-stone-600 block mt-1 uppercase">{activity.time}</span>
                 
                 <div className="flex items-center gap-4 mt-4">
                    <button className="flex items-center gap-1.5 text-stone-500 hover:text-pink-500 transition-colors">
                      <Heart className="w-4 h-4" /> <span className="text-[10px] font-mono uppercase">{activity.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-stone-500 hover:text-emerald-500 transition-colors">
                      <MessageSquare className="w-4 h-4" /> <span className="text-[10px] font-mono uppercase">{activity.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-stone-500 hover:text-white transition-colors">
                      <GitFork className="w-4 h-4" />
                    </button>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </section>
    </div>

    {/* Sidebar Content */}
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 sticky top-24">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-6 flex items-center justify-between">
          Social Reach
          <Clock className="w-3 h-3" />
        </h4>
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
             <span className="block text-xl font-bold text-white">1.2k</span>
             <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Followers</span>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
             <span className="block text-xl font-bold text-white">430</span>
             <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Following</span>
           </div>
        </div>

        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4 font-mono">Suggested Experts</h4>
        <div className="space-y-4">
          {users.filter(u => !u.isFriend).map(user => (
            <div key={user.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <img src={user.avatar} className="w-8 h-8 rounded-lg border border-white/10" alt="" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{user.username}</span>
              </div>
              <button 
                onClick={() => onFollow(user.id)}
                className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-stone-950 transition-all border border-emerald-500/20"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const FileBrowser = ({ nodes, onSelectFile }: { nodes: FileNode[], onSelectFile: (f: FileNode) => void }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders.has(node.name);

    return (
      <div key={node.name}>
        <div 
          onClick={() => isFolder ? toggleFolder(node.name) : onSelectFile(node)}
          className={`group flex items-center gap-3 py-2.5 px-4 hover:bg-white/5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-white/5 ${depth > 0 ? 'ml-4' : ''}`}
        >
          {isFolder ? (
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            </motion.div>
          ) : (
            <div className="w-3.5" />
          )}
          {isFolder ? <Folder className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-stone-500" />}
          <span className={`text-sm font-medium ${isFolder ? 'text-white' : 'text-stone-400 group-hover:text-white'}`}>{node.name}</span>
          <span className="ml-auto text-[10px] font-mono text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.size || ''}
          </span>
        </div>
        {isFolder && isExpanded && node.children && (
          <div className="mt-0.5">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div className="p-2 space-y-0.5">{nodes.map(node => renderNode(node))}</div>;
};

const CodeViewer = ({ file, onBack }: { file: FileNode, onBack: () => void }) => (
  <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden glass-card">
    <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-tight">{file.name}</span>
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">{file.size}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-stone-400 text-xs font-mono rounded-lg border border-white/5">Raw</button>
        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-stone-400 text-xs font-mono rounded-lg border border-white/5">Blame</button>
      </div>
    </div>
    <div className="p-8 overflow-x-auto min-h-[400px]">
      <pre className="font-mono text-sm leading-relaxed">
        <code>
          {file.content?.split('\n').map((line, i) => (
            <div key={i} className="flex gap-8 group">
              <span className="w-12 text-right shrink-0 select-none text-stone-600 group-hover:text-stone-400 transition-colors">{i + 1}</span>
              <span className="text-emerald-400/90">{line || ' '}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  </div>
);

const RepositoryDetail = ({ repo, onLike, onBack }: { repo: Repository, onLike: (id: string) => void, onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'issues' | 'pulls' | 'actions' | 'insights' | 'settings'>('code');
  const [intelFile, setIntelFile] = useState<{name: string, content: string} | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);

  const addIssue = () => {
    const title = prompt("Enter operation title:");
    if (!title) return;
    const newIssue: Issue = {
      id: Math.floor(Math.random() * 1000),
      title,
      status: 'open',
      label: 'Task',
      author: 'you',
      createdAt: 'just now',
      comments: 0
    };
    setIssues([newIssue, ...issues]);
  };

  const triggerAudit = (file?: FileNode) => {
    setIntelFile({ 
      name: file?.name || 'main.rs', 
      content: file?.content || '// Core physics engine implementation\nuse spatial_hash::Grid;\n\npub struct Nebula {\n    grid: Grid,\n    entities: Vec<Entity>,\n}\n\nimpl Nebula {\n    pub fn step(&mut self) {\n        // Parallel entity simulation\n        self.entities.par_iter_mut().for_each(|e| e.update());\n        self.grid.rebuild(&self.entities);\n    }\n}' 
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence>
        {intelFile && (
          <ForgeIntelligence 
            fileName={intelFile.name} 
            content={intelFile.content} 
            onClose={() => setIntelFile(null)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 bg-white/5 rounded-xl text-stone-400 hover:text-white transition-colors border border-white/5">
             <ChevronRight className="w-5 h-5 rotate-180" />
           </button>
           <nav className="flex items-center gap-2 text-sm text-stone-500 font-mono">
             <span className="hover:text-white cursor-pointer">{repo.owner}</span>
             <span>/</span>
             <span className="text-white font-bold">{repo.name}</span>
             <span className="bg-white/5 text-[10px] px-2 py-0.5 rounded-full border border-white/5 text-emerald-400">{repo.visibility}</span>
           </nav>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {[
              { id: 'code', icon: Code2, label: 'Source' },
              { id: 'issues', icon: ListTodo, label: 'Issues', count: 12 },
              { id: 'pulls', icon: GitPullRequest, label: 'Pull Requests', count: 4 },
              { id: 'actions', icon: Play, label: 'Actions' },
              { id: 'insights', icon: BarChart3, label: 'Insights' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-all shrink-0 font-mono uppercase tracking-widest text-[10px] font-black ${
                  activeTab === tab.id 
                    ? 'border-emerald-500 text-white' 
                    : 'border-transparent text-stone-500 hover:text-white hover:border-white/10'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-400 mt-[-1px]' : ''}`} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="bg-white/10 px-1.5 rounded-md text-[9px] group-hover:bg-white/20">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl overflow-hidden border border-white/5">
              <button 
                onClick={() => onLike(repo.id)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors text-stone-300 font-bold text-xs border-r border-white/5"
              >
                <Heart className="w-4 h-4 text-pink-500" /> Like
              </button>
              <div className="px-4 py-2 bg-stone-900 text-stone-500 font-mono text-xs flex items-center">{repo.likes}</div>
            </div>
            <button className="p-2 border border-white/5 rounded-xl text-stone-300 hover:bg-white/5"><GitFork className="w-5 h-5" /></button>
            <button 
              onClick={() => triggerAudit(selectedFile || undefined)}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-colors flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              {selectedFile ? `Audit ${selectedFile.name}` : "Audit Engine"}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-4">
            {selectedFile ? (
              <CodeViewer file={selectedFile} onBack={() => setSelectedFile(null)} />
            ) : (
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden glass-card">
                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-all font-mono">
                        <GitFork className="w-3 h-3 text-stone-500" /> {currentBranch} <ChevronDown className="w-3 h-3 text-stone-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <span className="font-mono">forge-labs</span> / <span className="text-white font-bold">{repo.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => triggerAudit()} className="p-2 hover:bg-white/5 rounded-lg text-emerald-400" title="Audit Source">
                      <Cpu className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-stone-600 tracking-widest uppercase">Go to file</span>
                  </div>
                </div>
                
                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-white">latest_release_v0.5.1</span>
                    <span className="text-stone-500 text-xs font-mono">merged 2 hours ago by @alix</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Verified Build</span>
                    <span className="text-[10px] font-mono text-stone-600">452 Commits</span>
                  </div>
                </div>
                <FileBrowser nodes={MOCK_FILES} onSelectFile={setSelectedFile} />
              </div>
            )}

            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 prose prose-invert max-w-none">
              <div className="flex items-center gap-2 mb-6 text-stone-500 font-mono tracking-widest text-[10px]">
                <FileText className="w-4 h-4" /> README.md
              </div>
              <h1 className="text-4xl font-serif font-black italic mb-6">Nebula Physics Engine</h1>
              <p className="text-stone-400 leading-relaxed text-lg mb-8">
                A highly optimized spatial synchronization engine built for low-latency web environments. Nebula leverages WebAssembly and SIMD instructions to deliver desktop-grade physics performance in standard browsers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-l-4 border-l-emerald-500">
                    <h4 className="text-white font-bold mb-2">High Parallelism</h4>
                    <p className="text-xs text-stone-500">Optimized for multi-threaded WASM workers.</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-l-4 border-l-indigo-500">
                    <h4 className="text-white font-bold mb-2">Spatial Hashing</h4>
                    <p className="text-xs text-stone-500">Efficient broad-phase collision detection.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 font-mono">About</h4>
              <p className="text-sm text-stone-400 font-medium leading-relaxed">{repo.description}</p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <Globe className="w-4 h-4" /> nebula-engine.io
              </div>
              <div className="flex flex-wrap gap-2">
                {['physics', 'wasm', 'graphics', 'spatial'].map(tag => (
                  <span key={tag} className="text-[10px] font-mono font-medium px-2 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 cursor-pointer transition-colors">#{tag}</span>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 font-mono">Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Watching</span>
                  <span className="text-white font-mono">452</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 flex items-center gap-2"><GitFork className="w-3.5 h-3.5" /> Forks</span>
                  <span className="text-white font-mono">{repo.forks}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Stars</span>
                  <span className="text-white font-mono">{(repo.stars/1000).toFixed(1)}k</span>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-500 font-mono">Languages</h4>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                 <div className="h-full bg-orange-500 w-[72%]" />
                 <div className="h-full bg-indigo-500 w-[20%]" />
                 <div className="h-full bg-emerald-500 w-[8%]" />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="flex items-center gap-2 text-stone-400">
                      <div className="w-2 h-2 rounded-full bg-orange-500" /> Rust
                    </span>
                    <span className="text-stone-600">72.4%</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="flex items-center gap-2 text-stone-400">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" /> C++
                    </span>
                    <span className="text-stone-600">20.1%</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="flex items-center gap-2 text-stone-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> Assembly
                    </span>
                    <span className="text-stone-600">7.5%</span>
                 </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden glass-card">
          <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest font-mono">
                <Info className="w-5 h-5 text-emerald-400" /> {issues.filter(i => i.status === 'open').length} Open Operations
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-white uppercase tracking-widest font-mono">
                <CheckCircle2 className="w-5 h-5" /> {issues.filter(i => i.status === 'closed').length} Closed
              </button>
            </div>
            <button 
              onClick={addIssue}
              className="px-4 py-2 bg-emerald-500 text-stone-950 rounded-xl text-xs font-bold font-mono uppercase tracking-widest"
            >
              Construct Issue
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {issues.map(issue => (
              <div key={issue.id} className="p-6 hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${issue.status === 'open' ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {issue.status === 'open' ? <Info className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tight">{issue.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-stone-500">
                      <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-tighter text-indigo-400">{issue.label}</span>
                      <span>#{issue.id} opened {issue.createdAt} by <span className="text-stone-300 hover:text-emerald-400 cursor-pointer">{issue.author}</span></span>
                    </div>
                  </div>
                  {issue.comments > 0 && (
                    <div className="flex items-center gap-1.5 text-stone-600 font-mono text-xs">
                      <MessageSquare className="w-4 h-4" /> {issue.comments}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pulls' && (
        <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden glass-card">
          <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest font-mono">
                <GitPullRequest className="w-5 h-5 text-emerald-400" /> {MOCK_PULLS.filter(p => p.status === 'open').length} Active Synchronies
              </button>
            </div>
            <button className="px-4 py-2 bg-emerald-500 text-stone-950 rounded-xl text-xs font-bold font-mono uppercase tracking-widest">New Merge Request</button>
          </div>
          <div className="divide-y divide-white/5">
            {MOCK_PULLS.map(pr => (
              <div key={pr.id} className="p-6 hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${pr.status === 'open' ? 'text-emerald-400' : pr.status === 'merged' ? 'text-purple-400' : 'text-stone-500'}`}>
                    <GitPullRequest className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tight">{pr.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-stone-500">
                      <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-stone-300">{pr.branch}</span>
                      <span>#{pr.id} by <span className="text-stone-300 font-bold">{pr.author}</span> {pr.status === 'merged' ? 'synchronized' : 'requested'} {pr.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
         <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden glass-card">
            <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-white font-mono flex items-center gap-3">
                <Play className="w-4 h-4 text-emerald-400" /> Automation Flow
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {MOCK_WORKFLOWS.map(run => (
                <div key={run.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${run.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'} animate-pulse`} />
                    <div>
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{run.name}</h4>
                      <p className="text-[10px] font-mono text-stone-500 uppercase tracking-tighter mt-1">{run.event} on {run.branch} • #{Math.floor(Math.random()*100)}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-stone-600 uppercase tracking-widest">{run.createdAt}</div>
                </div>
              ))}
            </div>
         </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 glass-card">
            <h3 className="text-xl font-serif font-black italic text-white mb-8">Node Discussion</h3>
            <div className="space-y-8 mb-8">
              {repo.commentList && repo.commentList.map((comment, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
                    {comment.user[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{comment.user}</span>
                      <span className="text-[10px] font-mono text-stone-600 uppercase tracking-widest">{comment.time}</span>
                    </div>
                    <p className="text-sm text-stone-400 leading-relaxed font-medium">{comment.text}</p>
                  </div>
                </div>
              ))}
              {(!repo.commentList || repo.commentList.length === 0) && (
                <div className="py-12 text-center text-stone-600 font-mono text-[10px] uppercase tracking-widest">
                  No transmissions discovered for this node.
                </div>
              )}
            </div>
            <div className="pt-8 border-t border-white/5 flex gap-4">
              <input 
                type="text" 
                placeholder="Broadcast a message..." 
                className="flex-1 bg-stone-950 border border-white/10 rounded-xl py-3 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-medium"
              />
              <button className="px-6 py-2 bg-emerald-500 text-stone-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors">
                Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-12 py-12">
          <section>
            <h3 className="text-2xl font-serif font-black italic text-white mb-2">Core Configuration</h3>
            <p className="text-stone-500 text-sm mb-8 font-medium">Manage visibility, access controls and neural link settings for this node.</p>
            
            <div className="space-y-6">
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 font-mono">Node Label</label>
                <input 
                  type="text" 
                  defaultValue={repo.name}
                  className="w-full bg-stone-950 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
                />
              </div>

              <div className="border border-red-500/20 bg-red-500/5 rounded-3xl p-8">
                <h4 className="text-red-400 font-bold mb-2">Danger Manifest</h4>
                <p className="text-xs text-stone-500 mb-6 font-medium">Operations that can cause irreversible data purging in the spatial mesh.</p>
                <div className="flex flex-col gap-4">
                  <button className="flex items-center justify-between p-4 bg-stone-950/50 border border-white/5 rounded-2xl hover:bg-stone-950 transition-colors group">
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Decommission Node</p>
                      <p className="text-[10px] text-stone-600 font-mono">Archive all repository state and logs.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-white" />
                  </button>
                  <button className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-colors group">
                    <div className="text-left">
                      <p className="text-xs font-bold text-red-400">Purge Repository</p>
                      <p className="text-[10px] text-red-900 font-mono">Permanently erase this node from the Forge network.</p>
                    </div>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const LayoutSidebar = ({ activeTab, onSelect }: { 
  activeTab: string, 
  onSelect: (t: string) => void
}) => (
  <aside className="w-64 border-r border-white/5 hidden lg:flex flex-col fixed top-16 bottom-0 py-8 px-4 bg-stone-950/20 backdrop-blur-md">
    <div className="space-y-8">
      <nav className="space-y-1">
        {[
          { id: 'dashboard', icon: Layout, label: 'Workbench' },
          { id: 'repos', icon: Database, label: 'Data Nodes' },
          { id: 'issues', icon: ListTodo, label: 'Operations' },
          { id: 'market', icon: Users, label: 'Community Hub' },
          { id: 'profile', icon: User, label: 'Neural Profile' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-mono uppercase tracking-[0.2em] text-[10px] font-black ${
              activeTab === item.id 
                ? 'bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/5' 
                : 'text-stone-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-emerald-400' : ''}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div>
        <h4 className="px-4 text-[9px] font-black uppercase tracking-widest text-stone-600 mb-4 flex items-center justify-between">
          Recent Nodes
          <ArrowUpRight className="w-3 h-3" />
        </h4>
        <div className="space-y-1">
           {MOCK_REPOS.slice(0, 2).map(repo => (
             <button key={repo.id} className="w-full flex items-center gap-3 px-4 py-2 text-stone-500 hover:text-white transition-colors group">
               <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-emerald-400" />
               <span className="text-[11px] font-mono truncate">{repo.name}</span>
             </button>
           ))}
        </div>
      </div>
    </div>

    <div className="mt-auto space-y-4">
      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
         <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono text-white">Build Success</span>
         </div>
         <p className="text-[10px] font-mono text-stone-500">nebula-core synced 0.2s ago</p>
      </div>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-white transition-colors font-mono uppercase tracking-[0.15em] text-[11px] font-black">
        <Settings className="w-4 h-4" /> Configuration
      </button>
    </div>
  </aside>
);

const UserDetail = ({ user, repos, onSelectRepo, onFollow, onLike, onBack }: { 
  user: UserProfile, 
  repos: Repository[], 
  onSelectRepo: (r: Repository) => void,
  onFollow: (id: string) => void,
  onLike: (id: string) => void,
  onBack: () => void
}) => {
  const userRepos = repos.filter(r => r.owner === user.username);
  
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl text-stone-400 hover:text-white transition-colors border border-white/5">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-[0.2em] font-black">Neural Profile</span>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <img src={user.avatar} className="w-32 h-32 rounded-3xl border-4 border-white/5 shadow-2xl" alt="" />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl font-serif font-black italic text-white uppercase tracking-tight mb-2">{user.username}</h2>
          <p className="text-stone-400 max-w-xl mb-6 font-medium leading-relaxed">{user.bio}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
              <span className="block text-xl font-bold text-white leading-none">{user.followers}</span>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Followers</span>
            </div>
            <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
              <span className="block text-xl font-bold text-white leading-none">{user.following}</span>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Following</span>
            </div>
            <button 
              onClick={() => onFollow(user.id)}
              className={`px-8 py-2 rounded-2xl font-bold text-sm transition-all ${user.isFriend ? 'bg-white/10 text-stone-300' : 'bg-emerald-500 text-stone-950 hover:bg-emerald-400'}`}
            >
              {user.isFriend ? 'Following' : 'Follow Node'}
            </button>
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-500 mb-8 font-mono flex items-center gap-3">
          <Database className="w-4 h-4" /> Spatial Repositories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userRepos.length > 0 ? (
            userRepos.map(repo => (
              <RepoCard key={repo.id} repo={repo} onClick={() => onSelectRepo(repo)} onLike={() => onLike(repo.id)} />
            ))
          ) : (
             <div className="col-span-full py-12 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                <p className="text-stone-600 font-mono text-xs uppercase tracking-widest font-black">No public nodes discovered in this spatial sector</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default function ForgeApp() {
  const [view, setView] = useState<'dashboard' | 'repo-detail' | 'social' | 'user-detail' | 'profile'>('dashboard');
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'me',
    username: 'shaikhmadiha',
    avatar: 'https://i.pravatar.cc/150?u=shaikhmadiha',
    bio: 'Lead Spatial Architect. Building the next generation of Forge nodes.',
    followers: 128,
    following: 64,
    isFriend: true
  });

  const [repos, setRepos] = useState<Repository[]>(MOCK_REPOS);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [notifications, setNotifications] = useState<ForgeNotification[]>(MOCK_NOTIFICATIONS);

  const toggleFollow = (userId: string) => {
    if (userId === 'me') return;
    setUsers(users.map(u => u.id === userId ? { ...u, isFriend: !u.isFriend, followers: u.followers + (u.isFriend ? -1 : 1) } : u));
    const user = users.find(u => u.id === userId);
    if (user && !user.isFriend) {
       setNotifications([{ id: Date.now().toString(), type: 'follow', user: user.username, target: 'your node', time: 'Just now', read: false }, ...notifications]);
    }
  };

  const handleLikeRepo = (repoId: string) => {
    setRepos(repos.map(r => r.id === repoId ? { ...r, likes: r.likes + 1 } : r));
    const repo = repos.find(r => r.id === repoId);
    if (repo) {
       setNotifications([{ id: Date.now().toString(), type: 'like', user: 'alix-dev', target: repo.name, time: 'Just now', read: false }, ...notifications]);
    }
  };

  const handleSelectRepo = (repo: Repository) => {
    setSelectedRepo(repo);
    setView('repo-detail');
  };

  const handleGoHome = () => {
    setView('dashboard');
    setSelectedRepo(null);
    setSelectedUser(null);
  };

  const constructRepository = () => {
    if (!newRepoName || !newRepoDesc) return;

    const newRepo: Repository = {
      id: `node-${Date.now()}`,
      name: newRepoName,
      owner: currentUser.username,
      description: newRepoDesc,
      stars: 0,
      forks: 0,
      visibility: 'Public',
      language: 'TypeScript',
      languageColor: 'bg-blue-500',
      updatedAt: 'Just now',
      size: '0 KB',
      likes: 0,
      comments: 0,
      commentList: []
    };

    setRepos([newRepo, ...repos]);
    setNotifications([
      { id: Date.now().toString(), type: 'push', user: 'System', target: newRepoName, time: 'Just now', read: false },
      ...notifications
    ]);
    setIsCreatingRepo(false);
    setNewRepoName('');
    setNewRepoDesc('');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-100 antialiased">
      <Navbar 
        onHome={handleGoHome} 
        onNewRepo={() => setIsCreatingRepo(true)} 
        onProfile={() => setView('profile')}
        notifications={notifications} 
        currentUser={currentUser}
      />

      <AnimatePresence>
        {isCreatingRepo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-stone-900 border border-white/10 rounded-[32px] w-full max-w-xl p-8 shadow-2xl"
             >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-serif font-black italic text-white uppercase tracking-tight">Construct New Node</h3>
                  <button onClick={() => setIsCreatingRepo(false)} className="p-2 text-stone-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 font-mono ml-4">Node Designation</label>
                    <input 
                      type="text" 
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="e.g. nebula-protocol"
                      className="w-full bg-stone-950 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono text-white placeholder:text-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 font-mono ml-4">Purpose Manifest</label>
                    <textarea 
                      value={newRepoDesc}
                      onChange={(e) => setNewRepoDesc(e.target.value)}
                      placeholder="Brief description of the repository logic..."
                      rows={4}
                      className="w-full bg-stone-950 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-medium text-white placeholder:text-stone-700 resize-none"
                    />
                  </div>

                  <button 
                    onClick={constructRepository}
                    disabled={!newRepoName || !newRepoDesc}
                    className="w-full py-4 bg-emerald-500 text-stone-950 font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                  >
                    <Cpu className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Initialize Node Sequence
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 z-[300]">
          <ForgeChat onClose={() => setIsChatOpen(false)} />
        </div>
      )}
      
      <div className="flex">
        <LayoutSidebar 
          activeTab={activeSidebarTab} 
          onSelect={(t) => {
            setActiveSidebarTab(t);
            if (t === 'dashboard') handleGoHome();
            if (t === 'market') setView('social');
            if (t === 'profile') setView('profile');
          }} 
        />
        
        <main className={`flex-1 transition-all duration-500 min-h-[calc(100vh-4rem)] p-6 lg:ml-64`}>
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <Dashboard 
                    repos={repos} 
                    onSelectRepo={handleSelectRepo} 
                    onNewRepo={() => setIsCreatingRepo(true)} 
                    users={users}
                    onFollow={toggleFollow}
                    onLike={handleLikeRepo}
                  />
                </motion.div>
              ) : view === 'profile' ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <UserDetail 
                    user={currentUser} 
                    repos={repos} 
                    onSelectRepo={handleSelectRepo} 
                    onFollow={() => {}} 
                    onLike={handleLikeRepo}
                    onBack={handleGoHome}
                  />
                </motion.div>
              ) : view === 'social' ? (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                   <div className="space-y-8">
                     <h2 className="text-3xl font-serif font-black italic text-white mb-8">Spatial Connections</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {users.map(user => (
                         <div key={user.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.05] transition-all group">
                           <div 
                             onClick={() => { setSelectedUser(user); setView('user-detail'); }}
                             className="flex lg:flex-row flex-col items-center gap-4 mb-6 cursor-pointer"
                           >
                             <img src={user.avatar} className="w-16 h-16 rounded-2xl border-2 border-white/10" alt="" />
                             <div className="text-center lg:text-left">
                               <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors uppercase italic">{user.username}</h3>
                               <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">{user.followers} Follows</p>
                             </div>
                           </div>
                           <p className="text-xs text-stone-400 font-medium leading-relaxed mb-6 text-center lg:text-left">{user.bio}</p>
                           <div className="flex gap-2">
                             <button 
                               onClick={() => toggleFollow(user.id)}
                               className={`flex-1 py-2 ${user.isFriend ? 'bg-white/10 text-stone-300' : 'bg-emerald-500 text-stone-950'} font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors`}
                             >
                               {user.isFriend ? 'Following' : 'Follow Node'}
                             </button>
                             <button className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-stone-400 hover:text-white transition-colors">
                               <MoreHorizontal className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                </motion.div>
              ) : view === 'user-detail' && selectedUser ? (
                <motion.div
                  key="user-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <UserDetail 
                    user={selectedUser} 
                    repos={repos} 
                    onSelectRepo={handleSelectRepo} 
                    onFollow={toggleFollow}
                    onLike={handleLikeRepo}
                    onBack={handleGoHome}
                  />
                </motion.div>
              ) : selectedRepo && (
                <motion.div
                  key="repo-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <RepositoryDetail repo={selectedRepo} onLike={handleLikeRepo} onBack={handleGoHome} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Command Menu Background Blur */}
      <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-emerald-500/5 to-transparent z-[-1]" />
    </div>
  );
}
