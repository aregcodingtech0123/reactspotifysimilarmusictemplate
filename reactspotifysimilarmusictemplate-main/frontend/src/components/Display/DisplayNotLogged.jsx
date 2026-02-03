import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePageNotLogged from "../HomePage/HomePageNotLogged";
import AboutNotLogged from "../About/AboutNotLogged";
import SongDetailNotLogged from "../SongDetail/SongDetailNotLogged";
import TrendingSongsAll from "../TrendingMusic/TrendingSongsAll";
import SignUpPage from "../SignUpPage";
import LoginPage from "../LoginPage";
import DiscoverSongsList from "../DiscoverSongsList";
import AllSongsByCategory from "../AllSongsByCategory";


const DisplayNotLogged = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePageNotLogged />} />
      <Route path="/signup" element={<SignUpPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/about" element={<AboutNotLogged />} />
      <Route path="/song/:id" element={<SongDetailNotLogged />} />
      <Route path="/trendingsongsall" element={<TrendingSongsAll />} />
      <Route path="/discoveringsongs" element={<DiscoverSongsList/>}/>
      <Route path="/category/:category" element={<AllSongsByCategory/>}/>
    </Routes>
  );
};

export default DisplayNotLogged;
