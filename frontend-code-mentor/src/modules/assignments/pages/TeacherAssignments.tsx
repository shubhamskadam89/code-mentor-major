import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  fetchClassroomsByTeacherEmail,
  Classroom
} from '../../../services/classroomService';
import {
  fetchAssignmentsByTeacher,
  createAssignment,
  Assignment,
  AssignmentProblem
} from '../../../services/assignmentService';
import {
  fetchTeacherStudentRoster,
  StudentRosterItem
} from '../../../services/teacherService';
import {
  Plus,
  Trash2,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Minus
} from 'lucide-react';

export function TeacherAssignments() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter
  const [selectedClassroom, setSelectedClassroom] = useState('all');

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassroomId, setNewClassroomId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('DSA Assignments');
  const [newTotalMarks, setNewTotalMarks] = useState(100);
  const [newDueDate, setNewDueDate] = useState('');
  const [newProblems, setNewProblems] = useState<AssignmentProblem[]>([
    { platform: 'LEETCODE', problemId: '', title: '', difficulty: 'Easy', problemUrl: '', points: 50, problemOrder: 1 }
  ]);

  // Grading state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingStudents, setGradingStudents] = useState<any[]>([]);
  const [loadingGrading, setLoadingGrading] = useState(false);

  useEffect(() => {
    if (!user || !user.email) return;
    const teacherEmail = user.email;

    async function loadData() {
      setLoading(true);
      try {
        const [classList, assignmentList, studentList] = await Promise.all([
          fetchClassroomsByTeacherEmail(teacherEmail),
          fetchAssignmentsByTeacher(teacherEmail),
          fetchTeacherStudentRoster(teacherEmail)
        ]);
        setClassrooms(classList);
        setAssignments(assignmentList);
        setStudents(studentList);
        if (classList.length > 0 && !newClassroomId) {
          setNewClassroomId(classList[0].id.toString());
        }
      } catch (err) {
        console.error("Error loading assignments data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, refreshKey]);

  const loadGradingDetails = async (assignment: Assignment) => {
    setLoadingGrading(true);
    setSelectedAssignment(assignment);
    try {
      const gradingList: any[] = [];
      const classObj = classrooms.find(c => c.name === assignment.classroomName);
      const classJoinCode = classObj?.joinCode;

      const classStudents = students.filter(st =>
        !classJoinCode || st.classrooms?.includes(classJoinCode)
      );

      for (const student of classStudents) {
        try {
          const response = await fetch(`http://localhost:8080/api/v1/dashboard/assignments/${student.handle}`);
          if (response.ok) {
            const data = await response.json();
            const match = data.find((a: any) => a.id === assignment.id);
            if (match) {
              gradingList.push({
                name: student.name,
                handle: student.handle,
                progress: match.progress,
                problems: match.problems || []
              });
            } else {
              gradingList.push({
                name: student.name,
                handle: student.handle,
                progress: 0,
                problems: assignment.problems.map((p: any) => ({ ...p, completed: false }))
              });
            }
          }
        } catch (e) {
          console.error("Error fetching student status", e);
        }
      }
      setGradingStudents(gradingList);
    } catch (err) {
      console.error("Error loading grading details:", err);
    } finally {
      setLoadingGrading(false);
    }
  };

  const handleUrlPaste = (index: number, url: string) => {
    let platform = 'LEETCODE';
    let problemId = 'unknown';
    let title = 'Coding Problem';

    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('leetcode.com')) {
        platform = 'LEETCODE';
        const match = parsed.pathname.match(/\/problems\/([^/]+)/);
        if (match) {
          problemId = match[1];
          title = problemId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      } else if (parsed.hostname.includes('geeksforgeeks.org')) {
        platform = 'GEEKSFORGEEKS';
        const match = parsed.pathname.match(/\/problems\/([^/]+)/);
        if (match) {
          problemId = match[1];
          title = problemId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      } else if (parsed.hostname.includes('codechef.com')) {
        platform = 'CODECHEF';
        const match = parsed.pathname.match(/\/problems\/([^/]+)/);
        if (match) {
          problemId = match[1];
          title = problemId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      } else if (parsed.hostname.includes('hackerrank.com')) {
        platform = 'HACKERRANK';
        const match = parsed.pathname.match(/\/challenges\/([^/]+)/);
        if (match) {
          problemId = match[1];
          title = problemId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      } else if (parsed.hostname.includes('codeforces.com')) {
        platform = 'CODEFORCES';
        const match = parsed.pathname.match(/\/problemset\/problem\/([^/]+)\/([^/]+)/) || parsed.pathname.match(/\/contest\/([^/]+)\/problem\/([^/]+)/);
        if (match) {
          problemId = `cf_${match[1]}_${match[2]}`;
          title = `CF Problem ${match[1]}${match[2]}`;
        }
      }
    } catch {
      // keep standard defaults
    }

    handleProblemChange(index, 'problemUrl', url);
    handleProblemChange(index, 'platform', platform);
    handleProblemChange(index, 'problemId', problemId);
    handleProblemChange(index, 'title', title);
  };

  const handleAddProblemField = () => {
    setNewProblems(prev => [...prev, { platform: 'LEETCODE', problemId: '', title: '', difficulty: 'Easy', problemUrl: '', points: 50, problemOrder: prev.length + 1 }]);
  };

  const handleRemoveProblemField = (index: number) => {
    if (newProblems.length <= 1) return;
    setNewProblems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProblemChange = (index: number, field: string, value: any) => {
    setNewProblems(prev => prev.map((p, i) => {
      if (i === index) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const normalizeProblemId = (value?: string) => {
    return (value || '')
      .toLowerCase()
      .trim()
      .replace(/^(leetcode|gfg|geeksforgeeks|codechef|hackerrank)[_-]+/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassroomId || !newTitle || !newDueDate) {
      alert("Please fill in all fields.");
      return;
    }

    // Validate problems
    for (const p of newProblems) {
      if (!p.problemUrl || !p.title) {
        alert("Please fill in problem URL and Title for all problems.");
        return;
      }
    }

    try {
      await createAssignment({
        classroomId: parseInt(newClassroomId),
        title: newTitle,
        description: newDescription,
        category: newCategory,
        totalMarks: newTotalMarks,
        dueDate: new Date(newDueDate).toISOString(),
        problems: newProblems
      });
      alert("Assignment created successfully!");
      setShowCreateForm(false);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewProblems([{ platform: 'LEETCODE', problemId: '', title: '', difficulty: 'Easy', problemUrl: '', points: 50, problemOrder: 1 }]);
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Error creating assignment:", err);
      alert(err.message || "Failed to create assignment.");
    }
  };

  // Filter assignments by classroom
  const filteredAssignments = assignments.filter(assignment => {
    return selectedClassroom === 'all' ||
      assignment.classroomName.includes(selectedClassroom) ||
      (classrooms.find(c => c.id === assignment.classroomId)?.joinCode === selectedClassroom);
  });

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCreateForm ? (
        /* CREATE ASSIGNMENT FORM */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-2xl font-black">Publish Assignment</h2>
              <p className="text-sm text-zinc-500 font-medium">Link problems directly from LeetCode, Codeforces, HackerRank, and GFG.</p>
            </div>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateAssignmentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-450 mb-2">Target Classroom</label>
                <select
                  value={newClassroomId}
                  onChange={(e) => setNewClassroomId(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-450 mb-2">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
                >
                  <option value="DSA Assignments">DSA Assignments</option>
                  <option value="Fundamentals">Fundamentals</option>
                  <option value="Advanced Challenge">Advanced Challenge</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-450 mb-2">Total Points / Marks</label>
                <input
                  type="number" required min={0}
                  value={newTotalMarks} onChange={(e) => setNewTotalMarks(parseInt(e.target.value))}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-450 mb-2">Assignment Title</label>
                <input
                  type="text" required placeholder="e.g. Graph Traversal Basics"
                  value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none font-semibold placeholder-zinc-400 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-450 mb-2">Due Date & Time</label>
                <input
                  type="datetime-local" required
                  value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none font-semibold text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-450 mb-2">Assignment Description</label>
              <textarea
                rows={3} placeholder="Provide instructions for this assignment..."
                value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none font-semibold placeholder-zinc-400 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-450">Coding Problems List</h3>
                <button
                  type="button" onClick={handleAddProblemField}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-orange-655 hover:text-orange-500"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Problem</span>
                </button>
              </div>

              <div className="space-y-4">
                {newProblems.map((prob, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 items-end">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Direct Problem URL Link</label>
                        <input
                          type="text" required placeholder="Paste Leetcode, GFG, CF, HackerRank URL..."
                          value={prob.problemUrl}
                          onChange={(e) => handleUrlPaste(idx, e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold placeholder-zinc-400 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Platform (Auto-Detected)</label>
                        <input
                          type="text" readOnly
                          value={prob.platform}
                          className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs font-mono font-bold text-zinc-500"
                        />
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Problem Title</label>
                        <input
                          type="text" required placeholder="Problem Name"
                          value={prob.title} onChange={(e) => handleProblemChange(idx, 'title', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-1.5">Points</label>
                        <input
                          type="number" required min={0}
                          value={prob.points} onChange={(e) => handleProblemChange(idx, 'points', parseInt(e.target.value))}
                          className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                    {newProblems.length > 1 && (
                      <button
                        type="button" onClick={() => handleRemoveProblemField(idx)}
                        className="p-2.5 text-zinc-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition self-end mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-zinc-150 dark:border-zinc-855 justify-end">
              <button
                type="button" onClick={() => setShowCreateForm(false)}
                className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 rounded-xl text-sm font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-655 text-white rounded-xl text-sm font-bold shadow-md"
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      ) : selectedAssignment ? (
        /* GRADING TRACKER VIEW */
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Classroom grading</div>
              <h2 className="text-3xl font-black mt-1 leading-none">{selectedAssignment.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Class Target</div>
              <div className="text-lg font-bold mt-1">{selectedAssignment.classroomName}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Points Weight</div>
              <div className="text-lg font-bold mt-1 text-orange-500">{selectedAssignment.totalMarks} Points</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm col-span-2">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Due Date</div>
              <div className="text-lg font-bold mt-1 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{new Date(selectedAssignment.dueDate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-850">
              <h3 className="font-extrabold text-lg">Assigned Problems</h3>
              <p className="text-xs text-zinc-500 font-semibold">Problems attached to this assignment.</p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {selectedAssignment.problems?.length ? selectedAssignment.problems.map((problem: any, index: number) => {
                const href = problem.problemUrl || '#';
                return (
                  <div key={problem.problemId || index} className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-900 dark:text-white truncate">{problem.title || problem.problemId}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs font-bold uppercase">
                        <span className="text-blue-500">{problem.platform}</span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-amber-500">{problem.difficulty || 'Unknown'}</span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-zinc-500">{problem.points || 0} pts</span>
                      </div>
                    </div>
                    {href !== '#' && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open</span>
                      </a>
                    )}
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-zinc-500 font-medium">No problems attached yet.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-850">
              <h3 className="font-extrabold text-lg">Student Assignment Tracker</h3>
              <p className="text-xs text-zinc-500 font-semibold">Verify individual completion rates and solved metrics for each student.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-850/30 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-4 font-bold">Student Name</th>
                    <th className="px-6 py-4 font-bold">Completion Rate</th>
                    {selectedAssignment.problems?.map((p: any) => (
                      <th key={p.problemId} className="px-6 py-4 font-bold text-center text-xs">
                        <div className="font-extrabold">{p.title}</div>
                        <div className="text-[9px] text-zinc-400 font-normal uppercase mt-0.5">{p.platform}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loadingGrading ? (
                    <tr>
                      <td colSpan={2 + (selectedAssignment.problems?.length || 0)} className="text-center py-12">
                        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : gradingStudents.length === 0 ? (
                    <tr>
                      <td colSpan={2 + (selectedAssignment.problems?.length || 0)} className="text-center py-12 text-zinc-500">
                        No students enrolled in this classroom context yet.
                      </td>
                    </tr>
                  ) : (
                    gradingStudents.map((st) => (
                      <tr key={st.handle} className="hover:bg-zinc-50 dark:hover:bg-zinc-805/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-zinc-900 dark:text-white">{st.name}</div>
                          <div className="text-xs text-zinc-400">@{st.handle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm font-extrabold ${st.progress === 100 ? 'text-emerald-505' : 'text-orange-500'}`}>{st.progress}%</span>
                            <div className="w-24 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden shrink-0">
                              <div className={`h-2 rounded-full ${st.progress === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${st.progress}%` }}></div>
                            </div>
                          </div>
                        </td>
                        {selectedAssignment.problems?.map((p: any) => {
                          const targetProblemId = normalizeProblemId(p.problemId);
                          const probStatus = st.problems?.find((sp: any) => normalizeProblemId(sp.problemId) === targetProblemId);
                          const completed = probStatus ? probStatus.completed : false;
                          return (
                            <td key={p.problemId} className="px-6 py-4 text-center whitespace-nowrap">
                              {completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                              ) : (
                                <Minus className="w-5 h-5 text-zinc-300 dark:text-zinc-700 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* LIST ASSIGNMENTS VIEW */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1">Class Assignments</h1>
              <p className="text-sm text-zinc-500 font-medium">Create assignments, link coding problems, and evaluate class progress.</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedClassroom}
                onChange={(e) => {
                  setSelectedClassroom(e.target.value);
                  const matchedClass = classrooms.find(c => c.joinCode === e.target.value);
                  if (matchedClass) {
                    setNewClassroomId(matchedClass.id.toString());
                  }
                }}
                className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none text-zinc-800 dark:text-zinc-200"
              >
                <option value="all">All Classrooms</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.joinCode}>{c.name}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (classrooms.length === 0) {
                    alert("Please launch a classroom target first.");
                    return;
                  }
                  setShowCreateForm(true);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-extrabold shadow-md hover:bg-orange-600 transition"
              >
                <Plus className="w-4 h-4 font-black" />
                <span>Create Assignment</span>
              </button>
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-550">
              No assignments found. Click "Create Assignment" to add the first one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  onClick={() => loadGradingDetails(assignment)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-zinc-350 dark:hover:border-zinc-700 transition cursor-pointer relative overflow-hidden group flex flex-col h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 transform origin-left scale-x-100 opacity-80"></div>
                  <div className="flex items-start justify-between mb-4 mt-2">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-1 group-hover:text-orange-500 transition-colors">{assignment.title}</h3>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{assignment.classroomName}</p>
                    </div>
                    <div className="px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold rounded shrink-0">
                      {assignment.category}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-zinc-500 mb-6">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-auto border-t border-zinc-100 dark:border-zinc-850 pt-4 flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    <span>{assignment.problems?.length || 0} Problems • {assignment.totalMarks} Pts</span>
                    <span className="text-orange-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Grade Portal</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
