'use client';
import type { Item } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { deleteItem } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

interface ItemListProps {
  items: Item[];
}

export function ItemList({ items }: ItemListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteItem(id);
      if (result.success) {
        toast({ title: "成功", description: result.message });
      } else {
        toast({ variant: "destructive", title: "錯誤", description: result.message });
      }
    });
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date).replace('上午', '上午 ').replace('下午', '下午 ');
  };

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground py-10 border bg-white border-dashed rounded-xl">
        <Clock className="mx-auto h-10 w-10" />
        <h3 className="mt-4 text-lg font-semibold">尚無核銷紀錄</h3>
        <p className="mt-1 text-sm">使用上方表單來新增項目。</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          核銷紀錄日誌
        </h2>
        <Badge variant="outline" className="font-mono text-xs">{items.length} TOTAL</Badge>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold tracking-wider text-lg">{item.barcode}</h3>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span className="font-mono">{item.createdAt ? formatDateTime(item.createdAt) : ''}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full" 
                onClick={() => handleDelete(item.id!)}
                disabled={isPending}
                >
                <Trash2 className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
