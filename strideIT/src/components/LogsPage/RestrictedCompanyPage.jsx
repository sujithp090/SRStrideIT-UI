import { useState } from "react";

const RESTRICTED_COMPANIES = [
  {
    name: "Accolite",
    reason: "PF statement live check",
    tag: "PF Verification",
  },
  {
    name: "Altimetrik",
    reason: "PF statement live check",
    tag: "PF Verification",
  },
  {
    name: "Capgemini",
    reason: "PF statement live check",
    tag: "PF Verification",
  },
  { name: "CGI", reason: "Final round F2F", tag: "F2F Mandatory" },
  {
    name: "Cognizant",
    reason: "PF statement live check",
    tag: "PF Verification",
  },
  { name: "Emids", reason: "5-day WFO policy", tag: "Strict WFO" },
  { name: "EY", reason: "Live verification", tag: "Live Verification" },
  { name: "Fireflink", reason: "Only ~50 employees", tag: "Small Company" },
  {
    name: "GlobalLogic",
    reason: "1 round in office mandatory",
    tag: "F2F Mandatory",
  },
  {
    name: "Happiest Minds",
    reason: "F2F round required",
    tag: "F2F Mandatory",
  },
  {
    name: "Harman",
    reason: "1 round in office mandatory",
    tag: "F2F Mandatory",
  },
  { name: "IBM", reason: "PF statement live check", tag: "PF Verification" },
  {
    name: "Infogain",
    reason: "1 round in office mandatory",
    tag: "F2F Mandatory",
  },
  {
    name: "Infinite Computer Solutions",
    reason: "1 round in office mandatory",
    tag: "F2F Mandatory",
  },
  { name: "JP Morgan", reason: "Live verification", tag: "Live Verification" },
  { name: "KPMG", reason: "Live verification", tag: "Live Verification" },
  { name: "Mirafra", reason: "Final round F2F", tag: "F2F Mandatory" },
  { name: "Mobile Programming", reason: "Small company", tag: "Small Company" },
  { name: "Mphasis", reason: "Live verification", tag: "Live Verification" },
  {
    name: "Nagarro",
    reason: "Additional checks apply",
    tag: "Additional Checks",
  },
  { name: "Photon", reason: "5-day WFO policy", tag: "Strict WFO" },
  { name: "Publicis Sapient", reason: "5-day WFO policy", tag: "Strict WFO" },
  {
    name: "Quinnox",
    reason: "1 round in office mandatory",
    tag: "F2F Mandatory",
  },
  {
    name: "Quest Global",
    reason: "Additional checks apply",
    tag: "Additional Checks",
  },
  {
    name: "Rakuten",
    reason: "Additional checks apply",
    tag: "Additional Checks",
  },
  {
    name: "Sandisk",
    reason: "Additional checks apply",
    tag: "Additional Checks",
  },
  {
    name: "Sonata Software",
    reason: "1 round in office mandatory",
    tag: "F2F Mandatory",
  },
  {
    name: "Tech Mahindra",
    reason: "Live verification",
    tag: "Live Verification",
  },
  { name: "Terralogic", reason: "5-day WFO policy", tag: "Strict WFO" },
  {
    name: "UST Global",
    reason: "1 round in office mandatory",
    tag: "F2F Mandatory",
  },
  {
    name: "Value Labs",
    reason: "360° interview check",
    tag: "Additional Checks",
  },
  {
    name: "Virtusa",
    reason: "Live bank detail check",
    tag: "Live Verification",
  },
  {
    name: "Infosys",
    reason: "Strict background verification",
    tag: "Background Check",
  },
  {
    name: "CitiusTech",
    reason: "Detailed background checks",
    tag: "Background Check",
  },
  { name: "EPAM", reason: "Strict assessment + F2F", tag: "F2F Mandatory" },
  {
    name: "LTI Mindtree",
    reason: "Live PF verification",
    tag: "PF Verification",
  },
  {
    name: "TCS",
    reason: "Mandatory background + extensive checks",
    tag: "Background Check",
  },
  {
    name: "Tata Elxsi",
    reason: "Strict hiring evaluation",
    tag: "Additional Checks",
  },
  {
    name: "Hexaware",
    reason: "Live verification steps",
    tag: "Live Verification",
  },
];

