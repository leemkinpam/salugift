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
      // 檢查瀏覽器是否支援原生條碼偵測 API (目前 Safari 支援度有限，Chrome 較佳)
      if (!('BarcodeDetector' in window)) {
        setIsDetectorSupported(false);// 若不支援，掃描功能將完全無法啟動
      } else {
        setIsDetectorSupported(true);
      }

      // 2. Get camera permissions
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported');
        setHasCameraPermission(false);
        return;
      }
      try {
        // facingMode: "environment" 強制使用後置鏡頭，這對於掃描條碼至關重要
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });// 若設為 "user" 會變成前鏡頭，導致對焦困難
        // 建議可加入 width, height 或 frameRate 限制來優化掃描效能
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
         // 停止所有軌道，否則鏡頭燈號會持續亮著，且佔用系統資源
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

    // BarcodeDetector 的實例化 (需定義支援的格式，如 'qr_code', 'code_128' 等)
    // 若格式未正確定義，偵測器將無法辨識特定的條碼類型
    const barcodeDetector = new window.BarcodeDetector({ formats: ['code_39','code_128', 'ean_13', 'qr_code'] }); // 這裡定義的 Array 直接決定能掃什麼
    let animationFrameId: number;

    // 掃描邏輯通常會放在 requestAnimationFrame 或 setInterval 中
    // 若掃描頻率太高 (無間隔)，會造成手機發燙或畫面卡頓
    // 若太低，使用者會感覺掃描反應遲鈍
    
    const detectBarcode = async () => {
      if (video.readyState < video.HAVE_METADATA) {
        animationFrameId = requestAnimationFrame(detectBarcode);
        return;
      }
      try {
        const barcodes: DetectedBarcode[] = await barcodeDetector.detect(video);
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue);// 成功回傳結果
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
        // requestAnimationFrame 是關鍵：它會隨瀏覽器更新頻率（通常 60fps）執行 detectBarcode
        // 若 detectBarcode 內運算量太大，會造成畫面卡頓或手機過熱
        animationFrameId = requestAnimationFrame(detectBarcode);
    };

    // 監聽 'playing' 事件：確保影像流已經真正開始播放才啟動掃描
    // 若影像未載入就偵測，BarcodeDetector 會因抓不到 Frame 而報錯或無反應
    video.addEventListener('playing', handleVideoPlaying);

    // Timeout for showing "not found" message
    // 為了防止程式在背景無限期消耗相機資源與電力，這段程式碼設定了保護機制
    // 掃描超時機制：15 秒內未偵測到條碼則強制關閉
    const scanTimeout = setTimeout(() => {
      if (open) { // Check if the dialog is still open
        toast({
          variant: 'destructive',
          title: '掃描超時',// 若條碼受損、光線不足或對焦失敗，15秒後會自動彈出提示
          description: '找不到條碼，請將條碼置於掃描框內再試一次。',
        });
        onOpenChange(false); // 這裡會觸發 Cleanup 停止鏡頭
      }
    }, 15000); // 15 seconds

    return () => {
      // 重要：當元件卸載或 Dialog 關閉時，必須取消動畫偵測
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // 清除計時器，避免 Dialog 關閉後仍彈出「掃描超時」的 Toast
      clearTimeout(scanTimeout);
      // 移除監聽器以防記憶體洩漏
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
                        : '您的瀏覽器不支援條碼掃描功能。'}
                    </AlertDescription>
                </Alert>
            </div>
          )}

          {hasCameraPermission === null && isDetectorSupported === null && (
             <p className="z-10 text-white/80">正在啟動相機...</p>
          )}

          {hasCameraPermission && isDetectorSupported && (
            <>
            {/* 視覺掃描框：使用者通常會把條碼放在這裡，請確保偵測區域邏輯與此 UI 重合 */}
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
