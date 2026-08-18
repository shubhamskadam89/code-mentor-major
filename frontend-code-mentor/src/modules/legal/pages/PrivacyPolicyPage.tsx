import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Lock,
  Bot,
  Database,
  Cpu,
  Globe,
  HardDrive,
  UserCheck,
  Clock,
  UserX,
  Mail,
  CheckCircle2,
  ArrowLeft,
  Sun,
  Moon,
  ExternalLink,
  BookOpen,
  Scale,
  FileCheck
} from 'lucide-react';
import navbarLight from '../../../assets/codementor-navbar-light.svg';
import navbarDark from '../../../assets/codementor-navbar-dark.svg';
import { useAuth } from '../../auth/context/AuthContext';
import { isFeatureEnabled } from '../../../services/featureFlags';

const THEME_KEY = 'app_theme';

const SECTIONS = [
  { id: 'section-1', number: '1', title: 'Introduction', icon: BookOpen },
  { id: 'section-2', number: '2', title: 'Information We Collect', icon: Database },
  { id: 'section-3', number: '3', title: 'How We Use Information', icon: Cpu },
  { id: 'section-4', number: '4', title: 'Sharing of Information', icon: Globe },
  { id: 'section-5', number: '5', title: 'AI Processing', icon: Bot },
  { id: 'section-6', number: '6', title: 'Website & Platform Access', icon: Globe },
  { id: 'section-7', number: '7', title: 'Local Storage', icon: HardDrive },
  { id: 'section-8', number: '8', title: 'Data Security', icon: Lock },
  { id: 'section-9', number: '9', title: 'Data Retention', icon: Clock },
  { id: 'section-10', number: '10', title: 'User Data Rights', icon: UserCheck },
  { id: 'section-11', number: '11', title: "Children's Privacy", icon: UserX },
  { id: 'section-12', number: '12', title: 'Changes to This Policy', icon: Scale },
  { id: 'section-13', number: '13', title: 'Contact Us', icon: Mail },
  { id: 'section-14', number: '14', title: 'Chrome Web Store Compliance', icon: ShieldCheck },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('section-1');
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    isFeatureEnabled('privacy-policy-page').then(setEnabled);
  }, []);

  // Dark mode state management
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

  // Track active section for table of contents
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleBack = () => {
    if (user) {
      navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } else {
      navigate('/');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (enabled === null) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Checking feature availability...</span>
        </div>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Privacy Policy Coming Soon</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Our team is finalizing the Privacy Policy documentation. Please check back shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CodeMentor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page-shell min-h-screen text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="cm-nav-surface sticky top-0 z-30 border-b bg-white dark:bg-zinc-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img src={navbarLight} alt="CodeMentor" className="h-8 w-auto max-w-[180px] dark:hidden" />
              <img src={navbarDark} alt="CodeMentor" className="hidden h-8 w-auto max-w-[180px] dark:block" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleBack}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-sm"
            >
              <span>{user ? 'Dashboard' : 'Sign In'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Header Section */}
      <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal & Privacy Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Privacy Policy for CodeMentor
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 pt-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">Last Updated: August 15, 2026</span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-zinc-700">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Chrome Web Store Compliant
            </span>
          </div>

          <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed pt-2">
            CodeMentor is committed to protecting your privacy. This policy outlines our transparent data handling practices, AI processing principles, and compliance guarantees.
          </p>
        </div>

        {/* Highlight Badges */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <ShieldCheck className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">No Data Selling</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Zero advertiser sharing</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <Lock className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Encrypted HTTPS</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Secure transmission</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <Bot className="w-5 h-5 text-purple-500 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Contextual AI Hints</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Educational assistance</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <FileCheck className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Limited Use</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Single purpose focus</div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky Table of Contents Sidebar */}
          <nav
            aria-label="Table of contents"
            className="hidden lg:block lg:col-span-4 xl:col-span-3"
          >
            <div className="sticky top-24 space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center space-x-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Table of Contents</span>
                </div>
                <div className="mt-3 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 custom-scrollbar">
                  {SECTIONS.map(({ id, number, title, icon: Icon }) => {
                    const isActive = activeSection === id;
                    return (
                      <button
                        key={id}
                        onClick={() => scrollToSection(id)}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${isActive
                            ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-zinc-700'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                          {number}
                        </span>
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Contact Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Have questions?</div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  For privacy inquiries or data rights requests, contact our team.
                </p>
                <button
                  onClick={() => scrollToSection('section-13')}
                  className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Information</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Policy Content Sections */}
          <article className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* Section 1: Introduction */}
            <section
              id="section-1"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  1. Introduction
                </h2>
              </div>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                <p>
                  CodeMentor (&ldquo;CodeMentor&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a Chrome extension that provides AI-assisted coding guidance and progressive hints while users solve programming problems on supported coding platforms.
                </p>
                <p>
                  This Privacy Policy explains what information CodeMentor collects, how that information is used, how it is shared, and how it is protected.
                </p>
                <p className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium">
                  By installing and using CodeMentor, you acknowledge the practices described in this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Section 2: Information We Collect */}
            <section
              id="section-2"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-6"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  2. Information We Collect
                </h2>
              </div>
              <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold">
                CodeMentor collects only information necessary to provide its coding-assistance functionality.
              </p>

              {/* 2.1 Account Information */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2.1</span>
                  <span>Account Information</span>
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  When you create or sign in to a CodeMentor account, we may collect:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-800 dark:text-zinc-200 pt-1 font-medium">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Email address</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Account identifier</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Platform username or handle</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Authentication-related information necessary to authenticate your account</span>
                  </li>
                </ul>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  This information is used to identify your CodeMentor account, maintain your account session, and associate your coding progress with your account.
                </p>
              </div>

              {/* 2.2 Coding Problem Information */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2.2</span>
                  <span>Coding Problem Information</span>
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  When CodeMentor is used on a supported coding platform, the extension may collect information related to the coding problem currently being viewed, including:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-800 dark:text-zinc-200 pt-1 font-medium">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Problem title</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Problem description and relevant problem context</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Problem URL</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Coding platform</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Programming language</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Problem difficulty, when available</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:col-span-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Problem identifier</span>
                  </li>
                </ul>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  This information is used to understand the problem the user is currently solving and generate relevant coding guidance.
                </p>
              </div>

              {/* 2.3 User Code */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2.3</span>
                  <span>User Code</span>
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  When the user requests coding assistance, CodeMentor may collect the code currently entered in the coding editor.
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  The code may be transmitted to the CodeMentor backend for analysis and generation of contextual hints.
                </p>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-300">
                  Code is used solely to provide the requested coding-assistance functionality and is not sold or used for advertising.
                </div>
              </div>

              {/* 2.4 Usage and Progress Information */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2.4</span>
                  <span>Usage and Progress Information</span>
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  CodeMentor may store information related to the user&apos;s use of the extension, including:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-800 dark:text-zinc-200 pt-1 font-medium">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Hints requested</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Hint levels/depth</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Problem attempts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Problem completion status</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Coding progress</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Assignment progress where applicable</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:col-span-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Extension settings and preferences</span>
                  </li>
                </ul>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  This information is used to provide progressive hints, maintain continuity between sessions, and display coding progress.
                </p>
              </div>
            </section>

            {/* Section 3: How We Use Information */}
            <section
              id="section-3"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  3. How We Use Information
                </h2>
              </div>
              <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold">
                We use collected information only for purposes directly related to CodeMentor&apos;s functionality, including:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Providing AI-assisted coding hints',
                  'Understanding the current coding problem',
                  'Analyzing user-submitted code when assistance is requested',
                  'Maintaining user accounts and authentication',
                  'Maintaining coding progress and hint history',
                  'Providing assignment and learning-progress features',
                  'Maintaining extension settings and preferences',
                  'Maintaining the security, reliability, and operation of CodeMentor',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Guarantees Box */}
              <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-zinc-800 border border-red-200 dark:border-red-900/60 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Strict Prohibitions & Guarantees</div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 font-medium">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>We do not use collected information for personalized advertising.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>We do not sell user information.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>We do not use user information for creditworthiness or lending purposes.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4: Sharing of Information */}
            <section
              id="section-4"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-5"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  4. Sharing of Information
                </h2>
              </div>
              <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                CodeMentor may transmit information to service providers that are necessary to operate the service.
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                Depending on the functionality used, these service providers may include:
              </p>

              <div className="space-y-4 pt-1">
                {/* Google */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs">G</div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Google</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    Google services may be used for authentication and account-related functionality.
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Information provided through Google authentication is used only for the authentication and account functionality requested by the user.
                  </p>
                </div>

                {/* Supabase */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">S</div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Supabase</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    Supabase may be used for database and backend infrastructure, including storage of account and application data.
                  </p>
                </div>

                {/* Google Gemini */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-xs">✦</div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Google Gemini</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    CodeMentor may use Google&apos;s Gemini API to process coding-related information and generate AI-assisted coding guidance.
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    When a user requests AI assistance, relevant coding-problem context and code may be transmitted to the AI service to generate the requested response.
                  </p>
                </div>

                {/* Hosting and Infrastructure Providers */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold text-xs">☁</div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Hosting and Infrastructure Providers</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    CodeMentor may use hosting and infrastructure providers to operate its frontend, backend, APIs, and databases.
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    These providers process information only as necessary to provide the CodeMentor service.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                We do not sell, rent, or trade user data to advertisers, data brokers, or other third parties.
              </div>
            </section>

            {/* Section 5: AI Processing */}
            <section
              id="section-5"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  5. AI Processing
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  CodeMentor uses artificial intelligence to generate contextual coding guidance.
                </p>
                <p>
                  When a user requests a hint or code analysis, relevant information such as the coding problem, programming language, and user-provided code may be transmitted to the CodeMentor backend and an AI service for processing.
                </p>
                <p>
                  AI-generated responses are intended to provide educational guidance and may not always be completely accurate.
                </p>
                <p className="font-bold text-zinc-900 dark:text-white">
                  CodeMentor does not intentionally use submitted code or account information for personalized advertising.
                </p>
              </div>
            </section>

            {/* Section 6: Website and Coding Platform Access */}
            <section
              id="section-6"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  6. Website and Coding Platform Access
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  CodeMentor operates on supported coding platforms to provide its core functionality.
                </p>
                <p>
                  The extension may access the content of the current coding problem and the user&apos;s code within supported coding-platform pages.
                </p>
                <p>
                  This access is limited to information necessary to identify the current problem, capture relevant code, and provide contextual coding assistance.
                </p>
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  CodeMentor does not intentionally collect or maintain a general browsing history of websites unrelated to its coding-assistance functionality.
                </div>
              </div>
            </section>

            {/* Section 7: Local Storage */}
            <section
              id="section-7"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  7
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  7. Local Storage
                </h2>
              </div>
              <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                CodeMentor may use Chrome&apos;s local extension storage to maintain information such as:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-800 dark:text-zinc-200 pt-1 font-medium">
                {[
                  'Extension settings',
                  'Current coding problem',
                  'Problem context',
                  'Hint history',
                  'Coding progress',
                  'Account handle',
                  'Temporary application state',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                Local storage allows the extension to maintain functionality between browser sessions.
              </p>
            </section>

            {/* Section 8: Data Security */}
            <section
              id="section-8"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  8
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  8. Data Security
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  We take reasonable measures to protect information processed by CodeMentor.
                </p>
                <p>
                  Information transmitted between the extension and CodeMentor&apos;s backend is intended to use encrypted HTTPS connections.
                </p>
                <p>
                  Authentication information and other sensitive information should be handled securely and should not be publicly disclosed.
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 italic font-medium">
                  However, no internet-based service can guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Section 9: Data Retention */}
            <section
              id="section-9"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  9
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  9. Data Retention
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  We retain information only for as long as reasonably necessary to provide CodeMentor&apos;s functionality, maintain user accounts, maintain coding progress, comply with applicable legal obligations, and protect the security of the service.
                </p>
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  Users may request deletion of their account and associated data by contacting us.
                </div>
              </div>
            </section>

            {/* Section 10: User Data Rights */}
            <section
              id="section-10"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  10
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  10. User Data Rights
                </h2>
              </div>
              <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold">
                Depending on applicable law, users may have rights regarding their personal information, including the right to:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-800 dark:text-zinc-200 pt-1 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Request access to their information</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Request correction of inaccurate information</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Request deletion of their information</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Ask questions about how their information is processed</span>
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                To make a request, contact us using the contact information provided below.
              </p>
            </section>

            {/* Section 11: Children's Privacy */}
            <section
              id="section-11"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  11
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  11. Children&apos;s Privacy
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  CodeMentor is intended for general users interested in learning and practicing programming.
                </p>
                <p>
                  We do not knowingly collect personal information from children in violation of applicable law.
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  If you believe that a child has provided personal information to CodeMentor inappropriately, please contact us so that we can take appropriate action.
                </p>
              </div>
            </section>

            {/* Section 12: Changes to This Privacy Policy */}
            <section
              id="section-12"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  12
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  12. Changes to This Privacy Policy
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  We may update this Privacy Policy when CodeMentor&apos;s functionality, data practices, or applicable requirements change.
                </p>
                <p>
                  When significant changes are made, we will provide appropriate notice through the CodeMentor website, extension, or other appropriate means.
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  The &ldquo;Last Updated&rdquo; date at the top of this policy indicates when the policy was most recently updated.
                </p>
              </div>
            </section>

            {/* Section 13: Contact Us */}
            <section
              id="section-13"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm scroll-mt-24 space-y-5"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  13
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  13. Contact Us
                </h2>
              </div>
              <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                If you have questions, concerns, or requests regarding this Privacy Policy or CodeMentor&apos;s handling of user data, please contact:
              </p>
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="font-extrabold text-base text-zinc-900 dark:text-white">CodeMentor</div>
                <div className="flex items-center space-x-2 text-sm text-zinc-800 dark:text-zinc-200">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Email: <span className="font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-bold">shubhamskadam89@gmail.com</span></span>
                </div>
              </div>
            </section>

            {/* Section 14: Chrome Web Store Limited Use Compliance */}
            <section
              id="section-14"
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-blue-500 dark:border-blue-500/80 shadow-md scroll-mt-24 space-y-4"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  14
                </div>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>14. Chrome Web Store Limited Use Compliance</span>
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  CodeMentor&apos;s use of information obtained through Chrome extension APIs and Google APIs is limited to providing and improving the extension&apos;s disclosed single purpose.
                </p>
                <p>
                  CodeMentor does not sell user data or transfer user data to third parties for advertising, creditworthiness, or unrelated purposes.
                </p>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300">
                  The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="cm-nav-surface border-t border-zinc-200 dark:border-zinc-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 bg-white dark:bg-zinc-900 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center space-x-2">
            <img src={navbarLight} alt="CodeMentor" className="h-6 w-auto dark:hidden" />
            <img src={navbarDark} alt="CodeMentor" className="hidden h-6 w-auto dark:block" />
            <span>&copy; {new Date().getFullYear()}. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('section-1')}
              className="hover:text-zinc-900 dark:hover:text-white transition"
            >
              Back to Top
            </button>
            <button
              onClick={handleBack}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {user ? 'Return to Dashboard' : 'Return to Home'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
