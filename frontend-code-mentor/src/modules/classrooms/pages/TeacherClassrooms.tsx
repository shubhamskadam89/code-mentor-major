import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  fetchTeacherProfile, 
  TeacherProfile 
} from '../../../services/teacherService';
import { 
  fetchClassroomsByTeacherEmail, 
  createClassroom, 
  Classroom 
} from '../../../services/classroomService';
import { Plus, X, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

export function TeacherClassrooms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [newDivision, setNewDivision] = useState('');
  const [creatingClassroom, setCreatingClassroom] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.email) return;
    const teacherEmail = user.email;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [teacherProfile, classList] = await Promise.all([
          fetchTeacherProfile(teacherEmail),
          fetchClassroomsByTeacherEmail(teacherEmail)
        ]);
        setProfile(teacherProfile);
        setClassrooms(classList);
      } catch (err: any) {
        console.error("Error loading teacher classrooms data:", err);
        setError("Unable to connect to the backend server. Please verify it is running.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newSubjectName.trim() || !newSemester.trim() || !newDivision.trim() || !profile) {
      alert("Please fill in all classroom details.");
      return;
    }

    setCreatingClassroom(true);
    try {
      const created = await createClassroom({
        name: newClassName.trim(),
        subjectName: newSubjectName.trim(),
        semester: newSemester.trim(),
        division: newDivision.trim(),
        teacherId: profile.id
      });
      alert(`Classroom "${created.name}" created successfully! Code: ${created.joinCode}`);
      setNewClassName('');
      setNewSubjectName('');
      setNewSemester('');
      setNewDivision('');
      setShowCreateModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Error creating classroom:", err);
      alert(err.message || "Failed to create classroom.");
    } finally {
      setCreatingClassroom(false);
    }
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (error || !profile) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 text-center text-red-750 dark:text-red-400 font-medium">
        {error || "Failed to load instructor profile details."}
      </div>
    );
  }

  const totalStudentsSum = classrooms.reduce((acc, c) => acc + c.studentCount, 0);

  return (
    <div className="space-y-8">
      {/* Instructor profile header summary */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-500/10 text-orange-655 flex items-center justify-center text-3xl shrink-0 shadow-inner font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">{profile.name}</h1>
            <p className="text-sm font-semibold text-zinc-400 mt-1 uppercase tracking-wider">{profile.designation || 'Instructor'} • {profile.department || 'Computer Science'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 shrink-0">
          <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-center shrink-0">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Classes</div>
            <div className="text-lg font-black text-orange-500 mt-0.5">{classrooms.length}</div>
          </div>
          <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-center shrink-0">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Students</div>
            <div className="text-lg font-black text-orange-500 mt-0.5">{totalStudentsSum}</div>
          </div>
        </div>
      </div>

      {/* Classrooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold tracking-tight">Active Classrooms</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-2 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-300 rounded-xl transition"
              title="Refresh classrooms"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
            >
              <Plus className="w-4 h-4 font-black" />
              <span>Create Classroom</span>
            </button>
          </div>
        </div>

        {classrooms.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
            No classrooms created yet. Click "Create Classroom" to launch your first coding group.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {classrooms.map(c => (
              <div 
                key={c.id} 
                onClick={() => navigate(`/teacher/classrooms/${c.id}`)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group flex flex-col h-full hover:border-zinc-350 dark:hover:border-zinc-700"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 transform origin-left scale-x-100 opacity-80"></div>
                
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-extrabold text-lg text-zinc-900 dark:text-white truncate leading-tight group-hover:text-orange-550 transition-colors mb-1 max-w-[85%]">{c.name}</h4>
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{c.subjectName} • Sem {c.semester} Div {c.division}</p>
                </div>

                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-850 mb-6">
                  <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Student Join Code</div>
                    <div className="font-mono text-sm font-black text-zinc-800 dark:text-zinc-200 mt-0.5">{c.joinCode}</div>
                  </div>
                  <button 
                    onClick={(e) => handleCopyCode(c.joinCode, e)}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 rounded-lg transition"
                    title="Copy code"
                  >
                    {copiedCode === c.joinCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs font-bold text-zinc-550">
                  <div className="space-y-1">
                    <div>{c.studentCount} Students</div>
                    <div>{c.activeAssignmentCount} Active Assignments</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE CLASSROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-655 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-black">Launch Coding Classroom</h3>
              <p className="text-xs text-zinc-450 font-semibold mt-1">Configure your course details to generate a join code.</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Classroom Name</label>
                <input 
                  type="text" required placeholder="e.g. Data Structures Laboratory"
                  value={newClassName} onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Subject Name</label>
                <input 
                  type="text" required placeholder="e.g. Computer Science CS-401"
                  value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Semester</label>
                  <input 
                    type="text" required placeholder="e.g. 4"
                    value={newSemester} onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Division</label>
                  <input 
                    type="text" required placeholder="e.g. A"
                    value={newDivision} onChange={(e) => setNewDivision(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
                  />
                </div>
              </div>
              <button 
                type="submit" disabled={creatingClassroom}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-extrabold transition shadow-md"
              >
                {creatingClassroom ? "Launching Class..." : "Create Classroom"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
