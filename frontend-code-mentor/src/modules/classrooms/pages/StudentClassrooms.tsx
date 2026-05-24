import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  fetchStudentProfile,
  StudentProfile
} from '../../../services/studentService';
import {
  fetchClassroomsByStudentId,
  joinClassroom,
  Classroom
} from '../../../services/classroomService';
import { Plus, X, RefreshCw, Copy, Check } from 'lucide-react';

export function StudentClassrooms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.handle) return;
    const studentHandle = user.handle;

    async function loadClassrooms() {
      setLoading(true);
      setError(null);
      try {
        const profile = await fetchStudentProfile(studentHandle);
        setStudentProfile(profile);

        const list = await fetchClassroomsByStudentId(profile.id);
        setClassrooms(list);
      } catch (err: any) {
        console.error("Error loading student classrooms:", err);
        setError("Failed to load classrooms. Please make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    loadClassrooms();
  }, [user, refreshKey]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !studentProfile) return;

    setJoining(true);
    try {
      await joinClassroom(studentProfile.id, joinCode.trim());
      alert("Successfully joined the classroom!");
      setJoinCode('');
      setShowJoinModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Error joining classroom:", err);
      alert(err.message || "Failed to join classroom. Verify the code and try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">My Classrooms</h1>
          <p className="text-zinc-500 font-medium">Access your joined classrooms and complete assigned coursework.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2.5 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition"
            title="Refresh classrooms"
          >
            <RefreshCw className="w-4 h-4 text-zinc-500" />
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-extrabold shadow-md shadow-orange-500/10 hover:bg-orange-650 transition"
          >
            <Plus className="w-4 h-4 font-black" />
            <span>Join Classroom</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 text-center text-red-750 dark:text-red-400 font-medium">
          {error}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 font-medium space-y-4">
          <div className="text-4xl">🏫</div>
          <p>You haven't joined any classrooms yet. Click "Join Classroom" at the top to enroll.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classrooms.map(c => (
            <div key={c.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden group flex flex-col h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 transform origin-left scale-x-100 opacity-80"></div>

              <div className="mb-4">
                <h4 className="font-extrabold text-lg text-zinc-900 dark:text-white truncate leading-tight group-hover:text-orange-500 transition-colors mb-1">{c.name}</h4>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{c.subjectName} • Sem {c.semester} Div {c.division}</p>
              </div>

              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-850 mb-6">
                <div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Classroom Code</div>
                  <div className="font-mono text-sm font-black text-zinc-800 dark:text-zinc-200 mt-0.5">{c.joinCode}</div>
                </div>
                <button
                  onClick={() => handleCopyCode(c.joinCode)}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 rounded-lg transition"
                  title="Copy code"
                >
                  {copiedCode === c.joinCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs font-bold text-zinc-500">
                <div className="space-y-1">
                  <div>{c.studentCount} Enrolled Students</div>
                  <div>{c.activeAssignmentCount} Active Assignments</div>
                </div>
                <button
                  onClick={() => navigate(`/student/classrooms/${c.id}`)}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-extrabold transition shadow-sm"
                >
                  Enter Classroom
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOIN CLASSROOM POPUP MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-black">Join a Classroom</h3>
              <p className="text-xs text-zinc-450 font-semibold mt-1">Enter the 6-character code provided by your instructor.</p>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Classroom Join Code</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. A9B8C7"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-center text-lg font-black focus:ring-1 focus:ring-orange-500 outline-none uppercase tracking-wider"
                />
              </div>
              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="w-full py-3 bg-orange-500 hover:bg-orange-655 text-white rounded-xl text-sm font-extrabold transition shadow-md shadow-orange-500/10"
              >
                {joining ? "Joining Class..." : "Enroll in Classroom"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
