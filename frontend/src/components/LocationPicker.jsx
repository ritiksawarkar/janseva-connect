import React, { useState } from 'react';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';

export const LocationPicker = ({
  location = {
    state: 'Maharashtra',
    district: '',
    area: '',
    landmark: '',
    location_address: '',
    latitude: '',
    longitude: ''
  },
  onChange,
  errors = {}
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const handleFieldChange = (field, value) => {
    onChange({
      ...location,
      [field]: value
    });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setGpsSuccess(true);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        onChange({
          ...location,
          latitude: lat,
          longitude: lng,
          // If area is empty, default to detected locality coordinates
          district: location.district || 'Pune',
          state: location.state || 'Maharashtra'
        });
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? 'Location permission denied. You can still enter your address manually.'
            : 'Unable to retrieve your current location. Please enter manually.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {/* GPS Detection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-900">
              Quick GPS Auto-Detect
            </p>
            <p className="text-[11px] text-blue-700/80">
              Assists department response team in locating the issue precisely.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={gpsLoading}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-2xs transition disabled:opacity-50 cursor-pointer"
        >
          {gpsLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : gpsSuccess ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          <span>{gpsLoading ? 'Detecting...' : gpsSuccess ? 'GPS Coordinates Captured' : 'Detect GPS Location'}</span>
        </button>
      </div>

      {gpsError && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>{gpsError}</span>
        </p>
      )}

      {/* Grid Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            State <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={location.state || 'Maharashtra'}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            className="w-full text-xs md:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            District <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Pune, Mumbai, Nagpur"
            value={location.district || ''}
            onChange={(e) => handleFieldChange('district', e.target.value)}
            className={`w-full text-xs md:text-sm bg-white border rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
              errors.district ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors.district && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.district}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            City / Area / Ward <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Shivaji Nagar, Kothrud, Ward 12"
            value={location.area || ''}
            onChange={(e) => handleFieldChange('area', e.target.value)}
            className={`w-full text-xs md:text-sm bg-white border rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
              errors.area ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors.area && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.area}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nearby Landmark
          </label>
          <input
            type="text"
            placeholder="e.g. Near Municipal Garden, Opp Bus Depot"
            value={location.landmark || ''}
            onChange={(e) => handleFieldChange('landmark', e.target.value)}
            className="w-full text-xs md:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full Street / Location Address <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Plot 14, FC Road Lane 2, Shivaji Nagar"
          value={location.location_address || ''}
          onChange={(e) => handleFieldChange('location_address', e.target.value)}
          className={`w-full text-xs md:text-sm bg-white border rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none ${
            errors.location_address ? 'border-rose-300' : 'border-slate-200'
          }`}
        />
        {errors.location_address && (
          <p className="text-[11px] text-rose-500 mt-1">{errors.location_address}</p>
        )}
      </div>

      {/* Lat/Long summary */}
      {location.latitude && location.longitude && (
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-100 p-2 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Coordinates: {location.latitude}, {location.longitude}</span>
          <span className="text-slate-400">• Generalized in public previews for privacy</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

