import Link from "next/link";
import styles from "./CtaBanner.module.css";

export default function CtaBanner() {
  return (
    <section>
      <div className={styles.banner}>
        <div>
          <h2 className={styles.title}>Siap kendalikan uangmu mulai hari ini?</h2>
          <p className={styles.desc}>Gratis untuk mulai, tanpa perlu kartu kredit.</p>
        </div>
        <Link href="/register" className="l-btn l-btn-on-dark">Daftar Gratis</Link>
      </div>
    </section>
  );
}