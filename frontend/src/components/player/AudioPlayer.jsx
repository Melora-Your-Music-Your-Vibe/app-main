import { useRef, useEffect, useCallback, useState } from 'react';
import {
  SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, Volume1, VolumeX, Heart, ListMusic, ChevronUp,
} from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import useFavoriteStore from '../../store/favoriteStore';
import MobilePlayer from './MobilePlayer';
import './AudioPlayer.css';

/* ── Crisp inline SVG icons ── */
function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14.72a.5.5 0 0 0 .757.429l11.5-7.36a.5.5 0 0 0 0-.858l-11.5-7.36A.5.5 0 0 0 8 5.14z" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="4" width="4" height="16" rx="1.5" />
      <rect x="15" y="4" width="4" height="16" rx="1.5" />
    </svg>
  );
}

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);

  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted,
    shuffle, repeat, setAudioRef, setCurrentTime, setDuration,
    togglePlay, nextSong, prevSong, seekTo, setVolume, toggleMute,
    toggleShuffle, toggleRepeat,
  } = usePlayerStore();

  const { isFavorite, toggleFavorite, loaded, loadFavorites } = useFavoriteStore();

  const liked = currentSong ? isFavorite(currentSong.id) : false;

  /* Load favorites once */
  useEffect(() => {
    if (!loaded) loadFavorites();
  }, [loaded, loadFavorites]);

  /* Register audio ref */
  useEffect(() => {
    if (audioRef.current) setAudioRef(audioRef.current);
  }, [setAudioRef]);

  /* Song change → load + play */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.src = currentSong.audioUrl;
    audio.load();
    audio.volume = isMuted ? 0 : volume / 100;
    if (isPlaying) audio.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  /* isPlaying state → DOM */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  /* Volume / mute */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [setCurrentTime, isSeeking]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, [setDuration]);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      nextSong();
    }
  }, [repeat, nextSong]);

  /* ── Seek: pointer-based for reliable click AND drag ── */
  const handlePointerDown = (e) => {
    setIsSeeking(true);
    const val = parseFloat(e.target.value);
    setSeekValue(val);
  };

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    setSeekValue(val);
    // Also update the audio element in real-time while dragging
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  const handlePointerUp = (e) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
    setIsSeeking(false);
  };

  /* Handle click on progress bar (not drag) */
  const handleProgressClick = (e) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(duration, ratio * duration));
    seekTo(time);
    setSeekValue(time);
  };

  const fmt = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* Keyboard shortcuts */
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
        default: break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentTime, duration, volume, togglePlay, nextSong, prevSong, seekTo, setVolume, toggleMute, toggleShuffle, toggleRepeat]);

  if (!currentSong) return null;

  const displayTime = isSeeking ? seekValue : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* ── Desktop / Mobile mini bar ── */}
      <div className="audio-player" id="audio-player" role="region" aria-label="Music Player">

        {/* Track info — tappable on mobile to open full player */}
        <div
          className="player-track-info"
          key={currentSong.id}
          onClick={() => window.innerWidth < 769 && setShowMobilePlayer(true)}
          style={{ cursor: window.innerWidth < 769 ? 'pointer' : 'default' }}
        >
          <div className="player-thumbnail">
            <img
              src={currentSong.thumbnailUrl || '/default-album.png'}
              alt={currentSong.title}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1f2e" width="100" height="100"/><text x="50" y="58" text-anchor="middle" fill="%2394a3b8" font-size="32">♪</text></svg>';
              }}
            />
          </div>
          <div className="player-song-details">
            <p className="player-song-title truncate">{currentSong.title}</p>
            <p className="player-song-artist truncate">{currentSong.artist}</p>
          </div>

          {/* Like — visible on both desktop and mobile */}
          <button
            className={`player-like-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSong.id); }}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* ── Controls + Progress (center) ── */}
        <div className="player-center">
          <div className="player-controls">
            <button className={`ctrl-btn ${shuffle ? 'active' : ''}`} onClick={toggleShuffle} title="Shuffle (S)">
              <Shuffle size={16} />
            </button>
            <button className="ctrl-btn-skip" onClick={prevSong} title="Previous">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>
            <button className="ctrl-btn-skip" onClick={nextSong} title="Next">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button className={`ctrl-btn ${repeat !== 'off' ? 'active' : ''}`} onClick={toggleRepeat} title="Repeat (R)">
              {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="player-progress-wrap">
            <span className="time-label">{fmt(displayTime)}</span>
            <div className="progress-track" ref={progressRef} onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              <input
                type="range"
                className="progress-slider"
                min="0"
                max={duration || 100}
                step="0.01"
                value={displayTime}
                onPointerDown={handlePointerDown}
                onChange={handleSeekChange}
                onPointerUp={handlePointerUp}
                aria-label="Seek"
              />
            </div>
            <span className="time-label">{fmt(duration)}</span>
          </div>
        </div>

        {/* ── Volume (right) ── */}
        <div className="player-right hide-mobile">
          <button className="ctrl-btn" aria-label="Queue" title="Queue">
            <ListMusic size={16} />
          </button>
          <button className="ctrl-btn" onClick={toggleMute} title="Mute (M)">
            <VolumeIcon size={16} />
          </button>
          <input
            type="range"
            className="volume-slider"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            aria-label="Volume"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.85) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.1) ${isMuted ? 0 : volume}%)`,
            }}
          />
        </div>

        {/* Mobile expand hint */}
        <button
          className="mobile-expand-btn hide-desktop"
          onClick={() => setShowMobilePlayer(true)}
          aria-label="Expand player"
        >
          <ChevronUp size={18} />
        </button>
      </div>

      {/* Mobile full-screen player */}
      {showMobilePlayer && (
        <MobilePlayer onClose={() => setShowMobilePlayer(false)} />
      )}
    </>
  );
}
