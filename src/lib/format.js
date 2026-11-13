export function formatRupiah(nilai) {
  return `Rp${Number(nilai || 0).toLocaleString("id-ID")}`;
}

// 'DD-MM-YYYY' atau 'DD/MM/YYYY' -> 'YYYY-MM-DD' (untuk perbandingan)
export function tanggalKeIso(value) {
  if (!value) return "";
  const match = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}
