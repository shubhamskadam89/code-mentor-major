import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  fetchTeacherStudentRoster, 
  StudentRosterItem 
} from '../../../services/teacherService';
import { 
  fetchClassroomsByTeacherEmail, 
  Classroom 
} from '../../../services/classroomService';
import { AlertTriangle, Lightbulb, Search, RefreshCw } from 'lucide-react';

export function TeacherStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || !user.email) return;
    const teacherEmail = user.email;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [roster, classList] = await Promise.all([
          fetchTeacherStudentRoster(teacherEmail),
          fetchClassroomsByTeacherEmail(teacherEmail)
        ]);
        setStudents(roster);
        setClassrooms(classList);
      } catch (err: any) {
        console.error("Error loading student data:", err);
        setError("Failed to retrieve students. Please check that the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, refreshKey]);

  // Filter students based on search and classroom
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassroom = selectedClassroom === 'all' || 
                             student.classrooms?.includes(selectedClassroom);
    return matchesSearch && matchesClassroom;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 text-center text-red-750 dark:text-red-400 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">Students</h1>
          <p className="text-zinc-500 font-medium">Monitor enrolled student performance metrics across your classes.</p>
        </div>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="p-2.5 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition"
          title="Refresh students"
        >
          <RefreshCw className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by student name or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all placeholder-zinc-400 text-zinc-800 dark:text-zinc-200"
              />
            </div>
            <select 
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Classrooms</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.joinCode}>{c.name} ({c.joinCode})</option>
              ))}
            </select>
          </div>
          <div className="text-xs font-bold text-zinc-450 self-center">
            Showing {filteredStudents.length} students
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-850/30 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 font-bold">Student Name</th>
                <th className="px-6 py-4 font-bold text-center">PRN</th>
                <th className="px-6 py-4 font-bold">Department</th>
                <th className="px-6 py-4 font-bold text-center">Hints</th>
                <th className="px-6 py-4 font-bold text-center">Needs Help</th>
                <th className="px-6 py-4 font-bold text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 font-medium">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.handle} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-655 font-bold select-none shadow-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white">{student.name}</div>
                          <div className="text-xs text-zinc-400">@{student.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-zinc-500">
                      {student.prn || "Not filled"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-650 dark:text-zinc-350">
                      {student.department || "Not filled"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 text-xs">
                        <Lightbulb className="w-3 h-3" />
                        {student.totalHintsUsed ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {(student.strugglingProblems ?? 0) > 0 || student.needsAttention ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {student.strugglingProblems ?? 0} problem{(student.strugglingProblems ?? 0) === 1 ? '' : 's'}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-zinc-400">Stable</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 text-xs">
                        ★ {student.rating}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
