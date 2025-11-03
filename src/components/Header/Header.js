// src/components/Header/Header.js
import React from 'react';
import "./Header.scss";
import Navbar from "../Navbar/Navbar";

const Header = () => {
  return (
    <header className='header'>
      <div className='header-wrapper'>
        <div className='header-main'>
          <div className='container'>
            <Navbar />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;