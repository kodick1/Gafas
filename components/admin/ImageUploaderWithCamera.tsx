"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle, Star, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ImageUploaderWithCameraProps = {
  images: File[];
  onChange: (images: File[]) => void;
  error?: string;
  maxImages?: number;
};

export function ImageUploaderWithCamera({ images, onChange, error, maxImages = 5 }: ImageUploaderWithCameraProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragDepthRef = useRef(0);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);
  const [dragging, setDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    const nextPreviews = images.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(nextPreviews);
    return () => nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [images]);

  useEffect(() => {
    if (!cameraOpen) return;
    let active = true;
    setCameraLoading(true);
    setCameraError("");

    async function openCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (reason) {
        if (active) setCameraError(reason instanceof Error ? reason.message : "No se pudo acceder a la cámara.");
      } finally {
        if (active) setCameraLoading(false);
      }
    }

    void openCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  function addImages(selectedFiles: FileList | File[]) {
    const files = Array.from(selectedFiles);
    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setFileError(`“${invalidFile.name}” no es un archivo de imagen.`);
      return;
    }
    const oversizedFile = files.find((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFile) {
      setFileError(`“${oversizedFile.name}” supera el límite de 10 MB.`);
      return;
    }
    const acceptedFiles = files.slice(0, maxImages - images.length);
    const combinedSize = [...images, ...acceptedFiles].reduce((total, file) => total + file.size, 0);
    if (combinedSize > 10 * 1024 * 1024) {
      setFileError("El tamaño total de las imágenes no puede superar 10 MB.");
      return;
    }
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setFileError(`Puedes cargar hasta ${maxImages} imágenes.`);
      return;
    }
    const accepted = files.slice(0, remaining);
    onChange([...images, ...accepted]);
    setFileError(files.length > remaining ? `Se agregaron ${remaining} imágenes. El máximo es ${maxImages}.` : "");
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("Espera a que la cámara muestre la imagen y vuelve a intentarlo.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("No se pudo preparar la imagen. Inténtalo de nuevo.");
      return;
    }
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      setCameraError("No se pudo capturar la foto. Inténtalo de nuevo.");
      return;
    }
    const filename = `foto-producto-${Date.now()}.jpg`;
    addImages([new File([blob], filename, { type: "image/jpeg", lastModified: Date.now() })]);
    setCameraOpen(false);
  }

  function closeCamera() {
    setCameraOpen(false);
    setCameraError("");
  }

  return (
    <div>
      <Card
        className={`relative overflow-hidden border-dashed p-5 transition sm:p-7 ${dragging ? "border-forest bg-[#f5f8f2] ring-2 ring-forest/10" : "border-slate-300"}`}
        onDragEnter={(event) => { event.preventDefault(); dragDepthRef.current += 1; setDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); dragDepthRef.current -= 1; if (dragDepthRef.current <= 0) { dragDepthRef.current = 0; setDragging(false); } }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); dragDepthRef.current = 0; setDragging(false); addImages(event.dataTransfer.files); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Seleccionar fotos de galería"
          onChange={(event) => { if (event.target.files) addImages(event.target.files); event.target.value = ""; }}
        />
        <button type="button" disabled={images.length >= maxImages} onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center text-center disabled:cursor-not-allowed">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb] text-forest"><ImagePlus size={21} /></span>
          <span className="mt-4 text-sm font-semibold">Arrastra imágenes o haz clic</span>
          <span className="mt-1 text-xs text-muted">Sube fotos del producto para mostrar sus detalles.</span>
          <span className="mt-2 text-[10px] text-muted">JPG, PNG, WEBP · Hasta {maxImages} fotos · 10 MB en total</span>
        </button>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" disabled={images.length >= maxImages} onClick={() => fileInputRef.current?.click()}><Upload size={15} />Subir de galería</Button>
          <Button type="button" variant="secondary" disabled={images.length >= maxImages} onClick={() => setCameraOpen(true)}><Camera size={15} />Tomar Foto</Button>
        </div>
        {fileError && <p role="alert" className="mt-3 text-xs text-amber-700">{fileError}</p>}
      </Card>

      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}

      {previews.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {previews.map(({ file, url }, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-canvas">
          <img src={url} alt={`Foto de producto${index === 0 ? " principal" : ""}: ${file.name}`} className="h-full w-full object-cover" />
          {index === 0
            ? <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-forest"><Star size={11} fill="currentColor" />Principal</span>
            : <button type="button" title="Usar como imagen principal" aria-label={`Usar ${file.name} como imagen principal`} className="absolute bottom-2 left-2 rounded-full bg-white/95 p-1.5 text-muted opacity-0 transition hover:text-forest focus:opacity-100 group-hover:opacity-100" onClick={() => onChange([file, ...images.filter((image) => image !== file)])}><Star size={13} /></button>}
          <button type="button" title="Eliminar imagen" aria-label={`Eliminar ${file.name}`} className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-ink shadow-sm opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" onClick={() => onChange(images.filter((image) => image !== file))}><X size={14} /></button>
        </div>)}
      </div>}

      {cameraOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCamera(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="camera-title" className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-line p-4 sm:p-5"><div><h2 id="camera-title" className="font-semibold">Tomar foto del producto</h2><p className="mt-1 text-xs text-muted">Permite el acceso a la cámara para capturar una imagen.</p></div><button type="button" aria-label="Cerrar cámara" onClick={closeCamera} className="rounded-full p-2 text-muted hover:bg-canvas"><X size={17} /></button></div>
          <div className="relative bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="aspect-video max-h-[55vh] w-full object-contain" />
            {cameraLoading && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white"><LoaderCircle className="mr-2 animate-spin" size={17} />Activando cámara...</span>}
          </div>
          {cameraError && <p role="alert" className="mx-4 mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700 sm:mx-5">{cameraError} Verifica los permisos del navegador y que la cámara esté disponible.</p>}
          <div className="flex justify-end gap-2 p-4 sm:p-5"><Button type="button" variant="secondary" onClick={closeCamera}>Cancelar</Button><Button type="button" disabled={cameraLoading || !!cameraError} onClick={() => void capturePhoto()}><Camera size={15} />Capturar</Button></div>
        </section>
      </div>}
    </div>
  );
}
