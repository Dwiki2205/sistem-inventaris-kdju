'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useItemStore } from '@/stores/itemStore';
import { useAuthStore } from '@/stores/authStore';
import ItemCard from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon, PackageIcon, Loader2 } from 'lucide-react';

const ItemListPage: React.FC = () => {
  const router = useRouter();
  const { items, fetchItems, loading, error } = useItemStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    const loadItems = async () => {
      try {
        await fetchItems();
      } catch (error) {
        console.error('Failed to load items:', error);
      }
    };
  
    loadItems();
  }, [fetchItems]);

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleItemClick = (itemId: string) => {
    router.push(`/barang/${itemId}`);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Memuat data barang...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-16">
        <PackageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-error mb-4">Gagal memuat data: {error}</p>
        <Button
          onClick={() => fetchItems()}
          className="bg-primary text-primary-foreground"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-foreground truncate">
            Daftar Barang
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {items.length > 0
              ? `Total ${items.length} barang ditemukan`
              : 'Kelola inventaris barang KDJU'
            }
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button
            onClick={() => router.push('/barang/tambah')}
            className="bg-accent-orange text-primary-foreground hover:bg-accent-orange/90 font-normal w-full sm:w-auto"
            disabled={loading}
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" strokeWidth={1.5} />
            <span className="sm:inline">Tambah Barang</span>
          </Button>
        )}
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            type="text"
            placeholder="Cari barang berdasarkan nama, kategori, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background text-foreground border-border text-sm sm:text-base"
            disabled={loading}
          />
        </div>
      </div>

      {loading && items.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Memperbarui data...</span>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item.id)}
          />
        ))}
      </div>

      {/* Empty States */}
      {filteredItems.length === 0 && searchQuery && (
        <div className="text-center py-12 sm:py-16">
          <PackageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            Tidak ada barang yang cocok dengan pencarian "{searchQuery}"
          </p>
          <Button
            variant="outline"
            onClick={() => setSearchQuery('')}
            className="w-full sm:w-auto"
          >
            Tampilkan Semua Barang
          </Button>
        </div>
      )}

      {filteredItems.length === 0 && !searchQuery && !loading && (
        <div className="text-center py-12 sm:py-16">
          <PackageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-muted-foreground text-sm sm:text-base mb-4">Belum ada barang terdaftar</p>
          {user?.role === 'admin' && (
            <Button
              onClick={() => router.push('/barang/tambah')}
              className="bg-accent-orange text-primary-foreground hover:bg-accent-orange/90 w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" strokeWidth={1.5} />
              Tambah Barang Pertama
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemListPage;