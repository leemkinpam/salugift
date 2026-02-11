'use client';
import { useState, useEffect } from 'react';
import { deleteItem as dbDeleteItem } from '@/lib/actions';
import type { Item } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

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

  // 1. 當伺服器重新驗證路徑 (revalidatePath) 時，同步更新初始資料
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // 2. 建立 Supabase Realtime 訂閱，實現「秒級」即時更新
  useEffect(() => {
    const channel = supabase
      .channel('items_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // 監聽新增、刪除、修改
          schema: 'public',
          table: 'items',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item;
            setItems((prev) => {
              // 檢查是否已存在（避免重複顯示）
              if (prev.find(i => i.id === newItem.id)) return prev;
              return [newItem, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. 處理日期格式化 (避免 Hydration 錯誤)
  useEffect(() => {
    const newFormattedDates: Record<string, string> = {};
    items.forEach(item => {
      newFormattedDates[item.id] = formatDateTime(new Date(item.created_at));
    });
    setClientFormattedDates(newFormattedDates);
  }, [items]);

  const handleDelete = async (id: number) => {
    // 樂觀更新：先從 UI 移除
    const originalItems = items;
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    
    const result = await dbDeleteItem(id);

    if (result.success) {
      toast({ title: "成功", description: result.message });
    } else {
      // 失敗則回滾
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
      <div className="mt-8 text-center text-muted-foreground py-10 border-2 border-dashed rounded-xl border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900/40">無核銷記錄</h3>
        <p className="mt-1 text-sm">掃描的條碼將會即時顯示在這裡。</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-purple-900/60 px-2 mb-3">最近核銷</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="shadow-md bg-white/80 backdrop-blur-sm rounded-2xl border-purple-100 hover:border-purple-200 transition-colors">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <h3 className="text-lg font-bold text-purple-900 tracking-tight truncate">
                  {item.barcode}
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="font-mono">
                    {clientFormattedDates[item.id] || <Skeleton className="h-4 w-32" />}
                  </span>
                </div>
              </div>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-purple-300 hover:bg-red-50 hover:text-red-500 rounded-full h-10 w-10 flex-shrink-0" 
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
