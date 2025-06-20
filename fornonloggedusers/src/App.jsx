// // App.jsx
// import React from 'react';
// import { BrowserRouter as Router } from 'react-router-dom';
// import NavbarNotLogged from './components/Navbar/NavbarNotLogged';
// import Footer from './components/Footer';
// import Display from './components/Display/Display';
// import Navbar from './components/Navbar/Navbar';
// import Chatbot from './components/Chatbot'; // Chatbot bileşenini içe aktar

// const App = () => {
//   return (
//     <Router>
//       <div className="flex flex-col min-h-screen">
//         <Navbar />
//         <div className="flex-grow">
//           <Display />
//         </div>
//         <Footer />
//         <Chatbot /> 
//       </div>
//     </Router>
//   );
// };

// export default App;


import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavbarNotLogged from './components/Navbar/NavbarNotLogged';
import Footer from './components/Footer';
import Display from './components/Display/Display';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/SideBar'; // Sidebar bileşenini içe aktar
import Chatbot from './components/Chatbot';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#121826]"> {/* Arka plan rengi eklendi */}
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* This would be fixed height */}
        <div className="flex flex-1">
          <Sidebar />
          <Display />
        </div>
      </div>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
};

export default App;