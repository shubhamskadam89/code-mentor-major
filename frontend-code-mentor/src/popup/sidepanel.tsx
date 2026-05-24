import React from 'react';
import ReactDOM from 'react-dom/client';
import { AlertCircle } from 'lucide-react';
import { StudentExtensionView } from '../modules/extension/pages/StudentExtensionView';
import { TeacherExtensionView } from '../modules/extension/pages/TeacherExtensionView';
import { useAuth } from '../shared/hooks/useExtensionBridge';
import './index.css';

function SidePanelLoading() {
  return (
    <div className="w-full h-screen bg-zinc-950 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SidePanelError() {
  return (
    <div className="w-full h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div className="space-y-1">
          <h1 className="text-sm font-extrabold">CodeMentor could not start</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Reload the extension from Chrome Extensions and open the side panel again.
          </p>
        </div>
      </div>
    </div>
  );
}

function SidePanelApp() {
  const { loading, role } = useAuth();

  if (loading) {
    return <SidePanelLoading />;
  }

  return role === 'teacher' ? <TeacherExtensionView /> : <StudentExtensionView />;
}

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SidePanelApp />
    </React.StrictMode>,
  );
} else {
  ReactDOM.createRoot(document.body).render(<SidePanelError />);
}
