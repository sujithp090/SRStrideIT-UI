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

const TAG_CLASS = {
  "PF Verification": "restricted-tag-pf",
  "F2F Mandatory": "restricted-tag-f2f",
  "Strict WFO": "restricted-tag-wfo",
  "Live Verification": "restricted-tag-live",
  "Small Company": "restricted-tag-small",
  "Background Check": "restricted-tag-bg",
  "Additional Checks": "restricted-tag-additional",
};

const ALL_TAGS = Object.keys(TAG_CLASS);

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
    <div className="restricted-overlay">
      <div className="restricted-panel">
        <div className="restricted-header">
          <div className="restricted-header-left">
            <div className="restricted-icon-wrap">
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
              <h2 className="restricted-title">Restricted Companies</h2>
              <p className="restricted-subtitle">
                {RESTRICTED_COMPANIES.length} companies — do not schedule interviews
              </p>
            </div>
          </div>
          {onClose && (
            <button className="restricted-close-btn" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="restricted-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" className="restricted-notice-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="restricted-notice-text">
            <strong>Note:</strong> Genuine candidates are <strong>exempted</strong> from this restriction. When in doubt,
            consult the admin before scheduling.
          </span>
        </div>

        <div className="restricted-controls">
          <div className="restricted-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" className="restricted-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="restricted-search-input"
              placeholder="Search company or reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="restricted-filters">
            <button
              className={`restricted-filter-chip ${activeFilter === "All" ? "active" : ""}`}
              onClick={() => setActiveFilter("All")}
            >
              All <span className="restricted-filter-count">{RESTRICTED_COMPANIES.length}</span>
            </button>
            {ALL_TAGS.map((tag) => {
              const isActive = activeFilter === tag;
              const tagClass = TAG_CLASS[tag] || "";
              return (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`restricted-filter-chip ${tagClass} ${isActive ? "active" : ""}`}
                >
                  <span className={`restricted-dot ${tagClass}`} />
                  {tag}
                  <span className="restricted-filter-count">{tagCounts[tag] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="restricted-table-wrap">
          <table className="restricted-table">
            <thead>
              <tr>
                <th className="restricted-th restricted-th-index">#</th>
                <th className="restricted-th">Company</th>
                <th className="restricted-th">Reason</th>
                <th className="restricted-th">Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="restricted-empty-row">No companies match your search.</td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const tagClass = TAG_CLASS[c.tag] || "";
                  return (
                    <tr key={c.name} className="restricted-tr">
                      <td className="restricted-td restricted-td-index">{RESTRICTED_COMPANIES.indexOf(c) + 1}</td>
                      <td className="restricted-td restricted-td-company">{c.name}</td>
                      <td className="restricted-td restricted-td-reason">{c.reason}</td>
                      <td className="restricted-td">
                        <span className={`restricted-tag ${tagClass}`}>
                          <span className={`restricted-dot ${tagClass}`} />
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

        <div className="restricted-footer">
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

