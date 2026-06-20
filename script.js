// ================================================================
// SIJAGUR — Sistem Identifikasi Jagung (Versi Offline - localStorage)
// ================================================================

const kategoriInfo = {
  daun: { label: "Daun", icon: "🍃" },
  batang: { label: "Batang", icon: "🌾" },
  tongkol: { label: "Tongkol / Buah", icon: "🌽" },
  umum: { label: "Pertumbuhan Umum", icon: "🌱" },
};

const gejalaDataBuiltin = [
  { id:"g1", kategori:"daun", text:"Muncul garis-garis kuning pucat (klorosis) sejajar tulang daun" },
  { id:"g2", kategori:"daun", text:"Bercak coklat kemerahan seperti karat, terasa menonjol jika diraba" },
  { id:"g3", kategori:"daun", text:"Bercak memanjang seperti bentuk cerutu, warna coklat keabu-abuan" },
  { id:"g4", kategori:"daun", text:"Bercak kecil memanjang dengan tepi kemerahan/kuning, jumlahnya banyak dan rapat" },
  { id:"g5", kategori:"daun", text:"Permukaan bawah daun berlapis seperti tepung putih (terutama pagi hari)" },
  { id:"g6", kategori:"daun", text:"Daun menggulung, kaku, dan tumbuh tegak" },
  { id:"g7", kategori:"daun", text:"Daun mengering, dimulai dari bagian bawah atau ujung daun" },
  { id:"g8", kategori:"daun", text:"Daun bercorak belang / mosaik hijau tua dan hijau muda" },
  { id:"g9", kategori:"daun", text:"Daun tumbuh menyempit dan bergaris-garis" },
  { id:"g10", kategori:"batang", text:"Batang bagian bawah membusuk, berwarna coklat kehitaman" },
  { id:"g11", kategori:"batang", text:"Batang mudah rebah atau roboh sendiri" },
  { id:"g12", kategori:"batang", text:"Ruas batang berlubang atau keropos saat dibelah" },
  { id:"g13", kategori:"batang", text:"Tercium bau busuk dari batang" },
  { id:"g14", kategori:"tongkol", text:"Biji pada tongkol berwarna kemerahan, keunguan, atau kehitaman" },
  { id:"g15", kategori:"tongkol", text:"Muncul jamur / kapang pada tongkol" },
  { id:"g16", kategori:"tongkol", text:"Kelobot melekat erat dan terasa basah" },
  { id:"g17", kategori:"tongkol", text:"Tongkol tidak terbentuk dengan baik atau ukurannya kecil" },
  { id:"g18", kategori:"umum", text:"Tanaman tumbuh kerdil / pertumbuhan terhambat" },
  { id:"g19", kategori:"umum", text:"Tanaman layu mendadak menjelang panen" },
  { id:"g20", kategori:"umum", text:"Tanaman mati saat masih muda" },
];

const penyakitDataBuiltin = [
  { id:"p1", nama:"Bulai (Downy Mildew)", penyebab:"Jamur Peronosclerospora spp.", gejala:["g1","g5","g6","g17","g18","g20"], penanganan:["Cabut dan musnahkan tanaman terinfeksi","Gunakan benih bersertifikat","Perlakuan benih dengan fungisida","Atur jarak tanam"] },
  { id:"p2", nama:"Karat Daun (Common Rust)", penyebab:"Jamur Puccinia sorghi", gejala:["g2","g7"], penanganan:["Gunakan varietas tahan","Jaga jarak tanam","Bersihkan gulma","Semprot fungisida"] },
  { id:"p3", nama:"Bercak Daun Utara (Northern Corn Leaf Blight)", penyebab:"Jamur Exserohilum turcicum", gejala:["g3","g7"], penanganan:["Tanam varietas tahan","Rotasi tanaman","Musnahkan sisa tanaman","Aplikasi fungisida"] },
  { id:"p4", nama:"Hawar Daun Selatan (Southern Corn Leaf Blight)", penyebab:"Jamur Bipolaris maydis", gejala:["g4","g7"], penanganan:["Benih sehat","Perbaiki drainase","Hindari jarak rapat","Semprot fungisida"] },
  { id:"p5", nama:"Busuk Batang (Stalk Rot)", penyebab:"Jamur Fusarium / Diplodia", gejala:["g10","g11","g12","g13","g19"], penanganan:["Perbaiki drainase","Hindari nitrogen berlebih","Panen tepat waktu","Rotasi tanaman"] },
  { id:"p6", nama:"Busuk Tongkol (Ear Rot)", penyebab:"Jamur Fusarium, Diplodia", gejala:["g14","g15","g16"], penanganan:["Panen tepat waktu","Jemur segera setelah panen","Simpan di tempat kering","Kendalikan hama"] },
  { id:"p7", nama:"Virus Mosaik Kerdil (Maize Dwarf Mosaic Virus)", penyebab:"Virus (kutu daun)", gejala:["g8","g18","g9"], penanganan:["Kendalikan kutu daun","Cabut tanaman terinfeksi","Benih bebas virus","Bersihkan gulma"] },
];

