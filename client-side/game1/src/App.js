import '@tensorflow/tfjs-backend-webgl';
import React, { useEffect, useRef, useState } from 'react';
import { loadModel, detectHandGesture, getRandomComputerGesture, HAND_GESTURES } from './HandDetector';

const App = () => {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [result, setResult] = useState('');
  const [detectionEnabled, setDetectionEnabled] = useState(true);

  useEffect(() => {
    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play();
        });
      }
    }
    
    async function loadHandModel() {
      const model = await loadModel();
      setModel(model);
    }

    setupCamera();
    loadHandModel();
  }, []);

  useEffect(() => {
    if (!model || !detectionEnabled) {
      return;
    }

    let animationFrameId;
    async function detectGesture() {
      const gesture = await detectHandGesture(model, videoRef.current);

      if (gesture !== null) {
        setDetectionEnabled(false);
        const computerGesture = getRandomComputerGesture();
        const result = getGameResult(gesture, computerGesture);
        updateScore(result);
        displayResult(result);

        setTimeout(() => {
          setDetectionEnabled(true);
        }, 2000);
      }

      animationFrameId = requestAnimationFrame(detectGesture);
    }

    detectGesture();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [model, detectionEnabled]);

  function getGameResult(playerGesture, computerGesture) {
    if (playerGesture === computerGesture) {
      return 'draw';
    }

    if (
      (playerGesture === HAND_GESTURES.rock && computerGesture === HAND_GESTURES.scissors) ||
      (playerGesture === HAND_GESTURES.paper && computerGesture === HAND_GESTURES.rock) ||
      (playerGesture === HAND_GESTURES.scissors && computerGesture === HAND_GESTURES.paper)
    ) {
      return 'win';
    }

    return 'lose';
  }

  function updateScore(result) {
    setScore((prevScore) => {
      if (result === 'win') {
        return { ...prevScore, player: prevScore.player + 1 };
      } else if (result === 'lose') {
        return { ...prevScore, computer: prevScore.computer + 1 };
      }
      return prevScore;
    });
  }

  function displayResult(result) {
    setResult(result);
  }

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay />
      <h2>Player: {score.player}</h2>
      <h2>Computer: {score.computer}</h2>
      <h2>Result: {result}</h2>
    </div>
  );
};

export default App;
