import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, StopCircle, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
    onCapture: (file: File, type: 'image' | 'video') => void;
    onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [preview, setPreview] = useState<{ url: string; file: File; type: 'image' | 'video' } | null>(null);

    // Start camera
    const startCamera = useCallback(async (mode: 'user' | 'environment') => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode },
                audio: true
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Camera access denied or unavailable", err);
        }
    }, [stream]);

    useEffect(() => {
        startCamera(facingMode);
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    // Flip camera
    const flipCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    // Capture Photo
    const takePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const url = URL.createObjectURL(blob);
                    setPreview({ url, file, type: 'image' });
                }
            }, 'image/jpeg', 0.9);
        }
    };

    // Video Recording
    const startRecording = () => {
        if (!stream) return;
        chunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setPreview({ url, file, type: 'video' });
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleApprove = () => {
        if (preview) {
            onCapture(preview.file, preview.type);
        }
        onClose();
    };

    const handleRetake = () => {
        setPreview(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center safe-area-bottom"
        >
            {/* Top Bar */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={onClose} className="text-white p-2 bg-black/30 rounded-full hover:bg-black/50 transition">
                    <X className="h-6 w-6" />
                </button>
                {!preview && (
                    <button onClick={flipCamera} className="text-white p-2 bg-black/30 rounded-full hover:bg-black/50 transition">
                        <RefreshCw className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* Main Viewport */}
            <div className="flex-1 w-full bg-black relative flex items-center justify-center overflow-hidden">
                {preview ? (
                    preview.type === 'image' ? (
                        <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <video src={preview.url} autoPlay loop playsInline className="w-full h-full object-cover" />
                    )
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 w-full pb-10 pt-6 px-8 flex items-center justify-center gap-10 bg-gradient-to-t from-black/80 to-transparent">
                {preview ? (
                    // Preview Controls
                    <div className="flex items-center justify-between w-full max-w-sm">
                        <button onClick={handleRetake} className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition group">
                            <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-500">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium tracking-wide">Retake</span>
                        </button>
                        <button onClick={handleApprove} className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition group">
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-black group-hover:bg-[#0A84FF] group-hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                                <Check className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-semibold tracking-wide">Send</span>
                        </button>
                    </div>
                ) : (
                    // Camera Controls
                    <div className="flex flex-col items-center justify-center">
                        {isRecording && (
                            <div className="mb-4 bg-red-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                                Recording
                            </div>
                        )}
                        <button
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onMouseLeave={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            onClick={(e) => {
                                // Prevent click from firing if we were holding
                                if (isRecording) {
                                    stopRecording();
                                } else {
                                    takePhoto();
                                }
                            }}
                            className={`h-20 w-20 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? 'border-red-500 scale-125' : 'border-white hover:scale-105'
                                }`}
                        >
                            <div className={`rounded-full transition-all ${isRecording ? 'h-8 w-8 bg-red-500 rounded-lg' : 'h-16 w-16 bg-white'
                                }`} />
                        </button>
                        <p className="text-white/50 text-xs mt-4 tracking-wide font-medium">Tap for photo, hold for video</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
