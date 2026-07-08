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
import About from '../pages/public/About';
import CategoryPage from '../pages/public/CategoryPage';
import NotFound from '../pages/public/NotFound';

import UserProfile from '../pages/user/UserProfile';
import Favorites from '../pages/user/Favorites';
import UserReviews from '../pages/user/UserReviews';
import Recommendations from '../pages/user/Recommendations';

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
import AdminReviews from '../pages/admin/AdminReviews';
import AdminReports from '../pages/admin/AdminReports';

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
      <Route path="/about" element={<About />} />
    </Route>

    <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<UserProfile />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/my-reviews" element={<UserReviews />} />
      <Route path="/recommendations" element={<Recommendations />} />
    </Route>

    <Route element={<ProtectedRoute roles={['PROVIDER', 'ADMIN']}><ProviderLayout /></ProtectedRoute>}>
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/provider/listings" element={<ProviderListings />} />
      <Route path="/provider/analytics" element={<ProviderAnalyticsPage />} />
      <Route path="/provider/reviews" element={<ProviderReviews />} />
      <Route path="/provider/settings" element={<ProviderSettings />} />
    </Route>

    <Route element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/providers" element={<AdminProviders />} />
      <Route path="/admin/listings" element={<AdminListings />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/reviews" element={<AdminReviews />} />
      <Route path="/admin/reports" element={<AdminReports />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
