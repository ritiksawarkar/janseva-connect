import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { serviceApi } from "../api";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import ServiceCard from "../components/ServiceCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";

export function ServicesList() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
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

  // Read filter state from URL query params
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const departmentId = searchParams.get("department_id") || "";
  const isVerified = searchParams.get("is_verified") || "";
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Load filter options once
  useEffect(() => {
    let isMounted = true;
    serviceApi
      .getCategories()
      .then((res) => {
        if (isMounted && res.data?.success) setCategories(res.data.categories || []);
      })
      .catch((err) => console.error("Error loading categories:", err));

    serviceApi
      .getDepartments()
      .then((res) => {
        if (isMounted && res.data?.success) setDepartments(res.data.departments || []);
      })
      .catch((err) => console.error("Error loading departments:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch services when params change
  useEffect(() => {
    let isMounted = true;

    const queryParams = {
      page,
      limit: 6,
      sort,
    };
    if (search) queryParams.search = search;
    if (category) queryParams.category = category;
    if (departmentId) queryParams.department_id = departmentId;
    if (isVerified) queryParams.is_verified = isVerified;

    serviceApi
      .getAll(queryParams)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success) {
          setServices(res.data.services || []);
          if (res.data.pagination) setPagination(res.data.pagination);
          setError(null);
        } else {
          setError(res.data?.message || "Failed to load public services");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching services:", err);
        setError("Unable to connect to the JanSeva Connect service catalog.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, category, departmentId, isVerified, sort, page, reloadKey]);

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
    // Reset to page 1 whenever filters change
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
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        breadcrumbs={[{ label: t("nav.services") }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Controls: Search and Sort */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="w-full md:max-w-xl">
            <SearchBar
              value={search}
              onSearch={(val) => updateParam("search", val)}
              placeholder={t("services.searchPlaceholder")}
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
              <option value="latest">Latest Added</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="popular">Popular Services</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout: Sidebar Filters + Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <FilterPanel
                categories={categories}
                departments={departments}
                selectedCategory={category}
                selectedDepartment={departmentId}
                selectedStatus={isVerified}
                onCategoryChange={(val) => updateParam("category", val)}
                onDepartmentChange={(val) => updateParam("department_id", val)}
                onStatusChange={(val) => updateParam("is_verified", val)}
                onReset={handleResetFilters}
                showDepartment={true}
                showState={false}
              />
            </div>
          </div>

          {/* Right Column: Listing Cards */}
          <div className="lg:col-span-3 space-y-6">
            {/* Status bar */}
            {!loading && !error && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <p>
                  {t("common.showing")}{" "}
                  <span className="font-bold text-slate-800">{services.length}</span>{" "}
                  {t("common.of")}{" "}
                  <span className="font-bold text-slate-800">{pagination.total}</span>{" "}
                  {t("common.results")}
                </p>

                {(search || category || departmentId || isVerified) && (
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

            {/* Loading Skeleton */}
            {loading && <LoadingSkeleton count={6} />}

            {/* Error State */}
            {!loading && error && (
              <ErrorState
                message={error}
                onRetry={handleRetry}
              />
            )}

            {/* Empty State */}
            {!loading && !error && services.length === 0 && (
              <EmptyState
                title={t("services.emptyTitle")}
                description={t("services.emptyDesc")}
                onReset={handleResetFilters}
              />
            )}

            {/* Services Grid */}
            {!loading && !error && services.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}

            {/* Pagination */}
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

export default ServicesList;
