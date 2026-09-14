import styles from "./Testimonials.module.css";

const testimonials = [
  { quote: "Baru sebulan pakai, aku jadi tahu ternyata jajan kopi paling banyak makan budget bulanan.", initials: "RA", name: "Rani A.", role: "Karyawan swasta, Bandung" },
  { quote: "Fitur target menabungnya bikin aku akhirnya bisa nabung buat DP motor tanpa berasa berat.", initials: "DP", name: "Dimas P.", role: "Freelancer, Yogyakarta" },
  { quote: "Mono AI-nya kepakai banget buat catat transaksi cepat, tinggal foto struk aja selesai.", initials: "SN", name: "Sinta N.", role: "Mahasiswa, Surabaya" },
];

// Ini masih data contoh/dummy — ganti dengan testimoni asli begitu sudah ada pengguna
export default function Testimonials() {
  return (
    <section className="l-section" id="testimoni">
      <div className="l-wrap">
        <div className="l-section-head">
          <div className="l-rule" />
          <h2>Dipakai anak muda dari berbagai kota</h2>
          <p>Contoh tampilan testimoni, ganti dengan ulasan asli begitu sudah ada pengguna.</p>
        </div>
        <div className={styles.grid}>
          {testimonials.map((t) => (
            <div className={styles.card} key={t.name}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.quote}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.person}>
                <div className={styles.avatar}>{t.initials}</div>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.role}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.tag}></div>
      </div>
    </section>
  );
}