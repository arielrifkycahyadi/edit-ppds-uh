'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataService } from '@/lib/data-service';
import { UserProfile } from '@/lib/types';
import {
  UserCheck,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Building2,
  Mail,
  Phone,
  ClipboardList,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function AdminReviewerPage() {
  const [reviewers, setReviewers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    nim_nip: '',
    full_name: '',
    email: '',
    phone: '',
    department: 'Departemen Obstetri & Ginekologi',
    is_active: true,
  });

  const loadReviewers = async () => {
    setReviewers(DataService.getUsers('reviewer'));
    try {
      const users = await DataService.syncUsersFromSupabase();
      setReviewers(users.filter((u) => u.role === 'reviewer'));
    } catch (e) {
      console.warn('Sync reviewers error:', e);
    }
  };

  useEffect(() => {
    loadReviewers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      nim_nip: '',
      full_name: '',
      email: '',
      phone: '',
      department: 'Departemen Ilmu Penyakit Dalam',
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
      department: user.department || 'FK UNHAS',
      is_active: user.is_active,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.saveUser({
      id: editingUser ? editingUser.id : undefined,
      role: 'reviewer',
      nim_nip: formData.nim_nip,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      is_active: formData.is_active,
    });
    setIsAddEditOpen(false);
    loadReviewers();
  };

  const handleToggleStatus = async (id: string) => {
    await DataService.toggleUserActive(id);
    loadReviewers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun Reviewer ini?')) {
      await DataService.deleteUser(id);
      loadReviewers();
    }
  };

  const filteredReviewers = reviewers.filter(
    (r) =>
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nim_nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Manajemen Tim Reviewer Jurnal"
        subtitle="Kelola data dosen penelaah/verifikator jurnal PPDS FK UNHAS dan pantau beban pemeriksaan"
        actions={
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#6a020a] rounded-xl transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Reviewer Baru</span>
          </button>
        }
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama dosen, NIP, atau email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Total <span className="text-slate-900 font-bold">{filteredReviewers.length}</span> Reviewer Aktif
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Nama Dosen & NIP</th>
                  <th className="py-3.5 px-4">Departemen / Bagian</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Beban Kerja (Selesai)</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviewers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada data reviewer.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReviewers.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{r.full_name}</p>
                        <p className="font-mono text-slate-500 text-xs">NIP. {r.nim_nip}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-100">
                          <Building2 className="w-3.5 h-3.5" />
                          {r.department || 'Fakultas Kedokteran'}
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{r.completed_reviews || 0} Selesai</span>
                          </span>
                        </div>
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

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Data Reviewer"
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

      {/* ADD / EDIT MODAL */}
      {isAddEditOpen && (
        <Modal
          isOpen={isAddEditOpen}
          onClose={() => setIsAddEditOpen(false)}
          title={editingUser ? 'Edit Data Reviewer' : 'Tambah Reviewer Baru'}
          subtitle="Masukkan data dosen penelaah jurnal PPDS FK UNHAS"
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  NIP / NIDN
                </label>
                <input
                  type="text"
                  required
                  value={formData.nim_nip}
                  onChange={(e) => setFormData({ ...formData, nim_nip: e.target.value })}
                  placeholder="Contoh: 198203152008121001"
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
                  placeholder="Prof. Dr. dr. Nama, Sp.XX(K)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Departemen / Bagian Spesialis
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Contoh: Departemen Obstetri & Ginekologi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Email UNHAS
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@med.unhas.ac.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Nomor HP / WhatsApp
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
                id="reviewer_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-slate-300 text-[#800000] focus:ring-[#800000]"
              />
              <label htmlFor="reviewer_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                Akun Reviewer Aktif (Dapat menerima & menelaah usulan naskah)
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
                {editingUser ? 'Simpan Perubahan' : 'Tambah Reviewer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
