import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`l-wrap ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Rapi catat uang, tenang jalani bulan.</h1>
          <p className={styles.lead}>
            BijakDana bantu kamu mencatat transaksi harian, menyusun anggaran, dan
            memantau target tabungan dalam satu tempat, supaya kamu selalu tahu ke
            mana uangmu pergi dan ke mana ia akan tumbuh.
          </p>
          <div className={styles.cta}>
            <Link href="/register" className="l-btn l-btn-primary">Daftar Gratis</Link>
            <a href="#cara-kerja" className="l-btn l-btn-ghost">Lihat Cara Kerja</a>
          </div>
          <p className={styles.note}>
            Fitur dasar gratis untuk mulai mencatat dan merencanakan keuanganmu.
          </p>
        </div>

        {/*
          GANTI VIDEO DI SINI:
          - Taruh video demo aplikasi di public/landing/hero-demo.mp4
          - Taruh gambar thumbnail/poster di public/landing/hero-poster.jpg
          - Video otomatis play, mute, loop (aman di semua browser)
        */}
        <div className={styles.videoStage}>
          <div className={styles.videoFrame}>
            <video
              className={styles.video}
              poster="/lhero-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/hero-demo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}