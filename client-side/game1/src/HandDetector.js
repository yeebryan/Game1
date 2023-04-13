import * as handpose from '@tensorflow-models/handpose';

export const HAND_GESTURES = {
  rock: 0,
  paper: 1,
  scissors: 2,
};

export async function loadModel() {
  const model = await handpose.load();
  return model;
}

export async function detectHandGesture(model, videoElement) {
  const predictions = await model.estimateHands(videoElement);

  if (predictions.length > 0) {
    const hand = predictions[0].annotations;

    const thumbIsOpen = hand.thumb[3][0] > hand.thumb[0][0];
    const indexFingerIsOpen = hand.indexFinger[3][0] > hand.indexFinger[0][0];
    const middleFingerIsOpen = hand.middleFinger[3][0] > hand.middleFinger[0][0];

    if (thumbIsOpen && indexFingerIsOpen && middleFingerIsOpen) {
      return HAND_GESTURES.paper;
    } else if (!thumbIsOpen && !indexFingerIsOpen && !middleFingerIsOpen) {
      return HAND_GESTURES.rock;
    } else if (!thumbIsOpen && indexFingerIsOpen && middleFingerIsOpen) {
      return HAND_GESTURES.scissors;
    }
  }

  return null;
}

export function getRandomComputerGesture() {
  return Math.floor(Math.random() * 3);
}
