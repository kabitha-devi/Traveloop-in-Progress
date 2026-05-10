import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Activity, TrendingUp, BarChart3, Eye, Ban } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { users } from '../data/users';
import { cities } from '../data/cities';
import { activities } from '../data/activities';

const tabs = ['Manage Users', 'Popular Cities', 'Popular Activities', 'User Trends & Analytics'];

const trendData = [
  { month: 'Jan', users: 120, trips: 45 }, { month: 'Feb', users: 150, trips: 62 },
  { month: 'Mar', users: 180, trips: 78 }, { month: 'Apr', users: 220, trips: 95 },
  { month: 'May', users: 280, trips: 110 }, { month: 'Jun', users: 350, trips: 140 },
];

const activityBreakdown = [
  { name: 'Adventure', count: 340, color: '#C084FC' }, { name: 'Culture', count: 280, color: '#4ADE80' },
  { name: 'Food & Drink', count: 220, color: '#FACC15' }, { name: 'Wellness', count: 150, color: '#38BDF8' },
  { name: 'Luxury', count: 90, color: '#F472B6' }, { name: 'Nightlife', count: 120, color: '#A78BFA' },
];

const regionDist = [
  { name: 'Europe', value: 42, color: '#C084FC' }, { name: 'Asia', value: 28, color: '#4ADE80' },
  { name: 'Middle East', value: 12, color: '#FACC15' }, { name: 'Africa', value: 10, color: '#FB923C' },
  { name: 'Americas', value: 8, color: '#38BDF8' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tooltipStyle = { background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F0FF', fontSize: '12px' };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-2">Admin Panel</h1>
        <p className="section-subtitle mb-6">Platform analytics and management</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === i ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 0 && (
          <div>
            <div className="glass-card p-4 mb-4">
              <p className="text-text-secondary text-sm">Manage platform users. View profiles, monitor activity, and take administrative actions as needed.</p>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs text-white font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                      <td className="px-4 py-3 text-text-secondary">{user.country}</td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">{user.joinedDate}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn-ghost p-1.5 inline-flex"><Eye size={14} /></button>
                        <button className="btn-ghost p-1.5 inline-flex text-danger"><Ban size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Region</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Popularity</th>
              </tr></thead>
              <tbody>
                {cities.sort((a, b) => b.popularity - a.popularity).map((city, i) => (
                  <tr key={city.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-text-secondary">{i + 1}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img src={city.image} alt={city.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="font-medium">{city.name}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{city.country}</td>
                    <td className="px-4 py-3"><span className="badge bg-white/5 text-text-primary text-xs">{city.region}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-white/10 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-accent" style={{ width: `${city.popularity}%` }}></div></div>
                        <span className="font-mono text-xs text-accent">{city.popularity}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 2 && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Duration</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Avg Cost</th>
              </tr></thead>
              <tbody>
                {activities.map((a, i) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-text-secondary">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3"><span className="badge-accent text-xs">{a.category}</span></td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">{a.duration}</td>
                    <td className="px-4 py-3 text-right font-mono text-accent">${a.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-6">
            {/* Line Chart */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">User & Trip Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#A89BB8" fontSize={12} />
                    <YAxis stroke="#A89BB8" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="users" stroke="#C084FC" strokeWidth={2} dot={{ fill: '#C084FC' }} />
                    <Line type="monotone" dataKey="trips" stroke="#4ADE80" strokeWidth={2} dot={{ fill: '#4ADE80' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Activity Breakdown</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#A89BB8" fontSize={10} angle={-30} textAnchor="end" height={60} />
                      <YAxis stroke="#A89BB8" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {activityBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">City Distribution by Region</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={regionDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                        {regionDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {regionDist.map(r => (
                    <div key={r.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }}></div>
                      <span className="text-xs text-text-secondary">{r.name} ({r.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
