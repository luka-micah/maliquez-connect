import { Link } from 'react-router-dom';
import { FiTarget, FiEye, FiHeart, FiShield, FiUsers, FiAward } from 'react-icons/fi';
import SeoHead from '../../components/seo/SeoHead';
import { OrganizationJsonLd } from '../../components/seo/JsonLd';

const About = () => (
  <div>
      <SeoHead
        title="About Us"
        description="Learn about Maliquez Connect — the decision intelligence platform helping you find, compare, and choose the best service providers with confidence."
        canonical="/about"
      />
      <OrganizationJsonLd
        name="Maliquez Connect"
        description="Decision intelligence platform connecting users with verified service providers."
        url="https://maliquez.com"
      />
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/60 via-white to-primary-50/40" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/40 rounded-full blur-3xl" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">About Us</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-darkText mt-4 mb-6">
          Connecting You to <span className="text-primary-600">Better Decisions</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Maliquez Connect is a decision intelligence platform that helps individuals and businesses find, compare, and choose the best service providers across Education, Healthcare, Hospitality, and Logistics.
        </p>
      </div>
    </section>

    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5">
              <FiTarget className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-brand-darkText mb-3">Our Mission</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              To empower individuals and businesses with the insights they need to make confident, informed decisions when choosing service providers.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5">
              <FiEye className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-brand-darkText mb-3">Our Vision</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              A world where every important decision about services is backed by transparent, reliable, and accessible information.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5">
              <FiHeart className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-brand-darkText mb-3">Our Values</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Transparency, trust, and community drive everything we do. We believe in honest reviews, verified listings, and putting users first.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Why Maliquez Connect</span>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-darkText mt-3">What Sets Us Apart</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FiShield, title: 'Verified Providers', description: 'Every listing is vetted for authenticity and quality assurance.' },
            { icon: FiAward, title: 'Trusted Reviews', description: 'Real feedback from real users you can rely on.' },
            { icon: FiUsers, title: 'Community Powered', description: 'Join thousands making smarter decisions together.' },
            { icon: FiTarget, title: 'Smart Comparisons', description: 'Compare options side by side to find your perfect match.' },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-brand-darkText mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-darkText mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-8">
          Join Maliquez Connect today and start making confident decisions about the services that matter most to you.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register" className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg">
            Create an Account
          </Link>
          <Link to="/search" className="px-8 py-3 bg-white text-primary-600 rounded-xl font-semibold border border-primary-600 hover:bg-primary-50 transition-colors">
            Browse Listings
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
