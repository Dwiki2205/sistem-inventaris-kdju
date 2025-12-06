// app/peminjaman/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBorrowStore } from '@/stores/borrowStore';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusIcon, CheckCircleIcon, XCircleIcon, Loader2, CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const BorrowListPage: React.FC = () => {
  const router = useRouter();
  const { records, updateRecord, fetchRecords, loading } = useBorrowStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const loadRecords = async () => {
      try {
        await fetchRecords();
      } catch (error) {
        console.error('Error loading borrow records:', error);
        addToast({
          title: 'Error',
          description: 'Gagal memuat data peminjaman',
          variant: 'error',
        });
      }
    };

    loadRecords();
  }, [fetchRecords, addToast]);

  const handleReturnItem = (recordId: string) => {
    setSelectedRecord(recordId);
    setIsReturnDialogOpen(true);
  };

  const handleCancelItem = (recordId: string) => {
    setSelectedRecord(recordId);
    setIsCancelDialogOpen(true);
  };

  const confirmReturn = async () => {
    if (selectedRecord) {
      try {
        await updateRecord(selectedRecord, {
          status: 'dikembalikan',
          actual_return_date: new Date().toISOString().split('T')[0],
          notes: returnNotes,
          verified_by: user?.id,
        });
        
        addToast({
          title: 'Berhasil',
          description: 'Barang berhasil dikembalikan',
          variant: 'success',
        });
        setIsReturnDialogOpen(false);
        setReturnNotes('');
        setSelectedRecord(null);
      } catch (error) {
        console.error('Error returning item:', error);
        addToast({
          title: 'Error',
          description: 'Gagal mengembalikan barang',
          variant: 'error',
        });
      }
    }
  };

  const confirmCancel = async () => {
    if (selectedRecord) {
      try {
        await updateRecord(selectedRecord, {
          status: 'dibatalkan',
          notes: cancelReason,
        });
        
        addToast({
          title: 'Berhasil',
          description: 'Peminjaman berhasil dibatalkan',
          variant: 'success',
        });
        setIsCancelDialogOpen(false);
        setCancelReason('');
        setSelectedRecord(null);
      } catch (error) {
        console.error('Error canceling borrow:', error);
        addToast({
          title: 'Error',
          description: 'Gagal membatalkan peminjaman',
          variant: 'error',
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      dipinjam: { label: 'Dipinjam', variant: 'default' as const },
      dikembalikan: { label: 'Dikembalikan', variant: 'success' as const },
      terlambat: { label: 'Terlambat', variant: 'destructive' as const },
      dibatalkan: { label: 'Dibatalkan', variant: 'secondary' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  // PERBAIKAN DI SINI: Ubah tipe parameter dan handle Date object
  const isOverdue = (returnDate: string | Date): boolean => {
    if (!returnDate) return false;
    
    const today = new Date();
    let returnDateObj: Date;
    
    if (returnDate instanceof Date) {
      returnDateObj = returnDate;
    } else {
      returnDateObj = new Date(returnDate);
    }
    
    // Set waktu ke akhir hari untuk perbandingan yang tepat
    returnDateObj.setHours(23, 59, 59, 999);
    
    return today > returnDateObj;
  };

  // Helper function untuk format date dengan aman
  const formatDate = (date: string | Date): string => {
    if (!date) return '-';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('id-ID');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Memuat data peminjaman...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2 text-foreground">
            Riwayat Peminjaman
          </h1>
          <p className="text-muted-foreground">
            {records.length > 0 
              ? `Total ${records.length} riwayat peminjaman` 
              : 'Kelola peminjaman barang'
            }
          </p>
        </div>
        <Button
          onClick={() => router.push('/peminjaman/tambah')}
          className="bg-accent-orange text-primary-foreground hover:bg-accent-orange/90 font-normal"
          disabled={loading}
        >
          <PlusIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
          Tambah Peminjaman
        </Button>
      </div>

      {loading && records.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Memperbarui data...</span>
        </div>
      )}

      <Card className="overflow-hidden bg-card text-card-foreground">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  Barang
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  Peminjam
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  Tanggal Pinjam
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  Tanggal Kembali
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  Catatan
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((record) => {
                // PERBAIKAN DI SINI: Pastikan kita mengirim string ke isOverdue
                const returnDateString = record.return_date 
                  ? (record.return_date instanceof Date 
                    ? record.return_date.toISOString() 
                    : record.return_date)
                  : '';
                
                const isRecordOverdue = record.status === 'dipinjam' && returnDateString && isOverdue(returnDateString);
                
                return (
                  <tr key={record.id} className={`hover:bg-muted/50 ${isRecordOverdue ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="font-medium">{record.item_name}</div>
                      {isRecordOverdue && (
                        <div className="text-xs text-red-600 flex items-center mt-1">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Terlambat
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{record.borrower_name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-foreground">
                      {record.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatDate(record.borrow_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className={`${isRecordOverdue ? 'text-red-600 font-medium' : ''}`}>
                        {formatDate(record.return_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs">
                      {record.notes ? (
                        <div className="line-clamp-2" title={record.notes}>
                          {record.notes}
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Tidak ada catatan</span>
                      )}
                      {record.actual_return_date && (
                        <div className="text-xs text-green-600 mt-1">
                          Dikembalikan: {formatDate(record.actual_return_date)}
                        </div>
                      )}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4">
                        {record.status === 'dipinjam' ? (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReturnItem(record.id)}
                              className="bg-success text-primary-foreground hover:bg-success/90 font-normal"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" strokeWidth={1.5} />
                              Kembalikan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelItem(record.id)}
                              className="bg-transparent text-error border-error hover:bg-error hover:text-white font-normal"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" strokeWidth={1.5} />
                              Batalkan
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {record.status === 'dikembalikan' && 'Selesai'}
                            {record.status === 'dibatalkan' && 'Dibatalkan'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {records.length === 0 && !loading && (
          <div className="text-center py-16">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground mb-4">Belum ada riwayat peminjaman</p>
            <Button
              onClick={() => router.push('/peminjaman/tambah')}
              className="bg-accent-orange text-primary-foreground hover:bg-accent-orange/90"
            >
              <PlusIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
              Tambah Peminjaman Pertama
            </Button>
          </div>
        )}
      </Card>

      {/* Return Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Konfirmasi Pengembalian</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menandai barang ini sebagai dikembalikan?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="returnNotes" className="text-foreground">
                Catatan Pengembalian (Opsional)
              </Label>
              <Textarea
                id="returnNotes"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Tambahkan catatan kondisi barang saat dikembalikan..."
                rows={4}
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReturnDialogOpen(false);
                setReturnNotes('');
                setSelectedRecord(null);
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted"
            >
              Batal
            </Button>
            <Button
              onClick={confirmReturn}
              className="bg-success text-primary-foreground hover:bg-success/90 font-normal"
            >
              Konfirmasi Pengembalian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Konfirmasi Pembatalan</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin membatalkan peminjaman ini?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason" className="text-foreground">
                Alasan Pembatalan
              </Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Masukkan alasan pembatalan..."
                rows={4}
                className="bg-background text-foreground border-border"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelReason('');
                setSelectedRecord(null);
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted"
            >
              Batal
            </Button>
            <Button
              onClick={confirmCancel}
              className="bg-error text-primary-foreground hover:bg-error/90 font-normal"
            >
              Konfirmasi Pembatalan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BorrowListPage;