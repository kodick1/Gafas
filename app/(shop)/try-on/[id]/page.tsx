"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { ArrowLeft, Camera, CameraOff, Check, RotateCcw } from "lucide-react";
import { products } from "@/lib/products";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocaleText } from "@/hooks/use-locale-text";
import { CameraAccessError, requestCameraStream } from "@/lib/camera";

type Landmark = { x: number; y: number };
type ScreenPoint = { x: number; y: number };

export default function TryOnPage() {
  const t = useLocaleText("tryOn");
  const tCommon = useLocaleText("common");
  const params = useParams<{ id: string }>();
  const query = useProducts();
  const product = query.data?.find((item) => item.id === params.id) ?? products[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>(0);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const missedFramesRef = useRef(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(t("start"));
  const [error, setError] = useState("");
  const [overlay, setOverlay] = useState<{ x: number; y: number; scale: number; angle: number } | null>(null);
  const [faceShape, setFaceShape] = useState("analizando");
  const [match, setMatch] = useState(95);

  function analyze(landmarks: Landmark[]) {
    const forehead = landmarks[10];
    const chin = landmarks[152];
    const jaw = Math.abs(landmarks[234].x - landmarks[454].x);
    const faceHeight = Math.abs(chin.y - forehead.y);
    const ratio = faceHeight ? jaw / faceHeight : 0.62;
    const shape = ratio > 0.78 ? "redondo" : ratio < 0.56 ? "ovalado" : "cuadrado";
    setFaceShape(shape);
    setMatch(product.faceShapes.includes(shape) ? 95 : 87);
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight || !video.clientWidth || !video.clientHeight) return;

    const scale = Math.max(video.clientWidth / video.videoWidth, video.clientHeight / video.videoHeight);
    const renderedWidth = video.videoWidth * scale;
    const renderedHeight = video.videoHeight * scale;
    const cropX = (video.clientWidth - renderedWidth) / 2;
    const cropY = (video.clientHeight - renderedHeight) / 2;
    const toScreenPoint = (point: Landmark): ScreenPoint => ({
      x: 1 - (point.x * renderedWidth + cropX) / video.clientWidth,
      y: (point.y * renderedHeight + cropY) / video.clientHeight,
    });
    const leftEye = toScreenPoint(landmarks[33]);
    const rightEye = toScreenPoint(landmarks[263]);
    const centerX = (leftEye.x + rightEye.x) / 2;
    const centerY = (leftEye.y + rightEye.y) / 2;
    const eyeDistance = Math.hypot(
      (rightEye.x - leftEye.x) * video.clientWidth,
      (rightEye.y - leftEye.y) * video.clientHeight,
    );
    setOverlay({
      x: centerX * 100,
      y: centerY * 100,
      scale: eyeDistance * 1.5 / 210,
      angle: Math.atan2(
        (rightEye.y - leftEye.y) * video.clientHeight,
        (rightEye.x - leftEye.x) * video.clientWidth,
      ) * 180 / Math.PI,
    });
  }

  async function startCamera() {
    setLoading(true);
    setError("");
    try {
      const stream = await requestCameraStream({ video: { facingMode: "user" }, audio: false });
      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach((track) => track.stop()); return; }
      video.srcObject = stream;
      await video.play();
      setCameraOn(true);
      setMessage(t("center"));
      const fileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
      landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: "GPU" },
        runningMode: "VIDEO",
        numFaces: 1,
      });
      setMessage(t("adjust"));
      const detect = () => {
        const currentVideo = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (currentVideo && landmarker && currentVideo.readyState >= 2) {
          const result = landmarker.detectForVideo(currentVideo, performance.now());
          if (result.faceLandmarks[0]) {
            missedFramesRef.current = 0;
            analyze(result.faceLandmarks[0]);
          } else {
            missedFramesRef.current += 1;
            if (missedFramesRef.current > 15) setOverlay(null);
            setMessage(t("notFound"));
          }
        }
        animationRef.current = requestAnimationFrame(detect);
      };
      animationRef.current = requestAnimationFrame(detect);
    } catch (reason) {
      const video = videoRef.current;
      if (video?.srcObject) (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
      setCameraOn(false);
      setError(reason instanceof CameraAccessError ? tCommon(`camera.${reason.code}`) : tCommon("modelError"));
    } finally {
      setLoading(false);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(animationRef.current);
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    missedFramesRef.current = 0;
    const video = videoRef.current;
    if (video?.srcObject) (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    if (video) video.srcObject = null;
    setCameraOn(false);
    setOverlay(null);
    setMessage(t("start"));
  }

  useEffect(() => () => {
    cancelAnimationFrame(animationRef.current);
    landmarkerRef.current?.close();
    const video = videoRef.current;
    if (video?.srcObject) (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
  }, []);

  if (query.isPending) return <main className="container-width grid gap-7 py-8 lg:grid-cols-[1fr_330px]"><Skeleton className="min-h-[68vh] rounded-3xl" /><Skeleton className="h-96 rounded-2xl" /></main>;
  if (query.isError) return <main className="container-width py-10"><Card><ErrorState onRetry={() => void query.refetch()} /></Card></main>;
  if (!query.data?.some((item) => item.id === params.id)) return <main className="container-width py-20 text-center"><h1 className="text-2xl font-semibold">{t("notFoundProduct")}</h1><Link href="/shop" className="mt-4 inline-block text-sm text-forest underline">{t("back", { name: product.name })}</Link></main>;

  return <main className="container-width py-7 sm:py-10">
    <Link href={`/product/${product.id}`} className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-muted"><ArrowLeft size={14} /> {t("back", { name: product.name })}</Link>
    <div className="grid gap-7 lg:grid-cols-[1fr_330px]">
      <section className="relative flex min-h-[68vh] items-center justify-center overflow-hidden rounded-3xl bg-[#26342f] sm:min-h-[620px]">
        <video ref={videoRef} playsInline muted className={`absolute inset-0 h-full w-full object-cover ${cameraOn ? "block -scale-x-100" : "hidden"}`} />
        {!cameraOn && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#496256_0%,#26342f_72%)]" />}
        {!overlay && <div className="pointer-events-none absolute left-1/2 top-1/2 h-[310px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-[48%] border border-white/25 sm:h-[400px] sm:w-[310px]"><span className="absolute -left-1 -top-1 h-7 w-7 rounded-tl-2xl border-l-2 border-t-2 border-lime" /><span className="absolute -right-1 -top-1 h-7 w-7 rounded-tr-2xl border-r-2 border-t-2 border-lime" /><span className="absolute -bottom-1 -left-1 h-7 w-7 rounded-bl-2xl border-b-2 border-l-2 border-lime" /><span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-br-2xl border-b-2 border-r-2 border-lime" /></div>}
        {overlay && <div className={`product-shape pointer-events-none absolute z-10 ${product.color === "olive" ? "glasses-color-olive" : product.color === "honey" ? "glasses-color-honey" : product.color === "burgundy" ? "glasses-color-burgundy" : "glasses-color-black"}`} style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, transform: `translate(-50%,-50%) rotate(${overlay.angle}deg) scale(${overlay.scale})`, transformOrigin: "center" }}><div className="product-lens" /><div className="product-lens" /></div>}
        {!cameraOn && <div className="relative text-center text-white"><Camera className="mx-auto mb-3 text-lime" size={26} /><p className="text-sm font-medium">{tCommon("tryCamera")}</p><p className="mt-1 text-xs text-white/60">{tCommon("wellLit")}</p></div>}
        <div className="absolute left-4 right-4 top-4 flex justify-between"><span className="rounded-full bg-black/30 px-3 py-2 text-[10px] text-white backdrop-blur">{message}</span><span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 text-[10px] text-white backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-lime" />{tCommon("liveVto")}</span></div>
        {cameraOn && <button aria-label={t("activate")} onClick={() => { stopCamera(); void startCamera(); }} className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white"><RotateCcw size={16} /></button>}
      </section>
      <aside className="flex flex-col rounded-2xl border border-line bg-white p-5 sm:p-6">
        <p className="eyebrow text-forest">{t("eyebrow")}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</h1><p className="mt-2 text-sm leading-5 text-muted">{t("description", { name: product.name })}</p>
        <div className="my-6 flex items-center gap-4 rounded-xl bg-canvas p-3"><div className="flex h-14 w-16 items-center justify-center rounded-lg bg-[#e7ece4]"><div className="product-shape scale-[.28]"><div className={`product-lens glasses-color-${product.color}`} /><div className={`product-lens glasses-color-${product.color}`} /></div></div><span><strong className="block text-sm">{product.name}</strong><small className="mt-1 block text-xs text-muted">{product.colorName}</small></span></div>
        <div className="border-y border-line py-5"><div className="flex items-center justify-between"><span className="text-sm font-semibold">{t("compatibility")}</span>{overlay && <span className="flex items-center gap-1 text-xs text-forest"><Check size={13} /> {t("analysis")}</span>}</div>{overlay ? <><div className="mt-4 flex items-end gap-2"><span className="text-4xl font-semibold tracking-tight">{match}%</span><span className="pb-1 text-xs text-muted">{t("matchWithFace")}</span></div><div className="mt-3 h-1.5 rounded-full bg-canvas"><div className="h-full rounded-full bg-forest transition-all" style={{ width: `${match}%` }} /></div><p className="mt-3 text-xs text-muted">{t("shape", { shape: t(faceShape === "redondo" ? "shapeRound" : faceShape === "ovalado" ? "shapeOval" : "shapeSquare") })}</p></> : <p className="mt-2 text-xs leading-5 text-muted">{t("activateDescription")}</p>}</div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>}
        <div className="mt-auto pt-6">{cameraOn ? <Button className="w-full" variant="secondary" onClick={stopCamera}><CameraOff size={16} />{t("turnOff")}</Button> : <Button className="w-full" onClick={() => void startCamera()} disabled={loading}><Camera size={16} />{loading ? t("loading") : t("activate")}</Button>}
          <Link href={`/product/${product.id}`} className="mt-3 flex h-11 items-center justify-center rounded-full text-sm font-semibold text-forest hover:bg-[#edf2eb]">Ver detalles y comprar</Link>
          <Link href="/shop" className="mt-2 block text-center text-xs text-muted underline">{t("other")}</Link>
        </div>
      </aside>
    </div>
  </main>;
}
