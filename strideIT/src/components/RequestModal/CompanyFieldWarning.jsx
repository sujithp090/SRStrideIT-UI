// ─────────────────────────────────────────────────────────────────────────────
// PATCH: Add this import at the top of RequestModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { getRestrictedCompanyInfo } from "../RestrictedCompaniesPage/RestrictedCompaniesPage";

// ─────────────────────────────────────────────────────────────────────────────
// Add this style object outside your component (or inside, as a const):
// ─────────────────────────────────────────────────────────────────────────────
const companyWarnStyle = {
  marginTop: 8,
  background: "#fef2f2",
  border: "1.5px solid #fca5a5",
  borderRadius: 10,
  padding: "10px 12px",
  display: "flex",
  alignItems: "flex-start",
  gap: 9,
  animation: "fadeSlideIn 0.2s ease",
};

// ─────────────────────────────────────────────────────────────────────────────
// Add this CSS somewhere globally or in your modal's <style> tag:
// ─────────────────────────────────────────────────────────────────────────────
/*
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
*/

// ─────────────────────────────────────────────────────────────────────────────
// FULL UPDATED COMPANY FIELD BLOCK (copy-paste ready for RequestModal.jsx)
// Replace the existing Company modal-field div with this:
// ─────────────────────────────────────────────────────────────────────────────
export function CompanyFieldWithWarning({ company, setCompany }) {
  const restrictedInfo = getRestrictedCompanyInfo(company);

  return (
    <div className="modal-field">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .company-warn-box {
          margin-top: 8px;
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          animation: fadeSlideIn 0.2s ease;
        }
        .company-warn-title {
          font-weight: 700;
          font-size: 12.5px;
          color: #dc2626;
          margin-bottom: 2px;
        }
        .company-warn-reason {
          font-size: 12px;
          color: #b91c1c;
          line-height: 1.5;
        }
        .company-warn-exempt {
          font-size: 11.5px;
          color: #6b7280;
          margin-top: 5px;
          font-style: italic;
        }
      `}</style>

      <label className="modal-label">Company *</label>
      <input
        className="modal-input"
        placeholder="e.g. Acme Corp"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={
          restrictedInfo
            ? { borderColor: "#fca5a5", background: "#fff8f8" }
            : {}
        }
      />

      {restrictedInfo && (
        <div className="company-warn-box">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <div className="company-warn-title">Restricted Company</div>
            <div className="company-warn-reason">
              <strong>{restrictedInfo.name}</strong> — {restrictedInfo.reason}.
              Please do not schedule interviews for this company.
            </div>
            <div className="company-warn-exempt">
              Genuine candidates are exempted. Contact admin if unsure before
              proceeding.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
