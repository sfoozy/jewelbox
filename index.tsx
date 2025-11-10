import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import JewelBox from './src/JewelBox';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <JewelBox />
  </React.StrictMode>
);
