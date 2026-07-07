import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-primary-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-4">
            Maliquez<span className="text-primary-200">Connect</span>
          </h3>
          <p className="text-sm text-white/80">Discover. Compare. Decide. Your decision intelligence platform.</p>
          <div className="flex items-center gap-3 mt-6">
            <a href="#" aria-label="Facebook" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
              <FiFacebook className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
              <FiTwitter className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
              <FiInstagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
              <FiLinkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/search" className="text-primary-200 hover:text-white transition-colors">Search</Link></li>
            <li><Link to="/categories" className="text-primary-200 hover:text-white transition-colors">Categories</Link></li>
            <li><Link to="/compare" className="text-primary-200 hover:text-white transition-colors">Compare</Link></li>
            <li><Link to="/about" className="text-primary-200 hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Sectors</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/search?sector=Education" className="text-primary-200 hover:text-white transition-colors">Education</Link></li>
            <li><Link to="/search?sector=Healthcare" className="text-primary-200 hover:text-white transition-colors">Healthcare</Link></li>
            <li><Link to="/search?sector=Hospitality" className="text-primary-200 hover:text-white transition-colors">Hospitality</Link></li>
            <li><Link to="/search?sector=Logistics" className="text-primary-200 hover:text-white transition-colors">Logistics</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="text-primary-200 hover:text-white transition-colors">Login</Link></li>
            <li><Link to="/register" className="text-primary-200 hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-600 mt-8 pt-8 text-center text-sm text-white/60">
        <p>&copy; {new Date().getFullYear()} Maliquez Connect. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
