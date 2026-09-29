const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const videosDir = path.join(__dirname, '..', 'videos');
const outputMkv = path.join(__dirname, '..', 'tutorial_sipatuju_lengkap.mkv');
const outputWebm = path.join(__dirname, '..', 'tutorial_sipatuju_lengkap.webm');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Clean old files in videos dir
fs.readdirSync(videosDir).forEach(f => fs.unlinkSync(path.join(videosDir, f)));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Memulai browser untuk merekam video tutorial komprehensif...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';

  try {
    // ==========================================
    // BAGIAN 1: PORTAL LOGIN & RESIDEN WORKFLOW
    // ==========================================
    console.log('📍 [1/3] Alur Penggunaan Residen PPDS...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await sleep(2500);

    // Ketik NIM Residen
    await page.locator('input[type="text"]').fill('C104212001');
    await sleep(700);
    await page.locator('input[type="password"]').fill('unhas12345');
    await sleep(800);
    await page.locator('button[type="submit"]').click();

    // Tunggu masuk ke Dashboard Residen
    await page.waitForURL('**/residen', { timeout: 10000 });
    await sleep(2500);

    // Navigasi ke Buat Pengajuan Baru
    console.log('  -> Membuka Form Pengajuan Baru 3 Jurnal...');
    await page.locator('a[href="/residen/pengajuan-baru"]').first().click();
    await page.waitForURL('**/residen/pengajuan-baru');
    await sleep(1500);

    // Langkah 1: Data Naskah
    const textareas = await page.locator('textarea').all();
    if (textareas.length >= 2) {
      await textareas[0].fill('Analisis Biomarker Serum Terhadap Luaran Pasien Kritis di ICU RSUP Dr. Wahidin Sudirohusodo');
      await sleep(600);
      await textareas[1].fill('Penelitian observasional analitik prospektif ini bertujuan untuk mengevaluasi korelasi kadar biomarker inflamasi terhadap mortalitas 30 hari pada 120 pasien kritis dewasa.');
      await sleep(800);
    }
    await page.locator('button:has-text("Lanjut ke Dosen Pembimbing")').click();
    await sleep(1200);

    // Langkah 2: Dosen Pembimbing
    await page.locator('input[placeholder*="Nama Dosen"]').fill('Prof. Dr. dr. H. Haerani Rasyid, M.Kes, Sp.PD-KGH, Sp.GK, FINASIM');
    await sleep(800);
    await page.locator('button:has-text("Lanjut ke 3 Jurnal Kandidat")').click();
    await sleep(1200);

    // Langkah 3: 3 Jurnal Kandidat
    const journalNameInputs = await page.locator('input[placeholder*="Acta"]').all();
    const issnInputs = await page.locator('input[placeholder*="0125-9326"]').all();

    if (journalNameInputs.length >= 3 && issnInputs.length >= 3) {
      // Jurnal 1
      await journalNameInputs[0].fill('Indonesian Journal of Internal Medicine');
      await sleep(400);
      await issnInputs[0].fill('0125-9326');
      await sleep(400);

      // Jurnal 2
      await journalNameInputs[1].fill('Medical Journal of Indonesia');
      await sleep(400);
      await issnInputs[1].fill('2252-8083');
      await sleep(400);

      // Jurnal 3
      await journalNameInputs[2].fill('Bali Medical Journal');
      await sleep(400);
      await issnInputs[2].fill('2089-1180');
      await sleep(800);
    }

    await page.locator('button:has-text("Jalankan Predatory Guard Check")').click();
    await sleep(2500);

    // Langkah 4: Predatory Guard Scan Result
    console.log('  -> Menampilkan Hasil Pemindaian Predatory Guard...');
    await page.locator('button:has-text("Lanjut ke Konfirmasi Akhir")').click();
    await sleep(1800);

    // Langkah 5: Konfirmasi & Kirim
    console.log('  -> Mengirim pengajuan resmi...');
    await page.locator('button:has-text("Kirim Pengajuan Sekarang")').click();
    await sleep(3500);

    // Berada di Hasil Pemeriksaan Residen
    await page.waitForURL('**/residen/hasil');
    await sleep(2500);

    // Logout Residen
    console.log('  -> Logout akun Residen...');
    await page.locator('header button').last().click();
    await sleep(800);
    await page.locator('button:has-text("Keluar dari Akun")').click();
    await page.waitForURL('**/login');
    await sleep(1800);

    // ==========================================
    // BAGIAN 2: REVIEWER WORKFLOW (KLAIM & TELAAH)
    // ==========================================
    console.log('📍 [2/3] Alur Penggunaan Reviewer Jurnal...');
    await page.locator('input[type="text"]').fill('198203152008121001');
    await sleep(600);
    await page.locator('input[type="password"]').fill('unhas12345');
    await sleep(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/reviewer');
    await sleep(2500);

    // Buka Pengajuan Tersedia
    console.log('  -> Membuka Pengajuan Tersedia & Mengambil Naskah (Self-Claim)...');
    await page.locator('a[href="/reviewer/pengajuan-tersedia"]').first().click();
    await page.waitForURL('**/reviewer/pengajuan-tersedia');
    await sleep(2000);

    // Klik Ambil Pemeriksaan
    const claimBtn = page.locator('button:has-text("Ambil Pemeriksaan")').first();
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await sleep(2500);
    } else {
      await page.locator('a[href="/reviewer/pemeriksaan-saya"]').first().click();
      await sleep(1500);
      const detailBtn = page.locator('a:has-text("Buka Lembar Pemeriksaan")').first();
      if (await detailBtn.isVisible()) await detailBtn.click();
      await sleep(2000);
    }

    // Berikan catatan telaah pada 3 Jurnal
    console.log('  -> Mengisi telaah kelayakan 3 jurnal kandidat...');
    const reviewerNotes = await page.locator('textarea').all();
    if (reviewerNotes.length >= 3) {
      await reviewerNotes[0].fill('Jurnal bereputasi tinggi Scopus Q2, ruang lingkup sangat sesuai dengan tema penelitian.');
      await sleep(400);
      await reviewerNotes[1].fill('Sesuai dengan kriteria tugas akhir PPDS FK UNHAS, reputasi terpercaya.');
      await sleep(400);
      await reviewerNotes[2].fill('Disarankan melakukan penyempurnaan format referensi Vancouver sebelum submit.');
      await sleep(800);
    }

    // Submit Telaah
    console.log('  -> Menyelesaikan telaah & menerbitkan keputusan...');
    await page.locator('button:has-text("Kirim Seluruh Hasil Telaah")').click();
    await sleep(3500);

    // Buka Riwayat Pemeriksaan Reviewer
    await page.waitForURL('**/reviewer/riwayat-pemeriksaan');
    await sleep(2500);

    // Klik Detail Telaah
    const viewDetailBtn = page.locator('button:has-text("Detail Telaah")').first();
    if (await viewDetailBtn.isVisible()) {
      await viewDetailBtn.click();
      await sleep(2500);
      await page.locator('button:has-text("Tutup")').click();
      await sleep(1000);
    }

    // Logout Reviewer
    console.log('  -> Logout akun Reviewer...');
    await page.locator('header button').last().click();
    await sleep(800);
    await page.locator('button:has-text("Keluar dari Akun")').click();
    await page.waitForURL('**/login');
    await sleep(1800);

    // ==========================================
    // BAGIAN 3: ADMINISTRATOR WORKFLOW
    // ==========================================
    console.log('📍 [3/3] Alur Penggunaan Administrator PPDS...');
    await page.locator('input[type="text"]').fill('197805122005011002');
    await sleep(600);
    await page.locator('input[type="password"]').fill('unhas12345');
    await sleep(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/admin');
    await sleep(2500);

    // Buka Manajemen Residen
    console.log('  -> Membuka Manajemen Residen...');
    await page.locator('a[href="/admin/residen"]').first().click();
    await page.waitForURL('**/admin/residen');
    await sleep(2500);

    // Buka Manajemen Reviewer
    console.log('  -> Membuka Manajemen Reviewer...');
    await page.locator('a[href="/admin/reviewer"]').first().click();
    await page.waitForURL('**/admin/reviewer');
    await sleep(2500);

    // Buka Restricted Journal Guard
    console.log('  -> Membuka Restricted Journal Guard & Blacklist...');
    await page.locator('a[href="/admin/jurnal-predator"]').first().click();
    await page.waitForURL('**/admin/jurnal-predator');
    await sleep(2500);

    // Kembali ke Dashboard Admin
    await page.locator('a[href="/admin"]').first().click();
    await page.waitForURL('**/admin');
    await sleep(2000);

    // Logout Admin
    console.log('  -> Logout akun Admin & Selesai...');
    await page.locator('header button').last().click();
    await sleep(800);
    await page.locator('button:has-text("Keluar dari Akun")').click();
    await page.waitForURL('**/login');
    await sleep(2000);

    console.log('✅ Skenario perekaman video tutorial komprehensif berhasil selesai 100%!');
  } catch (err) {
    console.error('❌ Error saat perekaman:', err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    // Copy generated video to destination
    const files = fs.readdirSync(videosDir);
    if (files.length > 0) {
      const generatedFile = path.join(videosDir, files[files.length - 1]);
      fs.copyFileSync(generatedFile, outputWebm);
      fs.copyFileSync(generatedFile, outputMkv);
      console.log(`\n🎉 File Video Tutorial Tersimpan:`);
      console.log(`   - MKV: ${outputMkv}`);
      console.log(`   - WebM: ${outputWebm}`);
    }
  }
}

main();
