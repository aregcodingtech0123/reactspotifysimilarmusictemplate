import React from "react";
import HeroLogged from "./HeroPart/HeroNotLogged";
import TrendingSongList from "../TrendingMusic/TrendingSongList";
import DiscoverSongsList from "../DiscoverSongsList";
import SongsByMoodList from "../SongsByMoodList";

const HomePageNotLogged=()=>{
    return(
        <div>
            <HeroLogged />
            <DiscoverSongsList isLogged={false}/>
            <SongsByMoodList isLogged={false}/>
            <TrendingSongList isLogged={false}/>
        </div>
    )
}
export default HomePageNotLogged