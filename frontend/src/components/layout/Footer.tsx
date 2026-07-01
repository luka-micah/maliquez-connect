import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-4">
            Maliquez<span className="text-primary-400">Connect</span>
          </h3>
          <p className="text-sm">Discover. Compare. Decide. Your decision intelligence platform.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/search" className="hover:text-white">Search</Link></li>
            <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link to="/compare" className="hover:text-white">Compare</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Sectors</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/search?sector=Education" className="hover:text-white">Education</Link></li>
            <li><Link to="/search?sector=Healthcare" className="hover:text-white">Healthcare</Link></li>
            <li><Link to="/search?sector=Hospitality" className="hover:text-white">Hospitality</Link></li>
            <li><Link to="/search?sector=Logistics" className="hover:text-white">Logistics</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Maliquez Connect. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
