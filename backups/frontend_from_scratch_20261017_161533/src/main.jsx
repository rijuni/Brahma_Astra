import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import './design-system/globals.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
