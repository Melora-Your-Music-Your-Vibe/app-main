import { useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Heart, ListMusic } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import './AudioPlayer.css';

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted,
    shuffle, repeat, setAudioRef, setCurrentTime, setDuration,
    togglePlay, nextSong, prevSong, seekTo, setVolume, toggleMute,
    toggleShuffle, toggleRepeat,
  } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) setAudioRef(audioRef.current);
  }, [setAudioRef]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, [setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, [setDuration]);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextSong();
    }
  }, [repeat, nextSong]);

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': if (e.shiftKey) nextSong(); else seekTo(Math.min(currentTime + 10, duration)); break;
        case 'ArrowLeft': if (e.shiftKey) prevSong(); else seekTo(Math.max(currentTime - 10, 0)); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(volume + 5, 100)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(volume - 5, 0)); break;
        case 'm': case 'M': toggleMute(); break;
        case 's': case 'S': if (!e.ctrlKey && !e.metaKey) toggleShuffle(); break;
        case 'r': case 'R': toggleRepeat(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentTime, duration, volume]);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player" id="audio-player">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} preload="auto" />

      <div className="player-track-info">
        <div className="player-thumbnail">
          <img src={currentSong.thumbnailUrl || '/default-album.png'} alt={currentSong.title}
            onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1f2e" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="30">♪</text></svg>'; }} />
        </div>
        <div className="player-song-details">
          <p className="player-song-title truncate">{currentSong.title}</p>
          <p className="player-song-artist truncate">{currentSong.artist}</p>
        </div>
        <button className="btn-icon player-like-btn hide-mobile" aria-label="Like">
          <Heart size={18} />
        </button>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className={`btn-icon ctrl-btn ${shuffle ? 'active' : ''}`} onClick={toggleShuffle} aria-label="Shuffle">
            <Shuffle size={18} />
          </button>
          <button className="btn-icon ctrl-btn" onClick={prevSong} aria-label="Previous">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button className="btn-icon play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>
          <button className="btn-icon ctrl-btn" onClick={nextSong} aria-label="Next">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button className={`btn-icon ctrl-btn ${repeat !== 'off' ? 'active' : ''}`} onClick={toggleRepeat} aria-label="Repeat">
            {repeat === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        <div className="player-progress-wrap">
          <span className="time-label">{formatTime(currentTime)}</span>
          <div className="progress-bar" ref={progressRef} onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="progress-thumb" style={{ left: `${progress}%` }} />
          </div>
          <span className="time-label">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right hide-mobile">
        <button className="btn-icon ctrl-btn" aria-label="Queue">
          <ListMusic size={18} />
        </button>
        <button className="btn-icon ctrl-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input type="range" className="volume-slider" min="0" max="100" value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseInt(e.target.value))} aria-label="Volume" />
      </div>
    </div>
  );
}
