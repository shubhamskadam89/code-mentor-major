import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  fetchTeacherProfile, 
  updateTeacherProfile, 
  TeacherProfile as ProfileType 
} from '../../../services/teacherService';
import { RefreshCw } from 'lucide-react';

export function TeacherProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || !user.email) return;
    const teacherEmail = user.email;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTeacherProfile(teacherEmail);
        setProfile(data);
        setEditName(data.name || '');
        setEditDept(data.department || '');
        setEditCollege(data.college || '');
        setEditDesignation(data.designation || '');
      } catch (err: any) {
        console.error("Error loading teacher profile:", err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !user || !user.email) return;
    const teacherEmail = user.email;

    setSaving(true);
    try {
      await updateTeacherProfile(teacherEmail, {
        name: editName.trim(),
        email: teacherEmail,
        department: editDept.trim(),
        college: editCollege.trim(),
        designation: editDesignation.trim(),
        profilePictureUrl: profile?.profilePictureUrl || '',
      });
      alert("Profile updated successfully!");
      setIsEditing(false);
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      alert(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">Profile Settings</h1>
          <p className="text-zinc-500 font-medium">Manage your college designations and parameters.</p>
        </div>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="p-2.5 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition"
          title="Refresh profile"
        >
          <RefreshCw className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-4xl mx-auto shadow-inner border border-zinc-150 dark:border-zinc-850 text-orange-655 font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black">{profile.name}</h2>
              <p className="text-sm font-semibold text-zinc-405">{profile.email}</p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
            <div className="py-3 flex justify-between">
              <span className="font-semibold text-zinc-400">Designation</span>
              <span className="font-bold text-zinc-850 dark:text-zinc-100">{profile.designation || "Instructor"}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="font-semibold text-zinc-400">Department</span>
              <span className="font-bold text-zinc-850 dark:text-zinc-100">{profile.department || "Computer Science"}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="font-semibold text-zinc-400">College / Institution</span>
              <span className="font-bold text-zinc-850 dark:text-zinc-100">{profile.college || "Not set"}</span>
            </div>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-250 dark:hover:bg-zinc-750 rounded-2xl text-sm font-bold transition"
            >
              Edit Profile Details
            </button>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          {isEditing && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-lg">Update Profile Parameters</h3>
                <p className="text-xs text-zinc-550 font-semibold">Change designations and college parameters to update on class dashboards.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-2">Full Name</label>
                  <input 
                    type="text" required value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold text-zinc-905 dark:text-zinc-100"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-2">Designation</label>
                    <input 
                      type="text" placeholder="e.g. Professor / Asst Professor"
                      value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold text-zinc-905 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-2">Department</label>
                    <input 
                      type="text" required value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold text-zinc-905 dark:text-zinc-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-450 mb-2">College / Institution</label>
                  <input 
                    type="text" placeholder="e.g. Stanford University"
                    value={editCollege} onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold text-zinc-905 dark:text-zinc-100"
                  />
                </div>
                <div className="flex space-x-3 justify-end pt-2">
                  <button 
                    type="button" onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={saving}
                    className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-extrabold shadow-md"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
