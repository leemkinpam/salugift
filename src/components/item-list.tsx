import type { Item } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Tag } from "lucide-react";

interface ItemListProps {
  items: Item[];
}

export function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="mt-12 text-center text-muted-foreground py-10 border border-dashed rounded-lg">
        <FileText className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">No Items Yet</h3>
        <p className="mt-1 text-sm">Add an item using the form above to see it here.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Recent Items</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                 <h3 className="font-semibold">{item.name}</h3>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>{item.barcode}</span>
                 </div>
              </div>
              <Badge variant="secondary">Qty: {item.quantity}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
