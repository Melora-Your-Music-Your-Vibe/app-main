import { useState } from 'react';
import { Play, Pause, Heart, PlusCircle, MoreHorizontal } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import './SongCard.css';

export default function SongCard({ song, songs = [], index = 0 }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;

  const [isClicked, setIsClicked] = useState(false);

  const handlePlay = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, songs.length > 0 ? songs : [song]);
    }
  };

  const handleAddToPlaylist = (e) => {
    e.stopPropagation();
    // TODO: Open modal to add to playlist
    alert('Create or select a playlist for ' + song.title);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    // TODO: Add to liked songs
  };

  return (
    <div className={`song-card ${isCurrent ? 'playing' : ''} ${isClicked ? 'pulse-click' : ''}`} id={`song-card-${song.id}`}>
      <div className="song-card-img" onClick={handlePlay}>
        <img src={song.thumbnailUrl || '/default-album.png'} alt={song.title}
          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1f2e" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="30">♪</text></svg>'; }} />
        <div className="song-card-overlay">
          <button className="song-play-btn" aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}>
            {isCurrent && isPlaying ? <Pause size={22} fill="#fff" /> : <Play size={22} fill="#fff" />}
          </button>
          <div className="song-card-actions">
            <button className="song-action-btn" onClick={handleLike} aria-label="Like"><Heart size={18} /></button>
            <button className="song-action-btn" onClick={handleAddToPlaylist} aria-label="Add to Playlist"><PlusCircle size={18} /></button>
          </div>
        </div>
        {isCurrent && isPlaying && (
          <div className="song-card-playing">
            <div className="music-bars">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>
      <div className="song-card-info">
        <p className="song-card-title truncate" title={song.title}>{song.title}</p>
        <p className="song-card-artist truncate">{song.artist}</p>
      </div>
    </div>
  );
}
