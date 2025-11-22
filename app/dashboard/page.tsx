'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DashboardCard } from '@/components/DashboardCard';
import { Package, ClipboardList, AlertTriangle, Users } from 'lucide-react';
import { DashboardStats } from '@/types';
import { dashboardService } from '@/config/database';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalBorrowed: 0,
    damagedItems: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await dashboardService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Memuat data dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Selamat datang kembali, {user?.name || 'Pengguna'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <DashboardCard
          title="Total Barang"
          value={stats.totalItems}
          Icon={Package}
          color="primary"
        />
        <DashboardCard
          title="Sedang Dipinjam"
          value={stats.totalBorrowed}
          Icon={ClipboardList}
          color="tertiary"
        />
        <DashboardCard
          title="Barang Rusak"
          value={stats.damagedItems}
          Icon={AlertTriangle}
          color="error"
        />
        {user?.role === 'admin' && (
          <DashboardCard
            title="Total Pengguna"
            value={stats.totalUsers}
            Icon={Users}
            color="accent-orange"
          />
        )}
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-serif font-semibold mb-3 sm:mb-4">
            Ringkasan Inventaris
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm sm:text-base">Barang Tersedia:</span>
              <span className="font-medium text-success text-sm sm:text-base">
                {stats.totalItems - stats.damagedItems} item
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm sm:text-base">Persentase Barang Rusak:</span>
              <span className="font-medium text-warning text-sm sm:text-base">
                {stats.totalItems > 0
                  ? ((stats.damagedItems / stats.totalItems) * 100).toFixed(1)
                  : 0
                }%
              </span>
            </div>
          </div>
        </div>
      
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-serif font-semibold mb-3 sm:mb-4">
            Aktivitas Terbaru
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sistem inventaris berjalan dengan baik. Total {stats.totalItems} barang terdaftar dalam sistem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;