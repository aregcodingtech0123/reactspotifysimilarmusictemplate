import React from 'react';
import HeroLogged from './HeroPart/HeroLogged';
import MusicSection from '../MusicSection';
import { GENRES } from '../../constants/genres';

const HomePageLogged = () => {
  return (
    <div>
      <HeroLogged />

      <MusicSection
        title="Listen Again"
        endpoint="/history"
        limit={10}
        genresList={GENRES}
        emptyMessage="No songs yet – start listening to see them here!"
        seeMoreSectionKey="history"
      />

      {/* Backend uses /recommend; if yours uses /recommendations, set endpoint="/recommendations" */}
      <MusicSection
        title="Recommended for You"
        endpoint="/recommend"
        genresList={GENRES}
        emptyMessage="Listen to a few songs to get personalized picks!"
        seeMoreSectionKey="recommended"
      />

      <MusicSection
        title="Discover more songs"
        endpoint="/songs"
        genresList={GENRES}
        emptyMessage="Discover new music below."
        seeMoreSectionKey="discover"
      />

      <MusicSection
        title="Trending Music"
        endpoint="/trending"
        genresList={GENRES}
        emptyMessage="Trending songs will appear here."
        seeMoreSectionKey="trending"
      />
    </div>
  );
};

export default HomePageLogged;
