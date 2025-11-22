'use client';

import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { BellIcon, MenuIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden bg-transparent text-primary-foreground hover:bg-white/10 h-10 w-10"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-serif font-semibold text-primary-foreground hidden lg:block">
          Sistem Inventaris KDJU
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-transparent text-primary-foreground hover:bg-white/10 h-10 w-10"
        >
          <BellIcon className="h-5 w-5" strokeWidth={1.5} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-transparent hover:bg-white/10 p-2 h-auto">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white text-primary font-normal text-sm">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card text-card-foreground">
            <DropdownMenuLabel className="text-foreground">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-error hover:bg-muted cursor-pointer"
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;