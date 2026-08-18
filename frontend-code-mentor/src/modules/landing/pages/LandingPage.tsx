import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Brain,
  Zap,
  Users,
  Trophy,
  BarChart3,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Check,
  Sun,
  Moon,
  Menu,
  X,
  Play,
  Layers
} from 'lucide-react';
import logoMark from '../../../assets/codementor-logo.svg';
import navbarLight from '../../../assets/codementor-navbar-light.svg';
import navbarDark from '../../../assets/codementor-navbar-dark.svg';
import { useAuth } from '../../auth/context/AuthContext';

const THEME_KEY = 'app_theme';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeHintTab, setActiveHintTab] = useState<1 | 2 | 3>(1);

  // Theme support
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored !== null) return stored === 'dark';
    } catch { /* ignore */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [dark]);

  const handleAuthAction = () => {
    if (user) {
      navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      question: 'Will CodeMentor give away the direct solution or spoil problems?',
      answer:
        'No. CodeMentor is built on a Socratic learning philosophy. Instead of spitting out complete code, it provides progressive, multi-level hints—starting with conceptual clues, moving to data structure suggestions, and only providing pseudocode if you specifically ask. This ensures you develop true problem-solving intuition.',
    },
    {
      question: 'Which coding platforms are currently supported?',
      answer:
        'CodeMentor currently supports LeetCode, GeeksforGeeks, and HackerRank. The companion extension automatically recognizes the active problem, extracts the description and your current code, and synchronizes your progress to your CodeMentor dashboard.',
    },
    {
      question: 'How does the Classroom & Teacher portal work?',
      answer:
        'Teachers can create virtual classrooms with unique invite codes, curate problem sets with due dates, and monitor student submission progress in real time. Students join classrooms with one click and see their assigned homework directly in their dashboard.',
    },
    {
      question: 'Is CodeMentor free for students and developers?',
      answer:
        'Yes! CodeMentor is free to use for students, educators, and self-learners practicing Data Structures and Algorithms.',
    },
    {
      question: 'How is my code and data protected?',
      answer:
        'We adhere strictly to Chrome Web Store Limited Use requirements and strict data protection policies. Your code is encrypted in transit via HTTPS and used solely to generate real-time learning guidance. We never sell user data or use it for advertising. Check our Privacy Policy for full details.',
    },
  ];

  return (
    <div className="cm-page-shell min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col">
      {/* Navigation Bar */}
      <header className="cm-nav-surface sticky top-0 z-50 border-b backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={navbarLight} alt="CodeMentor" className="h-8 w-auto max-w-[180px] dark:hidden" />
            <img src={navbarDark} alt="CodeMentor" className="hidden h-8 w-auto max-w-[180px] dark:block" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-zinc-900 dark:hover:text-white transition">
              Features
            </button>
            <button onClick={() => scrollToSection('extension')} className="hover:text-zinc-900 dark:hover:text-white transition">
              Extension
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-zinc-900 dark:hover:text-white transition">
              How It Works
            </button>
            <button onClick={() => scrollToSection('classrooms')} className="hover:text-zinc-900 dark:hover:text-white transition">
              Classrooms
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-zinc-900 dark:hover:text-white transition">
              FAQ
            </button>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <button
                onClick={handleAuthAction}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-5 space-y-3">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Features
            </button>
            <button onClick={() => scrollToSection('extension')} className="block w-full text-left py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Extension
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              How It Works
            </button>
            <button onClick={() => scrollToSection('classrooms')} className="block w-full text-left py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Classrooms
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              FAQ
            </button>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col space-y-2">
              <button
                onClick={handleAuthAction}
                className="w-full py-2.5 rounded-xl text-center text-sm font-bold bg-blue-600 text-white"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background glow accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold shadow-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Next-Gen AI Companion for LeetCode & Coding Practice</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
              Master Coding Problems with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Real-Time AI Guidance
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Get contextual, progressive hints that teach algorithmic logic step-by-step—never spoiling the answer. Track classroom assignments, sync LeetCode progress, and climb the leaderboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleAuthAction}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <span>{user ? 'Open Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('extension')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 font-bold text-sm sm:text-base transition shadow-sm flex items-center justify-center space-x-2"
              >
                <Laptop className="w-4 h-4 text-blue-500" />
                <span>Explore Chrome Extension</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No Direct Spoilers</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Autonomous LeetCode & GFG Sync</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Student & Teacher Portals</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Visual Mockup */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
                {/* Mock Window Header */}
                <div className="h-10 px-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    leetcode.com/problems/two-sum — CodeMentor Active
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-500 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden sm:inline">AI Synced</span>
                  </div>
                </div>

                {/* Mock Split View (Problem Editor & CodeMentor Sidepanel) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
                  {/* Left: Editor & Problem Context */}
                  <div className="lg:col-span-7 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">1. Two Sum</h3>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            Easy
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Given an array of integers <code className="text-blue-500">nums</code> and an integer <code className="text-blue-500">target</code>...
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2">
                        <span className="text-xs font-bold text-zinc-400">Java</span>
                      </div>
                    </div>

                    {/* Code Snippet Box */}
                    <div className="p-4 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-xs leading-relaxed overflow-x-auto">
                      <div className="text-zinc-500">// Your current submission draft</div>
                      <div><span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> {'{'}</div>
                      <div className="pl-4"><span className="text-purple-400">public int</span>[] <span className="text-blue-400">twoSum</span>(<span className="text-purple-400">int</span>[] nums, <span className="text-purple-400">int</span> target) {'{'}</div>
                      <div className="pl-8 text-zinc-400">Map&lt;Integer, Integer&gt; map = <span className="text-purple-400">new</span> HashMap&lt;&gt;();</div>
                      <div className="pl-8 text-zinc-400"><span className="text-purple-400">for</span> (<span className="text-purple-400">int</span> i = <span className="text-orange-400">0</span>; i &lt; nums.length; i++) {'{'}</div>
                      <div className="pl-12 text-zinc-400"><span className="text-purple-400">int</span> complement = target - nums[i];</div>
                      <div className="pl-12 text-emerald-400 font-bold"><span className="text-purple-400">if</span> (map.containsKey(complement)) ...</div>
                      <div className="pl-8 text-zinc-400">{'}'}</div>
                      <div className="pl-4 text-zinc-400">{'}'}</div>
                      <div>{'}'}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Platform: <strong>LeetCode</strong></span>
                      <span>Target: <code className="text-blue-500">O(N) Time</code></span>
                    </div>
                  </div>

                  {/* Right: CodeMentor Extension Sidepanel Preview */}
                  <div className="lg:col-span-5 p-6 bg-zinc-50 dark:bg-zinc-850 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                          CM
                        </div>
                        <span className="font-extrabold text-xs text-zinc-900 dark:text-white">
                          AI Mentor Companion
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold">
                        Level {activeHintTab} of 3
                      </span>
                    </div>

                    {/* Hint Level Selector */}
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80">
                      <button
                        onClick={() => setActiveHintTab(1)}
                        className={`py-1 rounded-lg text-xs font-bold transition ${
                          activeHintTab === 1
                            ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        1. Concept
                      </button>
                      <button
                        onClick={() => setActiveHintTab(2)}
                        className={`py-1 rounded-lg text-xs font-bold transition ${
                          activeHintTab === 2
                            ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        2. Strategy
                      </button>
                      <button
                        onClick={() => setActiveHintTab(3)}
                        className={`py-1 rounded-lg text-xs font-bold transition ${
                          activeHintTab === 3
                            ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        3. Code Hint
                      </button>
                    </div>

                    {/* Dynamic Hint Content Box */}
                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-blue-200/60 dark:border-blue-900/40 shadow-sm space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {activeHintTab === 1 && 'Conceptual Nudge'}
                          {activeHintTab === 2 && 'Data Structure Strategy'}
                          {activeHintTab === 3 && 'Algorithmic Optimization'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {activeHintTab === 1 &&
                          'Instead of a nested loop checking every pair in O(n²), can we check if the complement (target - current_num) already exists in O(1)?'}
                        {activeHintTab === 2 &&
                          'Consider using a Hash Map where keys are array values and values are their corresponding indices. Check for the complement in the map on each step.'}
                        {activeHintTab === 3 &&
                          'As you iterate with index i, lookup complement = target - nums[i]. If found, return [map.get(complement), i]. Otherwise map.put(nums[i], i).'}
                      </p>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[10px] text-zinc-400">Expected Time</div>
                        <div className="font-mono font-bold text-emerald-500">O(N)</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[10px] text-zinc-400">Space Complexity</div>
                        <div className="font-mono font-bold text-blue-500">O(N)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">10,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">Contextual Hints Served</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400">3+</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">Platforms Supported</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">Socratic Spoil-Free</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500">99.9%</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">Problem Sync Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Built For Deep Mastery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Everything You Need to Ace Technical Problem Solving
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            CodeMentor combines an unobtrusive browser extension with a powerhouse web dashboard for students and instructors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Progressive Hinting Engine</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Step through 3 tiers of guidance: conceptual clues, data structure strategies, and edge-case reminders without exposing full solutions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Floating Companion Sidepanel</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Never switch windows. The Chrome sidepanel opens natively on LeetCode & GFG, reading your code editor in real time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Autonomous Sync</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Problem title, platform, code attempts, and completion status sync seamlessly to your profile in the background.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Classrooms & Assignments</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Teachers create cohorts, assign curated LeetCode problems with deadlines, and view automated student completion stats.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-red-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-zinc-800 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Gamified Leaderboards</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Compete with peers, track problem streak consistency, and earn badges as you master new algorithms.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Portfolio & Skill Heatmap</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Comprehensive analytics detailing difficulty distribution (Easy, Medium, Hard), topic mastery, and solve timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Extension Deep Dive Section */}
      <section id="extension" className="py-20 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
                <Code2 className="w-3.5 h-3.5" />
                <span>Chrome Extension Experience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Designed to Blend Into Your Daily Coding Workflow
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                CodeMentor runs as a lightweight, secure Chrome extension. Whenever you visit LeetCode or GeeksforGeeks, CodeMentor is right beside your editor—ready to assist when you get stuck.
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  'Automatic problem statement and context extraction',
                  'Instant code analysis without copy-pasting into external windows',
                  'Progressive hint levels that maintain flow state',
                  'Live assignment progress sync for enrolled classrooms',
                ].map((text, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleAuthAction}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition inline-flex items-center space-x-2"
                >
                  <span>Install & Start Solving</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Extension Preview Card */}
            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center space-x-3">
                    <img src={logoMark} alt="CodeMentor" className="w-8 h-8 rounded-lg" />
                    <div>
                      <div className="font-extrabold text-sm">CodeMentor Companion</div>
                      <div className="text-[10px] text-zinc-400 font-mono">Chrome Extension v1.0.0</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Active Sync
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Problem Context</div>
                  <div className="p-3.5 rounded-xl bg-zinc-850 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Longest Substring Without Repeating Characters</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Platform: LeetCode • Difficulty: Medium</div>
                    </div>
                    <span className="text-amber-400 font-mono text-xs font-bold">#3</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                    <Brain className="w-4 h-4" />
                    <span>AI Hint Depth: Level 2 (Sliding Window)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Maintain two pointers [left, right] defining the current substring. Use a Set or Map to store the characters in the current window. If a duplicate is encountered at right, shrink the window from left.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                  <span>Classroom Task: <strong>Week 3 DSA Assignment</strong></span>
                  <span className="text-blue-400 font-bold">Progress: 4/5 Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 text-xs font-bold">
            <Play className="w-3.5 h-3.5" />
            <span>Streamlined Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            How CodeMentor Works in 4 Steps
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            From setup to problem resolution, CodeMentor is built to keep you in the zone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Connect & Install',
              desc: 'Install the CodeMentor Chrome extension and sign in to connect your student or teacher account.',
            },
            {
              step: '02',
              title: 'Open LeetCode / GFG',
              desc: 'Navigate to any supported problem. CodeMentor automatically recognizes the problem context.',
            },
            {
              step: '03',
              title: 'Request Progressive Hints',
              desc: 'Stuck on logic? Open the sidepanel to unlock tiered hints without revealing the full solution.',
            },
            {
              step: '04',
              title: 'Sync & Climb Ranks',
              desc: 'Solved problems sync automatically to your classroom assignments, portfolio, and leaderboard.',
            },
          ].map(({ step, title, desc }, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
              <div className="text-3xl font-black text-blue-600/40 dark:text-blue-400 font-mono">{step}</div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Classroom Hub for Teachers & Students */}
      <section id="classrooms" className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                <Users className="w-3.5 h-3.5" />
                <span>Dual Ecosystem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Empowering Both Students & Instructors
              </h2>
              <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed">
                Whether you are a student preparing for campus placements or an educator teaching Data Structures, CodeMentor bridges the gap between practice and evaluation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="font-bold text-sm text-blue-300">For Students</div>
                  <p className="text-xs text-blue-100/70 leading-relaxed">
                    View assigned problem sets with due dates, track pass rates, and never miss homework deadlines.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="font-bold text-sm text-purple-300">For Teachers</div>
                  <p className="text-xs text-blue-100/70 leading-relaxed">
                    Create classrooms with join codes, assign problems, and get real-time analytics on student completion.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <span className="font-extrabold text-sm">Classroom: CS301 Data Structures</span>
                  <span className="text-xs font-mono text-zinc-400">Code: DSA-2026</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-zinc-200">Assignment 4: Dynamic Programming</div>
                      <div className="text-[10px] text-zinc-400">Due: Tomorrow, 11:59 PM</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-zinc-200">Assignment 3: Binary Trees & BST</div>
                      <div className="text-[10px] text-zinc-400">Completed by 42/45 Students</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">Graded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 lg:py-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            Everything you need to know about CodeMentor and our Socratic AI principles.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between font-bold text-sm sm:text-base text-zinc-900 dark:text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 lg:p-16 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto">
            Ready to Supercharge Your Coding Journey?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of developers solving problems faster, understanding logic deeper, and building their technical portfolios with CodeMentor.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleAuthAction}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-blue-600 hover:bg-zinc-100 font-extrabold text-sm sm:text-base shadow-lg transition active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>{user ? 'Go to Dashboard' : 'Get Started for Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/privacy-policy')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-700/50 hover:bg-blue-700/70 border border-white/20 text-white font-bold text-sm sm:text-base transition"
            >
              Read Privacy Policy
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cm-nav-surface border-t border-zinc-200 dark:border-zinc-800/80 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center">
              <img src={navbarLight} alt="CodeMentor" className="h-7 w-auto max-w-[160px] dark:hidden" />
              <img src={navbarDark} alt="CodeMentor" className="hidden h-7 w-auto max-w-[160px] dark:block" />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              AI-assisted coding guidance, progressive hints, and classroom learning platform for engineers.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Product</div>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><button onClick={() => scrollToSection('features')} className="hover:underline">Features</button></li>
              <li><button onClick={() => scrollToSection('extension')} className="hover:underline">Chrome Extension</button></li>
              <li><button onClick={() => scrollToSection('classrooms')} className="hover:underline">Classroom Hub</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:underline">How It Works</button></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Legal & Trust</div>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <button onClick={() => navigate('/privacy-policy')} className="hover:underline text-blue-600 dark:text-blue-400 font-semibold">
                  Privacy Policy
                </button>
              </li>
              <li><span className="text-zinc-400">Chrome Limited Use</span></li>
              <li><span className="text-zinc-400">Security Standards</span></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Platforms</div>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><span>LeetCode</span></li>
              <li><span>GeeksforGeeks</span></li>
              <li><span>HackerRank</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div>&copy; {new Date().getFullYear()} CodeMentor. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/privacy-policy')} className="hover:underline">Privacy Policy</button>
            <button onClick={handleAuthAction} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {user ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
