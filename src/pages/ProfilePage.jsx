import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Edit3, Save, X, MapPin, Globe, Mail, Phone, Settings, Trash2, Bell, AlertTriangle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const languages = ['English', 'Spanish', 'French', 'Hindi', 'Japanese', 'Arabic', 'Portuguese'];

export default function ProfilePage() {
  const { currentUser, updateProfile, logout } = useAuthStore();
  const { trips } = useTripStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    currentUser?.notificationsEnabled !== false
  );
  const [language, setLanguage] = useState(currentUser?.language || 'English');
  const [form, setForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    country: currentUser?.country || '',
  });

  const userTrips = trips.filter(t => t.userId === currentUser?.id || true);
  const preplanned = userTrips.filter(t => t.status === 'upcoming').slice(0, 3);
  const previous = userTrips.filter(t => t.status === 'completed').slice(0, 3);
  const initials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase();

  const handleSave = () => {
    updateProfile({ ...form, language, notificationsEnabled });
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleDeleteAccount = async () => {
    await logout();
    navigate('/auth');
    toast.success('Account deleted. Goodbye! 👋');
  };

  const handleNotificationsToggle = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    updateProfile({ notificationsEnabled: newVal });
    toast.success(newVal ? '🔔 Notifications enabled' : '🔕 Notifications disabled');
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    updateProfile({ language: e.target.value });
    toast.success(`Language set to ${e.target.value}`);
  };

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center border-2 border-background">
              <Camera size={14} className="text-white" />
            </button>
          </div>
          <h1 className="font-display text-2xl font-bold">{form.firstName} {form.lastName}</h1>
          {!editing ? (
            <>
              <p className="text-text-secondary text-sm mt-1">{form.bio || 'No bio yet'}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-text-secondary text-xs">
                <span className="flex items-center gap-1"><Globe size={12} />{form.country || 'Worldwide'}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{userTrips.length} trips</span>
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary mt-4 text-sm">
                <Edit3 size={14} className="inline mr-1" /> Edit Profile
              </button>
            </>
          ) : (
            <div className="mt-4 space-y-3 text-left max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} className="input-field text-sm" placeholder="First" />
                <input type="text" value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} className="input-field text-sm" placeholder="Last" />
              </div>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input-field text-sm" placeholder="Email" />
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input-field text-sm" placeholder="Phone" />
              <input type="text" value={form.country} onChange={e => setForm(p => ({...p, country: e.target.value}))} className="input-field text-sm" placeholder="Country" />
              <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} className="input-field text-sm resize-none" rows={2} placeholder="Bio" />
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary flex-1 text-sm"><Save size={14} className="inline mr-1" />Save</button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm"><X size={14} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Preplanned Trips */}
        {preplanned.length > 0 && (
          <>
            <h2 className="section-title mb-4">Preplanned Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {preplanned.map(trip => (
                <div key={trip.id} className="glass-card-hover overflow-hidden cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                  <img src={trip.coverPhoto} alt={trip.name} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{trip.name}</h3>
                    <p className="text-xs text-text-secondary font-mono">{new Date(trip.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Previous Trips */}
        {previous.length > 0 && (
          <>
            <h2 className="section-title mb-4">Previous Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {previous.map(trip => (
                <div key={trip.id} className="glass-card-hover overflow-hidden cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                  <img src={trip.coverPhoto} alt={trip.name} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{trip.name}</h3>
                    <p className="text-xs text-text-secondary font-mono">{new Date(trip.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Settings */}
        <h2 className="section-title mb-4">Settings</h2>
        <div className="glass-card divide-y divide-white/5 mb-6">
          {/* Language */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-accent" />
              <span className="text-sm">Language</span>
            </div>
            <select value={language} onChange={handleLanguageChange}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors">
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-accent" />
              <span className="text-sm">Notifications</span>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${notificationsEnabled ? 'bg-accent' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Delete Account */}
          <button
            className="flex items-center gap-3 p-4 w-full text-left text-danger hover:bg-danger/5 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} /><span className="text-sm">Delete Account</span>
          </button>
        </div>
      </motion.div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-sm w-full p-6 border border-danger/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} className="text-danger" />
                <h2 className="font-display font-bold text-lg text-text-primary">Delete Account</h2>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                This will permanently delete your account and all your trips. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleDeleteAccount} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors">
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
