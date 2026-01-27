import { getItems } from '@/lib/supabase';
import { ScanForm } from '@/components/scan-form';
import { ItemList } from '@/components/item-list';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="flex items-center justify-center flex-col text-center gap-2 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-xl text-primary-foreground shadow">
              <QrCode className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-left">
                條碼驗證系統
              </h1>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-xs text-muted-foreground font-semibold tracking-wider">
                  HYBRID STORAGE ACTIVE
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-md mx-auto">
          <ScanForm />
          <Suspense fallback={<ItemListSkeleton />}>
            <Items />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function Items() {
  const items = await getItems();
  return <ItemList items={items} />;
}

function ItemListSkeleton() {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>核銷紀錄日誌</span>
        </h2>
        <Badge variant="outline" className="font-mono text-xs">... TOTAL</Badge>
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm bg-white rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
