import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Lock,
  Globe2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { serviceApi, schemeApi, statsApi } from "../api";
import ServiceCard from "../components/ServiceCard";
import SchemeCard from "../components/SchemeCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SearchBar from "../components/SearchBar";

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [popularServices, setPopularServices] = useState([]);
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  useEffect(() => {
    // 1. Fetch real dynamic stats from PostgreSQL
    statsApi
      .getOverview()
      .then((res) => {
        if (res.data?.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => {
        console.error("Failed to load platform stats:", err);
      });

    // 2. Fetch popular verified services
    serviceApi
      .getAll({ limit: 4, sort: "popular", is_verified: "true" })
      .then((res) => {
        if (res.data?.success) {
          setPopularServices(res.data.services || []);
        }
      })
      .catch((err) => console.error("Failed to load popular services:", err))
      .finally(() => setLoadingServices(false));

    // 3. Fetch featured schemes
    schemeApi
      .getFeatured(4)
      .then((res) => {
        if (res.data?.success) {
          setFeaturedSchemes(res.data.schemes || []);
        }
      })
      .catch((err) => console.error("Failed to load featured schemes:", err))
      .finally(() => setLoadingSchemes(false));
  }, []);

  const handleHeroSearch = (query) => {
    if (!query || !query.trim()) return;
    navigate(`/services?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-white to-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          {/* Official Verification Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 text-blue-800 text-xs font-semibold mb-6 border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{t("home.heroBadge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {t("home.heroHeading")}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t("home.heroSubtitle")}
          </p>

          {/* Central Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleHeroSearch}
              size="lg"
              placeholder={t("home.searchPlaceholder")}
            />
          </div>

          {/* Primary CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <span>{t("home.exploreServices")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/schemes"
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <span>{t("home.discoverSchemes")}</span>
            </Link>

            <Link
              to="/eligibility-checker"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t("home.checkEligibility")}</span>
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {t("home.verifiedNotice")}
          </p>
        </div>

        {/* Dynamic Real Platform Stats */}
        {stats && (
          <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                {stats.totalServices}
              </p>
              <p className="text-xs font-medium text-slate-600 mt-1">
                {t("stats.totalServices")}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {stats.verifiedServices}
              </p>
              <p className="text-xs font-medium text-slate-600 mt-1">
                {t("stats.verifiedServices")}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                {stats.totalSchemes}
              </p>
              <p className="text-xs font-medium text-slate-600 mt-1">
                {t("stats.totalSchemes")}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {stats.totalDepartments}
              </p>
              <p className="text-xs font-medium text-slate-600 mt-1">
                {t("stats.activeDepartments")}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* POPULAR PUBLIC SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("home.popularServicesTitle")}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t("home.popularServicesDesc")}
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
          >
            <span>{t("home.viewAllServices")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingServices ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED GOVERNMENT SCHEMES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("home.featuredSchemesTitle")}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t("home.featuredSchemesDesc")}
            </p>
          </div>

          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
          >
            <span>{t("home.viewAllSchemes")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingSchemes ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* HOW JANSEVA CONNECT WORKS */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t("home.howItWorksTitle")}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t("home.howItWorksDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.step1Title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("home.step1Desc")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.step2Title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("home.step2Desc")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.step3Title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("home.step3Desc")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t("home.step4Title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("home.step4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY USE JANSEVA CONNECT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t("home.whyJanSevaTitle")}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t("home.whyJanSevaDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {t("home.feature1Title")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("home.feature1Desc")}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {t("home.feature2Title")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("home.feature2Desc")}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {t("home.feature3Title")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("home.feature3Desc")}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {t("home.feature4Title")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("home.feature4Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* OFFICIAL GOVERNMENT RESOURCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Verified Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {t("home.officialResourcesTitle")}
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              {t("home.officialResourcesDesc")}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="https://aaplesarkar.mahaonline.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between transition-colors group"
            >
              <div>
                <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  Aaple Sarkar
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Maharashtra Right to Services</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            </a>

            <a
              href="https://mahadbt.maharashtra.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between transition-colors group"
            >
              <div>
                <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  MahaDBT
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Scholarships & Direct Benefit</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            </a>

            <a
              href="https://www.myscheme.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between transition-colors group"
            >
              <div>
                <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  myScheme Portal
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Govt of India Welfare Engine</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            </a>

            <a
              href="https://www.india.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between transition-colors group"
            >
              <div>
                <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  India.gov.in
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">National Citizen Portal</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
