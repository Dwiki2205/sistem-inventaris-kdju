'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Mail, Lock } from 'lucide-react';
import Image from 'next/image';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { authenticate, loading, error, clearError } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const isAuthenticated = await authenticate(email, password);

      if (isAuthenticated) {
        addToast({
          title: 'Login Berhasil',
          description: 'Selamat datang kembali!',
          variant: 'success',
        });
        router.push('/barang');
      } else {
        addToast({
          title: 'Login Gagal',
          description: error || 'Email atau password salah',
          variant: 'error',
        });
      }
    } catch (error) {
      addToast({
        title: 'Login Gagal',
        description: 'Terjadi kesalahan saat login',
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background dengan Logo KDJU dan pola subtle */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'url(/Logo_KDJU.png), radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0) 70%)',
          backgroundSize: 'contain, cover',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, repeat',
          backgroundColor: '#eff6ff', // warna blue-50, lembut seperti biru muda
        }}
      />

      {/* Overlay gradient gelap untuk readability, disesuaikan dengan hint biru */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-800/20 to-blue-900/40 -z-10" />

      <div className="flex items-center justify-center gap-8 max-w-6xl w-full">
        {/* Gambar di kiri */}
        <Image
          src="/JUJU_LOVE.png"
          alt="JUJU LOVE Left"
          width={300}
          height={300}
          className="hidden lg:block object-contain transform transition-transform hover:scale-105 animate-pulse-slow"
          priority
        />

        {/* Card di tengah */}
        <Card className="w-full max-w-md p-10 shadow-2xl backdrop-blur-md bg-white/80 border-blue-200 rounded-2xl animate-fade-in-up">
          {/* Logo di atas judul dengan animasi subtle */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/Logo_KDJU.png"
              alt="Logo KDJU"
              width={120}
              height={120}
              className="mb-6 drop-shadow-md transform transition-transform hover:scale-105 animate-pulse-slow"
              priority
            />
            <h1 className="text-3xl font-bold text-blue-900 font-serif tracking-wide">
              Sistem Inventaris KDJU
            </h1>
            <p className="text-blue-700 mt-2 text-center">Masuk ke akun Anda untuk mengelola inventaris dengan mudah</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-900 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@kdju.com"
                required
                disabled={loading}
                className="bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-300 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-900 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-300 ease-in-out"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg animate-shake">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg py-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-blue-800 space-y-1 border-t border-blue-200 pt-4">
            <p className="font-semibold">Demo Akun</p>
            <p>Admin: <span className="font-medium">admin@kdju.com / admin123</span></p>
            <p>Staff: <span className="font-medium">staff@kdju.com / staff123</span></p>
          </div>
        </Card>

        {/* Gambar di kanan */}
        <Image
          src="/JUJU_PERHATIAN.png"
          alt="JUJU LOVE Right"
          width={300}
          height={300}
          className="hidden lg:block object-contain transform transition-transform hover:scale-105 animate-pulse-slow"
          priority
        />
      </div>
    </div>
  );
};

export default LoginPage;