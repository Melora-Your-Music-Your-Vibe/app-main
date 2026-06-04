import { create } from 'zustand';
import api from '../services/api';

const useFavoriteStore = create((set, get) => ({
  favoriteIds: new Set(),
  loaded: false,

  loadFavorites: async () => {
    try {
      const { data } = await api.get('/favorites');
      const ids = new Set((data.data || []).map((s) => String(s.id)));
      set({ favoriteIds: ids, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggleFavorite: async (songId) => {
    const id = String(songId);
    const prev = new Set(get().favoriteIds);

    // Optimistic update
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ favoriteIds: next });

    try {
      await api.post(`/favorites/${id}`);
    } catch {
      // Revert on error
      set({ favoriteIds: prev });
    }
  },

  isFavorite: (songId) => get().favoriteIds.has(String(songId)),
}));

export default useFavoriteStore;
