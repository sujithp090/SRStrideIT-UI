import { getRestrictedCompanyInfo } from "../RestrictedCompaniesPage/RestrictedCompaniesPage";

export function CompanyFieldWithWarning({ company, setCompany }) {
  const restrictedInfo = getRestrictedCompanyInfo(company);

  return (
    <div className="modal-field">
      <label className="modal-label">Company *</label>
      <input
        className={`modal-input${restrictedInfo ? " company-warn-input" : ""}`}
        placeholder="e.g. Acme Corp"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
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
            className="company-warn-icon"
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
