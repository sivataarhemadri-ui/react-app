const DONATIONS_KEY = "foodbridge_donations";
const CERTS_KEY = "foodbridge_certificates";

export function getDonations() {
  try {
    return JSON.parse(localStorage.getItem(DONATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDonation(donation) {
  const all = getDonations();
  all.push(donation);
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(all));
  return donation;
}

export function updateDonation(id, patch) {
  const all = getDonations();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(all));
  return all[idx];
}

export function getCertificates() {
  try {
    return JSON.parse(localStorage.getItem(CERTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCertificate(cert) {
  const all = getCertificates();
  all.push(cert);
  localStorage.setItem(CERTS_KEY, JSON.stringify(all));
  return cert;
}

export const MEAL_VALUE = 35;

export function buildCertificateNumber(seq) {
  const year = new Date().getFullYear();
  const fy = `${year}-${String(year + 1).slice(2)}`;
  const padded = String(seq).padStart(5, "0");
  return { certificateNo: `FB-80G-${fy}-${padded}`, financialYear: fy };
}

export function formatDateIN(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
