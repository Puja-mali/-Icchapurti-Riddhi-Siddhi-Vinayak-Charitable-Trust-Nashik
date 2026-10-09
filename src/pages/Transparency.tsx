import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  FileText,
  Download,
  CheckCircle2,
  Scale,
  ExternalLink,
  Search,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Building,
  Info,
} from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { PageHeader } from "@/src/components/common/PageHeader";
import { TransparencyReport, TransparencyReportType } from "@/src/types";
import { transparencyService } from "@/src/services/transparencyService";
import { useLanguage } from "@/src/context/LanguageContext";

export const Transparency: React.FC = () => {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<TransparencyReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<TransparencyReport | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await transparencyService.getReports({
        reportType: selectedType !== "All" ? selectedType : undefined,
        financialYear: selectedYear !== "All" ? selectedYear : undefined,
        search: searchQuery.trim() || undefined,
        limit: 100,
      });
      setReports(response.reports || []);
    } catch (err: any) {
      console.error("Failed to load transparency reports:", err);
      setError(err?.message || t.transparency.loadError);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedType, selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  // Extract unique financial years for the dropdown
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    reports.forEach((r) => {
      if (r.financialYear) years.add(r.financialYear);
    });
    return Array.from(years).sort().reverse();
  }, [reports]);

  const reportTypeFilters = [
    { key: "All", label: t.transparency.allReports },
    { key: "Annual Report", label: t.transparency.annualReports },
    { key: "Financial Report", label: t.transparency.financialReports },
    { key: "Audit Report", label: t.transparency.auditReports },
    { key: "Impact Report", label: t.transparency.impactReports },
    { key: "Donation Utilization Report", label: t.transparency.utilizationReports },
    { key: "Other", label: t.transparency.otherReports },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf8f5]">
      {/* Subtle warm stone architectural texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d6c9b3_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Header */}
        <PageHeader
          kicker={
            language === "mr"
              ? "नोंदणीकृत सार्वजनिक विश्वस्त संस्था · नोंदणी क्र. E-9389 / Nashik"
              : language === "hi"
              ? "पंजीकृत सार्वजनिक धर्मार्थ ट्रस्ट · पंजीकरण सं. E-9389 / Nashik"
              : "Registered Public Charitable Trust · Reg. E-9389 / Nashik"
          }
          title={t.transparency.title}
          description={t.transparency.subtitle}
        />

        {/* Allocation Ratio Card — Modern Nashik Editorial Statutory Docket */}
        <div className="bg-[#fffdf9] text-stone-900 p-6 sm:p-9 rounded-3xl border border-[#ded5c5] shadow-sm relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-200/20 blur-3xl" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>Statutory Disbursal Integrity</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
                {t.transparency.directUtilization}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                Strict governance guidelines cap administrative overhead at under 8%. Every vendor invoice,
                hospital payment, and grain delivery note is cross-checked against independent field inspections.
              </p>
              
              <div className="grid grid-cols-3 gap-3.5 pt-2 text-xs">
                <div className="bg-[#f7f2ea] p-3.5 rounded-2xl border border-[#e2d8c6] space-y-0.5">
                  <div className="font-serif font-bold text-xl text-stone-900">92.4%</div>
                  <div className="text-[11px] text-stone-600 font-medium">Programs & Beneficiaries</div>
                </div>
                <div className="bg-[#f7f2ea] p-3.5 rounded-2xl border border-[#e2d8c6] space-y-0.5">
                  <div className="font-serif font-bold text-xl text-amber-800">4.8%</div>
                  <div className="text-[11px] text-stone-600 font-medium">Audits & Inspections</div>
                </div>
                <div className="bg-[#f7f2ea] p-3.5 rounded-2xl border border-[#e2d8c6] space-y-0.5">
                  <div className="font-serif font-bold text-xl text-stone-700">2.8%</div>
                  <div className="text-[11px] text-stone-600 font-medium">{t.transparency.adminExpenses}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#f9f5ee] p-5 sm:p-6 rounded-2xl border border-[#e0d5c3] space-y-2.5 text-xs">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5 font-serif text-sm">
                <Scale className="w-4 h-4 text-amber-700" />
                <span>Statutory Compliance Registry</span>
              </div>
              <div className="space-y-1.5 text-stone-600 text-[11px]">
                <div><strong className="text-stone-800">80G Registration:</strong> Subject to verification of statutory documentation</div>
                <div><strong className="text-stone-800">12A Registration:</strong> Subject to verification of statutory documentation</div>
                <div><strong className="text-stone-800">CSR-1 Reg Number:</strong> Subject to verification of MCA filing</div>
                <div><strong className="text-stone-800">FCRA Status:</strong> Non-commercial Indian Charity (Domestic Contributions Only)</div>
              </div>
              <div className="pt-1.5 text-[10px] text-stone-500 border-t border-[#e2d8c7]">
                *Official statutory registration certificates are verified upon administrative onboarding.
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Report Type Segmented Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {reportTypeFilters.map((flt) => (
                <button
                  key={flt.key}
                  type="button"
                  onClick={() => setSelectedType(flt.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedType === flt.key
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-white text-stone-700 border border-stone-200/80 hover:bg-stone-100"
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "mr" ? "अहवाल शोधा..." : language === "hi" ? "रिपोर्ट खोजें..." : "Search reports..."}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>
              <Button type="submit" size="sm" variant="outline" className="text-xs h-8 px-3 rounded-xl">
                <Search className="w-3 h-3" />
              </Button>
            </form>
          </div>
        </div>

      {/* Statutory Filings Table & Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            <span>Statutory Audit Dockets & Filed Reports</span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            {reports.length} {reports.length === 1 ? "document" : "documents"}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <Loader2 className="w-6 h-6 text-emerald-800 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">{t.transparency.loading}</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-8 text-center bg-red-50/70 rounded-xl border border-red-200 space-y-3">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <p className="text-xs text-red-700 font-semibold">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchReports}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              {t.transparency.retry}
            </Button>
          </div>
        )}

        {/* Empty State (When DB has no reports) */}
        {!isLoading && !error && reports.length === 0 && (
          <div className="p-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-800">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-800">
              {t.transparency.noReports}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              {t.transparency.noReportsDesc}
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedType("All");
                  setSelectedYear("All");
                  setSearchQuery("");
                  fetchReports();
                }}
                className="text-xs text-emerald-800 border-emerald-800/30"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* Reports Grid */}
        {!isLoading && !error && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-3.5 flex flex-col justify-between hover:border-emerald-700/40 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {rep.financialYear}
                      </span>
                      {rep.reportType && (
                        <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                          {rep.reportType}
                        </span>
                      )}
                      {rep.isFeatured && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ★ Featured
                        </span>
                      )}
                    </div>
                    {rep.filingDate && (
                      <span className="text-[11px] text-stone-500">{rep.filingDate}</span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                    {rep.title}
                  </h3>

                  {rep.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {rep.description}
                    </p>
                  )}

                  <div className="text-xs text-stone-600 space-y-1 pt-1">
                    {rep.auditorFirm && (
                      <div>
                        <strong>{t.transparency.auditor}:</strong> {rep.auditorFirm}
                      </div>
                    )}
                    {rep.statutoryType && (
                      <div>
                        <strong>{t.transparency.statutoryType}:</strong> {rep.statutoryType}
                      </div>
                    )}
                    {rep.totalDisbursal && (
                      <div>
                        <strong>{t.transparency.reportedDisbursal}:</strong> {rep.totalDisbursal}
                      </div>
                    )}
                    {rep.auditRating && (
                      <div className="text-emerald-800 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span>Rating: {rep.auditRating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-400">
                    {rep.fileSize || "Official Filing"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-3 h-8"
                      leftIcon={<Info className="w-3.5 h-3.5 text-stone-600" />}
                      onClick={() => setSelectedReport(rep)}
                    >
                      {t.transparency.viewDossier}
                    </Button>
                    {rep.fileUrl ? (
                      <a
                        href={rep.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-3 h-8 rounded-xl bg-[#14532d] hover:bg-[#0f4023] text-white font-medium shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t.transparency.viewDocument}</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sensitive Data Notice */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
        <div className="font-semibold text-stone-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Beneficiary Privacy & Governance Safeguard</span>
        </div>
        <p className="leading-relaxed">
          While financial transactions, vendor bills, and allocation percentages are fully audited and public,
          personal medical records and identity documents of minor beneficiaries are anonymized under Indian Data Protection norms.
        </p>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.title || t.transparency.dossierDetails}
      >
        {selectedReport && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 space-y-1.5">
              <div><strong>{t.transparency.financialYear}:</strong> {selectedReport.financialYear}</div>
              {selectedReport.reportType && (
                <div><strong>Report Type:</strong> {selectedReport.reportType}</div>
              )}
              {selectedReport.auditorFirm && (
                <div><strong>{t.transparency.auditor}:</strong> {selectedReport.auditorFirm}</div>
              )}
              {selectedReport.statutoryType && (
                <div><strong>{t.transparency.statutoryType}:</strong> {selectedReport.statutoryType}</div>
              )}
              {selectedReport.auditRating && (
                <div><strong>{t.transparency.auditRating}:</strong> {selectedReport.auditRating}</div>
              )}
              {selectedReport.totalDisbursal && (
                <div><strong>{t.transparency.reportedDisbursal}:</strong> {selectedReport.totalDisbursal}</div>
              )}
            </div>

            {selectedReport.description && (
              <div className="space-y-1">
                <div className="font-semibold text-stone-800">Executive Summary:</div>
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                  {selectedReport.description}
                </p>
              </div>
            )}

            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-mono text-center">
              DIGITALLY VERIFIED DOCKET • SCT-{selectedReport.financialYear.toUpperCase()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <Button size="sm" variant="outline" onClick={() => setSelectedReport(null)}>
                {t.transparency.close}
              </Button>
              {selectedReport.fileUrl && (
                <a
                  href={selectedReport.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-md bg-[#14532d] hover:bg-[#0f4023] text-white font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.transparency.viewDocument}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};
