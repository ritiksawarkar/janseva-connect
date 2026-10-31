import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getMyComplaints, getCategories } from '../services/complaintService';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintTable from '../components/ComplaintTable';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { LayoutGrid, List, PlusCircle, FileText } from 'lucide-react';

export const MyComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'ALL');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getMyComplaints({
        status,
        category,
        priority,
        search,
        page,
        limit: 8
      });

      if (res.success) {
        setComplaints(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status, category, priority, page]);

  const handleSearchSubmit = (term) => {
    setSearch(term);
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setStatus('ALL');
    setCategory('ALL');
    setPriority('ALL');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            My Submitted Grievances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage and track all public complaints registered by your account.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/citizen/complaints/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Complaint</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        onSearch={handleSearchSubmit}
        placeholder="Search by Tracking ID (e.g. JSC-2026-000001), Title, or Area..."
      />

      {/* Filter Panel */}
      <FilterPanel
        status={status}
        onStatusChange={(val) => { setStatus(val); setPage(1); }}
        category={category}
        onCategoryChange={(val) => { setCategory(val); setPage(1); }}
        priority={priority}
        onPriorityChange={(val) => { setPriority(val); setPage(1); }}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Complaints List / Table */}
      {loading ? (
        <LoadingSkeleton count={4} type={viewMode === 'table' ? 'table' : 'card'} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints match criteria"
          message="No complaints found matching your search and filter criteria. You can submit a new grievance or clear your filters."
          actionLabel="Register New Grievance"
          actionLink="/citizen/complaints/new"
        />
      ) : viewMode === 'table' ? (
        <ComplaintTable complaints={complaints} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
    </div>
  );
};

export default MyComplaints;

