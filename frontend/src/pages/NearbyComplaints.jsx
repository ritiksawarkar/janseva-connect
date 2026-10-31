import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { findNearbyComplaints, joinComplaint, getCategories } from '../services/complaintService';
import NearbyComplaintCard from '../components/NearbyComplaintCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export const NearbyComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  // Search Coordinates (default to Shivaji Nagar, Pune for initial demo discovery)
  const [lat, setLat] = useState(searchParams.get('lat') || '18.5308');
  const [lng, setLng] = useState(searchParams.get('lng') || '73.8475');
  const [locationName, setLocationName] = useState('Shivaji Nagar, Pune');
  const [radius, setRadius] = useState(parseFloat(searchParams.get('radius') || '2'));
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');
  const [page, setPage] = useState(1);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success) setCategories(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const fetchNearby = async () => {
    try {
      setLoading(true);
      const res = await findNearbyComplaints({
        latitude: lat,
        longitude: lng,
        radius,
        category: category || undefined,
        keywords: keywords || undefined,
        page,
        limit: 10
      });

      if (res.success) {
        setComplaints(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching nearby complaints:', err);
      showToast('Failed to load nearby complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [lat, lng, radius, category, page]);

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const userLat = pos.coords.latitude.toFixed(6);
        const userLng = pos.coords.longitude.toFixed(6);
        setLat(userLat);
        setLng(userLng);
        setLocationName('Detected GPS Location');
        showToast('Updated search location to your GPS coordinates.', 'success');
      },
      (err) => {
        setGpsLoading(false);
        showToast('Location permission denied or unavailable.', 'error');
      },
      { timeout: 8000 }
    );
  };

  const handleJoin = async (complaint) => {
    try {
      setJoiningId(complaint.id);
      const res = await joinComplaint(complaint.id);
      if (res.success) {
        showToast(`You have joined ${complaint.trackingId}! Supporter count updated.`);
        fetchNearby();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join complaint.', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  const predefinedLocations = [
    { name: 'Shivaji Nagar (Pune)', lat: 18.5308, lng: 73.8475 },
    { name: 'Kothrud (Pune)', lat: 18.5074, lng: 73.8077 },
    { name: 'Model Colony (Pune)', lat: 18.5362, lng: 73.8340 },
    { name: 'Swargate (Pune)', lat: 18.5018, lng: 73.8636 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Nearby Grievance Discovery Engine
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Find and support active civic issues in your area. Join existing complaints to escalate priority without filing duplicates.
        </p>
      </div>

      {/* Control Panel: Location, Radius & Quick Predefined Areas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Current Search Locality Indicator */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium leading-none">Searching Around</p>
              <h3 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">
                {locationName}
              </h3>
            </div>
          </div>

          {/* GPS Auto-detect Button */}
          <button
            type="button"
            onClick={handleUseCurrentGPS}
            disabled={gpsLoading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {gpsLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>Detect Current GPS Location</span>
          </button>
        </div>

        {/* Quick Predefined Locality Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-slate-400 mr-1">Quick Localities:</span>
          {predefinedLocations.map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => {
                setLat(loc.lat.toString());
                setLng(loc.lng.toString());
                setLocationName(loc.name);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                locationName === loc.name
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Search Radius & Category & Keyword Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Radius Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search Radius
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 0.5, label: '500 m' },
                { val: 1.0, label: '1 km' },
                { val: 2.0, label: '2 km' },
                { val: 5.0, label: '5 km' }
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setRadius(r.val)}
                  className={`text-xs py-1.5 rounded-lg border font-medium transition cursor-pointer text-center ${
                    radius === r.val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter by Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Keywords Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Keywords
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="e.g. Garbage, pothole, light..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchNearby()}
                className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <button
                type="button"
                onClick={fetchNearby}
                className="absolute right-2 p-1 text-slate-400 hover:text-blue-600"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Results Count Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm md:text-base font-bold text-slate-900">
          Nearby Active Grievances ({pagination.total})
        </h2>
        <span className="text-xs text-slate-500">
          Sorted by proximity and community support count
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No complaints within this radius"
          message={`No active public grievances found within ${radius < 1 ? `${radius * 1000}m` : `${radius}km`} of ${locationName}. You can expand the radius or file a new grievance.`}
          actionLabel="Register Grievance in this Area"
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

export default NearbyComplaints;

