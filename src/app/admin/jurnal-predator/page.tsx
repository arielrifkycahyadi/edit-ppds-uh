'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Modal } from '@/components/ui/Modal';
import { DataService } from '@/lib/data-service';
import { RestrictedJournal } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertOctagon,
  BookOpen,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function AdminJurnalPredatorPage() {
  const [journals, setJournals] = useState<RestrictedJournal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    journal_name: '',
    issn: '',
    source: 'Bealls List',
    source_reference: '',
  });

  const loadJournals = async () => {
    setJournals(DataService.getRestrictedJournals());
    try {
      const list = await DataService.syncRestrictedJournalsFromSupabase();
      setJournals(list);
    } catch (e) {
      console.warn('Sync restricted journals error:', e);
    }
  };

  useEffect(() => {
    loadJournals();
  }, []);

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.addRestrictedJournal(
      formData.journal_name,
      formData.issn,
      formData.source,
      formData.source_reference
    );
    setIsAddOpen(false);
    setFormData({
      journal_name: '',
      issn: '',
      source: 'Bealls List',
      source_reference: '',
    });
    loadJournals();
  };

  const handleToggleStatus = async (id: string) => {
    await DataService.toggleRestrictedJournal(id);
    loadJournals();
  };

  const filteredJournals = journals.filter((j) => {
    const matchesSearch =
      j.journal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.issn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.normalized_name.includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || j.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const activeCount = journals.filter((j) => j.is_active).length;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Restricted Journal Guard (Jurnal Predator & Discontinued)"
        subtitle="Daftar hitam sumber rujukan jurnal yang dilarang untuk publikasi tugas akhir PPDS FK UNHAS"
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Jurnal Terlarang</span>
          </button>
        }
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 shadow-sm">
          <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold text-amber-950">Sistem Proteksi Otomatis Residen (Restricted Journal Guard):</p>
            <p className="mt-0.5">
              Setiap pengajuan naskah oleh Residen akan melewati validasi normalisasi teks (nama jurnal dan ISSN) secara otomatis terhadap basis data ini. Jika terdeteksi, pengajuan akan langsung ditandai berisiko atau diblokir.
            </p>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Filter Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama jurnal atau ISSN..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-[#800000] outline-none"
              >
                <option value="all">Semua Sumber</option>
                <option value="Bealls List">Beall's List</option>
                <option value="Discontinued Scopus">Discontinued Scopus</option>
                <option value="Discontinued WoS">Discontinued WoS</option>
                <option value="Predatory Guard">Predatory Guard FK UNHAS</option>
                <option value="Manual Admin">Manual Admin</option>
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Total <span className="text-red-700 font-bold">{activeCount}</span> Jurnal Dibatasi (Aktif)
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Nama Jurnal</th>
                  <th className="py-3.5 px-4">ISSN</th>
                  <th className="py-3.5 px-4">Sumber / Klasifikasi</th>
                  <th className="py-3.5 px-4">Catatan Keterangan</th>
                  <th className="py-3.5 px-4">Status Proteksi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJournals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada jurnal terlarang yang sesuai pencarian.</p>
                    </td>
                  </tr>
                ) : (
                  filteredJournals.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 text-sm">{j.journal_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Norm: {j.normalized_name}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {j.issn || '-'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          {j.source}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 text-xs">{j.source_reference || '-'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            j.is_active
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${j.is_active ? 'bg-red-600' : 'bg-slate-400'}`} />
                          {j.is_active ? 'Aktif Memblokir' : 'Nonaktif'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(j.id)}
                          title={j.is_active ? 'Nonaktifkan Pemblokiran' : 'Aktifkan Pemblokiran'}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            j.is_active
                              ? 'text-slate-600 hover:bg-slate-100 border-slate-200'
                              : 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
                          }`}
                        >
                          {j.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ADD MODAL */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Tambah Jurnal Predator / Discontinued"
          subtitle="Masukkan data jurnal yang dilarang untuk dijadikan target publikasi PPDS"
          maxWidth="md"
        >
          <form onSubmit={handleAddJournal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Nama Lengkap Jurnal
              </label>
              <input
                type="text"
                required
                value={formData.journal_name}
                onChange={(e) => setFormData({ ...formData, journal_name: e.target.value })}
                placeholder="Contoh: International Journal of Medical Practice..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                ISSN / e-ISSN
              </label>
              <input
                type="text"
                required
                value={formData.issn}
                onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                placeholder="Contoh: 2349-512X"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Sumber Database / Blacklist
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-600 outline-none"
              >
                <option value="Bealls List">Beall's List (Predatory Publishers)</option>
                <option value="Discontinued Scopus">Scopus Discontinued List</option>
                <option value="Discontinued WoS">Clarivate / WoS Delisted</option>
                <option value="Predatory Guard">Predatory Guard FK UNHAS</option>
                <option value="Manual Admin">Manual Tim Admin PPDS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Keterangan / Alasan Pembatasan
              </label>
              <textarea
                rows={3}
                value={formData.source_reference}
                onChange={(e) => setFormData({ ...formData, source_reference: e.target.value })}
                placeholder="Contoh: Discontinued sejak 2025 akibat indikasi publication malpractice"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl transition-colors shadow-md"
              >
                Simpan ke Blacklist
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
