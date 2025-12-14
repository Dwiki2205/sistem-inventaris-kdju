'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://c.animaapp.com/mi5ogryswxygaI/img/ai_1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-buddhist opacity-25" />
      <Card className="w-full max-w-md p-12 relative z-10 bg-card text-card-foreground">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-semibold mb-2 text-foreground">
            Sistem Inventaris KDJU
          </h1>
          <p className="text-muted-foreground">Masuk ke akun Anda</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kdju.com"
              required
              disabled={loading}
              className="bg-background text-foreground border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="bg-background text-foreground border-border"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Demo: admin@kdju.com / admin123</p>
          <p>atau staff@kdju.com / staff123</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;