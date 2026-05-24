import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  fetchClassroomsByTeacherEmail, 
  Classroom 
} from '../../../services/classroomService';
import { 
  fetchTeacherStudentRoster, 
  StudentRosterItem 
} from '../../../services/teacherService';
import { 
  fetchAssignmentsByTeacher, 
  Assignment 
} from '../../../services/assignmentService';
import { 
  ArrowLeft, 
  Building, 
  Users, 
  BookOpen, 
  Trophy, 
  BarChart, 
  Copy, 
  Check, 
  Calendar,
  Settings
} from 'lucide-react';

export function TeacherClassroomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubTab = (searchParams.get('tab') || 'Overview') as 'Overview' | 'Students' | 'Assignments' | 'Leaderboard' | 'Analytics' | 'Settings';
  const setActiveSubTab = (tab: string) => {
    setSearchParams({ tab });
  };
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.email || !id) return;
    const teacherEmail = user.email;

    async function loadClassroomDetails() {
      setLoading(true);
      try {
        const classList = await fetchClassroomsByTeacherEmail(teacherEmail);
        const match = classList.find(c => c.id.toString() === id);
        if (match) {
          setClassroom(match);
          
          const [roster, assignmentList] = await Promise.all([
            fetchTeacherStudentRoster(teacherEmail),
            fetchAssignmentsByTeacher(teacherEmail)
          ]);
          setStudents(roster);
          setAssignments(assignmentList);
        } else {
          navigate('/teacher/classrooms');
        }
      } catch (err) {
        console.error("Error loading classroom details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClassroomDetails();
  }, [user, id, navigate]);

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

  if (!classroom) return null;

  // Filter students enrolled in this specific classroom
  const classStudents = students.filter(st => st.classrooms?.includes(classroom.joinCode));

  // Filter assignments mapped to this classroom
  const classAssignments = assignments.filter(a => a.classroomId === classroom.id);

  // Compute classroom leaderboard scoped to class students
  const classLeaderboard = classStudents
    .map(st => ({
      name: studentNameFormat(st.name),
      handle: st.handle,
      prn: st.prn,
      rating: st.rating,
      score: st.rating * 100 // Derive dynamic score
    }))
    .sort((a, b) => b.score - a.score);

  function studentNameFormat(fullName: string) {
    return fullName;
  }

  return (
    <div className="space-y-8">
      {/* Classroom Header */}
      <div className="flex items-center space-x-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <button 
          onClick={() => navigate('/teacher/classrooms')}
          className="p-2 hover:bg-zinc-150 dark:hover:bg-zinc-850 text-zinc-650 rounded-xl transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-none text-zinc-900 dark:text-white">{classroom.name}</h1>
          <p className="text-sm font-semibold text-zinc-400 mt-1.5 uppercase tracking-wider">
            {classroom.subjectName} • Semester {classroom.semester} Division {classroom.division}
          </p>
        </div>
      </div>

      {/* Classroom Tab Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-6 text-sm font-bold">
        <TabButton active={activeSubTab === 'Overview'} onClick={() => setActiveSubTab('Overview')} icon={<Building className="w-4 h-4" />} label="Overview" />
        <TabButton active={activeSubTab === 'Students'} onClick={() => setActiveSubTab('Students')} icon={<Users className="w-4 h-4" />} label="Students" />
        <TabButton active={activeSubTab === 'Assignments'} onClick={() => setActiveSubTab('Assignments')} icon={<BookOpen className="w-4 h-4" />} label="Assignments" />
        <TabButton active={activeSubTab === 'Leaderboard'} onClick={() => setActiveSubTab('Leaderboard')} icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
        <TabButton active={activeSubTab === 'Analytics'} onClick={() => setActiveSubTab('Analytics')} icon={<BarChart className="w-4 h-4" />} label="Analytics" />
        <TabButton active={activeSubTab === 'Settings'} onClick={() => setActiveSubTab('Settings')} icon={<Settings className="w-4 h-4" />} label="Settings" />
      </div>

      {/* Classroom Tab Content */}
      <div className="mt-6">
        {/* OVERVIEW SUB-TAB */}
        {activeSubTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
              <h3 className="font-extrabold text-lg">Classroom Configuration</h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Course Subject</div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-250 mt-1">{classroom.subjectName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Semester</div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-250 mt-1">{classroom.semester}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Division</div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-250 mt-1">{classroom.division}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Students enrolled</div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-250 mt-1">{classStudents.length} Students</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-lg mb-2">Classroom Join Code</h3>
                <p className="text-xs text-zinc-400">Share this code with students so they can join this classroom immediately.</p>
              </div>
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850 mt-4">
                <div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Student Join Code</div>
                  <div className="font-mono text-lg font-black text-zinc-800 dark:text-zinc-250 mt-0.5">{classroom.joinCode}</div>
                </div>
                <button 
                  onClick={() => handleCopyCode(classroom.joinCode)}
                  className="p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 rounded-xl transition"
                  title="Copy code"
                >
                  {copiedCode === classroom.joinCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS SUB-TAB */}
        {activeSubTab === 'Students' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 font-extrabold">
              Classroom Roster ({classStudents.length} Students Enrolled)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-850/30 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-4 font-bold">Student Name</th>
                    <th className="px-6 py-4 font-bold text-center">PRN</th>
                    <th className="px-6 py-4 font-bold">Department</th>
                    <th className="px-6 py-4 font-bold text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-zinc-500 font-medium">
                        No students enrolled in this classroom context yet.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map(student => (
                      <tr key={student.handle} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-650 font-bold select-none text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-white">{student.name}</div>
                              <div className="text-xs text-zinc-400">@{student.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-zinc-500">
                          {student.prn || "Not set"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-650 dark:text-zinc-350">
                          {student.department || "Not set"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 text-xs">
                            ★ {student.rating}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ASSIGNMENTS SUB-TAB */}
        {activeSubTab === 'Assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold tracking-tight">Classroom Assignments</h3>
              <button 
                onClick={() => navigate('/teacher/assignments')}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
              >
                Go to Assignment Builder
              </button>
            </div>

            {classAssignments.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
                No assignments published to this class yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {classAssignments.map(assignment => (
                  <div 
                    key={assignment.id} 
                    onClick={() => navigate('/teacher/assignments')}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group flex flex-col h-full hover:border-zinc-350 dark:hover:border-zinc-700"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                    <div className="flex items-start justify-between mb-4 mt-2">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-1 group-hover:text-orange-500 transition-colors">{assignment.title}</h3>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{assignment.classroomName}</p>
                      </div>
                      <div className="px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-655 text-[10px] font-extrabold rounded shrink-0">
                        {assignment.category}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-zinc-500 mb-6">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="mt-auto border-t border-zinc-100 dark:border-zinc-850 pt-4 flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wide">
                      <span>{assignment.problems?.length || 0} Problems • {assignment.totalMarks} Pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD SUB-TAB */}
        {activeSubTab === 'Leaderboard' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 font-extrabold">
              Classroom Standing Standings
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-850/30 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-4 font-bold text-center w-20">Rank</th>
                    <th className="px-6 py-4 font-bold">Student</th>
                    <th className="px-6 py-4 font-bold text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {classLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-zinc-500 font-medium">
                        No students ranked in this classroom yet.
                      </td>
                    </tr>
                  ) : (
                    classLeaderboard.map((student, idx) => (
                      <tr key={student.handle} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-zinc-500">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-black select-none text-sm shadow-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-white">{student.name}</div>
                              <div className="text-xs text-zinc-400">@{student.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-orange-500 font-bold">
                          {student.score} Pts
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS SUB-TAB */}
        {activeSubTab === 'Analytics' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg">Classroom Completion Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-2xl">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Average Solve Progress</div>
                <div className="text-3xl font-black text-orange-500 mt-2">84%</div>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-2xl">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Top Standing Student</div>
                <div className="text-3xl font-black text-orange-500 mt-2">
                  {classLeaderboard.length > 0 ? classLeaderboard[0].name : "None yet"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS SUB-TAB */}
        {activeSubTab === 'Settings' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">Classroom Settings</h3>
            <p className="text-sm text-zinc-500">Configure preferences and parameters for this group.</p>
            
            <div className="space-y-4 max-w-xl">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4">
                <h4 className="font-bold text-sm">General Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Classroom Name</label>
                    <input 
                      type="text" 
                      defaultValue={classroom.name}
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 font-semibold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Subject Description</label>
                    <textarea 
                      rows={3}
                      defaultValue={`${classroom.subjectName} Division ${classroom.division} - Semester ${classroom.semester}`}
                      className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 font-semibold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border border-red-200 dark:border-red-900/30 rounded-2xl bg-red-50/20 dark:bg-red-950/10 space-y-3">
                <h4 className="font-bold text-sm text-red-655 dark:text-red-400">Danger Zone</h4>
                <p className="text-xs text-zinc-400">Archive this classroom. Students will no longer see it as active.</p>
                <button 
                  type="button"
                  onClick={() => alert("Classroom archiving is locked for this demo.")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition animate-pulse"
                >
                  Archive Classroom
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 pb-3 border-b-2 transition-all ${
        active 
          ? 'border-orange-500 text-orange-605' 
          : 'border-transparent text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
