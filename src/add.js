import React, { useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io();

const App = () => {
  useEffect(() => {
    socket.on('offer', offer => {
      socket.emit('answer', offer);
    });

    socket.on('iceCandidate', candidate => {
      if (peerConnection) {
        peerConnection.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  let localStream, peerConnection;

  const startCall = async () => {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioElement = document.createElement('audio');
      audioElement.srcObject = localStream;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);

      createPeerConnection();
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('iceCandidate', event.candidate);
      }
    };

    peerConnection.ontrack = event => {
      const remoteAudio = document.createElement('audio');
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.autoplay = true;
      document.body.appendChild(remoteAudio);
    };
  };

  const hangUpCall = () => {
    peerConnection.close();
    socket.close();
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl mb-6">Voice Call App</h1>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4" onClick={startCall}>
        Start Call
      </button>
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={hangUpCall}>
        Hang Up
      </button>
    </div>
  );
};

export default App;
