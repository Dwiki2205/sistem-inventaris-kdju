// utils/validation.ts
export const validateItemData = (data: any) => {
  const errors: string[] = [];

  // Validate required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Nama barang wajib diisi');
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Kategori wajib diisi');
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.push('Lokasi wajib diisi');
  }

  // Validate stock
  if (data.stock === undefined || data.stock === null) {
    errors.push('Stok wajib diisi');
  } else {
    const stock = Number(data.stock);
    if (isNaN(stock)) {
      errors.push('Stok harus berupa angka');
    } else if (stock < 0) {
      errors.push('Stok tidak boleh negatif');
    }
  }

  // Validate condition
  const validConditions = ['baik', 'rusak', 'perlu_perbaikan'];
  if (!data.condition || !validConditions.includes(data.condition)) {
    errors.push(`Kondisi harus salah satu dari: ${validConditions.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateImageFile = (file: File) => {
  const errors: string[] = [];

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    errors.push('Format file harus JPG, PNG, atau WebP');
  }

  // Check file size (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push('Ukuran file maksimal 5MB');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};