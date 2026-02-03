import React from "react";
import UsersListenAgainList from "../UsersMusic/UsersListenAgainList"
import TrendingSongList from "../TrendingMusic/TrendingSongList";
import HeroLogged from "./HeroPart/HeroLogged";
import SongsByMoodList from "../SongsByMoodList";
import DiscoverSongsList from "../DiscoverSongsList";
const HomePageLogged=()=>{
    return(
        <div>
            <HeroLogged/>
            <UsersListenAgainList isLogged={true}/>
            <SongsByMoodList isLogged={true}/>
            <DiscoverSongsList isLogged={true}/>
            <TrendingSongList isLogged={true}/>
        </div>
    )
}
export default HomePageLogged