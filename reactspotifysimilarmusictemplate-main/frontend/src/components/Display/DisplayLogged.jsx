import React from "react";
import { Routes, Route } from "react-router-dom";
import AboutLogged from "../About/AboutLogged";
import HomePageLogged from "../HomePage/HomePageLogged";
import Profile from "../Profile/Profile";
import SongDetailLogged from "../SongDetail/SongDetailLogged";
import TrendingSongsAll from "../TrendingMusic/TrendingSongsAll";

import DiscoverSongsList from "../DiscoverSongsList";
import AllSongsByCategory from "../AllSongsByCategory";
import ProfileSettings from "../Profile/ProfileSettings";
import UsersLikedSongs from "../UsersMusic/UsersLikedSongs";
import UsersSongHistory from "../UsersMusic/UsersSongHistory";

const DisplayLogged = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePageLogged />} />
      <Route path="/about" element={<AboutLogged />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profilesettings" element={<ProfileSettings />} />
      <Route path="/songdetail/:id" element={<SongDetailLogged />} />
      <Route path="/trendingsongsall" element={<TrendingSongsAll/>} />      
      <Route path="/discoveringsongs" element={<DiscoverSongsList/>}/>
      <Route path="/category/:category" element={<AllSongsByCategory/>}/>
      <Route path="/likedsongs" element={<UsersLikedSongs/>}/>
      <Route path="/history" element={<UsersSongHistory/>}/>
    </Routes>
  );
};

export default DisplayLogged;