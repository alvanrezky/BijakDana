"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./LandingHeader.module.css";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={`l-wrap ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-bijakdana.png" alt="Logo BijakDana" />
          </span>
          BijakDana
        </Link>

        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ""}`}>
          <a href="#fitur" onClick={() => setMenuOpen(false)}>Fitur</a>
          <a href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara Kerja</a>
          <a href="#testimoni" onClick={() => setMenuOpen(false)}>Testimoni</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        </div>

        <div className={styles.navActions}>
          <Link href="/login" className="l-btn l-btn-textlink">Masuk</Link>
          <Link href="/register" className="l-btn l-btn-primary">Daftar Gratis</Link>
        </div>

        <button
          className={styles.navToggle}
          aria-label="Buka menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>
    </header>
  );
}