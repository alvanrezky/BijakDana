import styles from "./Steps.module.css";

const steps = [
  {
    num: "01",
    title: "Catat",
    desc: "Catat setiap pemasukan dan pengeluaran hanya dalam beberapa detik, lengkap dengan kategori yang terdeteksi otomatis.",
  },
  {
    num: "02",
    title: "Rencanakan",
    desc: "Susun anggaran bulanan per kategori dan tentukan target tabungan sesuai prioritas hidupmu sendiri.",
  },
  {
    num: "03",
    title: "Bertumbuh",
    desc: "Tumbuhkan uang Anda lewat pilihan investasi cerdas dan lihat bagaimana aset Anda berkembang dari waktu ke waktu.",
  },
];

export default function Steps() {
  return (
    <section className={`l-section ${styles.steps}`} id="cara-kerja">
      <div className="l-wrap">
        <div className={`l-section-head ${styles.head}`}>
          <div className="l-rule" />
          <h2>Tiga langkah, sudah terangkum di nama kami</h2>
          <p>BijakDana dibangun mengikuti alur paling wajar dalam mengatur uang, dari mencatat sampai melihat hasilnya.</p>
        </div>
      </div>
      <div className="l-wrap" style={{ padding: 0 }}>
        <div className={styles.row}>
          {steps.map((s) => (
            <div className={styles.col} key={s.num}>
              <div className={styles.num}>{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}