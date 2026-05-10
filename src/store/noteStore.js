import { create } from 'zustand';
import { notes as initialNotes } from '../data/notes';

const useNoteStore = create((set, get) => ({
  notes: initialNotes,

  getNotesByTrip: (tripId) => {
    return get().notes.filter(n => n.tripId === tripId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  getNotesByStop: (stopId) => {
    return get().notes.filter(n => n.stopId === stopId);
  },

  addNote: (noteData) => {
    const newNote = {
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...noteData,
    };
    set((state) => ({ notes: [...state.notes, newNote] }));
    return newNote;
  },

  updateNote: (noteId, updates) => {
    set((state) => ({
      notes: state.notes.map(n => n.id === noteId ? { ...n, ...updates, timestamp: new Date().toISOString() } : n),
    }));
  },

  deleteNote: (noteId) => {
    set((state) => ({ notes: state.notes.filter(n => n.id !== noteId) }));
  },
}));

export default useNoteStore;