const TAG_STYLES = {
  "PF Verification": { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  "F2F Mandatory": { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  "Strict WFO": { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
  "Live Verification": { bg: "#fce7f3", color: "#9d174d", dot: "#ec4899" },
  "Small Company": { bg: "#e0f2fe", color: "#075985", dot: "#0ea5e9" },
  "Background Check": { bg: "#dcfce7", color: "#14532d", dot: "#22c55e" },
  "Additional Checks": { bg: "#f1f5f9", color: "#334155", dot: "#94a3b8" },
};

const ALL_TAGS = Object.keys(TAG_STYLES);

export default function RestrictedCompaniesPage({ onClose }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = RESTRICTED_COMPANIES.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.reason.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || c.tag === activeFilter;
    return matchSearch && matchFilter;
  });

  const tagCounts = {};
  RESTRICTED_COMPANIES.forEach((c) => {
    tagCounts[c.tag] = (tagCounts[c.tag] || 0) + 1;
  });

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Header — fixed, never scrolls */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconWrap}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <div>
              <h2 style={styles.title}>Restricted Companies</h2>
              <p style={styles.subtitle}>
                {RESTRICTED_COMPANIES.length} companies — do not schedule
                interviews
              </p>
            </div>
          </div>
          {onClose && (
            <button style={styles.closeBtn} onClick={onClose}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Disclaimer — fixed, never scrolls */}
        <div style={styles.noticeBanner}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={styles.noticeText}>
            <strong>Note:</strong> Genuine candidates are{" "}
            <strong>exempted</strong> from this restriction. When in doubt,
            consult the admin before scheduling.
          </span>
        </div>

        {/* Search + Filters — fixed, never scrolls */}
        <div style={styles.controls}>
          <div style={styles.searchWrap}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              style={styles.searchInput}
              placeholder="Search company or reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={styles.filters}>
            <button
              style={{
                ...styles.filterChip,
                ...(activeFilter === "All" ? styles.filterChipActive : {}),
              }}
              onClick={() => setActiveFilter("All")}
            >
              All{" "}
              <span style={styles.filterCount}>
                {RESTRICTED_COMPANIES.length}
              </span>
            </button>
            {ALL_TAGS.map((tag) => {
              const s = TAG_STYLES[tag];
              const isActive = activeFilter === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  style={{
                    ...styles.filterChip,
                    ...(isActive
                      ? { background: s.bg, color: s.color, borderColor: s.dot }
                      : {}),
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: s.dot,
                      display: "inline-block",
                      marginRight: 5,
                    }}
                  />
                  {tag}
                  <span style={styles.filterCount}>{tagCounts[tag] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ONLY the table scrolls ── */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 40 }}>#</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Reason</th>
                <th style={styles.th}>Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#94a3b8",
                      fontSize: 14,
                    }}
                  >
                    No companies match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const s = TAG_STYLES[c.tag];
                  return (
                    <tr key={c.name} style={styles.tr}>
                      <td
                        style={{
                          ...styles.td,
                          color: "#94a3b8",
                          fontSize: 12,
                          width: 40,
                        }}
                      >
                        {RESTRICTED_COMPANIES.indexOf(c) + 1}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: 13.5,
                        }}
                      >
                        {c.name}
                      </td>
                      <td
                        style={{ ...styles.td, color: "#475569", fontSize: 13 }}
                      >
                        {c.reason}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.tag,
                            background: s.bg,
                            color: s.color,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: s.dot,
                              display: "inline-block",
                              marginRight: 5,
                            }}
                          />
                          {c.tag}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.footer}>
          Showing {filtered.length} of {RESTRICTED_COMPANIES.length} companies
        </div>
      </div>
    </div>
  );
}

// ─── Exported helper for modal warning ───────────────────────────────────────
export function getRestrictedCompanyInfo(companyName) {
  if (!companyName || companyName.trim().length < 2) return null;
  return (
    RESTRICTED_COMPANIES.find(
      (c) => c.name.toLowerCase() === companyName.trim().toLowerCase(),
    ) || null
  );
}

export { RESTRICTED_COMPANIES };

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  panel: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 820,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
    overflow: "hidden", // panel itself does NOT scroll
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0, // ← never shrink/scroll away
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 400,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBanner: {
    margin: "16px 24px 0",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    flexShrink: 0, // ← never shrink/scroll away
  },
  noticeText: { fontSize: 13, color: "#1e40af", lineHeight: 1.55 },
  controls: {
    padding: "16px 24px 12px",
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0, // ← never shrink/scroll away
  },
  searchWrap: { position: "relative", marginBottom: 12 },
  searchInput: {
    width: "100%",
    paddingLeft: 38,
    paddingRight: 14,
    paddingTop: 9,
    paddingBottom: 9,
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 13.5,
    color: "#0f172a",
    outline: "none",
    background: "#f8fafc",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  filters: { display: "flex", flexWrap: "wrap", gap: 6 },
  filterChip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 11px",
    borderRadius: 20,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  filterChipActive: {
    background: "#fef2f2",
    color: "#dc2626",
    borderColor: "#fca5a5",
  },
  filterCount: {
    background: "rgba(0,0,0,0.07)",
    borderRadius: 20,
    padding: "1px 6px",
    fontSize: 11,
    marginLeft: 2,
  },
  tableWrap: {
    flex: 1,
    overflowY: "auto", // ← ONLY this div scrolls
    padding: "0 24px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 11.5,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    background: "#fff", // solid white — rows won't bleed through
    position: "sticky",
    top: 0,
    zIndex: 2, // ← sits above td cells while scrolling
    boxShadow: "0 2px 0 #f1f5f9", // border-bottom doesn't stick, box-shadow does
  },
  tr: { borderBottom: "1px solid #f8fafc" },
  td: { padding: "11px 12px", verticalAlign: "middle" },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11.5,
    fontWeight: 600,
  },
  footer: {
    padding: "12px 24px",
    borderTop: "1px solid #f1f5f9",
    fontSize: 12.5,
    color: "#94a3b8",
    textAlign: "right",
    flexShrink: 0, // ← never shrink/scroll away
  },
};
