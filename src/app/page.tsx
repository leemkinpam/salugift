import { Suspense } from 'react';
import { ScanForm } from '@/components/scan-form';
import { Items } from '@/components/item-list';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-md mx-auto">
        <ScanForm />
        <Suspense fallback={<ItemsSkeleton />}>
          <Items />
        </Suspense>
      </div>
    </main>
  );
}

function ItemsSkeleton() {
  return (
    <div className="mt-8 space-y-3">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}
