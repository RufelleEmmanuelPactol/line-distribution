import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import image from './image.jpg'

const MultipleTimers = App.MultipleTimers;
const Imagery = App.Imagery;
const vizMode = false;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      {vizMode ? "<Imagery image={image}/>" : ""}
    <MultipleTimers />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
