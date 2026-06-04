import { useRef, useEffect, useState, useCallback } from 'react';
import {
  ChevronDown, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Volume2, Volume1, VolumeX,
} from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import useFavoriteStore from '../../store/favoriteStore';
import './MobilePlayer.css';

function IconPlay() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14.72a.5.5 0 0 0 .757.429l11.5-7.36a.5.5 0 0 0 0-.858l-11.5-7.36A.5.5 0 0 0 8 5.14z" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="4" width="4" height="16" rx="1.5" />
      <rect x="15" y="4" width="4" height="16" rx="1.5" />
    </svg>
  );
}

/* ── Dummy lyrics fallback (when song has no lyrics) ── */
const DUMMY_LYRICS = [
  { time: 0, text: '♪ ♪ ♪' },
  { time: 10, text: '🎵 Instrumental 🎵' },
  { time: 20, text: '♪ ♪ ♪' },
];

export default function MobilePlayer({ onClose }) {
  const lyricsRef = useRef(null);
  const progressRef = useRef(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [activeLyricIdx, setActiveLyricIdx] = useState(0);

  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted,
    shuffle, repeat, togglePlay, nextSong, prevSong, seekTo, setVolume,
    toggleMute, toggleShuffle, toggleRepeat,
  } = usePlayerStore();

  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const liked = currentSong ? isFavorite(currentSong.id) : false;

  /* Lyrics: use song.lyrics if available, else dummy */
  const lyrics = (currentSong?.lyrics?.length > 0)
    ? currentSong.lyrics
    : DUMMY_LYRICS;

  /* ── Sync active lyric to currentTime ── */
  useEffect(() => {
    if (!lyrics.length) return;
    const idx = lyrics.reduce((acc, line, i) => {
      return currentTime >= line.time ? i : acc;
    }, 0);
    setActiveLyricIdx(idx);
  }, [currentTime, lyrics]);

  /* ── Scroll active lyric into view ── */
  useEffect(() => {
    const container = lyricsRef.current;
    if (!container) return;
    const active = container.querySelector('.lyric-line.active');
    if (!active) return;
    active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeLyricIdx]);

  const fmt = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayTime = isSeeking ? seekValue : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handlePointerDown = (e) => {
    setIsSeeking(true);
    setSeekValue(parseFloat(e.target.value));
  };
  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    setSeekValue(val);
  };
  const handlePointerUp = (e) => {
    seekTo(parseFloat(e.target.value));
    setIsSeeking(false);
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  if (!currentSong) return null;

  return (
    <div className="mobile-player-overlay" role="dialog" aria-modal="true" aria-label="Now Playing">
      {/* Blurred background from album art */}
      <div
        className="mobile-player-bg"
        style={{ backgroundImage: `url(${currentSong.thumbnailUrl || '/default-album.png'})` }}
      />

      <div className="mobile-player-content">
        {/* Header */}
        <div className="mobile-player-header">
          <button className="mp-btn-icon" onClick={onClose} aria-label="Minimize">
            <ChevronDown size={24} />
          </button>
          <div className="mp-header-text">
            <span className="mp-header-label">Now Playing</span>
          </div>
          <button
            className={`mp-btn-icon ${liked ? 'liked' : ''}`}
            onClick={() => toggleFavorite(currentSong.id)}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Album art */}
        <div className={`mp-album-art ${isPlaying ? 'spinning' : ''}`}>
          <img
            src={currentSong.thumbnailUrl || '/default-album.png'}
            alt={currentSong.title}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1f2e" width="100" height="100"/><text x="50" y="58" text-anchor="middle" fill="%2394a3b8" font-size="32">♪</text></svg>';
            }}
          />
        </div>

        {/* Track info */}
        <div className="mp-track-info">
          <p className="mp-title">{currentSong.title}</p>
          <p className="mp-artist">{currentSong.artist}</p>
        </div>

        {/* Progress */}
        <div className="mp-progress-wrap">
          <div className="mp-progress-track" ref={progressRef}>
            <div className="mp-progress-fill" style={{ width: `${progress}%` }} />
            <input
              type="range"
              className="mp-progress-slider"
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
          <div className="mp-time-row">
            <span>{fmt(displayTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mp-controls">
          <button className={`mp-ctrl ${shuffle ? 'active' : ''}`} onClick={toggleShuffle}>
            <Shuffle size={20} />
          </button>
          <button className="mp-ctrl-skip" onClick={prevSong}>
            <SkipBack size={28} fill="currentColor" />
          </button>
          <button className="mp-play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button className="mp-ctrl-skip" onClick={nextSong}>
            <SkipForward size={28} fill="currentColor" />
          </button>
          <button className={`mp-ctrl ${repeat !== 'off' ? 'active' : ''}`} onClick={toggleRepeat}>
            {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Volume */}
        <div className="mp-volume-row">
          <button className="mp-ctrl" onClick={toggleMute}>
            <VolumeIcon size={18} />
          </button>
          <input
            type="range"
            className="mp-volume-slider"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            aria-label="Volume"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.7) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.15) ${isMuted ? 0 : volume}%)`,
            }}
          />
        </div>

        {/* Lyrics */}
        <div className="mp-lyrics" ref={lyricsRef} aria-label="Lyrics">
          <p className="mp-lyrics-label">Lyrics</p>
          {lyrics.map((line, i) => (
            <p
              key={i}
              className={`lyric-line ${i === activeLyricIdx ? 'active' : i < activeLyricIdx ? 'past' : 'future'}`}
              onClick={() => seekTo(line.time)}
            >
              {line.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
