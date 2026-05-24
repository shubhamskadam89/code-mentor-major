import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useStudentProfile } from '../../../shared/hooks/useStudentProfile';
import { useStudentClassrooms } from '../../../shared/hooks/useClassrooms';
import { useStudentAssignments } from '../../../shared/hooks/useAssignments';
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle2, ChevronRight, User } from 'lucide-react';

export function StudentClassroomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Queries
  const { data: profile, isLoading: profileLoading } = useStudentProfile(user?.handle);
  const { data: classrooms, isLoading: classroomsLoading } = useStudentClassrooms(profile?.id);
  const { data: assignments, isLoading: assignmentsLoading } = useStudentAssignments(user?.handle);

  const isLoading = profileLoading || classroomsLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const classroom = classrooms?.find(c => c.id.toString() === id);

  if (!classroom) {
    return (
      <div className="space-y-4 text-center py-12">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Classroom Not Found</h2>
        <p className="text-zinc-500 dark:text-zinc-400">The classroom you are trying to view does not exist or you are not enrolled.</p>
        <button
          onClick={() => navigate('/student/classrooms')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classrooms</span>
        </button>
      </div>
    );
  }

  // Filter assignments mapped to this classroom name or classroom ID
  // Wait, backend matches by course/classroom name, or we can check both classroomId and course name
  const classroomAssignments = assignments?.filter(a => 
    a.classroomId === classroom.id || a.course === classroom.name
  ) || [];

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-sm font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Classroom Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
              Classroom Code: {classroom.joinCode}
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">{classroom.name}</h1>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm font-semibold uppercase tracking-wider">
              {classroom.subjectName} • Semester {classroom.semester} • Division {classroom.division}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-500/15 text-orange-500 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Instructor</div>
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {classroom.teacherName || "Instructor"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <span>Classroom Assignments ({classroomAssignments.length})</span>
          </h2>
        </div>

        {classroomAssignments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 font-medium">
            <p className="text-lg">📚 No assignments published yet.</p>
            <p className="text-xs text-zinc-400 mt-1">Assignments published by your teacher will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {classroomAssignments.map((a) => {
              const isCompleted = a.status === 'completed';
              
              // Border colors based on state
              let borderClass = 'border-zinc-200 dark:border-zinc-800';
              if (isCompleted) {
                borderClass = 'border-emerald-500/30 dark:border-emerald-500/20';
              } else if (a.color === 'orange') {
                borderClass = 'border-amber-500/30 dark:border-amber-500/20';
              }

              return (
                <div 
                  key={a.id} 
                  className={`bg-white dark:bg-zinc-900 border ${borderClass} rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-md relative overflow-hidden`}
                >
                  {isCompleted && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  )}
                  {!isCompleted && a.color === 'orange' && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-lg text-zinc-900 dark:text-white leading-tight">
                        {a.title}
                      </h4>
                      {isCompleted ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-605 dark:text-zinc-400">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                    
                    <p className="text-zinc-450 dark:text-zinc-500 text-xs font-medium line-clamp-1">
                      {a.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-405 font-bold pt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Due: {a.dueDate}</span>
                      </span>
                      <span>•</span>
                      <span>{a.problems?.length || 0} coding problems</span>
                      <span>•</span>
                      <span>Total Marks: {a.totalMarks}</span>
                    </div>
                  </div>

                  {/* Progress info & action */}
                  <div className="flex items-center space-x-6 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-850">
                    <div className="w-28 space-y-1 text-right">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Progress</div>
                      <div className="text-sm font-black text-zinc-800 dark:text-zinc-200">{a.progress}%</div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`}
                          style={{ width: `${a.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/student/assignments/${a.id}`)}
                      className={`inline-flex items-center space-x-1 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                        isCompleted 
                          ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10'
                      }`}
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
