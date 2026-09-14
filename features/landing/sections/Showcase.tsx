import styles from "./Showcase.module.css";

const shots = [
  { src: "/shot-tabel.png", cap: "Tabel Keuangan", sub: "Catat transaksi dan pantau pocket budget per kategori." },
  { src: "/shot-grafik.png", cap: "Grafik & Analisis", sub: "Alokasi pengeluaran per bulan, minggu, dan hari dalam satu tampilan." },
  { src: "/shot-tabungan.png", cap: "Tabungan & Investasi", sub: "Pocket dana darurat dan proyeksi pertumbuhan tabunganmu." },
];

const shotsRow2 = [
  { src: "/shot-riwayat.png", cap: "Riwayat Transaksi", sub: "Evaluasi pengeluaran harian, lengkap dengan ringkasan masuk dan keluar." },
  { src: "/shot-kesehatan.png", cap: "Kesehatan Keuangan", sub: "Skor kondisi keuangan bulanan beserta faktor-faktor pendukungnya." },
];

// GANTI GAMBAR: taruh screenshot/foto/video asli aplikasi kamu di public/landing/
// dengan nama file yang sama seperti di atas (shot-tabel.png, shot-grafik.png, dst)
export default function Showcase() {
  return (
    <section className={`l-section ${styles.showcase}`}>
      <div className="l-wrap">
        <div className="l-section-head">
          <div className="l-rule" />
          <h2>Lihat langsung tampilannya</h2>
          <p>Cuplikan asli dari aplikasi BijakDana, bukan ilustrasi.</p>
        </div>
        <div className={styles.grid}>
          {shots.map((s) => (
            <div className={styles.card} key={s.cap}>
              <div className={styles.imgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={`Tampilan ${s.cap} BijakDana`} />
              </div>
              <div className={styles.cap}>
                <div className={styles.capTitle}>{s.cap}</div>
                <p>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.grid} ${styles.row2}`}>
          {shotsRow2.map((s) => (
            <div className={styles.card} key={s.cap}>
              <div className={styles.imgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={`Tampilan ${s.cap} BijakDana`} />
              </div>
              <div className={styles.cap}>
                <div className={styles.capTitle}>{s.cap}</div>
                <p>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}