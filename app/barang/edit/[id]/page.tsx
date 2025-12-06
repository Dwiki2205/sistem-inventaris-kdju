// app/barang/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useItemStore } from '@/stores/itemStore';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { UploadIcon, ArrowLeftIcon, Loader2, Save, X } from 'lucide-react';
import { Item } from '@/types';

const EditItemPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const {
    items,
    fetchItemById,
    updateItem,
    loading: storeLoading,
    error: storeError,
    clearError
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
  
  const [originalData, setOriginalData] = useState<Item | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load item data
  const loadItemData = useCallback(async () => {
    if (!id) {
      console.error('No ID provided for edit');
      addToast({
        title: 'Error',
        description: 'ID barang tidak valid',
        variant: 'error',
      });
      router.push('/barang');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      console.log('Loading item data for ID:', id);
      
      let itemData: Item | null = null;
      
      // Check local store first
      if (items.length > 0) {
        itemData = items.find((i) => i.id === id) || null;
        console.log('Found in local store:', itemData);
      }
      
      // If not found, fetch from API
      if (!itemData) {
        console.log('Not found in store, fetching from API...');
        itemData = await fetchItemById(id);
      }

      if (itemData) {
        console.log('Item data loaded:', itemData);
        
        setFormData({
          name: itemData.name || '',
          category: itemData.category || '',
          stock: itemData.stock || 0,
          location: itemData.location || '',
          condition: itemData.condition || 'baik',
          description: itemData.description || '',
          image_data: itemData.image_data || '',
        });
        
        setOriginalData(itemData);
        
        if (itemData.image_data) {
          setImagePreview(itemData.image_data);
        }
      } else {
        console.error('Item not found:', id);
        throw new Error('Item tidak ditemukan');
      }
    } catch (error) {
      console.error('Error loading item:', error);
      
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memuat data barang',
        variant: 'error',
      });
      
      // Redirect after showing toast
      setTimeout(() => {
        router.push('/barang');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  }, [id, items, fetchItemById, router, addToast, clearError]);

  // Check for changes
  useEffect(() => {
    if (!originalData) return;

    const changes = 
      formData.name !== originalData.name ||
      formData.category !== originalData.category ||
      formData.stock !== originalData.stock ||
      formData.location !== originalData.location ||
      formData.condition !== originalData.condition ||
      formData.description !== originalData.description ||
      formData.image_data !== originalData.image_data;

    setHasChanges(changes);
  }, [formData, originalData]);

  // Load data on mount
  useEffect(() => {
    if (id) {
      loadItemData();
    }
  }, [id, loadItemData]);

  // Handle store errors
  useEffect(() => {
    if (storeError) {
      addToast({
        title: 'Error',
        description: storeError,
        variant: 'error',
      });
      clearError();
    }
  }, [storeError, addToast, clearError]);

  // Handle before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, isSubmitting]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
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
        description: 'File harus berupa gambar (JPG, PNG, WebP)',
        variant: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => {
      setIsSubmitting(true);
    };
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, image_data: base64 }));
      setImagePreview(base64);
      setIsSubmitting(false);
    };
    reader.onerror = () => {
      addToast({
        title: 'Error',
        description: 'Gagal membaca file gambar',
        variant: 'error',
      });
      setIsSubmitting(false);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_data: '' }));
    setImagePreview('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Nama barang wajib diisi');
    }
    
    if (!formData.category.trim()) {
      errors.push('Kategori wajib diisi');
    }
    
    if (!formData.location.trim()) {
      errors.push('Lokasi wajib diisi');
    }
    
    if (formData.stock < 0) {
      errors.push('Stok tidak boleh negatif');
    }
    
    if (!['baik', 'rusak', 'perlu_perbaikan'].includes(formData.condition)) {
      errors.push('Kondisi tidak valid');
    }

    if (errors.length > 0) {
      addToast({
        title: 'Validasi Gagal',
        description: errors.join(', '),
        variant: 'error',
      });
      return;
    }

    if (!hasChanges) {
      // app/barang/edit/[id]/page.tsx - Perbaiki baris 262
      addToast({
        title: 'Info',
        description: 'Tidak ada perubahan yang dilakukan',
        variant: 'default', // Ganti 'info' dengan 'default'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting form data:', formData);

      const updateData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        stock: formData.stock,
        location: formData.location.trim(),
        condition: formData.condition,
        description: formData.description.trim(),
        image_data: formData.image_data,
      };

      await updateItem(id!, updateData);

      addToast({
        title: 'Berhasil',
        description: 'Barang berhasil diperbarui',
        variant: 'success',
      });

      // Redirect with delay to show success message
      setTimeout(() => {
        router.push('/barang');
      }, 1000);

    } catch (error: any) {
      console.error('Error saving item:', error);
      
      let errorMessage = 'Terjadi kesalahan saat menyimpan data';
      
      if (error.message.includes('Failed to update')) {
        errorMessage = 'Gagal memperbarui data. Silakan coba lagi.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Item tidak ditemukan di server.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Data tidak valid. Periksa kembali isian form.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Koneksi jaringan bermasalah. Periksa koneksi internet Anda.';
      }

      addToast({
        title: 'Error',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    if (originalData) {
      setFormData({
        name: originalData.name || '',
        category: originalData.category || '',
        stock: originalData.stock || 0,
        location: originalData.location || '',
        condition: originalData.condition || 'baik',
        description: originalData.description || '',
        image_data: originalData.image_data || '',
      });
      
      setImagePreview(originalData.image_data || '');
      setHasChanges(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/barang')}
          className="mb-8"
          disabled
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Kembali
        </Button>
      
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Memuat data barang...</h3>
            <p className="text-sm text-muted-foreground">
              Mohon tunggu sebentar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/barang')}
          disabled={isSubmitting}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Kembali ke Daftar Barang
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Edit Barang
          </h1>
          <p className="text-muted-foreground">
            Perbarui informasi barang
          </p>
          
          {originalData && (
            <div className="mt-2 text-sm text-muted-foreground">
              <span>ID: {originalData.id}</span>
              <span className="mx-2">•</span>
              <span>Terakhir diperbarui: {new Date(originalData.updated_at).toLocaleDateString('id-ID')}</span>
            </div>
          )}
        </div>

        {/* Changes indicator */}
        {hasChanges && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-yellow-700 font-medium">
                Anda memiliki perubahan yang belum disimpan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold pb-2 border-b">
              Informasi Dasar
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="font-medium">
                  Nama Barang *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  placeholder="Masukkan nama barang"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Nama lengkap barang yang mudah dikenali
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="font-medium">
                  Kategori *
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Elektronik, Furniture, Alat Tulis"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Kategori barang untuk pengelompokan
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="stock" className="font-medium">
                  Stok *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  required
                  disabled={isSubmitting}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Jumlah barang yang tersedia
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="font-medium">
                  Lokasi *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Ruang A, Gudang B, Rak 3"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Tempat penyimpanan barang
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="condition" className="font-medium">
                  Kondisi *
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: 'baik' | 'rusak' | 'perlu_perbaikan') =>
                    setFormData(prev => ({ ...prev, condition: value }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                        Baik
                      </div>
                    </SelectItem>
                    <SelectItem value="perlu_perbaikan">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                        Perlu Perbaikan
                      </div>
                    </SelectItem>
                    <SelectItem value="rusak">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                        Rusak
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Status kondisi barang saat ini
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold pb-2 border-b">
              Deskripsi
            </h2>
            
            <div className="space-y-3">
              <Label htmlFor="description" className="font-medium">
                Deskripsi Barang
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                disabled={isSubmitting}
                placeholder="Deskripsi detail tentang barang, spesifikasi, catatan khusus, dll."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tambahkan informasi detail tentang barang (spesifikasi, catatan, dll.)
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold pb-2 border-b">
              Gambar Barang
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="image" className="font-medium">
                  Upload Gambar Baru
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => document.getElementById('image')?.click()}
                    className="h-11"
                  >
                    <UploadIcon className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">Pilih File</span>
                  </Button>
                </div>
              </div>
              
              {imagePreview && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label>Preview Gambar:</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      disabled={isSubmitting}
                      className="h-9"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-64 object-contain rounded-lg border"
                    />
                  </div>
                </div>
              )}
              
              {!imagePreview && originalData?.image_data && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    Gambar sebelumnya telah dihapus. Upload gambar baru jika diperlukan.
                  </p>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Format yang didukung: JPG, PNG, WebP</p>
                <p>• Ukuran maksimal: 5MB</p>
                <p>• Gambar akan ditampilkan di detail barang</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || storeLoading || !hasChanges}
              className="sm:min-w-32 h-11"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memperbarui...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Perbarui Barang
                </>
              )}
            </Button>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting || !hasChanges}
                className="flex-1 h-11"
              >
                Reset Perubahan
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/barang')}
                disabled={isSubmitting}
                className="flex-1 h-11"
              >
                Batal
              </Button>
            </div>
          </div>

          {/* Status info */}
          <div className="text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">
                  {isSubmitting ? 'Sedang menyimpan...' : hasChanges ? 'Ada perubahan' : 'Tidak ada perubahan'}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2">
                  {originalData ? new Date(originalData.updated_at).toLocaleString('id-ID') : '-'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditItemPage;