import styles from "./Features.module.css";

const features = [
  { title: "Mono AI", desc: "Asisten AI untuk konsultasi seputar keuanganmu, sekaligus bantu menambahkan transaksi lewat chat atau scan struk belanja." },
  { title: "Tabel Keuangan & Pocket Budget", desc: "Semua pengeluaran tercatat rapi dan dikelompokkan jadi pocket per kategori, jadi anggaran lebih mudah dipantau ketat." },
  { title: "Grafik & Analisis", desc: "Alokasi pengeluaran per bulan, minggu, dan hari terdata rapi, jadi kamu langsung tahu apakah masih sesuai rencana budget." },
  { title: "Tabungan & Investasi", desc: "Buat pocket tabungan dan dana darurat untuk fondasi keuangan yang kuat, lengkap edukasi investasi agar uangmu terus bertumbuh." },
  { title: "Riwayat Transaksi", desc: "Telusuri dan evaluasi seluruh pengeluaranmu dalam periode tertentu, lengkap dengan ringkasan masuk, keluar, dan net." },
  { title: "Skor Kesehatan Keuangan", desc: "Ringkasan kondisi keuanganmu setiap periode dalam satu skor, lengkap dengan faktor-faktor yang mempengaruhinya." },
];

export default function Features() {
  return (
    <section className="l-section" id="fitur">
      <div className="l-wrap">
        <div className="l-section-head">
          <div className="l-rule" />
          <h2>Semua yang kamu perlu, tanpa fitur yang bikin bingung</h2>
          <p>Enam fitur utama yang benar-benar dipakai tiap hari untuk mengatur keuanganmu.</p>
        </div>
      </div>
      <div className="l-wrap" style={{ padding: 0 }}>
        <div className={styles.grid}>
          {features.map((f) => (
            <div className={styles.card} key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}