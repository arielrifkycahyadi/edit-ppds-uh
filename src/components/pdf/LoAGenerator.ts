import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Submission } from '@/lib/types';
import { formatDateOnly } from '@/lib/utils';

export async function generateLoAPDF(submission: Submission) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const approvedJournal = submission.journals.find(j => j.decision === 'accepted' || j.decision === 'revision') || submission.journals[0];

  // Generate QR Code for digital verification
  const qrUrl = `https://sipatuju.med.unhas.ac.id/verify/${submission.code}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 120 });

  // 1. HEADER / KOP SURAT FK UNHAS
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', pageWidth / 2, 18, { align: 'center' });
  doc.text('UNIVERSITAS HASANUDDIN', pageWidth / 2, 23, { align: 'center' });
  
  doc.setFontSize(13);
  doc.setTextColor(128, 0, 0); // UNHAS Maroon
  doc.text('FAKULTAS KEDOKTERAN', pageWidth / 2, 29, { align: 'center' });
  
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('PROGRAM PENDIDIKAN DOKTER SPESIALIS (PPDS)', pageWidth / 2, 34, { align: 'center' });
  doc.text('Jl. Perintis Kemerdekaan Km. 10 Tamalanrea, Makassar 90245 | Telp. (0411) 586010', pageWidth / 2, 38, { align: 'center' });
  doc.text('Laman: http://med.unhas.ac.id | Pos-el: ppds@med.unhas.ac.id', pageWidth / 2, 42, { align: 'center' });

  // Double Border Line
  doc.setDrawColor(128, 0, 0);
  doc.setLineWidth(1.0);
  doc.line(20, 46, pageWidth - 20, 46);
  doc.setLineWidth(0.3);
  doc.line(20, 47.5, pageWidth - 20, 47.5);

  // 2. JUDUL SURAT
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('SURAT KETERANGAN KELAYAKAN PUBLIKASI JURNAL', pageWidth / 2, 57, { align: 'center' });
  
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const docNumber = submission.loa_document_number || `1042/UN4.6.8/PPDS/LOA/${new Date().getFullYear()}`;
  doc.text(`Nomor: ${docNumber}`, pageWidth / 2, 62, { align: 'center' });

  // 3. PENGANTAR
  const textX = 22;
  let cursorY = 72;
  doc.setFontSize(10);
  doc.text('Ketua Tim Verifikasi Jurnal Program Pendidikan Dokter Spesialis (PPDS) Fakultas Kedokteran', textX, cursorY);
  cursorY += 5;
  doc.text('Universitas Hasanuddin menerangkan bahwa:', textX, cursorY);

  // 4. BIODATA RESIDEN
  cursorY += 8;
  const col1 = 26;
  const col2 = 68;
  const col3 = 73;

  const residentInfo = [
    { label: 'Nama Mahasiswa', val: submission.resident_name || 'dr. Residen' },
    { label: 'Nomor Induk Mahasiswa', val: submission.resident_nim || '-' },
    { label: 'Program Studi PPDS', val: submission.program_ppds || '-' },
    { label: 'Dosen Pembimbing', val: submission.supervisor_name || '-' },
    { label: 'Jenis Naskah', val: submission.article_type || '-' },
  ];

  doc.setFont('times', 'normal');
  residentInfo.forEach(item => {
    doc.setFont('times', 'normal');
    doc.text(item.label, col1, cursorY);
    doc.text(':', col2, cursorY);
    doc.setFont('times', 'bold');
    doc.text(item.val, col3, cursorY);
    cursorY += 6;
  });

  // Judul Naskah (Multi-line)
  doc.setFont('times', 'normal');
  doc.text('Judul Naskah', col1, cursorY);
  doc.text(':', col2, cursorY);
  doc.setFont('times', 'bolditalic');
  const splitTitle = doc.splitTextToSize(`"${submission.article_title}"`, pageWidth - col3 - 22);
  doc.text(splitTitle, col3, cursorY);
  cursorY += splitTitle.length * 5 + 4;

  // 5. PERNYATAAN KELAYAKAN
  doc.setFont('times', 'normal');
  doc.text(
    'Setelah melalui proses pemeriksaan kesesuaian ruang lingkup (aims & scope), reputasi indeksasi, serta verifikasi anti-jurnal predator/discontinued, naskah tersebut dinyatakan LAYAK dan DISETUJUI untuk disubmit/dipublikasikan pada target jurnal:',
    textX,
    cursorY,
    { maxWidth: pageWidth - 44, align: 'justify' }
  );
  cursorY += 16;

  // Box Jurnal yang Disetujui
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(0.4);
  doc.roundedRect(22, cursorY, pageWidth - 44, 24, 2, 2, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(128, 0, 0);
  doc.text(`1. ${approvedJournal.journal_name}`, 26, cursorY + 6);
  
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`ISSN: ${approvedJournal.issn}  |  Kuartil/Indeksasi: ${approvedJournal.quartile}`, 26, cursorY + 12);
  
  if (approvedJournal.reviewer_comment) {
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitComment = doc.splitTextToSize(`Catatan Reviewer: "${approvedJournal.reviewer_comment}"`, pageWidth - 56);
    doc.text(splitComment, 26, cursorY + 18);
  }

  cursorY += 32;

  // 6. PENUTUP
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(
    'Demikian Surat Keterangan ini diterbitkan dengan sebenarnya untuk dipergunakan sebagai kelengkapan berkas tugas akhir dan syarat yudisium PPDS FK UNHAS.',
    textX,
    cursorY,
    { maxWidth: pageWidth - 44, align: 'justify' }
  );

  // 7. TANDA TANGAN & QR CODE VERIFIKASI
  cursorY += 18;
  const signatureX = pageWidth - 80;
  const dateStr = formatDateOnly(submission.loa_generated_at || new Date().toISOString());

  doc.text(`Makassar, ${dateStr}`, signatureX, cursorY);
  cursorY += 5;
  doc.text('Ketua Tim Verifikasi Publikasi', signatureX, cursorY);
  cursorY += 4;
  doc.text('PPDS Fakultas Kedokteran UNHAS', signatureX, cursorY);

  // Add QR Code
  doc.addImage(qrDataUrl, 'PNG', 24, cursorY - 2, 26, 26);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan QR untuk validasi keaslian dokumen', 24, cursorY + 28);
  doc.text(`Kode Verifikasi: ${submission.code}`, 24, cursorY + 31);

  // Reviewer Signature Box
  cursorY += 24;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const reviewerName = submission.assigned_reviewer_name || 'Prof. Dr. dr. Syahrul Rauf, Sp.OG(K)';
  doc.text(reviewerName, signatureX, cursorY);
  cursorY += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('NIP. 198203152008121001', signatureX, cursorY);

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dicetak secara otomatis melalui Sistem SIPATUJU PPDS FK UNHAS pada ${formatDateOnly(new Date().toISOString())}`, pageWidth / 2, 285, { align: 'center' });

  // Save PDF
  doc.save(`Surat_Persetujuan_${submission.code}.pdf`);
}
