import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../dashboard/components/Sidebar';
import { TopBar } from '../../dashboard/components/TopBar';

function getInitialSidebarOpen(): boolean {
  try {
    const collapsed = localStorage.getItem('sidebar_collapsed');
    if (collapsed !== null) return collapsed !== 'true';
  } catch { /* ignore */ }
  return true;
}

export function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarOpen);

  return (
    <div className="cm-page-shell flex text-slate-900 dark:text-white h-screen overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-0">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
