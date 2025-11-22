'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { PackageIcon, ClipboardListIcon, LayoutDashboardIcon, UsersIcon, SettingsIcon, LogOutIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, roles: ['admin'] },
    { path: '/barang', label: 'Daftar Barang', icon: PackageIcon, roles: ['admin', 'staff'] },
    { path: '/peminjaman', label: 'Peminjaman', icon: ClipboardListIcon, roles: ['admin', 'staff'] },
    { path: '/admin', label: 'Admin', icon: UsersIcon, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'staff')
  );

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="h-full bg-primary shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-primary-foreground/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-primary-foreground">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary-foreground leading-tight">
              KDJU Inventory
            </h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9"
        >
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground shadow-sm'
                  : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-primary-foreground/20 mx-3" />

      {/* Footer Actions */}
      <div className="p-3 space-y-1">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-200 text-sm"
        >
          <SettingsIcon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium truncate">Pengaturan</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-200 w-full text-left text-sm"
        >
          <LogOutIcon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium truncate">Keluar</span>
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-primary-foreground/20">
        <div className="text-sm text-primary-foreground/80">
          <p className="font-medium truncate">{user?.name}</p>
          <p className="text-xs capitalize truncate">{user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;