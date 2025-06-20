import React from "react";
import { Routes,Route } from "react-router-dom";
import NavbarLogged from "./NavbarLogged";
import NavbarNotLogged from "./NavbarNotLogged";


const Navbar=()=>{
    return(
        <>
            <Routes>
                {/* <Route path="/:username/*" element={<NavbarLogged/>}/>  */}
                <Route path="/*" element={<NavbarNotLogged/>}/> 
            </Routes>
        </>
    )
}
export default Navbar;


