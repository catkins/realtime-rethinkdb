import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import io from 'socket.io-client';

// without args this connects to the current host and port
const socket = io.connect();

ReactDOM.render(
  <App socket={socket} />, document.getElementById('root')
);
