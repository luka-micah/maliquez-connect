import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import GTMProvider from './components/analytics/GTMProvider';
import ScrollToTop from './components/common/ScrollToTop';

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <GTMProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </GTMProvider>
  </BrowserRouter>
);

export default App;
