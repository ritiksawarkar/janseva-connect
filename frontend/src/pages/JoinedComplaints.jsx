import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJoinedComplaints, leaveComplaint } from '../services/complaintService';
import SearchBar from '../components/SearchBar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintTable from '../components/ComplaintTable';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import { Heart, LayoutGrid, List, Sparkles } from 'lucide-react';

export const JoinedComplaints = () => {
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  // Leave support modal state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchJoined = async () => {
    try {
      setLoading(true);
      const res = await getJoinedComplaints({
        status: status !== 'ALL' ? status : undefined,
        search: search.trim() || undefined,
        page,
        limit: 8
      });

      if (res.success) {
        setComplaints(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching joined complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoined();
  }, [status, page]);

  const handleSearchSubmit = (term) => {
    setSearch(term);
    setPage(1);
    fetchJoined();
  };

  const handleOpenLeaveModal = (comp) => {
    setSelectedComplaint(comp);
    setLeaveModalOpen(true);
  };

  const handleConfirmLeave = async () => {
    if (!selectedComplaint) return;
    setWithdrawing(true);
    try {
      const res = await leaveComplaint(selectedComplaint.id);
      if (res.success) {
        showToast(`Withdrew support from ${selectedComplaint.tracking_id || selectedComplaint.trackingId}.`);
        fetchJoined();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to withdraw support.', 'error');
    } finally {
      setWithdrawing(false);
      setLeaveModalOpen(false);
      setSelectedComplaint(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Joined Community Complaints
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Neighborhood complaints you have joined to support rapid departmental resolution.
          </p>
        </div>

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
      </div>

      {/* Innovation Explainer Banner */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Community Support In Action:</strong> When multiple citizens join an existing complaint, departments receive a single consolidated work order rather than multiple duplicate reports.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearchSubmit}
            placeholder="Search joined complaints by Tracking ID or Title..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="text-xs md:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 w-full sm:w-48 shadow-2xs"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_VERIFICATION">Under Verification</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLUTION_SUBMITTED">Resolution Submitted</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Listing */}
      {loading ? (
        <LoadingSkeleton count={4} type={viewMode === 'table' ? 'table' : 'card'} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No joined complaints found"
          message="You have not joined any community grievances yet. Discover open complaints near your location to lend your support!"
          actionLabel="Explore Nearby Complaints"
          actionLink="/citizen/nearby-complaints"
        />
      ) : viewMode === 'table' ? (
        <ComplaintTable
          complaints={complaints}
          isJoinedView={true}
          onLeave={handleOpenLeaveModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              isJoinedView={true}
              onLeave={handleOpenLeaveModal}
            />
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />

      {/* Confirmation Modal to Leave Support */}
      <ConfirmationModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={handleConfirmLeave}
        loading={withdrawing}
        title="Withdraw Community Support"
        message={`Are you sure you want to withdraw your support from ${selectedComplaint?.tracking_id || selectedComplaint?.trackingId}?`}
        confirmText="Withdraw Support"
        confirmVariant="rose"
      />
    </div>
  );
};

export default JoinedComplaints;
