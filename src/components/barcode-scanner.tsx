"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
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
  }, [open, onScan, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="relative aspect-square w-full bg-black flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-dashed border-slate-400 rounded-lg"></div>

          {isScanning && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="animate-scan absolute w-full h-1 bg-primary/70 shadow-[0_0_10px_2px_hsl(var(--primary))]"></div>
            </div>
          )}
          
          <p className="z-10 text-white/80">模擬相機畫面...</p>
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
