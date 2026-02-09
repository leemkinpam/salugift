'use client';
import { useState, useEffect } from 'react';
import { deleteItem as dbDeleteItem } from '@/lib/actions';
import type { Item } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

export function ItemList({ items: initialItems }: { items: Item[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [clientFormattedDates, setClientFormattedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Format dates on the client to avoid hydration mismatch
    const newFormattedDates: Record<string, string> = {};
    items.forEach(item => {
      newFormattedDates[item.id] = formatDateTime(new Date(item.created_at));
    });
    setClientFormattedDates(newFormattedDates);
  }, [items]);

  const handleDelete = async (id: number) => {
    const originalItems = items;
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    
    const result = await dbDeleteItem(id);

    if (result.success) {
      toast({ title: "成功", description: result.message });
    } else {
      setItems(originalItems);
      toast({
        variant: 'destructive',
        title: "失敗",
        description: result.message,
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground py-10 border-2 border-dashed rounded-xl">
        <h3 className="text-lg font-semibold">無核銷記錄</h3>
        <p className="mt-1 text-sm">掃描的條碼將會顯示在這裡。</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-muted-foreground px-2 mb-2">最近核銷</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="shadow-sm bg-white/50 backdrop-blur-sm rounded-xl border-purple-200/50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <h3 className="font-semibold text-purple-900 truncate">{item.barcode}</h3>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span className="font-mono">{clientFormattedDates[item.id] || <Skeleton className="h-4 w-32" />}</span>
                </div>
              </div>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-purple-500 hover:bg-red-50 hover:text-red-500 rounded-full h-10 w-10" 
                  onClick={() => handleDelete(item.id)}
                  aria-label="刪除"
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
