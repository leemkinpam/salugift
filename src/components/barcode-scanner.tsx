"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
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
        toast({
          variant: 'destructive',
          title: '相機權限遭拒',
          description: '請在您的瀏覽器設定中啟用相機權限以使用此功能。',
        });
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
    };

    if (open) {
      getCameraPermission();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, toast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open && hasCameraPermission) {
      setIsScanning(true);
      // Simulate a scan after 2 seconds
      timer = setTimeout(() => {
        const mockBarcode = `A${Math.random().toString().slice(2, 8).toUpperCase()}`;
        onScan(mockBarcode);
        setIsScanning(false);
        onOpenChange(false);
      }, 2000);
    } else {
      setIsScanning(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [open, hasCameraPermission, onScan, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="relative aspect-square w-full bg-black flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
              <Alert variant="destructive">
                <AlertTitle>需要相機權限</AlertTitle>
                <AlertDescription>
                  請允許相機權限以使用此功能。
                </AlertDescription>
              </Alert>
            </div>
          )}

          {hasCameraPermission === null && (
            <p className="z-10 text-white/80">正在請求相機權限...</p>
          )}

          {hasCameraPermission && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-dashed border-slate-400 rounded-lg"></div>
              {isScanning && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="animate-scan absolute w-full h-1 bg-primary/70 shadow-[0_0_10px_2px_hsl(var(--primary))]"></div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-6 pt-2">
            <DialogHeader>
                <DialogTitle>掃描條碼</DialogTitle>
                <DialogDescription>
                    將您的相機對準條碼。掃描將自動完成。
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
