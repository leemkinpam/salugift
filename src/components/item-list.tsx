'use client';
import type { Download } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Link, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface DownloadListProps {
  items: Download[];
}

export function DownloadList({ items: initialItems }: DownloadListProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<Download[]>(initialItems);

  const handleDelete = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    toast({ title: "成功", description: "已刪除下載記錄。" });
  };
  
  const handleCopy = (filename: string) => {
    navigator.clipboard.writeText(filename);
    toast({ title: "成功", description: "已複製檔案名稱。" });
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground py-10">
        <h3 className="text-lg font-semibold">尚無下載紀錄</h3>
        <p className="mt-1 text-sm">這裡會顯示您的下載歷史。</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="text-sm font-medium text-muted-foreground px-2 mb-2">昨天</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="shadow-sm bg-white rounded-lg border">
            <CardContent className="p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                <a href="#" className="font-medium text-sm text-blue-600 truncate hover:underline" onClick={(e) => e.preventDefault()}>
                  {item.filename}
                </a>
              </div>
              <div className="flex items-center gap-1">
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full h-8 w-8"
                  aria-label="複製連結"
                  >
                  <Link className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full h-8 w-8"
                  onClick={() => handleCopy(item.filename)}
                  aria-label="複製"
                  >
                  <Copy className="h-4 w-4" />
                </Button>
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full h-8 w-8" 
                  onClick={() => handleDelete(item.id)}
                  aria-label="刪除"
                  >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
