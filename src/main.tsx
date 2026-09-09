import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './style.css';
import SceneBoundary from './scene/SceneBoundary';
createRoot(document.getElementById('root')!).render(<React.StrictMode><SceneBoundary><App/></SceneBoundary></React.StrictMode>);
