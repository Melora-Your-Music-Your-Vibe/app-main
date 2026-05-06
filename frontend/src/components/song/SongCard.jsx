import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import './SongCard.css';

export default function SongCard({ song, songs = [], index = 0 }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, songs.length > 0 ? songs : [song]);
    }
  };

  return (
    <div className={`song-card ${isCurrent ? 'playing' : ''}`} id={`song-card-${song.id}`}>
      <div className="song-card-img" onClick={handlePlay}>
        <img src={song.thumbnailUrl || '/default-album.png'} alt={song.title}
          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1f2e" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="30">♪</text></svg>'; }} />
        <div className="song-card-overlay">
          <button className="song-play-btn" aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}>
            {isCurrent && isPlaying ? <Pause size={22} fill="#fff" /> : <Play size={22} fill="#fff" />}
          </button>
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
