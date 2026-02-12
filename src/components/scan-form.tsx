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
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Loader2 } from 'lucide-react';

const FormSchema = ItemSchema.pick({ barcode: true });

export function ScanForm() {
  const { toast } = useToast();
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      barcode: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('barcode', data.barcode);

      const result = await createItem({ success: false }, formData);

      if (result.success) {
        toast({
          title: '成功！',
          description: result.message,
        });
        form.reset();
      } else {
        const isDuplicate = result.message?.includes('重複核銷');
        toast({
          title: isDuplicate ? '重複核銷' : '提交失敗',
          description: result.message || '發生未知錯誤。',
          variant: 'destructive',
        });
        
        if (result.errors) {
          if (result.errors.barcode) form.setError('barcode', { message: result.errors.barcode[0] });
        }
      }
    });
  }

  const handleScan = (barcode: string) => {
    form.setValue('barcode', barcode, { shouldValidate: true });
  };

  return (
    <>
      <Card className="shadow-lg rounded-2xl bg-white">
        <CardContent className="p-6">
          <p className="text-center text-xs tracking-widest text-muted-foreground mb-4">REDEMPTION PORTAL</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input className="h-14 text-lg rounded-lg" placeholder="輸入或掃描條碼" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        className="h-14 w-20 rounded-lg flex-col gap-1"
                        onClick={() => setScannerOpen(true)}
                        aria-label="Scan barcode"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="text-xs font-bold">SCAN</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="secondary" className="w-full h-14 text-lg rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {isPending ? '提交中...' : '提交核銷'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <BarcodeScanner open={isScannerOpen} onOpenChange={setScannerOpen} onScan={handleScan} />
    </>
  );
}
