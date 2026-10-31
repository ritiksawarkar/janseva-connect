import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Compass,
  Target,
  FileSearch,
  Languages,
  CheckCircle2,
  Landmark,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";

export function About() {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 pb-16">
      <PageHeader
        title={t("about.title")}
        subtitle={t("about.subtitle")}
        breadcrumbs={[{ label: t("nav.about") }]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* CRITICAL TRANSPARENCY & DISCLAIMER NOTICE */}
        <section className="bg-amber-50/70 border border-amber-300 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-amber-950">
                {t("about.disclaimerTitle")}
              </h2>
              <p className="text-sm text-amber-900 leading-relaxed">
                {t("about.disclaimerDesc")}
              </p>
              <p className="text-xs text-amber-800">
                JanSeva Connect does not charge application fees, issue statutory certificates, or act on behalf of any government department. For direct legal processing and statutory service delivery, citizens are always redirected to designated official portals such as Aaple Sarkar (Maharashtra) and MahaDBT.
              </p>
            </div>
          </div>
        </section>

        {/* VISION & MISSION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t("about.visionTitle")}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("about.visionDesc")}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t("about.missionTitle")}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("about.missionDesc")}
            </p>
          </div>
        </section>

        {/* PROBLEMS ADDRESSED */}
        <section className="bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Problems We Address in Citizen Governance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
                Challenge 1
              </span>
              <h3 className="font-bold text-slate-900">Information Fragmentation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Schemes and public services are scattered across dozens of individual departmental portals, making it arduous for citizens to discover entitlements.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
                Challenge 2
              </span>
              <h3 className="font-bold text-slate-900">Opaque Eligibility Rules</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eligibility conditions are buried in complex legal gazettes. Citizens often travel to government offices only to learn they are missing one criterion.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
                Challenge 3
              </span>
              <h3 className="font-bold text-slate-900">Language Barriers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Technical jargon in non-native languages hinders marginalized citizens. JanSeva Connect delivers clear Marathi, Hindi, and English interfaces.
              </p>
            </div>
          </div>
        </section>

        {/* CORE PLATFORM PILLARS */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 text-center sm:text-left">
            {t("about.pillarsTitle")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 mb-2">
                <FileSearch className="w-5 h-5 text-blue-600" />
                <h3>{t("about.pillar1")}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar1Desc")}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 mb-2">
                <Languages className="w-5 h-5 text-purple-600" />
                <h3>{t("about.pillar2")}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar2Desc")}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3>{t("about.pillar3")}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar3Desc")}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 mb-2">
                <Landmark className="w-5 h-5 text-blue-700" />
                <h3>{t("about.pillar4")}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar4Desc")}
              </p>
            </div>
          </div>
        </section>

        {/* QUICK CONTACT BANNER */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-blue-950">
              Have Feedback or Questions?
            </h3>
            <p className="text-xs text-blue-800 mt-1">
              Reach out to our platform support team or browse our comprehensive Help & FAQ section.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/help"
              className="px-4 py-2 rounded-lg bg-white border border-blue-300 text-blue-900 text-xs font-semibold hover:bg-blue-100/50 transition-colors"
            >
              Help & FAQ
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
