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
      // Simulate a scan after 3 seconds
      timer = setTimeout(() => {
        const mockBarcode = Math.random().toString().slice(2, 15);
        onScan(mockBarcode);
        setIsScanning(false);
        onOpenChange(false);
      }, 3000);
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
        <div className="relative aspect-square w-full bg-slate-900 flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-dashed border-slate-400 rounded-lg"></div>

          {isScanning && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="animate-scan absolute w-full h-1 bg-primary/70 shadow-[0_0_10px_2px_hsl(var(--primary))]"></div>
            </div>
          )}
          
          <p className="z-10 text-white/80">Simulating camera feed...</p>
        </div>
        <div className="p-6 pt-2">
            <DialogHeader>
                <DialogTitle>Scanning Barcode</DialogTitle>
                <DialogDescription>
                    Point your camera at a barcode. The scan will complete automatically.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                  Cancel
              </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
