"use client";

import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Check, LoaderCircle, MousePointer2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleText } from "@/hooks/use-locale-text";

type Landmark = { x: number; y: number };
type Point = { x: number; y: number };

export function DipMeasurer({ onClose, onComplete }: { onClose: () => void; onComplete: (dip: number) => void }) {
  const t = useLocaleText("checkout");
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const pointsRef = useRef<Point[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [dip, setDip] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(t("dipInitial"));

  useEffect(() => {
    let stream: MediaStream | null = null;
    let active = true;
    async function prepareCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        const video = videoRef.current;
        if (!video || !active) { stream.getTracks().forEach((track) => track.stop()); return; }
        video.srcObject = stream;
        await video.play();
        const fileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (!active) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setLoading(false);
        const detect = () => {
          const currentVideo = videoRef.current;
          if (currentVideo && landmarkerRef.current && currentVideo.readyState >= 2) {
            const result = landmarkerRef.current.detectForVideo(currentVideo, performance.now());
            const face = result.faceLandmarks[0] as Landmark[] | undefined;
            const currentPoints = pointsRef.current;
            if (face && currentPoints.length === 2) {
              const eyeDistance = Math.hypot((face[362].x - face[133].x) * currentVideo.videoWidth, (face[362].y - face[133].y) * currentVideo.videoHeight);
              const cardDistance = Math.hypot((currentPoints[1].x - currentPoints[0].x) * currentVideo.videoWidth, (currentPoints[1].y - currentPoints[0].y) * currentVideo.videoHeight);
              if (cardDistance > 0) {
                const measured = Math.round((eyeDistance / cardDistance) * 85.6);
                if (measured >= 35 && measured <= 85) {
                  setDip((previous) => previous === measured ? previous : measured);
                  setMessage(t("dipReady"));
                } else {
                  setDip(null);
                  setMessage(t("dipAdjust"));
                }
              }
            } else if (!face) {
              setDip(null);
              setMessage(t("dipNoFace"));
            }
          }
          animationRef.current = requestAnimationFrame(detect);
        };
        animationRef.current = requestAnimationFrame(detect);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : t("dipError"));
        setLoading(false);
        if (stream) stream.getTracks().forEach((track) => track.stop());
      }
    }
    void prepareCamera();
    return () => {
      active = false;
      cancelAnimationFrame(animationRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleVideoClick(event: React.MouseEvent<HTMLVideoElement>) {
    if (loading || error) return;
    if (pointsRef.current.length === 2) { pointsRef.current = []; setPoints([]); setDip(null); return; }
    const bounds = event.currentTarget.getBoundingClientRect();
    const point = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    const next = [...pointsRef.current, point];
    pointsRef.current = next;
    setPoints(next);
    setMessage(next.length === 1 ? t("dipSecondPoint") : t("dipMeasuring"));
  }

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="dip-title" className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-line p-5"><div><p className="eyebrow text-forest">{t("dipEyebrow")}</p><h2 id="dip-title" className="mt-1 text-xl font-semibold">{t("dipTitle")}</h2></div><button aria-label={t("dipClose")} onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-canvas"><X size={17} /></button></div>
      <div className="p-5">
        <div className="relative overflow-hidden rounded-xl bg-[#26342f]">
          <video ref={videoRef} playsInline muted onClick={handleVideoClick} className="block h-auto max-h-[55vh] w-full cursor-crosshair object-contain" />
          <div className="pointer-events-none absolute inset-x-3 top-3 rounded-full bg-black/35 px-3 py-2 text-center text-[11px] text-white">{loading ? t("dipPreparing") : message}</div>
          {points.map((point, index) => <span key={index} className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lime bg-forest/70" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-white">{index + 1}</span></span>)}
          {!loading && !error && <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1.5 text-[10px] text-white"><MousePointer2 size={12} /> {t("dipPointInstruction")}</span>}
          {loading && <LoaderCircle className="absolute left-1/2 top-1/2 animate-spin text-white" />}
        </div>
        {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">{error} {t("cameraPermissions")}</p> : <p className="mt-3 text-xs leading-5 text-muted">{t("dipDirections")}</p>}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-canvas p-3"><span><span className="block text-xs text-muted">{t("dipEstimate")}</span><strong className="mt-1 block text-xl">{dip ? `${dip} mm` : "— mm"}</strong></span><Button variant="secondary" size="sm" onClick={() => { pointsRef.current = []; setPoints([]); setDip(null); setMessage(t("dipRetry")); }} disabled={!points.length}><RotateCcw size={14} />{t("dipRecalibrate")}</Button></div>
        <div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>{t("dipCancel")}</Button><Button disabled={!dip || loading} onClick={() => { if (dip) { onComplete(dip); onClose(); } }}><Check size={14} />{t("dipUse")} {dip ? `${dip} mm` : t("dipMeasurement")}</Button></div>
      </div>
    </div>
  </div>;
}
