import { DownloadList } from '@/components/item-list';
import type { Download } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock data based on the screenshot
const mockDownloads: Download[] = [
  { id: '1', filename: '580775913 1139010558447863 254333357075629582 n (1).jpg', createdAt: new Date() },
  { id: '2', filename: '581434286 1139010538447865 1925109622440663797 n.jpg', createdAt: new Date() },
  { id: '3', filename: '581787166 1139010428447876 4558871168859801218 n.jpg', createdAt: new Date() },
  { id: '4', filename: '581794437 1139010415114544 5242064353256554152 n.jpg', createdAt: new Date() },
  { id: '5', filename: '582544827 1139010388447880 6880995208826707793 n.jpg', createdAt: new Date() },
  { id: '6', filename: '580596543 1139010001781252 2483057599435126820 n.jpg', createdAt: new Date() },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
                 <h1 className="text-xl font-semibold tracking-tight">
                    下載記錄
                </h1>
                <div className="flex-1 flex justify-center px-8">
                    <div className="w-full max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="搜尋下載記錄" className="pl-10 h-10 w-full rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-slate-200" />
                    </div>
                </div>
                <div className="w-24"></div> {/* Spacer */}
            </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <DownloadList items={mockDownloads} />
        </div>
      </main>
    </div>
  );
}
