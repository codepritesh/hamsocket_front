import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const App = () => {
  const [localStream, setLocalStream] = useState(null);
  const [localPeerConnection, setLocalPeerConnection] = useState(null);

  useEffect(() => {
    
    socket.on('offer', offer => {
      socket.emit('answer', offer);
    });

    socket.on('iceCandidate', candidate => {
      if (localPeerConnection) {
        localPeerConnection.addIceCandidate(candidate);
      }
    });
    return () => {
      if (socket.readyState === 1) { // <-- This is important
        socket.disconnect();
        socket.close();
      }
  };
  }, [localPeerConnection]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      const audioElement = document.createElement('audio');
      audioElement.srcObject = stream;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);

      setLocalStream(stream);

      createPeerConnection()
      console.log('localStream',localStream)
      localStream.getTracks().forEach(track => localPeerConnection.addTrack(track, localStream));
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = event => {
      console.log('event123',event)
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

    setLocalPeerConnection(peerConnection);
  };

  const hangUpCall = () => {
    localPeerConnection.close();
    socket.close();
    window.location.reload();
  };

  return (
    
    <div className="flex flex-col items-center justify-center h-screen border-8 border-red-50">
    <h1 className="text-3xl mb-6 border-8 border-green-500">Voice Call App</h1>
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 border-8 border-blue-500" onClick={startCall}>
      Start Call
    </button>
    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border-8 border-violet-500" onClick={hangUpCall}>
      Hang Up
    </button>
  </div>
  );
};

export default App;
