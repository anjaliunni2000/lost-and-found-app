import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

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

import MatchResultPage from "@/pages/MatchResultPage";
import MatchDetails from "./pages/MatchDetails";
import HowItWorks from "./components/HowItWorks";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ClaimRequests from "./pages/ClaimRequests";
import Chats from "./pages/Chats";
import FinderDetails from "./pages/FinderDetails";
import AIResults from "@/pages/AIResults";
import AdminItems from "./pages/AdminItems";
import AdminUsers from "./pages/AdminUsers";
import AdminFeedback from "./pages/AdminFeedback";
import AdminResolutions from "./pages/AdminResolutions";
import VerifyEmail from "./pages/VerifyEmail";
import ClaimItem from "@/pages/ClaimItem";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/finder-details/:id" element={<FinderDetails />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/claim-item/:id" element={<ClaimItem />} />

          {/* USER */}
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

          <Route
            path="/chat/user/:userId"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />

          <Route
            path="/claims"
            element={
              <ProtectedRoute>
                <ClaimRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-results"
            element={
              <ProtectedRoute>
                <AIResults />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/resolutions"
            element={
              <ProtectedRoute adminOnly>
                <AdminResolutions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/matches"
            element={
              <ProtectedRoute adminOnly>
                <AdminMatches />
              </ProtectedRoute>
            }
          />



          <Route
            path="/admin/items"
            element={
              <ProtectedRoute adminOnly>
                <AdminItems />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute adminOnly>
                <AdminFeedback />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}