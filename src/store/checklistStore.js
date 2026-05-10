import { create } from 'zustand';
import { checklists as initialChecklists } from '../data/checklists';

const useChecklistStore = create((set, get) => ({
  checklists: initialChecklists,

  getChecklistByTrip: (tripId) => {
    return get().checklists.find(cl => cl.tripId === tripId);
  },

  toggleItem: (checklistId, itemId) => {
    set((state) => ({
      checklists: state.checklists.map(cl =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map(item =>
                item.id === itemId ? { ...item, packed: !item.packed } : item
              ),
            }
          : cl
      ),
    }));
  },

  addItem: (checklistId, item) => {
    const newItem = {
      id: `cli${Date.now()}`,
      packed: false,
      ...item,
    };
    set((state) => ({
      checklists: state.checklists.map(cl =>
        cl.id === checklistId
          ? { ...cl, items: [...cl.items, newItem] }
          : cl
      ),
    }));
  },

  removeItem: (checklistId, itemId) => {
    set((state) => ({
      checklists: state.checklists.map(cl =>
        cl.id === checklistId
          ? { ...cl, items: cl.items.filter(item => item.id !== itemId) }
          : cl
      ),
    }));
  },

  resetChecklist: (checklistId) => {
    set((state) => ({
      checklists: state.checklists.map(cl =>
        cl.id === checklistId
          ? { ...cl, items: cl.items.map(item => ({ ...item, packed: false })) }
          : cl
      ),
    }));
  },

  createChecklist: (tripId) => {
    const newChecklist = {
      id: `cl${Date.now()}`,
      tripId,
      items: [
        { id: `cli${Date.now()}a`, label: "Passport", category: "Documents", packed: false },
        { id: `cli${Date.now()}b`, label: "Flight Tickets", category: "Documents", packed: false },
        { id: `cli${Date.now()}c`, label: "Phone Charger", category: "Electronics", packed: false },
      ],
    };
    set((state) => ({ checklists: [...state.checklists, newChecklist] }));
    return newChecklist;
  },
}));

export default useChecklistStore;
