import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { findNearbyComplaints, joinComplaint } from '../services/complaintService';
import NearbyComplaintCard from '../components/NearbyComplaintCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Sparkles, Navigation, MapPin } from 'lucide-react';

export const NearbyComplaintResults = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const lat = searchParams.get('lat') || '18.5308';
  const lng = searchParams.get('lng') || '73.8475';
  const radius = parseFloat(searchParams.get('radius') || '2');
  const category = searchParams.get('category') || '';
  const keywords = searchParams.get('keywords') || '';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await findNearbyComplaints({
        latitude: lat,
        longitude: lng,
        radius,
        category: category || undefined,
        keywords: keywords || undefined,
        limit: 12
      });

      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load nearby complaint results.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [lat, lng, radius, category, keywords]);

  const handleJoin = async (complaint) => {
    try {
      setJoiningId(complaint.id);
      const res = await joinComplaint(complaint.id);
      if (res.success) {
        showToast(`You have joined ${complaint.trackingId}! Supporter count updated.`);
        fetchResults();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join complaint.', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center space-x-3">
        <Link
          to="/citizen/nearby-complaints"
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Nearby Match Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active grievances filtered within {radius}km of target coordinates.
          </p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            {category ? `Category: ${category} • ` : ''}Radius: {radius} km • {complaints.length} matches found
          </span>
        </div>
        <Link
          to="/citizen/complaints/new"
          className="font-semibold text-blue-700 hover:underline"
        >
          Proceed with New Complaint →
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Matching Nearby Complaints"
          message="No active complaints match your exact criteria. You can register a new grievance."
          actionLabel="Register Complaint"
          actionLink="/citizen/complaints/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((comp) => (
            <NearbyComplaintCard
              key={comp.id}
              complaint={comp}
              onJoin={handleJoin}
              joiningId={joiningId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyComplaintResults;
