import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import ItemDetail from "./pages/ItemDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMatches from "./pages/AdminMatches";
import AdminMatchApproval from "./pages/AdminMatchApproval";
import MatchResultPage from "@/pages/MatchResultPage";
import MatchDetails from "./pages/MatchDetails";
import HowItWorks from "./components/HowItWorks";
import Privacy from "./pages/Privacy";


const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<Browse />} />
<Route path="/report-lost" element={<ReportLost />} />
<Route path="/report-found" element={<ReportFound />} />
<Route path="/how-it-works" element={<HowItWorks />} />
<Route path="/privacy" element={<Privacy />} />
<Route path="/terms" element={<Privacy />} />


            {/* ================= PROTECTED USER ROUTES ================= */}
            <Route
              path="/report-lost"
              element={
                <ProtectedRoute>
                  <ReportLost />
                </ProtectedRoute>
              }
            />

            <Route
              path="/report-found"
              element={
                <ProtectedRoute>
                  <ReportFound />
                </ProtectedRoute>
              }
            />

           <Route
  path="/match-result/:id"
  element={
    <ProtectedRoute>
      <MatchResultPage />
    </ProtectedRoute>
  }
/>

            <Route
              path="/match-details/:matchId"
              element={
                <ProtectedRoute>
                  <MatchDetails />
                </ProtectedRoute>
              }
            />

            {/* ================= ADMIN ROUTES ================= */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/matches"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminMatches />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/match-approval"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminMatchApproval />
                </ProtectedRoute>
              }
            />

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}