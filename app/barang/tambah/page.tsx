'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useItemStore } from '@/stores/itemStore';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { UploadIcon, ArrowLeftIcon, Loader2 } from 'lucide-react';

const ItemFormPage: React.FC = () => {
  const router = useRouter();
  const {
    createItem,
    loading: storeLoading
  } = useItemStore();
  const { addToast } = useToastStore();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    location: '',
    condition: 'baik' as 'baik' | 'rusak' | 'perlu_perbaikan',
    description: '',
    image_data: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: 'Error',
          description: 'Ukuran gambar maksimal 5MB',
          variant: 'error',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        addToast({
          title: 'Error',
          description: 'File harus berupa gambar',
          variant: 'error',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, image_data: base64 }));
        setImagePreview(base64);
      };
      reader.onerror = () => {
        addToast({
          title: 'Error',
          description: 'Gagal membaca file gambar',
          variant: 'error',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_data: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.name.trim() || !formData.category.trim() || !formData.location.trim()) {
      addToast({
        title: 'Error',
        description: 'Harap isi semua field yang wajib diisi',
        variant: 'error',
      });
      return;
    }

    if (formData.stock < 0) {
      addToast({
        title: 'Error',
        description: 'Stok tidak boleh negatif',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createItem({
        name: formData.name.trim(),
        category: formData.category.trim(),
        stock: formData.stock,
        location: formData.location.trim(),
        condition: formData.condition,
        description: formData.description.trim(),
        image_data: formData.image_data,
      });
    
      addToast({
        title: 'Berhasil',
        description: 'Barang berhasil ditambahkan',
        variant: 'success',
      });

      router.push('/barang');
    } catch (error) {
      console.error('Error saving item:', error);
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/barang')}
        disabled={isSubmitting}
        className="mb-8"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Kembali
      </Button>

      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">
          Tambah Barang
        </h1>
        <p className="text-muted-foreground">
          Tambahkan barang baru ke inventaris
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Barang *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="Masukkan nama barang"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Kategori *
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="Contoh: Elektronik, Furniture"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">
                Stok *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Lokasi *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="Contoh: Ruang A, Gudang B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">
                Kondisi *
              </Label>
              <Select
                value={formData.condition}
                onValueChange={(value: 'baik' | 'rusak' | 'perlu_perbaikan') =>
                  setFormData(prev => ({ ...prev, condition: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baik">Baik</SelectItem>
                  <SelectItem value="perlu_perbaikan">Perlu Perbaikan</SelectItem>
                  <SelectItem value="rusak">Rusak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              disabled={isSubmitting}
              placeholder="Deskripsi detail tentang barang..."
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="image">
              Upload Gambar
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => document.getElementById('image')?.click()}
              >
                <UploadIcon className="h-5 w-5" />
              </Button>
            </div>
          
            {imagePreview && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preview Gambar:</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    disabled={isSubmitting}
                  >
                    Hapus
                  </Button>
                </div>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          
            <p className="text-xs text-muted-foreground">
              Format yang didukung: JPG, PNG, WebP. Maksimal 5MB.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || storeLoading}
              className="min-w-24"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/barang')}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ItemFormPage;