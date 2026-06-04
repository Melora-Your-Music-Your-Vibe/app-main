import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: parseInt(localStorage.getItem('melora_volume') || '80'),
  isMuted: false,
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'
  queue: [],
  currentIndex: 0,
  originalQueue: [],
  audioRef: null,

  setAudioRef: (ref) => set({ audioRef: ref }),

  playSong: (song, queue = null) => {
    const state = get();
    if (queue) {
      set({ queue, originalQueue: [...queue], currentIndex: queue.findIndex(s => s.id === song.id) || 0 });
    }
    set({ currentSong: song, isPlaying: true });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  pause: () => { set({ isPlaying: false }); },
  play: () => { set({ isPlaying: true }); },

  nextSong: () => {
    const { queue, currentIndex, shuffle } = get();
    if (queue.length === 0) return;
    let nextIdx;
    if (shuffle) {
      // Pick random index different from current (if queue > 1)
      if (queue.length === 1) {
        nextIdx = 0;
      } else {
        do { nextIdx = Math.floor(Math.random() * queue.length); } while (nextIdx === currentIndex);
      }
    } else {
      // Always circular — wrap at end
      nextIdx = (currentIndex + 1) % queue.length;
    }
    set({ currentSong: queue[nextIdx], currentIndex: nextIdx, isPlaying: true });
  },

  prevSong: () => {
    const { queue, currentIndex, currentTime } = get();
    // If more than 3 seconds played, restart current song
    if (currentTime > 3) {
      const { audioRef } = get();
      if (audioRef) audioRef.currentTime = 0;
      set({ currentTime: 0 });
      return;
    }
    if (queue.length === 0) return;
    // Always circular — wrap at start
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    set({ currentSong: queue[prevIdx], currentIndex: prevIdx, isPlaying: true });
  },

  seekTo: (time) => {
    const { audioRef } = get();
    if (audioRef) audioRef.currentTime = time;
    set({ currentTime: time });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (dur) => set({ duration: dur }),

  setVolume: (vol) => {
    localStorage.setItem('melora_volume', vol.toString());
    const { audioRef } = get();
    if (audioRef) audioRef.volume = vol / 100;
    set({ volume: vol, isMuted: vol === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume, audioRef } = get();
    if (audioRef) audioRef.volume = isMuted ? volume / 100 : 0;
    set({ isMuted: !isMuted });
  },

  toggleShuffle: () => {
    const { shuffle, queue, originalQueue } = get();
    if (!shuffle) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      set({ queue: shuffled, shuffle: true });
    } else {
      set({ queue: [...originalQueue], shuffle: false });
    }
  },

  toggleRepeat: () => {
    const { repeat } = get();
    const modes = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(repeat) + 1) % 3];
    set({ repeat: nextMode });
  },

  addToQueue: (song) => {
    const { queue } = get();
    set({ queue: [...queue, song], originalQueue: [...get().originalQueue, song] });
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIdx = currentIndex;
    if (index < currentIndex) newIdx--;
    set({ queue: newQueue, currentIndex: Math.max(0, newIdx) });
  },

  clearQueue: () => set({ queue: [], originalQueue: [], currentIndex: 0, currentSong: null, isPlaying: false }),
}));

export default usePlayerStore;
