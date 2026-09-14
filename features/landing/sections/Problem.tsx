import styles from "./Problem.module.css";

const items = [
  {
    title: "Uang habis, tapi nggak tahu kemana perginya",
    desc: "Transaksi kecil harian jarang dicatat, padahal jumlahnya paling besar di akhir bulan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    title: "Pengin nabung, tapi nggak pernah konsisten",
    desc: "Tanpa target dan progres yang terlihat, niat menabung gampang kalah sama godaan bulanan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" />
      </svg>
    ),
  },
  {
    title: "Catatan keuangan tersebar di mana-mana",
    desc: "Sebagian di notes HP, sebagian cuma diingat, jadi susah dilihat sebagai satu gambaran utuh.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
];

export default function Problem() {
  return (
    <section className={`l-section ${styles.problem}`}>
      <div className={`l-wrap ${styles.grid}`}>
        <div className="l-section-head" style={{ marginBottom: 0 }}>
          <div className="l-rule" />
          <h2>Kalau gajian selalu terasa numpang lewat, kamu nggak sendirian.</h2>
          <p>Kebanyakan orang bukan boros, cuma nggak pernah lihat gambaran utuh soal ke mana uangnya pergi tiap bulan.</p>
        </div>
        <div className={styles.list}>
          {items.map((item) => (
            <div className={styles.item} key={item.title}>
              <div className={styles.icon}>{item.icon}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}