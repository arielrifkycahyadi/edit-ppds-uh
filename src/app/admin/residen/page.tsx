'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataService } from '@/lib/data-service';
import { UserProfile } from '@/lib/types';
import { PPDS_PROGRAMS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function AdminResidenPage() {
  const [residents, setResidents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('all');

  // Modal State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    nim_nip: '',
    full_name: '',
    email: '',
    phone: '',
    program_ppds: PPDS_PROGRAMS[0] as string,
    is_active: true,
  });

  const loadResidents = async () => {
    setResidents(DataService.getUsers('residen'));
    try {
      const users = await DataService.syncUsersFromSupabase();
      setResidents(users.filter((u) => u.role === 'residen'));
    } catch (e) {
      console.warn('Sync residents error:', e);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      nim_nip: '',
      full_name: '',
      email: '',
      phone: '',
      program_ppds: PPDS_PROGRAMS[0],
      is_active: true,
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      nim_nip: user.nim_nip,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      program_ppds: user.program_ppds || PPDS_PROGRAMS[0],
      is_active: user.is_active,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.saveUser({
      id: editingUser ? editingUser.id : undefined,
      role: 'residen',
      nim_nip: formData.nim_nip,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      program_ppds: formData.program_ppds,
      is_active: formData.is_active,
    });
    setIsAddEditOpen(false);
    loadResidents();
  };

  const handleToggleStatus = async (id: string) => {
    await DataService.toggleUserActive(id);
    loadResidents();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data akun Residen ini?')) {
      await DataService.deleteUser(id);
      loadResidents();
    }
  };

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nim_nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === 'all' || r.program_ppds === programFilter;
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Manajemen Akun Residen (Mahasiswa PPDS)"
        subtitle="Kelola data akun mahasiswa, program spesialisasi, dan status akses login"
        actions={
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#6a020a] rounded-xl transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Residen Baru</span>
          </button>
        }
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Filter Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIM, atau email..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>

              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-[#800000] outline-none max-w-xs"
              >
                <option value="all">Semua Program PPDS</option>
                {PPDS_PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Total <span className="text-slate-900 font-bold">{filteredResidents.length}</span> Residen
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">NIM & Mahasiswa</th>
                  <th className="py-3.5 px-4">Program Spesialis (PPDS)</th>
                  <th className="py-3.5 px-4">Kontak (Email / Telp)</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4">Total Pengajuan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada data residen.</p>
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{r.full_name}</p>
                        <p className="font-mono text-slate-500 text-xs">{r.nim_nip}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#800000] font-semibold text-[11px] border border-red-100">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {r.program_ppds || '-'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.email}</span>
                        </div>
                        {r.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3" />
                            <span>{r.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(r.id)}
                          title="Klik untuk mengubah status aktif"
                          className="group"
                        >
                          <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 text-xs px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                          {r.total_submissions || 0} naskah
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Data Residen"
                            className="p-1.5 text-slate-500 hover:text-[#800000] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Hapus Akun"
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ADD / EDIT RESIDENT MODAL */}
      {isAddEditOpen && (
        <Modal
          isOpen={isAddEditOpen}
          onClose={() => setIsAddEditOpen(false)}
          title={editingUser ? 'Edit Data Mahasiswa Residen' : 'Tambah Residen Baru'}
          subtitle="Masukkan data identitas sesuai sistem akademik FK UNHAS"
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  NIM (Nomor Induk Mahasiswa)
                </label>
                <input
                  type="text"
                  required
                  value={formData.nim_nip}
                  onChange={(e) => setFormData({ ...formData, nim_nip: e.target.value })}
                  placeholder="Contoh: C104212001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Contoh: dr. Ahmad Fauzi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Program Studi PPDS (30 Program)
              </label>
              <select
                required
                value={formData.program_ppds}
                onChange={(e) => setFormData({ ...formData, program_ppds: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
              >
                {PPDS_PROGRAMS.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Email Akun (UNHAS / Personal)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ahmad@pasca.unhas.ac.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-slate-300 text-[#800000] focus:ring-[#800000]"
              />
              <label htmlFor="is_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                Akun Aktif (Dapat Login dan Mengajukan Verifikasi Jurnal)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#6a020a] rounded-xl transition-colors shadow-md"
              >
                {editingUser ? 'Simpan Perubahan' : 'Tambah Residen'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
