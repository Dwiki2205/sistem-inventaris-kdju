'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useItemStore } from '@/stores/itemStore';
import { useBorrowStore } from '@/stores/borrowStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, EditIcon, PackageIcon } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const ItemDetailPage: React.FC<PageProps> = ({ params }) => {
  // Unwrap params menggunakan React.use()
  const { id } = React.use(params);
  const router = useRouter();
  const { items } = useItemStore();
  const { records } = useBorrowStore();
  const { user } = useAuthStore();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundItem = items.find((i) => i.id === id);
    if (foundItem) {
      setItem(foundItem);
    }
  }, [id, items]);

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Barang tidak ditemukan</p>
      </div>
    );
  }

  const itemRecords = records.filter((r) => r.item_id === id);

  const conditionColors = {
    baik: 'bg-success text-primary-foreground',
    rusak: 'bg-error text-primary-foreground',
    perlu_perbaikan: 'bg-warning text-foreground',
  };

  const conditionLabels = {
    baik: 'Baik',
    rusak: 'Rusak',
    perlu_perbaikan: 'Perlu Perbaikan',
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.push('/barang')}
        className="mb-8 bg-transparent text-foreground hover:bg-muted"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
        Kembali
      </Button>

      <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-tertiary/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {item.image_data ? (
                <img
                  src={item.image_data}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PackageIcon className="h-24 w-24 text-gray-400" strokeWidth={1.5} />
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-serif font-semibold mb-2 text-foreground">
                  {item.name}
                </h1>
                <p className="text-muted-foreground">{item.category}</p>
              </div>
              {user?.role === 'admin' && (
                <Button
                  onClick={() => router.push(`/barang/edit/${item.id}`)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-normal"
                >
                  <EditIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
                  Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Stok</p>
                <p className="text-2xl font-mono font-medium text-foreground">{item.stock}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lokasi</p>
                <p className="text-lg font-normal text-foreground">{item.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Kondisi</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-normal ${
                    conditionColors[item.condition as keyof typeof conditionColors]
                  }`}
                >
                  {conditionLabels[item.condition as keyof typeof conditionLabels]}
                </span>
              </div>
            </div>

            <Button
              onClick={() => router.push('/peminjaman/tambah')}
              className="bg-accent-orange text-primary-foreground hover:bg-accent-orange/90 font-normal"
            >
              Pinjam Barang
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="info" className="text-foreground data-[state=active]:bg-background">
            Info Barang
          </TabsTrigger>
          <TabsTrigger value="history" className="text-foreground data-[state=active]:bg-background">
            Riwayat Peminjaman
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-8">
          <Card className="p-8 bg-card text-card-foreground">
            <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">Deskripsi</h2>
            <p className="text-foreground leading-relaxed">{item.description}</p>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-8">
          <Card className="p-8 bg-card text-card-foreground">
            <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">
              Riwayat Peminjaman
            </h2>
            {itemRecords.length > 0 ? (
              <div className="space-y-4">
                {itemRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 border border-border rounded-lg bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{record.borrower_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.borrow_date).toLocaleDateString('id-ID')} -{' '}
                          {new Date(record.return_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-normal ${
                          record.status === 'dipinjam'
                            ? 'bg-info text-primary-foreground'
                            : record.status === 'dikembalikan'
                            ? 'bg-success text-primary-foreground'
                            : 'bg-error text-primary-foreground'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ada riwayat peminjaman</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ItemDetailPage;