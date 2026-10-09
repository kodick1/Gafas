"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

type Landmark = { x: number; y: number; z?: number };
type Point = { x: number; y: number };

type VirtualTryOnProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  landmarker: FaceLandmarker | null;
  enabled: boolean;
  frameColor: string;
  onFaceDetected: (landmarks: Landmark[]) => void;
  onFaceLost: () => void;
};

const SMOOTHING_FRAMES = 5;

export function VirtualTryOn({
  videoRef,
  landmarker,
  enabled,
  frameColor,
  onFaceDetected,
  onFaceLost,
}: VirtualTryOnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onFaceDetected, onFaceLost });
  const frameColorRef = useRef(frameColor);

  useEffect(() => {
    callbacksRef.current = { onFaceDetected, onFaceLost };
  }, [onFaceDetected, onFaceLost]);

  useEffect(() => {
    frameColorRef.current = frameColor;
  }, [frameColor]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!enabled || !landmarker || !video || !canvas || !context) return;

    let animationFrame = 0;
    let lastVideoTime = -1;
    let missedFrames = 0;
    let faceVisible = false;
    const recentFrames: Point[][] = [];
    const glassesSprite = document.createElement("canvas");
    glassesSprite.width = 400;
    glassesSprite.height = 136;
    const spriteContext = glassesSprite.getContext("2d");
    if (!spriteContext) return;

    const drawGlasses = (landmarks: Landmark[]) => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const point = (index: number): Point => ({
        x: (1 - landmarks[index].x) * width,
        y: landmarks[index].y * height,
      });

      const leftEyeOuter = point(33);
      const leftEyeInner = point(133);
      const rightEyeInner = point(362);
      const rightEyeOuter = point(263);
      const noseBridge = point(168);
      const leftTemple = point(127);
      const rightTemple = point(356);
      const currentFrame = [
        leftEyeOuter,
        leftEyeInner,
        rightEyeInner,
        rightEyeOuter,
        noseBridge,
        leftTemple,
        rightTemple,
      ];

      recentFrames.push(currentFrame);
      if (recentFrames.length > SMOOTHING_FRAMES) recentFrames.shift();
      const averagePoint = (index: number): Point => ({
        x: recentFrames.reduce((sum, frame) => sum + frame[index].x, 0) / recentFrames.length,
        y: recentFrames.reduce((sum, frame) => sum + frame[index].y, 0) / recentFrames.length,
      });

      const smoothed = currentFrame.map((_, index) => averagePoint(index));
      const [leftOuter, leftInner, rightInner, rightOuter, bridge, templeLeft, templeRight] = smoothed;
      const eyeCenters = [
        {
          x: (leftOuter.x + leftInner.x) / 2,
          y: (leftOuter.y + leftInner.y) / 2,
        },
        {
          x: (rightInner.x + rightOuter.x) / 2,
          y: (rightInner.y + rightOuter.y) / 2,
        },
      ].sort((first, second) => first.x - second.x);
      const [leftEyeCenter, rightEyeCenter] = eyeCenters;
      const eyeDistance = Math.hypot(
        rightOuter.x - leftOuter.x,
        rightOuter.y - leftOuter.y,
      );
      const eyeCenterDistance = Math.hypot(
        rightEyeCenter.x - leftEyeCenter.x,
        rightEyeCenter.y - leftEyeCenter.y,
      );
      const templeDistance = Math.hypot(templeRight.x - templeLeft.x, templeRight.y - templeLeft.y);
      if (!eyeDistance || !eyeCenterDistance || !templeDistance) return;

      const angle = Math.atan2(rightEyeCenter.y - leftEyeCenter.y, rightEyeCenter.x - leftEyeCenter.x);
      const glassesWidth = Math.max(templeDistance * 1.04, eyeDistance * 2.15);
      const scale = glassesWidth / glassesSprite.width;
      const glassesHeight = glassesSprite.height * scale;
      const spriteEyeDistance = eyeCenterDistance / scale;
      const lensGap = spriteEyeDistance * 0.24;
      const lensWidth = Math.min(spriteEyeDistance * 0.92, (glassesSprite.width * 0.84 - lensGap) / 2);
      const lensHeight = glassesSprite.height * 0.72;
      const lensTop = (glassesSprite.height - lensHeight) / 2;
      const leftLensX = glassesSprite.width / 2 - spriteEyeDistance / 2 - lensWidth / 2;
      const rightLensX = glassesSprite.width / 2 + spriteEyeDistance / 2 - lensWidth / 2;
      const frameThickness = glassesSprite.width * 0.025;
      const bridgeOffsetY = glassesHeight * 0.4;

      context.clearRect(0, 0, width, height);
      spriteContext.clearRect(0, 0, glassesSprite.width, glassesSprite.height);
      spriteContext.lineWidth = frameThickness;
      spriteContext.lineJoin = "round";
      spriteContext.strokeStyle = frameColorRef.current;
      spriteContext.fillStyle = `${frameColorRef.current}30`;

      spriteContext.beginPath();
      spriteContext.roundRect(leftLensX, lensTop, lensWidth, lensHeight, lensHeight * 0.28);
      spriteContext.roundRect(rightLensX, lensTop, lensWidth, lensHeight, lensHeight * 0.28);
      spriteContext.fill();
      spriteContext.stroke();

      spriteContext.beginPath();
      spriteContext.moveTo(leftLensX + lensWidth, glassesSprite.height / 2);
      spriteContext.quadraticCurveTo(
        glassesSprite.width / 2,
        glassesSprite.height * 0.42,
        rightLensX,
        glassesSprite.height / 2,
      );
      spriteContext.stroke();

      spriteContext.beginPath();
      spriteContext.moveTo(leftLensX, lensTop + lensHeight * 0.2);
      spriteContext.lineTo(leftLensX - glassesSprite.width * 0.09, glassesSprite.height * 0.28);
      spriteContext.moveTo(rightLensX + lensWidth, lensTop + lensHeight * 0.2);
      spriteContext.lineTo(rightLensX + lensWidth + glassesSprite.width * 0.09, glassesSprite.height * 0.28);
      spriteContext.stroke();

      context.save();
      context.translate(bridge.x, bridge.y - bridgeOffsetY);
      context.rotate(angle);
      context.scale(scale, scale);
      context.drawImage(glassesSprite, -glassesSprite.width / 2, -glassesSprite.height / 2);
      context.restore();
    };

    const render = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        const landmarks = result.faceLandmarks[0] as Landmark[] | undefined;
        if (landmarks && landmarks.length >= 468) {
          missedFrames = 0;
          faceVisible = true;
          callbacksRef.current.onFaceDetected(landmarks);
          drawGlasses(landmarks);
        } else {
          missedFrames += 1;
          if (missedFrames >= SMOOTHING_FRAMES) {
            recentFrames.length = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (faceVisible) callbacksRef.current.onFaceLost();
            faceVisible = false;
          }
        }
      }
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrame);
      recentFrames.length = 0;
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled, landmarker, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-cover ${enabled ? "block" : "hidden"}`}
    />
  );
}
