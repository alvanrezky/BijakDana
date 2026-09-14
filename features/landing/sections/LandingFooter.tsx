import Link from "next/link";
import styles from "./LandingFooter.module.css";

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className="l-wrap">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoMark}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-bijakdana.png" alt="Logo BijakDana" />
              </span>
              BijakDana
            </div>
            <p>Catat. Rencanakan. Bertumbuh. Aplikasi keuangan personal untuk anak muda Indonesia.</p>
          </div>
          <div className={styles.col}>
            <h4>Produk</h4>
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className={styles.col}>
            <h4>Perusahaan</h4>
            {/* Halaman /tentang dan /kontak belum dibuat — buat nanti supaya link ini tidak 404 */}
            <Link href="/tentang">Tentang Kami</Link>
            <Link href="/kontak">Kontak</Link>
          </div>
          <div className={styles.col}>
            <h4>Legal</h4>
            {/* Halaman /privasi dan /syarat belum dibuat — buat nanti supaya link ini tidak 404 */}
            <Link href="/privasi">Kebijakan Privasi</Link>
            <Link href="/syarat">Syarat Layanan</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <div>© {new Date().getFullYear()} BijakDana. Semua hak dilindungi.</div>
        </div>
      </div>
    </footer>
  );
}