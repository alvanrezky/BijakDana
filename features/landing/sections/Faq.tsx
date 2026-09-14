"use client";
import { useState } from "react";
import styles from "./Faq.module.css";

const faqs = [
  { q: "Apakah BijakDana gratis dipakai?", a: "Fitur dasar seperti pencatatan transaksi dan anggaran bulanan bisa dipakai gratis selamanya." },
  { q: "Apa itu Mono AI?", a: "Mono AI adalah asisten di dalam BijakDana yang bisa diajak konsultasi seputar keuanganmu, sekaligus membantu mencatat transaksi lewat chat atau scan struk belanja." },
  { q: "Apakah data keuanganku aman?", a: "Data kamu tersimpan aman dan hanya bisa diakses oleh akunmu sendiri." },
  { q: "Perlu instal aplikasi atau cukup lewat browser?", a: "BijakDana adalah aplikasi web, jadi bisa langsung dipakai dari browser di HP atau laptop tanpa instalasi." },
  { q: "Bagaimana cara mulai menggunakannya?", a: 'Klik "Daftar Gratis", isi data singkat, dan kamu bisa langsung mulai mencatat transaksi pertamamu.' },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`l-section ${styles.faq}`} id="faq">
      <div className="l-wrap">
        <div className="l-section-head">
          <div className="l-rule" />
          <h2>Pertanyaan yang sering ditanyakan</h2>
        </div>
        <div className={styles.list}>
          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <div className={styles.item} key={item.q}>
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                >
                  {item.q}
                  <span className={`${styles.chev} ${open ? styles.chevOpen : ""}`}>+</span>
                </button>
                <div className={styles.answer} style={{ maxHeight: open ? "240px" : "0" }}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}