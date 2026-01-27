'use client';
import type { Item } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { deleteItem } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useState, useEffect } from "react";

interface ItemListProps {
  items: Item[];
}

const ClientFormattedTime = ({ date }: { date: Date }) => {
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const formatDateTime = (d: Date) => {
      return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(d).replace('上午', '上午 ').replace('下午', '下午 ');
    };
    setFormattedTime(formatDateTime(date));
  }, [date]);

  return <span className="font-mono">{formattedTime}</span>;
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

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground py-10 border bg-purple-50/50 border-dashed rounded-xl">
        <Clock className="mx-auto h-10 w-10 text-purple-400" />
        <h3 className="mt-4 text-lg font-semibold text-purple-800">尚無核銷紀錄</h3>
        <p className="mt-1 text-sm text-purple-600">使用上方表單來新增項目。</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="shadow-sm bg-white rounded-xl border-purple-200/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold tracking-wider text-base text-purple-900">{item.barcode}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {item.createdAt && <ClientFormattedTime date={item.createdAt} />}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400 hover:bg-red-50 hover:text-red-500 rounded-full h-8 w-8" 
                onClick={() => handleDelete(item.id!)}
                disabled={isPending}
                >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
