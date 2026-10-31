import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowUpDown, RotateCcw, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { schemeApi } from "../api";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import SchemeCard from "../components/SchemeCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";

export function SchemesList() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // URL query parameters
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";
  const beneficiaryGroup = searchParams.get("beneficiary_group") || "";
  const isVerified = searchParams.get("is_verified") || "";
  const sort = searchParams.get("sort") || "featured";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Load scheme categories
  useEffect(() => {
    let isMounted = true;
    schemeApi
      .getCategories()
      .then((res) => {
        if (isMounted && res.data?.success) setCategories(res.data.categories || []);
      })
      .catch((err) => console.error("Error loading scheme categories:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch schemes when parameters change
  useEffect(() => {
    let isMounted = true;

    const queryParams = {
      page,
      limit: 6,
      sort,
    };
    if (search) queryParams.search = search;
    if (category) queryParams.category = category;
    if (state) queryParams.state = state;
    if (beneficiaryGroup) queryParams.beneficiary_group = beneficiaryGroup;
    if (isVerified) queryParams.is_verified = isVerified;

    schemeApi
      .getAll(queryParams)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success) {
          setSchemes(res.data.schemes || []);
          if (res.data.pagination) setPagination(res.data.pagination);
          setError(null);
        } else {
          setError(res.data?.message || "Failed to load government schemes");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching schemes:", err);
        setError("Unable to connect to the JanSeva Connect schemes database.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, category, state, beneficiaryGroup, isVerified, sort, page, reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  const updateParam = (key, value) => {
    setLoading(true);
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    if (key !== "page") {
      nextParams.set("page", "1");
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setLoading(true);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={t("schemes.title")}
        subtitle={t("schemes.subtitle")}
        breadcrumbs={[{ label: t("nav.schemes") }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner to Quick Check Eligibility */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Interactive Rule Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              Unsure which schemes you qualify for?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Check your eligibility in 60 seconds with our privacy-protected, rule-based checker.
            </p>
          </div>
          <Link
            to="/eligibility-checker"
            className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-xs inline-flex items-center gap-2 shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Launch Eligibility Checker</span>
          </Link>
        </div>

        {/* Top Controls: Search and Sort */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="w-full md:max-w-xl">
            <SearchBar
              value={search}
              onSearch={(val) => updateParam("search", val)}
              placeholder={t("schemes.searchPlaceholder")}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {t("services.sortLabel")}:
            </span>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="featured">Featured First</option>
              <option value="latest">Latest Added</option>
              <option value="name_asc">Scheme Name (A-Z)</option>
              <option value="name_desc">Scheme Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Filter Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <FilterPanel
                categories={categories}
                selectedCategory={category}
                selectedState={state}
                selectedStatus={isVerified}
                onCategoryChange={(val) => updateParam("category", val)}
                onStateChange={(val) => updateParam("state", val)}
                onStatusChange={(val) => updateParam("is_verified", val)}
                onReset={handleResetFilters}
                showDepartment={false}
                showState={true}
              />
            </div>
          </div>

          {/* Right Column: Schemes Grid */}
          <div className="lg:col-span-3 space-y-6">
            {!loading && !error && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <p>
                  {t("common.showing")}{" "}
                  <span className="font-bold text-slate-800">{schemes.length}</span>{" "}
                  {t("common.of")}{" "}
                  <span className="font-bold text-slate-800">{pagination.total}</span>{" "}
                  {t("common.results")}
                </p>

                {(search || category || state || isVerified) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Active Filters</span>
                  </button>
                )}
              </div>
            )}

            {loading && <LoadingSkeleton count={6} />}

            {!loading && error && (
              <ErrorState message={error} onRetry={handleRetry} />
            )}

            {!loading && !error && schemes.length === 0 && (
              <EmptyState
                title={t("schemes.emptyTitle")}
                description={t("schemes.emptyDesc")}
                onReset={handleResetFilters}
              />
            )}

            {!loading && !error && schemes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map((scheme) => (
                  <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
              </div>
            )}

            {!loading && !error && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => updateParam("page", p)}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchemesList;
