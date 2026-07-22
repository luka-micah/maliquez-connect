import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import PublicLayout from '../layouts/PublicLayout';
import UserLayout from '../layouts/UserLayout';
import ProviderLayout from '../layouts/ProviderLayout';
import AdminLayout from '../layouts/AdminLayout';

import Home from '../pages/public/Home';
import Search from '../pages/public/Search';
import ListingDetails from '../pages/public/ListingDetails';
import Compare from '../pages/public/Compare';
import Categories from '../pages/public/Categories';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import AgentRegister from '../pages/public/AgentRegister';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import About from '../pages/public/About';
import CategoryPage from '../pages/public/CategoryPage';
import Events from '../pages/public/Events';
import NotFound from '../pages/public/NotFound';

import UserProfile from '../pages/user/UserProfile';
import Favorites from '../pages/user/Favorites';
import UserReviews from '../pages/user/UserReviews';
import Recommendations from '../pages/user/Recommendations';
import ChatList from '../pages/user/ChatList';
import ChatWindow from '../pages/user/ChatWindow';

import ProviderDashboard from '../pages/provider/ProviderDashboard';
import ProviderListings from '../pages/provider/ProviderListings';
import ProviderAnalyticsPage from '../pages/provider/ProviderAnalyticsPage';
import ProviderReviews from '../pages/provider/ProviderReviews';
import ProviderSettings from '../pages/provider/ProviderSettings';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProviders from '../pages/admin/AdminProviders';
import AdminListings from '../pages/admin/AdminListings';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminAds from '../pages/admin/AdminAds';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminEventRegistrations from '../pages/admin/AdminEventRegistrations';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminReports from '../pages/admin/AdminReports';
import AdminProviderAnalytics from '../pages/admin/AdminProviderAnalytics';
import AdminLogin from '../pages/admin/AdminLogin';
import AgentLeaderboard from '../pages/admin/AgentLeaderboard';
import AdminAgents from '../pages/admin/AdminAgents';
import AdminOnboardings from '../pages/admin/AdminOnboardings';

import AgentLayout from '../layouts/AgentLayout';
import AgentDashboard from '../pages/agent/AgentDashboard';
import ProviderManagement from '../pages/agent/ProviderManagement';
import ProviderPipeline from '../pages/agent/ProviderPipeline';
import ProviderDetails from '../pages/agent/ProviderDetails';
import FollowUps from '../pages/agent/FollowUps';
import Activities from '../pages/agent/Activities';

import ProviderClaim from '../pages/provider/ProviderClaim';

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/listings/:id" element={<ListingDetails />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categories/:slug" element={<CategoryPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-agent" element={<AgentRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/events" element={<Events />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </Route>

    <Route path="/provider/claim" element={<ProviderClaim />} />

    <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<UserProfile />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/my-reviews" element={<UserReviews />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/inbox" element={<ChatList />} />
      <Route path="/inbox/:id" element={<ChatWindow />} />
    </Route>

    <Route element={<ProtectedRoute roles={['PROVIDER', 'ADMIN']}><ProviderLayout /></ProtectedRoute>}>
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/provider/listings" element={<ProviderListings />} />
      <Route path="/provider/analytics" element={<ProviderAnalyticsPage />} />
      <Route path="/provider/reviews" element={<ProviderReviews />} />
      <Route path="/provider/settings" element={<ProviderSettings />} />
      <Route path="/provider/inbox" element={<ChatList />} />
      <Route path="/provider/inbox/:id" element={<ChatWindow />} />
    </Route>

    <Route element={<ProtectedRoute roles={['AGENT', 'ADMIN']}><AgentLayout /></ProtectedRoute>}>
      <Route path="/agent/dashboard" element={<AgentDashboard />} />
      <Route path="/agent/providers" element={<ProviderManagement />} />
      <Route path="/agent/providers/:id" element={<ProviderDetails />} />
      <Route path="/agent/pipeline" element={<ProviderPipeline />} />
      <Route path="/agent/follow-ups" element={<FollowUps />} />
      <Route path="/agent/activities" element={<Activities />} />
    </Route>

    <Route element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/providers" element={<AdminProviders />} />
      <Route path="/admin/providers/analytics/:id" element={<AdminProviderAnalytics />} />
      <Route path="/admin/listings" element={<AdminListings />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/ads" element={<AdminAds />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/events/registrations" element={<AdminEventRegistrations />} />
      <Route path="/admin/reviews" element={<AdminReviews />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/agents" element={<AdminAgents />} />
      <Route path="/admin/onboardings" element={<AdminOnboardings />} />
      <Route path="/admin/agent-leaderboard" element={<AgentLeaderboard />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
