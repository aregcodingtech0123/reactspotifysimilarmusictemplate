import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = ({ song, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Start playing when component mounts
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Playback failed:", error);
        // Modern browsers require user interaction before audio can play
        setIsPlaying(false);
      });
    }

    // Set up event listeners
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      // Clean up event listeners
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.pause();
    };
  }, [song.id]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    // Reset current track or implement previous track logic
    audioRef.current.currentTime = 0;
  };

  const handleNext = () => {
    // Implement next track logic
    console.log("Next track");
  };

  const handleSeek = (e) => {
    const newTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleClose = () => {
    audioRef.current.pause();
    onClose();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 text-white p-2 shadow-lg border-t border-gray-800 z-40 transition-all duration-300 ease-in-out">
      {/* z-index'i 40 olarak ayarladık, böylece sidebar menü genellikle 50 z-index'inde çalıştığında üstte kalabilir */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-3 w-1/4">
          <img 
            src={song.imageUrl} 
            alt={song.title} 
            className="h-12 w-12 object-cover rounded"
          />
          <div className="truncate">
            <p className="font-medium truncate">{song.title}</p>
            <p className="text-gray-400 text-sm truncate">{song.artist}</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white transition"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={togglePlayPause}
              className="bg-white rounded-full p-2 hover:bg-gray-200 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m-9-8h14" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={handleNext}
              className="text-gray-400 hover:text-white transition"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="w-full flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <div 
              className="h-1 flex-1 bg-gray-700 rounded-full cursor-pointer relative"
              onClick={handleSeek}
            >
              <div 
                className="absolute h-full bg-blue-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume and Close Controls */}
        <div className="flex items-center space-x-4 w-1/4 justify-end">
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close player"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Audio element - hidden */}
      <audio 
        ref={audioRef}
        src={`/api/songs/${song.id}`} // Replace with your actual audio URL
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default MusicPlayer;