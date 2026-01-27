import { getItems } from '@/lib/supabase';
import { ScanForm } from '@/components/scan-form';
import { ItemList } from '@/components/item-list';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
            ScanToDB
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple app to scan barcodes, input data, and save it to a
            database.
          </p>
        </header>
        <div className="max-w-2xl mx-auto">
          <ScanForm />
          <Suspense fallback={<ItemListSkeleton />}>
            <Items />
          </Suspense>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground">
        <p>Built with Next.js and a sprinkle of magic.</p>
      </footer>
    </div>
  );
}

async function Items() {
  const items = await getItems();
  return <ItemList items={items} />;
}

function ItemListSkeleton() {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Recent Items
      </h2>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
