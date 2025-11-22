'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useItemStore } from '@/stores/itemStore';
import { useBorrowStore } from '@/stores/borrowStore';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, Loader2 } from 'lucide-react';

const BorrowPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, fetchItems } = useItemStore();
  const { createRecord, loading } = useBorrowStore();
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    borrowerName: user?.name || '',
    itemId: '',
    quantity: 1,
    borrowDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load items jika belum ada
    if (items.length === 0) {
      fetchItems();
    }
  }, [items.length, fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validasi form
      if (!formData.itemId || !formData.borrowerName || !formData.returnDate) {
        addToast({
          title: 'Error',
          description: 'Harap isi semua field yang wajib',
          variant: 'error',
        });
        return;
      }

      const item = items.find((i) => i.id === formData.itemId);
      if (!item) {
        addToast({
          title: 'Error',
          description: 'Barang tidak ditemukan',
          variant: 'error',
        });
        return;
      }

      if (formData.quantity > item.stock) {
        addToast({
          title: 'Error',
          description: `Jumlah melebihi stok tersedia. Stok: ${item.stock}`,
          variant: 'error',
        });
        return;
      }

      if (formData.quantity <= 0) {
        addToast({
          title: 'Error',
          description: 'Jumlah harus lebih dari 0',
          variant: 'error',
        });
        return;
      }

      // Data untuk dikirim ke API
      const recordData = {
        item_id: formData.itemId,
        borrower_name: formData.borrowerName,
        quantity: formData.quantity,
        borrow_date: formData.borrowDate,
        return_date: formData.returnDate,
        notes: formData.notes,
        status: 'dipinjam' as const,
        created_by: user?.id || '',
      };

      console.log('Creating borrow record:', recordData);

      // Gunakan createRecord dari store yang sudah memanggil API
      await createRecord(recordData);
      
      addToast({
        title: 'Berhasil',
        description: 'Peminjaman berhasil dicatat',
        variant: 'success',
      });
      
      router.push('/peminjaman');
    } catch (error: any) {
      console.error('Error creating borrow record:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Gagal mencatat peminjaman',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Hitung tanggal minimal untuk kembali (hari ini + 1)
  const getMinReturnDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-8 bg-transparent text-foreground hover:bg-muted"
        disabled={submitting}
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
        Kembali
      </Button>

      <div className="mb-12">
        <h1 className="text-3xl font-serif font-semibold mb-2 text-foreground">
          Form Peminjaman
        </h1>
        <p className="text-muted-foreground">Isi form untuk meminjam barang</p>
      </div>

      <Card className="p-8 bg-card text-card-foreground">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="borrowerName" className="text-foreground">
              Nama Peminjam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="borrowerName"
              value={formData.borrowerName}
              onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
              required
              disabled={submitting}
              className="bg-background text-foreground border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemId" className="text-foreground">
              Barang <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.itemId}
              onValueChange={(value) => setFormData({ ...formData, itemId: value })}
              disabled={submitting}
            >
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder="Pilih barang" />
              </SelectTrigger>
              <SelectContent className="bg-card text-card-foreground">
                {items.map((item) => (
                  <SelectItem 
                    key={item.id} 
                    value={item.id} 
                    className="text-foreground"
                    disabled={item.stock === 0}
                  >
                    {item.name} (Stok: {item.stock}) {item.stock === 0 && '- Stok Habis'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-foreground">
                Jumlah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
                disabled={submitting}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrowDate" className="text-foreground">
                Tanggal Pinjam <span className="text-red-500">*</span>
              </Label>
              <Input
                id="borrowDate"
                type="date"
                value={formData.borrowDate}
                onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                required
                disabled={submitting}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnDate" className="text-foreground">
                Tanggal Kembali <span className="text-red-500">*</span>
              </Label>
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                min={getMinReturnDate()}
                required
                disabled={submitting}
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              disabled={submitting}
              className="bg-background text-foreground border-border"
              placeholder="Tambahkan catatan mengenai peminjaman..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={submitting || loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Peminjaman'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
              className="bg-transparent text-foreground border-border hover:bg-muted"
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BorrowPage;