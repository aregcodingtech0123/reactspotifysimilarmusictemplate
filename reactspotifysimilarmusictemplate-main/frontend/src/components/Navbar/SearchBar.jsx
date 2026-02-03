import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-full max-w-md px-2">
      <div className="flex items-center gap-3 border rounded-2xl px-3 py-2 shadow-sm bg-white">
        <FaSearch className="w-5 h-5 cursor-pointer text-gray-500" />
        <input 
          className="w-full outline-none bg-transparent text-sm md:text-base" 
          type="text" 
          placeholder="Search..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
export default SearchBar