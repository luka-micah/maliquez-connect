import { Link } from 'react-router-dom';
import { FiTarget, FiEye, FiHeart, FiShield, FiUsers, FiAward, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200/30 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-300/30 to-primary-100/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-primary-200/40 to-primary-50/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-primary-200/30 to-primary-100/10 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-l from-primary-300/20 to-transparent rounded-full blur-2xl animate-pulse-glow" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="animate-fade-in-up">
          <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">About Us</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-darkText mt-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          Connecting You to <span className="text-primary-600">Better Decisions</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Maliquez Connect is a decision intelligence platform that helps individuals and businesses find, compare, and choose the best service providers across Education, Healthcare, Hospitality, and Logistics.
        </p>
      </div>
    </section>

    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: FiTarget, title: 'Our Mission', description: 'To empower individuals and businesses with the insights they need to make confident, informed decisions when choosing service providers.', delay: '0.1s' },
            { icon: FiEye, title: 'Our Vision', description: 'A world where every important decision about services is backed by transparent, reliable, and accessible information.', delay: '0.2s' },
            { icon: FiHeart, title: 'Our Values', description: 'Transparency, trust, and community drive everything we do. We believe in honest reviews, verified listings, and putting users first.', delay: '0.3s' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-8 border border-gray-100 text-center animate-fade-in-up hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: item.delay }}>
              <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-brand-darkText mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dxx0r7sdm/image/upload/v1783692074/hel1_ckfhio.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-900/80" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary-300 font-semibold text-sm tracking-wider uppercase">Why Maliquez Connect</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">What Sets Us Apart</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FiShield, title: 'Verified Providers', description: 'Every listing is vetted for authenticity and quality assurance.' },
            { icon: FiAward, title: 'Trusted Reviews', description: 'Real feedback from real users you can rely on.' },
            { icon: FiUsers, title: 'Community Powered', description: 'Join thousands making smarter decisions together.' },
            { icon: FiTarget, title: 'Smart Comparisons', description: 'Compare options side by side to find your perfect match.' },
          ].map((item) => (
            <div key={item.title} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase animate-fade-in-up">Get in Touch</span>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-darkText mt-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Contact Us</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Have questions or feedback? We would love to hear from you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5">
              <FiMail className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-brand-darkText mb-2">Email</h3>
            <a href="mailto:info@maliquez.com" className="text-primary-600 hover:text-primary-700">info@maliquez.com</a>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5">
              <FiPhone className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-brand-darkText mb-2">Phone</h3>
            <a href="tel:07032495905" className="text-primary-600 hover:text-primary-700">07032495905</a>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-5">
              <FiMapPin className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-brand-darkText mb-2">Address</h3>
            <p className="text-gray-500 text-sm">112 Ebitu Ukiwe Street, Jabi, Abuja</p>
          </div>
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
