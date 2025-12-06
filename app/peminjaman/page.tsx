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
  const { items, fetchItems, loading: itemsLoading } = useItemStore();
  const { createRecord, loading: borrowLoading } = useBorrowStore();
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
  const [availableItems, setAvailableItems] = useState(items.filter(item => item.stock > 0));

  useEffect(() => {
    // Load items jika belum ada
    if (items.length === 0) {
      fetchItems();
    } else {
      // Filter hanya item yang ada stoknya
      setAvailableItems(items.filter(item => item.stock > 0));
    }
  }, [items, fetchItems]);

  // Update availableItems ketika items berubah
  useEffect(() => {
    setAvailableItems(items.filter(item => item.stock > 0));
  }, [items]);

  // Hitung tanggal minimal untuk kembali (hari ini)
  const getMinReturnDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimal besok
    return today.toISOString().split('T')[0];
  };

  // Hitung tanggal maksimal untuk pinjam (hari ini)
  const getMaxBorrowDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validasi form
      if (!formData.itemId || !formData.borrowerName || !formData.returnDate) {
        addToast({
          title: 'Error',
          description: 'Harap isi semua field yang wajib (bertanda *)',
          variant: 'error',
        });
        setSubmitting(false);
        return;
      }

      const item = items.find((i) => i.id === formData.itemId);
      if (!item) {
        addToast({
          title: 'Error',
          description: 'Barang tidak ditemukan',
          variant: 'error',
        });
        setSubmitting(false);
        return;
      }

      if (formData.quantity > item.stock) {
        addToast({
          title: 'Error',
          description: `Jumlah melebihi stok tersedia. Stok: ${item.stock}`,
          variant: 'error',
        });
        setSubmitting(false);
        return;
      }

      if (formData.quantity <= 0) {
        addToast({
          title: 'Error',
          description: 'Jumlah harus lebih dari 0',
          variant: 'error',
        });
        setSubmitting(false);
        return;
      }

      // Validasi tanggal
      const borrowDate = new Date(formData.borrowDate);
      const returnDate = new Date(formData.returnDate);
      
      if (returnDate <= borrowDate) {
        addToast({
          title: 'Error',
          description: 'Tanggal kembali harus setelah tanggal pinjam',
          variant: 'error',
        });
        setSubmitting(false);
        return;
      }

      // Pastikan user sudah login
      if (!user?.id) {
        addToast({
          title: 'Error',
          description: 'Anda harus login untuk melakukan peminjaman',
          variant: 'error',
        });
        setSubmitting(false);
        router.push('/login');
        return;
      }

      // Data untuk dikirim ke API
      const recordData = {
        item_id: formData.itemId,
        borrower_name: formData.borrowerName,
        quantity: formData.quantity,
        borrow_date: borrowDate.toISOString(),
        return_date: returnDate.toISOString(),
        notes: formData.notes,
        status: 'dipinjam' as const,
        created_by: user.id,
      };

      console.log('Creating borrow record:', recordData);

      // Gunakan createRecord dari store yang sudah memanggil API
      const newRecord = await createRecord(recordData);
      
      console.log('Borrow record created successfully:', newRecord);
      
      addToast({
        title: 'Berhasil!',
        description: 'Peminjaman berhasil dicatat',
        variant: 'success',
        duration: 3000,
      });
      
      // Reset form setelah sukses
      setFormData({
        borrowerName: user?.name || '',
        itemId: '',
        quantity: 1,
        borrowDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        notes: '',
      });
      
      // Refresh items untuk update stok
      await fetchItems();
      
      // Redirect setelah 2 detik
      setTimeout(() => {
        router.push('/peminjaman');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating borrow record:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Gagal mencatat peminjaman',
        variant: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = itemsLoading || borrowLoading || submitting;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-8 bg-transparent text-foreground hover:bg-muted"
        disabled={isLoading}
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
        Kembali
      </Button>

      <div className="mb-12">
        <h1 className="text-3xl font-serif font-semibold mb-2 text-foreground">
          Form Peminjaman Barang
        </h1>
        <p className="text-muted-foreground">Isi form untuk meminjam barang dari inventaris</p>
      </div>

      <Card className="p-6 md:p-8 bg-card text-card-foreground shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Peminjam */}
          <div className="space-y-2">
            <Label htmlFor="borrowerName" className="text-foreground">
              Nama Peminjam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="borrowerName"
              value={formData.borrowerName}
              onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
              required
              disabled={isLoading}
              className="bg-background text-foreground border-border"
              placeholder="Masukkan nama lengkap peminjam"
            />
            <p className="text-sm text-muted-foreground">Nama akan tercatat sebagai peminjam</p>
          </div>

          {/* Pilih Barang */}
          <div className="space-y-2">
            <Label htmlFor="itemId" className="text-foreground">
              Barang yang Dipinjam <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.itemId}
              onValueChange={(value) => {
                const selectedItem = items.find(item => item.id === value);
                setFormData({ 
                  ...formData, 
                  itemId: value,
                  quantity: selectedItem ? Math.min(formData.quantity, selectedItem.stock) : 1
                });
              }}
              disabled={isLoading || availableItems.length === 0}
            >
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder={availableItems.length === 0 ? "Tidak ada barang tersedia" : "Pilih barang"} />
              </SelectTrigger>
              <SelectContent className="bg-card text-card-foreground max-h-[300px]">
                {availableItems.length === 0 ? (
                  <SelectItem value="" disabled className="text-muted-foreground">
                    Tidak ada barang yang tersedia
                  </SelectItem>
                ) : (
                  availableItems.map((item) => (
                    <SelectItem 
                      key={item.id} 
                      value={item.id} 
                      className="text-foreground hover:bg-accent"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          Stok: {item.stock} | Lokasi: {item.location} | Kondisi: {item.condition}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {availableItems.length === 0 && (
              <p className="text-sm text-amber-600">
                Semua barang sedang habis stok. Silakan tambah stok barang terlebih dahulu.
              </p>
            )}
          </div>

          {/* Grid: Jumlah, Tanggal Pinjam, Tanggal Kembali */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Jumlah */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-foreground">
                Jumlah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={items.find(i => i.id === formData.itemId)?.stock || 1}
                value={formData.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const maxStock = items.find(i => i.id === formData.itemId)?.stock || 1;
                  setFormData({ ...formData, quantity: Math.min(value, maxStock) });
                }}
                required
                disabled={isLoading || !formData.itemId}
                className="bg-background text-foreground border-border"
              />
              {formData.itemId && (
                <p className="text-sm text-muted-foreground">
                  Stok tersedia: {items.find(i => i.id === formData.itemId)?.stock || 0}
                </p>
              )}
            </div>

            {/* Tanggal Pinjam */}
            <div className="space-y-2">
              <Label htmlFor="borrowDate" className="text-foreground">
                Tanggal Pinjam <span className="text-red-500">*</span>
              </Label>
              <Input
                id="borrowDate"
                type="date"
                value={formData.borrowDate}
                onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                max={getMaxBorrowDate()}
                required
                disabled={isLoading}
                className="bg-background text-foreground border-border"
              />
              <p className="text-sm text-muted-foreground">Maksimal hari ini</p>
            </div>

            {/* Tanggal Kembali */}
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
                disabled={isLoading}
                className="bg-background text-foreground border-border"
              />
              <p className="text-sm text-muted-foreground">Minimal besok</p>
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              disabled={isLoading}
              className="bg-background text-foreground border-border resize-none"
              placeholder="Tambahkan catatan mengenai peminjaman (tujuan, kondisi khusus, dll.)"
            />
            <p className="text-sm text-muted-foreground">
              Catatan akan membantu dalam pelacakan dan pengembalian barang
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={isLoading || availableItems.length === 0 || !formData.itemId}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 py-6 text-base sm:w-auto w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Menyimpan Peminjaman...
                </>
              ) : (
                'Simpan Peminjaman'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="bg-transparent text-foreground border-border hover:bg-muted font-medium px-8 py-6 text-base sm:w-auto w-full"
            >
              Batal
            </Button>
          </div>

          {/* Informasi */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-2">Informasi Penting:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pastikan semua data yang diisi sudah benar</li>
              <li>• Stok barang akan otomatis berkurang setelah peminjaman</li>
              <li>• Tanggal pengembalian harus sesuai kesepakatan</li>
              <li>• Status peminjaman dapat diubah nanti jika diperlukan</li>
            </ul>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BorrowPage;