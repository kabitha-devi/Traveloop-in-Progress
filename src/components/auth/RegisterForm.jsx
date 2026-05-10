import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';

const countries = [
  'United States', 'India', 'United Kingdom', 'Japan', 'France', 'Germany',
  'Italy', 'Spain', 'Australia', 'Canada', 'Brazil', 'UAE', 'South Korea',
  'Singapore', 'Thailand', 'Indonesia', 'Mexico', 'South Africa', 'Portugal', 'Greece'
];

export default function RegisterForm({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: '', location: '', additionalInfo: '', password: ''
  });
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || '';
            const country = data.address.country || '';
            const locStr = city ? `${city}, ${country}` : country;
            update('location', locStr);
            if (country) update('country', country);
            toast.success('Location detected!');
          } catch (err) {
            update('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            toast.warning('Set coordinates as location.');
          }
        },
        () => {
          toast.error('Unable to retrieve location.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.country) errs.country = 'Please select a country';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(form);
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Create Account</h2>
      <p className="text-text-secondary text-sm mb-6">Start planning your dream trips today</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload */}
        <div className="flex justify-center mb-4">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-white/20 group-hover:border-accent/50 transition-all duration-300">
              <Camera size={24} className="text-white/60 group-hover:text-white transition-colors" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center border-2 border-background">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-firstname">
              First Name
            </label>
            <input
              id="reg-firstname"
              type="text"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              placeholder="Alex"
              className={`input-field ${errors.firstName ? 'border-danger/50' : ''}`}
            />
            {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-lastname">
              Last Name
            </label>
            <input
              id="reg-lastname"
              type="text"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder="Rivera"
              className={`input-field ${errors.lastName ? 'border-danger/50' : ''}`}
            />
            {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email & Password */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="alex@email.com"
              className={`input-field ${errors.email ? 'border-danger/50' : ''}`}
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
              className={`input-field ${errors.password ? 'border-danger/50' : ''}`}
            />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-phone">Phone</label>
          <input
            id="reg-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+1 555-0142"
            className={`input-field ${errors.phone ? 'border-danger/50' : ''}`}
          />
          {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-country">Country</label>
          <select
            id="reg-country"
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
            className={`input-field ${errors.country ? 'border-danger/50' : ''} ${!form.country ? 'text-text-secondary/50' : ''}`}
          >
            <option value="">Select your country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.country && <p className="text-danger text-xs mt-1">{errors.country}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-location">Location</label>
          <div className="flex gap-2">
            <input
              id="reg-location"
              type="text"
              value={form.location || ''}
              onChange={(e) => update('location', e.target.value)}
              placeholder="e.g. New York, USA"
              className="input-field"
            />
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="btn-secondary px-4 py-3 text-sm flex items-center gap-1"
              title="Use current location"
            >
              📍
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="reg-info">
            Additional Info <span className="text-text-secondary/50">(optional)</span>
          </label>
          <textarea
            id="reg-info"
            value={form.additionalInfo}
            onChange={(e) => update('additionalInfo', e.target.value)}
            placeholder="Tell us about your travel interests..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-accent hover:text-accent-light transition-colors font-medium">
          Sign in
        </button>
      </p>
    </div>
  );
}
