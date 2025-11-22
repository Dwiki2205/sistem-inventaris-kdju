'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Loader2, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import { User } from '@/types';
import { userService } from '@/config/database';
import { useToastStore } from '@/stores/toastStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff'
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadUsers();
  }, [user, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      addToast({
        title: 'Error',
        description: 'Gagal memuat data pengguna',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createUser(formData);
      addToast({
        title: 'Berhasil',
        description: 'Pengguna berhasil ditambahkan',
        variant: 'success',
      });
      setIsAddDialogOpen(false);
      setFormData({ name: '', email: '', role: 'staff' });
      loadUsers();
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Gagal menambahkan pengguna',
        variant: 'error',
      });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.id, formData);
      addToast({
        title: 'Berhasil',
        description: 'Pengguna berhasil diperbarui',
        variant: 'success',
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'staff' });
      loadUsers();
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Gagal memperbarui pengguna',
        variant: 'error',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    try {
      await userService.deleteUser(userId);
      addToast({
        title: 'Berhasil',
        description: 'Pengguna berhasil dihapus',
        variant: 'success',
      });
      loadUsers();
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Gagal menghapus pengguna',
        variant: 'error',
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Nama', 'Email', 'Role', 'Tanggal Dibuat'];
    const csvData = users.map(user => [
      user.name,
      user.email,
      user.role,
      new Date(user.created_at).toLocaleDateString('id-ID')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    addToast({
      title: 'Berhasil',
      description: 'Data pengguna berhasil diexport',
      variant: 'success',
    });
  };

  if (user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Memuat data pengguna...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2 text-foreground">
            Halaman Admin
          </h1>
          <p className="text-muted-foreground">Kelola pengguna dan laporan</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-accent-orange text-primary-foreground hover:bg-accent-orange/90 font-normal"
        >
          <PlusIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
          Tambah User
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="users" className="text-foreground data-[state=active]:bg-background">
            Manajemen User
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-foreground data-[state=active]:bg-background">
            Laporan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-8">
          <Card className="overflow-hidden bg-card text-card-foreground">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                      Tanggal Dibuat
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-normal ${
                            user.role === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="bg-transparent text-foreground border-border hover:bg-muted"
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-transparent text-error border-error hover:bg-error hover:text-white"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-8">
          <Card className="p-8 bg-card text-card-foreground">
            <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">
              Export Laporan
            </h2>
            <p className="text-muted-foreground mb-8">
              Download laporan inventaris dan peminjaman dalam format CSV
            </p>
            <div className="space-y-4">
              <Button
                onClick={handleExportCSV}
                className="bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 font-normal"
              >
                <DownloadIcon className="h-5 w-5 mr-2" strokeWidth={1.5} />
                Export Data Pengguna
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Tambah Pengguna Baru</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Isi form untuk menambahkan pengguna baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nama</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'staff') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground">
                    <SelectItem value="staff" className="text-foreground">Staff</SelectItem>
                    <SelectItem value="admin" className="text-foreground">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="bg-transparent text-foreground border-border hover:bg-muted"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
              >
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Pengguna</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Edit informasi pengguna
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-foreground">Nama</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-foreground">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-foreground">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'staff') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground">
                    <SelectItem value="staff" className="text-foreground">Staff</SelectItem>
                    <SelectItem value="admin" className="text-foreground">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-transparent text-foreground border-border hover:bg-muted"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
              >
                Perbarui
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;