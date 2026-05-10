import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit3, Save, X, MapPin, Globe, Mail, Phone, Settings, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuthStore();
  const { trips } = useTripStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
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
    updateProfile(form);
    setEditing(false);
    toast.success('Profile updated successfully!');
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
                <span className="flex items-center gap-1"><Globe size={12} />{form.country}</span>
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
              <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} className="input-field text-sm resize-none" rows={2} placeholder="Bio" />
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary flex-1 text-sm"><Save size={14} className="inline mr-1" />Save</button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm"><X size={14} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Preplanned Trips */}
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

        {/* Previous Trips */}
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

        {/* Settings */}
        <h2 className="section-title mb-4">Settings</h2>
        <div className="glass-card divide-y divide-white/5">
          {[
            { icon: Globe, label: 'Language', value: currentUser?.language || 'English' },
            { icon: Settings, label: 'Notifications', value: 'Enabled' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3"><Icon size={16} className="text-accent" /><span className="text-sm">{label}</span></div>
              <span className="text-sm text-text-secondary">{value}</span>
            </div>
          ))}
          <button className="flex items-center gap-3 p-4 w-full text-left text-danger hover:bg-danger/5 transition-colors">
            <Trash2 size={16} /><span className="text-sm">Delete Account</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
