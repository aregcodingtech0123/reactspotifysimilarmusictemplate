import React from "react";
import { Link } from 'react-router-dom';//Link bileşenini import et

const specialBtn = `
  bg-gradient-to-r from-purple-500 to-blue-500 
  hover:from-purple-600 hover:to-blue-600 
  focus:outline-none focus:ring-2 focus:ring-purple-300 
  active:bg-blue-700 px-6 py-3 my-3 rounded-lg text-white 
  font-semibold shadow-md transition duration-300 ease-in-out transform 
  hover:scale-105
`;

const SpecialBtn = ({ btnTxt, link }) => {
  return (
    <Link to={link} className={specialBtn}>
      {btnTxt}
    </Link>
  );
};

export default SpecialBtn;