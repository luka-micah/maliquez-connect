import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import GTMProvider from './components/analytics/GTMProvider';

const App = () => (
  <BrowserRouter>
    <GTMProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </GTMProvider>
  </BrowserRouter>
);

export default App;
