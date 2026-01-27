'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ItemSchema } from '@/lib/definitions';
import { createItem } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/barcode-scanner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScanLine, Plus, Loader2 } from 'lucide-react';

const FormSchema = ItemSchema.omit({ id: true, createdAt: true });

export function ScanForm() {
  const { toast } = useToast();
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      barcode: '',
      name: '',
      quantity: 1,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('barcode', data.barcode);
      formData.append('name', data.name);
      formData.append('quantity', String(data.quantity));

      const result = await createItem({ success: false }, formData);

      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'An unknown error occurred.',
          variant: 'destructive',
        });
        if (result.errors) {
          if (result.errors.barcode) form.setError('barcode', { message: result.errors.barcode[0] });
          if (result.errors.name) form.setError('name', { message: result.errors.name[0] });
          if (result.errors.quantity) form.setError('quantity', { message: result.errors.quantity[0] });
        }
      }
    });
  }

  const handleScan = (barcode: string) => {
    form.setValue('barcode', barcode, { shouldValidate: true });
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Scan or enter barcode" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setScannerOpen(true)}
                        aria-label="Scan barcode"
                      >
                        <ScanLine className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Clean Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isPending ? 'Adding...' : 'Add Item'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <BarcodeScanner open={isScannerOpen} onOpenChange={setScannerOpen} onScan={handleScan} />
    </>
  );
}