// ---------- Fungsi Storage ----------
function saveToLocalStorage(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function loadFromLocalStorage(key, defaultValue) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

// ---------- State Aplikasi ----------
let customPenyakit = loadFromLocalStorage('sijagur_penyakit', []);
let riwayat = loadFromLocalStorage('sijagur_riwayat', []);
const selected = new Set();

function getAllGejala() { return gejalaDataBuiltin; } // Bisa ditambah custom gejala jika mau
function getAllPenyakit() { return [...penyakitDataBuiltin, ...customPenyakit]; }
function findGejala(id) { return getAllGejala().find(g => g.id === id) || { text: id }; }

// 1. Tab Navigasi
document.querySelectorAll('.tabbar button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// 2. Render Form Gejala
function renderGejalaForm() {
  const form = document.getElementById('gejalaForm');
  const gejala = getAllGejala();
  let html = '';

  Object.keys(kategoriInfo).forEach(cat => {
    const catGejala = gejala.filter(g => g.kategori === cat);
    if(catGejala.length === 0) return;

    html += `
      <div class="category">
        <div class="category-head">
          <div class="icon">${kategoriInfo[cat].icon}</div>
          <h2>Bagian ${kategoriInfo[cat].label}</h2>
          <div class="count">${catGejala.length}</div>
        </div>
    `;
    catGejala.forEach(g => {
      html += `
        <label class="gejala-item">
          <input type="checkbox" value="${g.id}" onchange="toggleGejala('${g.id}', this.checked)">
          <div class="checkbox"></div>
          <div class="gejala-text">${g.text}</div>
        </label>
      `;
    });
    html += `
        <div class="kesimpulan-bagian" id="kesimpulan-${cat}">
          <span class="ic">📝</span>
          <span class="txt">Belum ada gejala tercatat pada bagian ini.</span>
        </div>
      </div>
    `;
  });
  form.innerHTML = html;
  updateStats();
  updateKesimpulanBagianUI();
}

// 3. Logic Pilihan Gejala
window.toggleGejala = function(id, isChecked) {
  if(isChecked) selected.add(id);
  else selected.delete(id);

  document.getElementById('counterNum').textContent = selected.size;
  document.getElementById('diagnoseBtn').disabled = selected.size === 0;
  updateKesimpulanBagianUI();
};

function updateStats() {
  document.getElementById('statGejala').textContent = getAllGejala().length;
  document.getElementById('statPenyakit').textContent = getAllPenyakit().length;
}

// 3b. Kesimpulan per bagian (live, berdasarkan gejala yang sedang dicentang)
function getKesimpulanBagian(cat) {
  const gejala = getAllGejala().filter(g => g.kategori === cat);
  const total = gejala.length;
  const count = gejala.filter(g => selected.has(g.id)).length;
  const pct = total === 0 ? 0 : (count / total) * 100;

  let level = 'none';
  let text = 'Belum ada gejala tercatat pada bagian ini.';

  if (count > 0) {
    if (pct < 40) {
      level = 'low';
      text = `Terindikasi gejala ringan (${count} dari ${total} gejala) pada bagian ini, perlu dipantau lebih lanjut.`;
    } else if (pct < 70) {
      level = 'medium';
      text = `Terindikasi gejala sedang (${count} dari ${total} gejala), kemungkinan ada gangguan pada bagian ini.`;
    } else {
      level = 'high';
      text = `Terindikasi gejala kuat (${count} dari ${total} gejala), kemungkinan besar ada gangguan serius pada bagian ini.`;
    }
  }

  return { count, total, pct: Math.round(pct), level, text };
}

function updateKesimpulanBagianUI() {
  Object.keys(kategoriInfo).forEach(cat => {
    const box = document.getElementById('kesimpulan-' + cat);
    if (!box) return;
    const kb = getKesimpulanBagian(cat);
    box.className = 'kesimpulan-bagian' + (kb.level !== 'none' ? ' level-' + kb.level : '');
    const icon = kb.level === 'high' ? '🔴' : kb.level === 'medium' ? '🟠' : kb.level === 'low' ? '🟢' : '📝';
    box.innerHTML = `<span class="ic">${icon}</span><span class="txt"><b>Kesimpulan bagian ini:</b> ${kb.text}</span>`;
  });
}

// 4. Reset & Diagnosa
document.getElementById('resetBtn').addEventListener('click', () => {
  selected.clear();
  document.getElementById('gejalaForm').reset();
  document.getElementById('counterNum').textContent = '0';
  document.getElementById('diagnoseBtn').disabled = true;
  document.getElementById('resultsWrap').classList.remove('show');
  document.getElementById('namaPengamat').value = '';
  updateKesimpulanBagianUI();
});

document.getElementById('diagnoseBtn').addEventListener('click', () => {
  const penyakit = getAllPenyakit();
  const results = [];

  penyakit.forEach(p => {
    const matched = p.gejala.filter(g => selected.has(g));
    if(matched.length > 0) {
      // Hitung persentase kecocokan
      const score = Math.round((matched.length / p.gejala.length) * 100);
      results.push({ ...p, score, matched });
    }
  });

  results.sort((a, b) => b.score - a.score);
  renderResults(results);

  // Simpan ke riwayat (lengkap dengan detail per bagian & hasil, untuk fitur cetak PDF)
  const nama = document.getElementById('namaPengamat').value || "Petani Anonim";
  const topResult = results.length > 0 ? results[0].nama : "Tidak Terdeteksi";
  const topScore = results.length > 0 ? results[0].score : 0;

  const selectedGejalaSnapshot = Array.from(selected).map(id => {
    const g = findGejala(id);
    return { id, text: g.text, kategori: g.kategori };
  });

  const perBagianSnapshot = {};
  Object.keys(kategoriInfo).forEach(cat => {
    perBagianSnapshot[cat] = getKesimpulanBagian(cat);
  });

  const resultsSnapshot = results.map(r => ({
    nama: r.nama,
    penyebab: r.penyebab,
    score: r.score,
    matchedText: r.matched.map(id => findGejala(id).text),
    penanganan: r.penanganan
  }));

  riwayat.unshift({
    date: new Date().toLocaleString('id-ID'),
    nama: nama,
    hasil: topResult,
    skor: topScore,
    selectedGejala: selectedGejalaSnapshot,
    perBagian: perBagianSnapshot,
    results: resultsSnapshot
  });
  saveToLocalStorage('sijagur_riwayat', riwayat);
  renderRiwayat();
});

function renderResults(results) {
  const wrap = document.getElementById('resultsWrap');
  const body = document.getElementById('resultsBody');
  const sub = document.getElementById('resultsSub');

  if(results.length === 0) {
    sub.textContent = "Tidak ditemukan penyakit yang sesuai.";
    body.innerHTML = `<div class="empty-state">Silakan periksa kembali gejala yang dipilih.</div>`;
  } else {
    sub.textContent = `Ditemukan ${results.length} kemungkinan penyakit.`;
    let html = '';
    results.forEach(r => {
      let badge = r.score >= 70 ? 'badge-high' : r.score >= 40 ? 'badge-med' : 'badge-low';
      let kernels = Math.round(r.score / 20);
      let kernelHtml = '';
      for(let i=0; i<5; i++) kernelHtml += `<div class="kernel ${i < kernels ? 'filled' : ''}"></div>`;

      let matchedHtml = r.matched.map(id => `- ${findGejala(id).text}`).join('<br>');
      let treatHtml = r.penanganan.map(t => `<li>${t}</li>`).join('');

      html += `
        <div class="disease-card">
          <div class="disease-card-top">
            <div>
              <div class="disease-name">${r.nama}</div>
              <div class="disease-cause">${r.penyebab}</div>
            </div>
            <div class="badge ${badge}">${r.score}% Cocok</div>
          </div>
          <div class="kernel-meter">${kernelHtml}</div>
          <details class="treatment" open>
            <summary>Gejala Cocok (${r.matched.length}/${r.gejala.length})</summary>
            <div class="matched-symptoms">${matchedHtml}</div>
          </details>
          <details class="treatment">
            <summary>Rekomendasi Penanganan</summary>
            <ul>${treatHtml}</ul>
          </details>
        </div>
      `;
    });
    body.innerHTML = html;
  }
  wrap.classList.add('show');
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 5. Riwayat Tab
function renderRiwayat() {
  const list = document.getElementById('riwayatList');
  if(riwayat.length === 0) {
    list.innerHTML = `<div class="empty-state">Belum ada riwayat diagnosa tersimpan.</div>`;
    return;
  }
  let html = '';
  riwayat.forEach((r, idx) => {
    html += `
      <div class="history-card">
        <div class="history-top">
          <div>
            <div class="history-date">${r.date} — ${r.nama}</div>
            <div class="history-main">${r.hasil}</div>
          </div>
          <div class="history-pct">${r.skor}%</div>
        </div>
        <div class="history-actions">
          <button class="btn-print" type="button" onclick="cetakRiwayat(${idx})">🖨️ Cetak PDF</button>
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

document.getElementById('clearRiwayatBtn').addEventListener('click', () => {
  if(confirm('Hapus semua catatan riwayat secara permanen?')) {
    riwayat = [];
    saveToLocalStorage('sijagur_riwayat', riwayat);
    renderRiwayat();
  }
});

// 5b. Cetak PDF (memakai dialog cetak bawaan browser -> pilih "Simpan sebagai PDF")
window.cetakRiwayat = function(index) {
  const item = riwayat[index];
  if (!item) return;

  const printArea = document.getElementById('printArea');
  const hasDetail = item.selectedGejala && item.results && item.perBagian;

  if (!hasDetail) {
    printArea.innerHTML = `
      <div class="print-title">🌽 SIJAGUR — Laporan Hasil Diagnosa</div>
      <div class="print-meta">
        Nama Pengamat: <b>${item.nama}</b><br>
        Tanggal: ${item.date}<br>
        Hasil Utama: <b>${item.hasil}</b> (${item.skor}% kecocokan)
      </div>
      <p style="font-size:12.5px; color:#555; margin-top:14px;">Detail gejala dan rincian hasil tidak tersedia untuk catatan riwayat versi lama.</p>
      <div class="print-footer">Dicetak dari Sistem Identifikasi Jagung (SIJAGUR) — Hasil bersifat indikatif, bukan diagnosa pasti. Konsultasikan dengan Penyuluh Pertanian Lapangan (PPL).</div>
    `;
    window.print();
    return;
  }

  let kategoriHtml = '';
  Object.keys(kategoriInfo).forEach(cat => {
    const items = item.selectedGejala.filter(g => g.kategori === cat);
    const kb = item.perBagian[cat];
    kategoriHtml += `
      <div class="print-kategori">
        <h4>${kategoriInfo[cat].icon} Bagian ${kategoriInfo[cat].label}</h4>
        ${items.length ? items.map(g => `<p>• ${g.text}</p>`).join('') : '<p style="color:#888;">Tidak ada gejala dipilih.</p>'}
        <p class="print-kesimpulan">Kesimpulan: ${kb ? kb.text : '-'}</p>
      </div>
    `;
  });

  let hasilHtml = '';
  if (item.results.length === 0) {
    hasilHtml = '<p style="font-size:12.5px;">Tidak ditemukan penyakit yang sesuai dengan gejala yang dipilih.</p>';
  } else {
    item.results.forEach(r => {
      hasilHtml += `
        <div class="print-disease">
          <h4>${r.nama} <span class="pscore">— ${r.score}% Cocok</span></h4>
          <div class="pcause">${r.penyebab}</div>
          <p><b>Gejala cocok:</b> ${r.matchedText.join(', ')}</p>
          <p><b>Rekomendasi penanganan:</b></p>
          <ul>${r.penanganan.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      `;
    });
  }

  printArea.innerHTML = `
    <div class="print-title">🌽 SIJAGUR — Laporan Hasil Diagnosa</div>
    <div class="print-meta">
      Nama Pengamat: <b>${item.nama}</b><br>
      Tanggal: ${item.date}<br>
      Hasil Utama: <b>${item.hasil}</b> (${item.skor}% kecocokan)
    </div>
    <div class="print-section-title">Gejala per Bagian</div>
    ${kategoriHtml}
    <div class="print-section-title">Hasil Diagnosa Lengkap</div>
    ${hasilHtml}
    <div class="print-footer">Dicetak dari Sistem Identifikasi Jagung (SIJAGUR) — Hasil bersifat indikatif berdasarkan kecocokan gejala, bukan diagnosa pasti. Konsultasikan dengan Penyuluh Pertanian Lapangan (PPL).</div>
  `;

  window.print();
};

// 6. Data Penyakit Tab
function renderDataPenyakit() {
  const list = document.getElementById('dataPenyakitList');
  const all = getAllPenyakit();
  let html = '';
  all.forEach(p => {
    html += `
      <div class="disease-card" style="padding:14px;">
        <div class="disease-name" style="font-size:16px;">${p.nama}</div>
        <div class="disease-cause">${p.penyebab}</div>
        <div style="margin-top:8px; font-size:12px; color:#6b7a66;">
          <b>Total Gejala Terkait:</b> ${p.gejala.length} parameter <br>
          <b>Langkah Penanganan:</b> ${p.penanganan.length} langkah
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

// Render Checkbox Gejala di Form Tambah Penyakit
function renderAddFormGejala() {
   const wrap = document.getElementById('formGejalaWrap');
   const gejala = getAllGejala();
   let html = '<div style="max-height:160px; overflow-y:auto; border:2px solid var(--paper-dim); border-radius:10px; padding:10px; background:#fff;">';
   gejala.forEach(g => {
     html += `
       <label style="display:flex; gap:8px; margin-bottom:8px; align-items:start; font-size:13px;">
         <input type="checkbox" value="${g.id}" class="add-gejala-checkbox">
         <span>${g.text}</span>
       </label>
     `;
   });
   html += '</div>';
   wrap.innerHTML = html;
}

document.getElementById('toggleAddForm').addEventListener('click', () => {
  document.getElementById('addDiseaseForm').classList.toggle('show');
});

document.getElementById('cancelDiseaseBtn').addEventListener('click', () => {
  document.getElementById('addDiseaseForm').classList.remove('show');
});

document.getElementById('saveDiseaseBtn').addEventListener('click', () => {
  const nama = document.getElementById('newDiseaseName').value.trim();
  const penyebab = document.getElementById('newDiseaseCause').value.trim() || "Tidak diketahui";
  const penangananRaw = document.getElementById('newDiseaseTreatment').value;
  const penanganan = penangananRaw.split('\n').map(s=>s.trim()).filter(Boolean);

  const checkboxes = document.querySelectorAll('.add-gejala-checkbox:checked');
  const gejalaPilihan = Array.from(checkboxes).map(c => c.value);

  const msg = document.getElementById('addDiseaseMsg');

  if(!nama || gejalaPilihan.length === 0 || penanganan.length === 0) {
    msg.textContent = "Nama penyakit, minimal 1 gejala, dan 1 penanganan wajib diisi!";
    msg.className = 'field-msg';
    return;
  }

  const newId = 'custom_' + Date.now();
  customPenyakit.push({ id: newId, nama, penyebab, gejala: gejalaPilihan, penanganan });
  saveToLocalStorage('sijagur_penyakit', customPenyakit);

  msg.textContent = "Data penyakit berhasil disimpan lokal!";
  msg.className = 'field-msg ok';

  setTimeout(() => {
    document.getElementById('addDiseaseForm').classList.remove('show');
    document.getElementById('newDiseaseName').value = '';
    document.getElementById('newDiseaseCause').value = '';
    document.getElementById('newDiseaseTreatment').value = '';
    msg.textContent = '';
    renderAddFormGejala();
    renderDataPenyakit();
    updateStats();
  }, 1500);
});

// 7. Inisialisasi Pertama Kali
window.onload = () => {
  renderGejalaForm();
  renderRiwayat();
  renderDataPenyakit();
  renderAddFormGejala();
};
