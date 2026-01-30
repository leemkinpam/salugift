"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraOff } from 'lucide-react';

// Define types for the BarcodeDetector API
interface BarcodeDetectorOptions {
  formats: string[];
}

interface DetectedBarcode {
  rawValue: string;
}

declare global {
  interface Window {
    BarcodeDetector: {
      new(options?: BarcodeDetectorOptions): any;
      getSupportedFormats(): Promise<string[]>;
    }
  }
}

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isDetectorSupported, setIsDetectorSupported] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // This effect handles camera permissions and checks for BarcodeDetector support when the dialog opens.
    const setupScanner = async () => {
      // 1. Check for BarcodeDetector support
      if (!('BarcodeDetector' in window)) {
        setIsDetectorSupported(false);
      } else {
        const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
        if (supportedFormats.includes('code_39')) {
            setIsDetectorSupported(true);
        } else {
            setIsDetectorSupported(false);
        }
      }

      // 2. Get camera permissions
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported');
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setHasCameraPermission(null);
      setIsDetectorSupported(null);
      setIsScanning(false);
    };

    if (open) {
      setupScanner();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, [open]);

  useEffect(() => {
    // This effect handles the actual barcode detection logic.
    if (!open || !hasCameraPermission || !isDetectorSupported) {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const barcodeDetector = new window.BarcodeDetector({ formats: ['code_39'] });
    let animationFrameId: number;

    const detectBarcode = async () => {
      if (video.readyState < video.HAVE_METADATA) {
        animationFrameId = requestAnimationFrame(detectBarcode);
        return;
      }
      try {
        const barcodes: DetectedBarcode[] = await barcodeDetector.detect(video);
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue);
          onOpenChange(false);
        } else {
          animationFrameId = requestAnimationFrame(detectBarcode);
        }
      } catch (e) {
        console.error('Barcode detection failed:', e);
        // This can happen if the document is not focused.
        animationFrameId = requestAnimationFrame(detectBarcode);
      }
    };

    const handleVideoPlaying = () => {
        setIsScanning(true);
        animationFrameId = requestAnimationFrame(detectBarcode);
    };
    
    video.addEventListener('playing', handleVideoPlaying);

    // Timeout for showing "not found" message
    const scanTimeout = setTimeout(() => {
      if (open) { // Check if the dialog is still open
        toast({
          variant: 'destructive',
          title: '掃描超時',
          description: '找不到條碼，請將條碼置於掃描框內再試一次。',
        });
        onOpenChange(false);
      }
    }, 15000); // 15 seconds

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      clearTimeout(scanTimeout);
      video.removeEventListener('playing', handleVideoPlaying);
      setIsScanning(false);
    };
  }, [open, hasCameraPermission, isDetectorSupported, onScan, onOpenChange, toast]);
  
  const showUnsupportedError = isDetectorSupported === false;
  const showPermissionError = hasCameraPermission === false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="relative aspect-square w-full bg-black flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          
          {(showPermissionError || showUnsupportedError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center">
                <CameraOff className="h-16 w-16 text-destructive mb-4" />
                <Alert variant="destructive">
                    <AlertTitle>
                        {showPermissionError ? '需要相機權限' : '瀏覽器不支援'}
                    </AlertTitle>
                    <AlertDescription>
                        {showPermissionError
                        ? '請允許相機權限以使用掃描功能。'
                        : '您的瀏覽器不支援 Code 39 條碼掃描功能。'}
                    </AlertDescription>
                </Alert>
            </div>
          )}

          {hasCameraPermission === null && isDetectorSupported === null && (
             <p className="z-10 text-white/80">正在啟動相機...</p>
          )}

          {hasCameraPermission && isDetectorSupported && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-dashed border-purple-300 rounded-lg"></div>
              {isScanning && (
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="animate-scan absolute w-full h-1 bg-purple-400/80 shadow-[0_0_10px_2px_hsl(var(--primary))]"></div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-6 pt-4">
            <DialogHeader>
                <DialogTitle>掃描條碼</DialogTitle>
                <DialogDescription>
                    將您的相機對準條碼，系統將會自動掃描。
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                  取消
              </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
