import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { fetchClassroomsByTeacherEmail, Classroom } from '../../services/classroomService';
import {
  Home,
  User,
  Building,
  FolderGit2,
  LogOut,
  Users,
  BookOpen,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  ArrowLeft,
  BarChart2
} from 'lucide-react';

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (b: boolean) => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomsListExpanded, setClassroomsListExpanded] = useState(true);

  useEffect(() => {
    if (user && user.role === 'teacher' && user.email) {
      fetchClassroomsByTeacherEmail(user.email)
        .then(setClassrooms)
        .catch(err => console.error("Error loading classrooms for sidebar:", err));
    }
  }, [user]);

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };

  const toggleCollapse = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(!next)); // collapsed = !open
    } catch {
      // localStorage unavailable in some envs
    }
  };

  if (!user) return null;

  const collapsed = !sidebarOpen;

  // Check if inside classroom route context
  const classroomMatch = matchPath({ path: "/teacher/classrooms/:id" }, location.pathname);
  const classroomId = classroomMatch?.params.id;
  const currentClassroom = classroomId ? classrooms.find(c => c.id.toString() === classroomId) : null;
  const showContextualSidebar = user.role === 'teacher' && !!classroomId;

  return (
    <aside
      className={`
        flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
        transition-all duration-300 overflow-hidden z-20 fixed md:relative h-screen flex flex-col
        ${collapsed ? 'w-0 md:w-16 -translate-x-full md:translate-x-0' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="p-4 flex items-center border-b border-zinc-100 dark:border-zinc-800/50 shrink-0 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          🎓
        </div>
        {!collapsed && (
          <span className="ml-2.5 font-extrabold text-xl font-sans tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">
            CodeMentor
          </span>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {user.role === 'student' ? (
          <>
            <NavItem collapsed={collapsed} to="/student/dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" />
            <NavItem collapsed={collapsed} to="/student/classrooms" icon={<Building className="w-4 h-4" />} label="Classrooms" />
            <NavItem collapsed={collapsed} to="/student/assignments" icon={<BookOpen className="w-4 h-4" />} label="Assignments" />
            <NavItem collapsed={collapsed} to="/student/submissions" icon={<FolderGit2 className="w-4 h-4" />} label="Submissions" />
            <NavItem collapsed={collapsed} to="/student/leaderboard" icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
            <NavItem collapsed={collapsed} to="/student/profile" icon={<User className="w-4 h-4" />} label="Profile" />
          </>
        ) : showContextualSidebar ? (
          /* Contextual Sidebar inside /teacher/classrooms/:id */
          <div className="space-y-1">
            <NavLink
              to="/teacher/classrooms"
              className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-550 dark:text-zinc-400 hover:text-orange-500 transition-colors ${collapsed ? 'justify-center' : 'space-x-3'} mb-4`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Back to Classrooms</span>}
            </NavLink>

            {!collapsed && currentClassroom && (
              <div className="px-3 mb-4">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">Active Context</div>
                <div className="font-extrabold text-sm text-zinc-900 dark:text-white mt-1 truncate" title={currentClassroom.name}>{currentClassroom.name}</div>
              </div>
            )}

            <ContextNavItem collapsed={collapsed} to={`/teacher/classrooms/${classroomId}?tab=Overview`} active={!location.search || location.search.includes('tab=Overview')} icon={<Building className="w-4 h-4" />} label="Overview" />
            <ContextNavItem collapsed={collapsed} to={`/teacher/classrooms/${classroomId}?tab=Students`} active={location.search.includes('tab=Students')} icon={<Users className="w-4 h-4" />} label="Students" />
            <ContextNavItem collapsed={collapsed} to={`/teacher/classrooms/${classroomId}?tab=Assignments`} active={location.search.includes('tab=Assignments')} icon={<BookOpen className="w-4 h-4" />} label="Assignments" />
            <ContextNavItem collapsed={collapsed} to={`/teacher/classrooms/${classroomId}?tab=Leaderboard`} active={location.search.includes('tab=Leaderboard')} icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
            <ContextNavItem collapsed={collapsed} to={`/teacher/classrooms/${classroomId}?tab=Analytics`} active={location.search.includes('tab=Analytics')} icon={<BarChart2 className="w-4 h-4" />} label="Analytics" />
            <ContextNavItem collapsed={collapsed} to={`/teacher/classrooms/${classroomId}?tab=Settings`} active={location.search.includes('tab=Settings')} icon={<Settings className="w-4 h-4" />} label="Settings" />
          </div>
        ) : (
          /* Hierarchical Teacher Sidebar (General) */
          <>
            <NavItem collapsed={collapsed} to="/teacher/dashboard" icon={<Home className="w-4 h-4" />} label="Overview" />
            
            {/* Classrooms Collapsible Sub-list */}
            <div className="space-y-1">
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-650 dark:text-zinc-400`}>
                <NavLink to="/teacher/classrooms" className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} flex-1`}>
                  <Building className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">Classrooms</span>}
                </NavLink>
                {!collapsed && classrooms.length > 0 && (
                  <button onClick={() => setClassroomsListExpanded(!classroomsListExpanded)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    {classroomsListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
              
              {!collapsed && classroomsListExpanded && classrooms.length > 0 && (
                <div className="pl-6 space-y-1 border-l border-zinc-150 dark:border-zinc-850 ml-5 mt-1 transition-all duration-200">
                  {classrooms.map(c => (
                    <NavLink
                      key={c.id}
                      to={`/teacher/classrooms/${c.id}`}
                      className={({ isActive }) =>
                        `block py-1.5 px-3 rounded-lg text-xs font-semibold transition-all truncate ${
                          isActive
                            ? 'text-orange-600 dark:text-orange-500 font-bold bg-orange-50/50 dark:bg-orange-500/5'
                            : 'text-zinc-550 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200'
                        }`
                      }
                    >
                      {c.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavItem collapsed={collapsed} to="/teacher/assignments" icon={<BookOpen className="w-4 h-4" />} label="Assignments" />
            <NavItem collapsed={collapsed} to="/teacher/students" icon={<Users className="w-4 h-4" />} label="Students" />
            <NavItem collapsed={collapsed} to={classrooms[0] ? `/teacher/classrooms/${classrooms[0].id}?tab=Leaderboard` : "/teacher/classrooms"} icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
            <NavItem collapsed={collapsed} to={classrooms[0] ? `/teacher/classrooms/${classrooms[0].id}?tab=Analytics` : "/teacher/classrooms"} icon={<BarChart2 className="w-4 h-4" />} label="Analytics" />
            <NavItem collapsed={collapsed} to="/teacher/profile" icon={<User className="w-4 h-4" />} label="Profile" />
          </>
        )}
      </div>

      {/* Footer: user info + logout */}
      <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-1">
        {/* User chip */}
        <div className={`flex items-center px-3 py-2 ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400 shrink-0 select-none">
            {user.handle.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">{user.handle}</div>
              <div className="text-[10px] text-zinc-400 truncate">{user.email}</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          title="Log Out"
          className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ${collapsed ? 'justify-center' : 'space-x-3'}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`hidden md:flex items-center w-full px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ${collapsed ? 'justify-center' : 'space-x-2'}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${collapsed ? 'justify-center' : 'space-x-3'} ${
          isActive
            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 font-extrabold'
            : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function ContextNavItem({
  to,
  icon,
  label,
  collapsed,
  active
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${collapsed ? 'justify-center' : 'space-x-3'} ${
        active
          ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 font-extrabold'
          : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
