import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext';
import { AuthScreens } from './components/AuthScreens';

// Auth pages
import { AuthCallbackPage } from '../modules/auth/pages/AuthCallbackPage';

// Extension Pages
import { StudentExtensionView } from '../modules/extension/pages/StudentExtensionView';
import { TeacherExtensionView } from '../modules/extension/pages/TeacherExtensionView';

// Shared Layouts
import { StudentLayout } from '../shared/layouts/StudentLayout';
import { TeacherLayout } from '../shared/layouts/TeacherLayout';

// Student Pages
import { StudentDashboard } from '../modules/dashboard/pages/StudentDashboard';
import { StudentClassrooms } from '../modules/classrooms/pages/StudentClassrooms';
import { StudentClassroomDetails } from '../modules/classrooms/pages/StudentClassroomDetails';
import { StudentAssignments } from '../modules/assignments/pages/StudentAssignments';
import { StudentAssignmentDetails } from '../modules/assignments/pages/StudentAssignmentDetails';
import { StudentSubmissions } from '../modules/submissions/pages/StudentSubmissions';
import { StudentLeaderboard } from '../modules/leaderboard/pages/StudentLeaderboard';
import { StudentProfile } from '../modules/profile/pages/StudentProfile';

// Teacher Pages
import { TeacherDashboardView } from '../modules/dashboard/pages/TeacherDashboardView';
import { TeacherClassrooms } from '../modules/classrooms/pages/TeacherClassrooms';
import { TeacherClassroomDetails } from '../modules/classrooms/pages/TeacherClassroomDetails';
import { TeacherAssignments } from '../modules/assignments/pages/TeacherAssignments';
import { TeacherStudents } from '../modules/students/pages/TeacherStudents';
import { TeacherProfile } from '../modules/profile/pages/TeacherProfile';

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'student' | 'teacher' }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white h-screen items-center justify-center">
                <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <AuthScreens
                onLoginSuccess={() => { /* AuthContext state update triggers re-render */ }}
            />
        );
    }

    if (user.role !== requiredRole) {
        return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
    }

    return <>{children}</>;
}

export default function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/student/dashboard" replace />} />

                {/* Student Routes */}
                <Route
                    path="/student"
                    element={
                        <PrivateRoute requiredRole="student">
                            <StudentLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="classrooms" element={<StudentClassrooms />} />
                    <Route path="classrooms/:id" element={<StudentClassroomDetails />} />
                    <Route path="assignments" element={<StudentAssignments />} />
                    <Route path="assignments/:assignmentId" element={<StudentAssignmentDetails />} />
                    <Route path="submissions" element={<StudentSubmissions />} />
                    <Route path="leaderboard" element={<StudentLeaderboard />} />
                    <Route path="profile" element={<StudentProfile />} />
                </Route>

                {/* Teacher Routes */}
                <Route
                    path="/teacher"
                    element={
                        <PrivateRoute requiredRole="teacher">
                            <TeacherLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<TeacherDashboardView />} />
                    <Route path="classrooms" element={<TeacherClassrooms />} />
                    <Route path="classrooms/:id" element={<TeacherClassroomDetails />} />
                    <Route path="assignments" element={<TeacherAssignments />} />
                    <Route path="students" element={<TeacherStudents />} />
                    <Route path="profile" element={<TeacherProfile />} />
                </Route>

                {/* Extension Routes */}
                <Route path="/extension/student" element={<StudentExtensionView />} />
                <Route path="/extension/teacher" element={<TeacherExtensionView />} />

                {/* OAuth2 Callback — backend redirects here after Google login */}
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    );
}
