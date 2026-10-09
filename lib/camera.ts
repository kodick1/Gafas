export type CameraAccessErrorCode =
  | "secureContext"
  | "unsupported"
  | "permissionDenied"
  | "notFound"
  | "inUse"
  | "failed";

export class CameraAccessError extends Error {
  constructor(readonly code: CameraAccessErrorCode) {
    super(code);
    this.name = "CameraAccessError";
  }
}

export async function requestCameraStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (!window.isSecureContext) {
    throw new CameraAccessError("secureContext");
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new CameraAccessError("unsupported");
  }

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    const code: CameraAccessErrorCode =
      name === "NotAllowedError" || name === "SecurityError"
        ? "permissionDenied"
        : name === "NotFoundError" || name === "OverconstrainedError"
          ? "notFound"
          : name === "NotReadableError" || name === "AbortError"
            ? "inUse"
            : "failed";
    throw new CameraAccessError(code);
  }
}
