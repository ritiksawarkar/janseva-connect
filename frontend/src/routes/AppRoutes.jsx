import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CitizenLayout from '../layouts/CitizenLayout';
import CitizenDashboard from '../pages/CitizenDashboard';
import MyComplaints from '../pages/MyComplaints';
import SubmitComplaint from '../pages/SubmitComplaint';
import NearbyComplaints from '../pages/NearbyComplaints';
import NearbyComplaintResults from '../pages/NearbyComplaintResults';
import JoinedComplaints from '../pages/JoinedComplaints';
import ComplaintDetails from '../pages/ComplaintDetails';
import TrackComplaint from '../pages/TrackComplaint';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/citizen/dashboard" replace />} />

      {/* Citizen Portal Layout with all 8 pages */}
      <Route element={<CitizenLayout />}>
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/complaints" element={<MyComplaints />} />
        <Route path="/citizen/complaints/new" element={<SubmitComplaint />} />
        <Route path="/citizen/nearby-complaints" element={<NearbyComplaints />} />
        <Route path="/citizen/nearby-complaints/results" element={<NearbyComplaintResults />} />
        <Route path="/citizen/joined-complaints" element={<JoinedComplaints />} />
        <Route path="/citizen/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/track-complaint" element={<TrackComplaint />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/citizen/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
