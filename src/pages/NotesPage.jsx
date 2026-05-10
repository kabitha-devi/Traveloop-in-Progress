import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Edit3, Trash2, Calendar, MapPin, Save, X, Sparkles, Loader2, Globe } from 'lucide-react';
import useNoteStore from '../store/noteStore';
import useTripStore from '../store/tripStore';
import useToast from '../hooks/useToast';
import EmptyState from '../components/shared/EmptyState';
import { aiApi } from '../utils/api';

export default function NotesPage() {
  const { trips, stops } = useTripStore();
  const { notes, addNote, updateNote, deleteNote } = useNoteStore();
  const toast = useToast();
  const [selectedTrip, setSelectedTrip] = useState(trips[0]?.id || '');
  const [viewMode, setViewMode] = useState('day');
  const [editingNote, setEditingNote] = useState(null); // { id, title, body }
  const [newNote, setNewNote] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [journal, setJournal] = useState(null);
  const [showPhrases, setShowPhrases] = useState(false);
  const [phrases, setPhrases] = useState(null);
  const [phraseCountry, setPhraseCountry] = useState('');
  const [phraseLanguage, setPhraseLanguage] = useState('');
  const [phraseLoading, setPhraseLoading] = useState(false);

  const tripNotes = notes.filter(n => n.tripId === selectedTrip);
  const tripStops2 = stops.filter(s => s.tripId === selectedTrip);

  const groupedByDay = {};
  tripNotes.forEach(n => {
    const key = `Day ${n.day}`;
    if (!groupedByDay[key]) groupedByDay[key] = [];
    groupedByDay[key].push(n);
  });

  const groupedByStop = {};
  tripNotes.forEach(n => {
    const stop = tripStops2.find(s => s.id === n.stopId);
    const key = stop?.cityName || 'General';
    if (!groupedByStop[key]) groupedByStop[key] = [];
    groupedByStop[key].push(n);
  });

  const grouped = viewMode === 'day' ? groupedByDay : groupedByStop;

  const handleAddNote = () => {
    setNewNote({ title: '', body: '', day: 1, stopId: tripStops2[0]?.id || '', tripId: selectedTrip });
  };

  const saveNewNote = () => {
    if (!newNote.title.trim()) { toast.warning('Title required'); return; }
    addNote(newNote);
    setNewNote(null);
    toast.success('Note added! 📝');
  };

  const startEdit = (note) => {
    setEditingNote({ id: note.id, title: note.title, body: note.body });
  };

  const saveEdit = () => {
    if (!editingNote.title.trim()) { toast.warning('Title required'); return; }
    updateNote(editingNote.id, { title: editingNote.title, body: editingNote.body });
    setEditingNote(null);
    toast.success('Note updated! ✏️');
  };

  const generateJournal = async () => {
    if (!selectedTrip) { toast.warning('Select a trip first'); return; }
    setAiLoading(true);
    setJournal(null);
    try {
      const data = await aiApi.generateJournal(selectedTrip);
      setJournal(data);
      toast.success('Journal generated! ✨');
    } catch (error) {
      toast.error(error.message || 'Journal generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchEmergencyPhrases = async () => {
    if (!phraseCountry || !phraseLanguage) { toast.warning('Enter country and language'); return; }
    setPhraseLoading(true);
    try {
      const data = await aiApi.emergencyPhrases({ country: phraseCountry, language: phraseLanguage });
      setPhrases(data);
      toast.success('Emergency phrases loaded! 🌍');
    } catch (error) {
      toast.error(error.message || 'Failed to fetch phrases');
    } finally {
      setPhraseLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title text-3xl mb-2">Trip Journal</h1>
            <p className="section-subtitle">Your travel notes and memories</p>
          </div>
          <button onClick={handleAddNote} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Add Note
          </button>
        </div>
      </motion.div>

      {/* Trip Selector */}
      <div className="glass-card p-4 mb-6">
        <label className="block text-sm text-text-secondary mb-2">Select Trip</label>
        <select value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)} className="input-field">
          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* AI Actions */}
      <div className="glass-card p-4 mb-6 border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-accent" />
          <h3 className="font-display font-semibold text-sm text-text-primary">AI Features</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={generateJournal} disabled={aiLoading}
            className="btn-primary flex items-center gap-2 text-xs px-3 py-2 bg-gradient-to-r from-accent to-primary">
            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <BookOpen size={12} />}
            ✨ Generate AI Journal
          </button>
          <button onClick={() => setShowPhrases(!showPhrases)}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-2">
            <Globe size={12} /> Emergency Phrases
          </button>
        </div>
      </div>

      {/* Emergency Phrases Panel */}
      <AnimatePresence>
        {showPhrases && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card p-5 mb-6 border border-blue-500/20 overflow-hidden">
            <h3 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Globe size={16} className="text-blue-400" /> Emergency Phrases
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Country</label>
                <input type="text" value={phraseCountry} onChange={e => setPhraseCountry(e.target.value)}
                  placeholder="e.g., Japan" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Language</label>
                <input type="text" value={phraseLanguage} onChange={e => setPhraseLanguage(e.target.value)}
                  placeholder="e.g., Japanese" className="input-field text-sm" />
              </div>
            </div>
            <button onClick={fetchEmergencyPhrases} disabled={phraseLoading}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2 mb-3">
              {phraseLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Get Phrases
            </button>
            {phrases?.phrases && (
              <div className="space-y-2">
                {phrases.phrases.map((p, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-primary font-medium">{p.english}</span>
                    </div>
                    <p className="text-sm text-accent font-medium">{p.translation}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-secondary font-mono">🗣️ {p.phonetic}</span>
                      {p.script && <span className="text-xs text-text-secondary">{p.script}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Journal */}
      <AnimatePresence>
        {journal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-6 mb-6 border border-success/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-text-primary">{journal.title}</h3>
              <button onClick={() => setJournal(null)} className="text-text-secondary text-xs hover:text-text-primary">✕</button>
            </div>
            <p className="text-text-secondary text-sm italic mb-4 leading-relaxed">{journal.story}</p>
            {journal.dayHighlights?.map((day, i) => (
              <div key={i} className="mb-3 p-3 rounded-xl bg-white/5">
                <h4 className="font-display font-semibold text-sm text-accent mb-1">Day {day.day}: {day.headline}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{day.body}</p>
              </div>
            ))}
            {journal.coverCaption && (
              <p className="text-xs text-text-secondary/60 text-center mt-3 italic">"{journal.coverCaption}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'day' ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary'}`}>By Day</button>
        <button onClick={() => setViewMode('stop')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'stop' ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary'}`}>By Stop</button>
      </div>

      {/* New Note Form */}
      {newNote && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6">
          <h3 className="font-display font-semibold mb-3">New Note</h3>
          <div className="space-y-3">
            <input type="text" value={newNote.title} onChange={e => setNewNote(p => ({...p, title: e.target.value}))} placeholder="Note title..." className="input-field text-sm" />
            <textarea value={newNote.body} onChange={e => setNewNote(p => ({...p, body: e.target.value}))} placeholder="Write your note..." rows={3} className="input-field text-sm resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Day</label>
                <input type="number" value={newNote.day} onChange={e => setNewNote(p => ({...p, day: parseInt(e.target.value) || 1}))} className="input-field text-sm" min="1" />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Stop</label>
                <select value={newNote.stopId} onChange={e => setNewNote(p => ({...p, stopId: e.target.value}))} className="input-field text-sm">
                  {tripStops2.map(s => <option key={s.id} value={s.id}>{s.cityName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveNewNote} className="btn-primary text-sm flex-1"><Save size={14} className="inline mr-1" />Save</button>
              <button onClick={() => setNewNote(null)} className="btn-secondary text-sm"><X size={14} /></button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notes List */}
      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon={BookOpen} title="No notes yet" description="Start documenting your journey!" action={handleAddNote} actionLabel="Add First Note" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, groupNotes]) => (
            <div key={group}>
              <h3 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
                {viewMode === 'stop' ? <MapPin size={14} className="text-accent" /> : <Calendar size={14} className="text-accent" />}
                {group}
              </h3>
              <div className="space-y-3">
                {groupNotes.map(note => (
                  <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
                    {editingNote?.id === note.id ? (
                      <div className="space-y-2">
                        <input type="text" value={editingNote.title}
                          onChange={e => setEditingNote(p => ({...p, title: e.target.value}))}
                          className="input-field text-sm w-full" />
                        <textarea value={editingNote.body}
                          onChange={e => setEditingNote(p => ({...p, body: e.target.value}))}
                          rows={3} className="input-field text-sm resize-none w-full" />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Save size={12} /> Save</button>
                          <button onClick={() => setEditingNote(null)} className="btn-secondary text-xs px-3 py-1.5"><X size={12} /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary text-sm">{note.title}</h4>
                          <p className="text-text-secondary text-sm mt-1">{note.body}</p>
                          <p className="text-xs text-text-secondary/60 font-mono mt-2">
                            {new Date(note.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <button onClick={() => startEdit(note)} className="btn-ghost p-1.5"><Edit3 size={14} /></button>
                          <button onClick={() => { deleteNote(note.id); toast.success('Note deleted'); }}
                            className="btn-ghost p-1.5 text-danger"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
