/**
 * Global audio player: one song at a time, plays previewUrl from backend.
 * Uses a single hidden <audio> (off-screen, not display:none) so playback works in all browsers.
 * Playback only runs when the backend returns a valid previewUrl; seed the DB (Nest seed script) if songs have no preview.
 */
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { logListen } from '../services/recommendationApi';

const DEBUG_AUDIO = false;
const LISTEN_EVENT = 'recommendation:listen';

const PlayerContext = createContext(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

function logAudioState(el, label) {
  if (!DEBUG_AUDIO || !el) return;
  const readyStateNames = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
  const networkStateNames = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];
  console.log(`[PlayerContext] ${label} → readyState=${el.readyState} (${readyStateNames[el.readyState]}), networkState=${el.networkState} (${networkStateNames[el.networkState]}), src=${el.src || '(none)'}`);
}

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSongState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) {
      if (DEBUG_AUDIO) console.warn('[PlayerContext] useEffect: audio ref not set yet');
      return;
    }
    if (DEBUG_AUDIO) console.log('[PlayerContext] Attaching audio event listeners; element in DOM:', !!document.body.contains(el));

    const onLoadedData = () => {
      if (DEBUG_AUDIO) console.log('[PlayerContext] audio event: loadeddata');
      logAudioState(el, 'after loadeddata');
    };
    const onCanPlay = () => {
      if (DEBUG_AUDIO) console.log('[PlayerContext] audio event: canplay');
      logAudioState(el, 'after canplay');
    };
    const onPlay = () => {
      if (DEBUG_AUDIO) console.log('[PlayerContext] audio event: play (playback started)');
      setIsPlaying(true);
    };
    const onPause = () => {
      if (DEBUG_AUDIO) console.log('[PlayerContext] audio event: pause');
      setIsPlaying(false);
    };
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => setDuration(el.duration);
    const onEnded = () => {
      if (DEBUG_AUDIO) console.log('[PlayerContext] audio event: ended');
      setIsPlaying(false);
    };
    const onError = () => {
      setIsPlaying(false);
      if (DEBUG_AUDIO && el.error) {
        console.error('[PlayerContext] audio event: error', {
          code: el.error.code,
          message: el.error.message,
          codeMeaning: ['MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED'][el.error.code] || 'UNKNOWN',
          currentSrc: el.currentSrc || el.src,
        });
      }
    };

    el.addEventListener('loadeddata', onLoadedData);
    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('loadeddata', onLoadedData);
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, []);

  const setCurrentSong = useCallback((song) => {
    const el = audioRef.current;
    if (!el) {
      if (DEBUG_AUDIO) console.warn('[PlayerContext] setCurrentSong: audioRef.current is null — element may not be in DOM yet');
      if (song) setCurrentSongState(song);
      setIsPlaying(false);
      return;
    }
    if (!song) {
      setCurrentSongState(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      el.pause();
      el.removeAttribute('src');
      el.load();
      return;
    }
    const audioUrl = (song.previewUrl ?? song.preview_url ?? song.audioUrl ?? '').trim() || null;
    if (!audioUrl || typeof audioUrl !== 'string') {
      // No playable URL — do not show player (backend may need seeding for previewUrl)
      el.pause();
      el.removeAttribute('src');
      el.load();
      return;
    }
    if (DEBUG_AUDIO) {
      console.log('[PlayerContext] setCurrentSong: assigning URL', { title: song.title, url: audioUrl });
      const notDirectAudio = /youtube\.com|youtu\.be|spotify\.com|deezer\.com\/[a-z]|soundcloud\.com\/[a-z]/i.test(audioUrl);
      if (notDirectAudio) console.warn('[PlayerContext] URL may not be a direct audio source (e.g. page link). Use mp3/preview CDN URL.', audioUrl);
    }
    setCurrentSongState(song);
    setCurrentTime(0);
    setDuration(0);
    el.pause();
    el.src = audioUrl;
    el.load();
    logAudioState(el, 'after load()');
    const playPromise = el.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          setIsPlaying(true);
          if (DEBUG_AUDIO) console.log('[PlayerContext] audio.play() resolved — playback allowed by browser');
        })
        .catch((err) => {
          setIsPlaying(false);
          if (DEBUG_AUDIO) console.error('[PlayerContext] audio.play() REJECTED', { reason: err?.message || String(err), name: err?.name, err });
        });
    } else {
      setIsPlaying(true);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const el = audioRef.current;
    if (!currentSong || !el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      if (currentSong.previewUrl || currentSong.preview_url || currentSong.audioUrl) {
        el.play().catch((err) => {
          setIsPlaying(false);
          if (DEBUG_AUDIO) console.error('[PlayerContext] togglePlayPause play() rejected', err);
        });
        setIsPlaying(true);
      }
    }
  }, [currentSong, isPlaying]);

  /**
   * Call this from the click handler so play() runs in the same user gesture.
   * Sets currentSong, assigns src, loads, and calls el.play() synchronously in this stack.
   * Pushes song.id to listen_history in localStorage for "Listen Again" on Home.
   */
  const play = useCallback((song) => {
    if (!song) return;
    const audioUrl = song.previewUrl ?? song.preview_url ?? song.audioUrl ?? null;
    if (!audioUrl || (typeof audioUrl === 'string' && !audioUrl.trim())) {
      if (DEBUG_AUDIO) console.warn('[PlayerContext] play(): no playable URL for song', song?.title, song);
      return;
    }
    if (currentSong?.id === song.id) {
      togglePlayPause();
      return;
    }
    try {
      const key = 'listen_history';
      const max = 50;
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const id = song.id != null ? String(song.id) : null;
      if (id) {
        const next = [...list.filter((x) => x !== id), id].slice(-max);
        localStorage.setItem(key, JSON.stringify(next));
        logListen(song.id).catch(() => {}).finally(() => {
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(LISTEN_EVENT, { detail: { songId: song.id } }));
        });
      }
    } catch (_) {}
    setCurrentSong(song);
  }, [currentSong?.id, togglePlayPause, setCurrentSong]);

  const stop = useCallback(() => {
    setCurrentSong(null);
  }, [setCurrentSong]);

  const seek = useCallback((time) => {
    const el = audioRef.current;
    if (el && typeof time === 'number' && !isNaN(time)) {
      el.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    setCurrentSong,
    togglePlayPause,
    play,
    stop,
    seek,
    audioRef: DEBUG_AUDIO ? audioRef : undefined,
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Single audio element, hidden off-screen so browsers allow playback (display:none can block in some cases). */}
      <audio
        ref={audioRef}
        preload="metadata"
        style={{ position: 'fixed', left: '-9999px', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />
      {children}
    </PlayerContext.Provider>
  );
}
