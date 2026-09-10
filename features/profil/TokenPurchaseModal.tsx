"use client";
import { motion, AnimatePresence } from "framer-motion";
import { TOKEN_PACKAGES } from "@/lib/ai/tokenPricing";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./TokenPurchaseModal.module.css";

// Fitur pembelian token dinonaktifkan sementara — Midtrans belum diintegrasikan.
// Sebelumnya tombol "Beli" langsung menambah saldo lewat saveProfile() tanpa
// proses pembayaran apa pun; logic itu sengaja dihapus. Saat Midtrans sudah siap,
// buat handler baru yang memanggil API pembayaran, baru tambah saldo setelah
// callback sukses dari Midtrans.
export default function TokenPurchaseModal({
  open,
  onClose,
  currentBalance,
}: {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onPurchased?: (newBalance: number) => void; // tidak dipakai selama fitur beli nonaktif
}) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="token-purchase-overlay"
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className={styles.title}>{t("token_modal_title")}</div>
            <div className={styles.balanceBox}>
              {t("token_current_balance")} <strong>{currentBalance.toLocaleString("id-ID")}</strong>
            </div>

            <div className={styles.comingSoonBanner}>
              🚧 Fitur pembelian token belum tersedia. Pembayaran (Midtrans) sedang dalam proses integrasi.
            </div>

            <div className={styles.grid}>
              {TOKEN_PACKAGES.map((pkg) => (
                <div key={pkg.id} className={styles.pkgDisabled} aria-disabled="true">
                  <div className={styles.pkgTokens}>{pkg.tokens.toLocaleString("id-ID")}</div>
                  <div className={styles.pkgLabel}>token</div>
                  <div className={styles.pkgPrice}>{formatRupiah(pkg.price)}</div>
                </div>
              ))}
            </div>

            <button className={styles.buyBtn} disabled title="Fitur belum tersedia">
              {t("token_buy_btn")} (Segera Hadir)
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>
              {t("btn_cancel")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}