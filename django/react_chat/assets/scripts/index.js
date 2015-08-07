import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import { createApp } from 'app/App';

window.initialize = function initialize(state) {
  ReactDOM.render(createApp(state), document.querySelector('.container'));
};
