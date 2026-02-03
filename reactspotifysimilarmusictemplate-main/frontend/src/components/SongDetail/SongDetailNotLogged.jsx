import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const SongDetail = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gerçek bir uygulamada burada API çağrısı yapılabilir
    // Örnek veri oluşturuyoruz
    const fetchSong = () => {
      const songData = {
        1: {
          id: 1,
          imageUrl: "/api/placeholder/400/320",
          title: "Hit Pop Album",
          artist: "The Pop Stars",
          releaseDate: "2024-01-15",
          description: "The latest chart-topping album from The Pop Stars featuring catchy melodies and energetic performances."
        },
        2: {
          id: 2,
          imageUrl: "/api/placeholder/400/320",
          title: "Rock Legends",
          artist: "The Rockers",
          releaseDate: "2023-11-20",
          description: "A powerful collection of rock anthems that showcase The Rockers' extraordinary talent and energy."
        },
        3: {
          id: 3,
          imageUrl: "/api/placeholder/400/320",
          title: "Smooth Jazz",
          artist: "Jazz Quartet",
          releaseDate: "2024-02-05",
          description: "A soulful journey through classic and modern jazz compositions performed with exceptional skill."
        }
      };

      setTimeout(() => {
        setSong(songData[id]);
        setLoading(false);
      }, 500); // Yükleme durumunu simüle etmek için kısa bir gecikme
    };

    fetchSong();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl text-white mb-4">Song not found</h1>
          <Link to="/" className="text-blue-400 hover:underline">
            ← Back to Trending Music
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img src={song.imageUrl} alt={song.title} className="w-full h-64 object-cover" />
          </div>
          <div className="p-6 md:w-2/3">
            <Link to="/" className="text-blue-400 hover:underline block mb-4">
              ← Back to Trending Music
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">{song.title}</h1>
            <p className="text-xl text-gray-300 mb-4">by {song.artist}</p>
            <p className="text-gray-400 mb-4">Released: {song.releaseDate}</p>
            <div className="bg-gray-700 p-4 rounded">
              <h2 className="text-xl text-white mb-2">Description</h2>
              <p className="text-gray-300">{song.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetail;