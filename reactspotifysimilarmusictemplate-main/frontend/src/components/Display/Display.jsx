import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DisplayLogged from "./DisplayLogged";
import DisplayNotLogged from "./DisplayNotLogged";


const Display = () => {


    return (
        <div className="flex-1 transition-all duration-300">
        <Routes>
            <Route path="/:username/*" element={<DisplayLogged />} /> 
            {/* <Route path="/*" element={<DisplayNotLogged />} /> */}
        </Routes>
        </div>
    );
}

export default Display