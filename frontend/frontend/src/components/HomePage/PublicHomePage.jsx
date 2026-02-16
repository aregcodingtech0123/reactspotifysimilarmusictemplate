import React from 'react';
import PublicHeroSection from './HeroPart/PublicHeroSection';
import PopularMusicSection from '../Sections/PopularMusicSection';
import TrendingMusicSection from '../Sections/TrendingMusicSection';
import PopularArtistsSection from '../Sections/PopularArtistsSection';
import PopularAlbumsSection from '../Sections/PopularAlbumsSection';

const PublicHomePage = () => {
  return (
    <div data-testid="public-homepage" className="min-h-screen bg-gray-900">
      <PublicHeroSection />
      <PopularMusicSection />
      <TrendingMusicSection />
      <PopularArtistsSection />
      <PopularAlbumsSection />
    </div>
  );
};

export default PublicHomePage;
