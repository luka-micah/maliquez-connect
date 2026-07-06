import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { searchApi } from '../../api/authApi';
import ListingCard from '../../components/common/ListingCard';
import {
  FiSearch, FiBookOpen, FiHeart, FiHome, FiTruck,
  FiStar, FiTrendingUp, FiShield, FiThumbsUp, FiUsers, FiAward,
  FiBarChart2, FiArrowUp, FiArrowRight, FiCheckCircle, FiZap,
  FiCompass, FiRefreshCw,
} from 'react-icons/fi';
import { ApiResponse, Listing } from '../../types';

function ScrollReveal({ children, className = '', style, ...props }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`animate-reveal ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

interface Sector {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  sector: string;
  description: string;
  count: string;
  image: string;
}

const sectors: Sector[] = [
  {
    name: 'Education', icon: FiBookOpen, color: 'text-blue-500', gradient: 'from-blue-500 to-blue-600',
    sector: 'EDUCATION', description: 'Schools, tutors, and learning centers', count: '240+',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
  },
  {
    name: 'Healthcare', icon: FiHeart, color: 'text-red-500', gradient: 'from-red-500 to-red-600',
    sector: 'HEALTHCARE', description: 'Hospitals, clinics, and wellness', count: '180+',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80',
  },
  {
    name: 'Hospitality', icon: FiHome, color: 'text-amber-500', gradient: 'from-amber-500 to-amber-600',
    sector: 'HOSPITALITY', description: 'Hotels, restaurants, and travel', count: '320+',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  },
  {
    name: 'Logistics', icon: FiTruck, color: 'text-green-500', gradient: 'from-green-500 to-green-600',
    sector: 'LOGISTICS', description: 'Shipping, freight, and delivery', count: '150+',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
  },
];

const steps = [
  { icon: FiSearch, title: 'Search', description: 'Browse thousands of verified service providers in your area' },
  { icon: FiBarChart2, title: 'Compare', description: 'Compare ratings, pricing, and features side by side' },
  { icon: FiThumbsUp, title: 'Decide', description: 'Make confident choices backed by real user reviews' },
];

const features = [
  { icon: FiShield, title: 'Verified Providers', description: 'Every listing is vetted for authenticity and quality' },
  { icon: FiStar, title: 'Real Reviews', description: 'Honest feedback from real users you can trust' },
  { icon: FiTrendingUp, title: 'Smart Comparisons', description: 'Side-by-side analysis to find your perfect match' },
  { icon: FiZap, title: 'AI Recommendations', description: 'Personalized suggestions based on your preferences' },
  { icon: FiUsers, title: 'Community Driven', description: 'Join thousands making smarter decisions together' },
  { icon: FiAward, title: 'Quality Assured', description: 'Only top-rated providers make the cut' },
];

const testimonials = [
  {
    name: 'Sarah Johnson', role: 'Parent', avatar: 'SJ',
    text: 'Found the perfect tutor for my daughter in minutes. The comparison feature is a game-changer!',
    rating: 5,
  },
  {
    name: 'Michael Chen', role: 'Small Business Owner', avatar: 'MC',
    text: 'Maliquez Connect helped me find a reliable logistics partner. Saved me hours of research.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez', role: 'Healthcare Seeker', avatar: 'ER',
    text: 'The reviews are authentic and detailed. Finally a platform I can trust for important decisions.',
    rating: 5,
  },
];

const stats = [
  { icon: FiCompass, end: 890, label: 'Listings', suffix: '+' },
  { icon: FiUsers, end: 12500, label: 'Active Users', suffix: '+' },
  { icon: FiStar, end: 4200, label: 'Reviews', suffix: '+' },
  { icon: FiAward, end: 98, label: 'Satisfaction Rate', suffix: '%' },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data: trendingRes, isLoading, error } = useQuery<AxiosResponse<ApiResponse<Listing[]>>>({
    queryKey: ['trending'],
    queryFn: () => searchApi.getTrending(),
  });

  const trending: Listing[] = trendingRes?.data?.data || [];

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-0 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/60 via-white to-primary-50/40" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-50/60 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary-100/30 rounded-full blur-2xl animate-float-slow" />

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch min-h-[70vh]">
            {/* Left: Hero Content */}
            <div className="text-center lg:text-left flex flex-col justify-center">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 rounded-full text-primary-700 text-xs md:text-sm mb-8 font-medium">
                  <FiZap className="w-4 h-4 text-primary-600" />
                  Decision Intelligence Platform
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-brand-darkText leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="text-primary-600">Search.</span>
                <span className="block text-primary-600">Connect.</span>
                <span className="block text-primary-600">Discover.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                The smartest way to find and compare top-rated service providers across Education, Healthcare, Hospitality, and Logistics.
              </p>

              <form onSubmit={handleSearch} className="max-w-xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for services, providers, or categories..."
                    className="w-full px-6 py-4 pr-36 rounded-2xl text-gray-900 text-lg shadow-lg focus:ring-2 focus:ring-primary-600 focus:outline-none bg-white border border-gray-200 transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-medium flex items-center gap-2 shadow-lg"
                    >
                      <FiSearch className="w-5 h-5" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-24 lg:mb-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold flex items-center gap-2 shadow-lg"
                >
                  Get Started
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => scrollToSection('sectors')}
                  className="px-6 py-3 bg-white text-primary-600 rounded-xl border border-primary-600 hover:bg-primary-50 transition-all font-medium flex items-center gap-2"
                >
                  <FiCompass className="w-4 h-4" />
                  Browse Sectors
                </button>
              </div>
            </div>

            {/* Right: How It Works */}
            <div className="animate-fade-in-up h-full flex" style={{ animationDelay: '0.5s' }}>
              <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 md:p-10 flex flex-col shadow-lg">
                {/* <div className="flex items-center gap-2 mb-6 md:mb-10">
                  <FiZap className="w-5 h-5 text-primary-600" />
                  <h3 className="text-brand-darkText font-bold text-base md:text-lg">How It Works</h3>
                </div> */}
                <div className="flex-1 flex flex-col gap-4 md:justify-evenly">
                  {steps.map((step, i) => (
                    <div key={step.title} className="flex items-start gap-3 md:gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                          <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary-100 text-primary-700 text-[10px] md:text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <h4 className="text-brand-darkText font-semibold text-sm md:text-base">{step.title}</h4>
                        </div>
                        <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => scrollToSection('stats')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-primary-600 transition-colors animate-float"
          aria-label="Scroll down"
        >
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
          </div>
        </button>
      </section>

      {/* ─── STATS ─── */}
      <section id="stats" className="relative mt-8 md:mt-12 z-20 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 text-primary-600 rounded-xl mb-3">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                <Counter end={stat.end} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>



      {/* ─── TRENDING LISTINGS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Trending Now</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Popular Listings</h2>
              <p className="text-gray-500 mt-2">Most viewed and highly rated providers this week</p>
            </div>
            <Link
              to="/search"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold group"
            >
              View All
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <FiRefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Failed to load trending listings. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && trending.length === 0 && (
            <div className="text-center py-16">
              <FiCompass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No trending listings available at the moment.</p>
            </div>
          )}

          {!isLoading && !error && trending.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.slice(0, 8).map((listing, i) => (
                <div
                  key={listing.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── SECTORS (Sticky Card) ─── */}
      <section id="sectors" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Browse by Sector</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Explore top-rated providers across four key industries
            </p>
          </ScrollReveal>

          <div className="relative" style={{ height: '2200px' }}>
            {sectors.map(({ name, icon: Icon, gradient, sector, description, count, image }, i) => (
              <div
                key={sector}
                className="sticky h-72 md:h-56"
                style={{ top: `${80 + i * 96}px`, zIndex: 1 + i }}
              >
                <Link
                  to={`/search?sector=${sector}`}
                  className="group block bg-white rounded-2xl border border-gray-100 hover:bg-primary-100 transition-all duration-500 hover:shadow-2xl overflow-hidden relative h-full"
                >
                  <div className="flex h-full">
                    {/* LEFT: Details */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10 min-w-0">
                      <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                        <div className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0 group-hover:bg-primary-700 group-hover:text-white transition-all duration-300">
                          <Icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{name}</h3>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto md:mt-4">
                        <div>
                          <div className="text-xl md:text-2xl font-bold text-primary-600">{count}</div>
                          <div className="text-xs md:text-sm text-gray-400">providers</div>
                        </div>
                        <span className="w-9 h-9 md:w-10 md:h-10 bg-gray-100 group-hover:bg-primary-100 rounded-full flex items-center justify-center group-hover:text-primary-600 transition-all duration-300 flex-shrink-0">
                          <FiArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                        </span>
                      </div>
                    </div>

                    {/* RIGHT: Image / Visual */}
                    <div className="hidden sm:flex w-48 md:w-64 lg:w-80 flex-shrink-0 relative overflow-hidden">
                      <img
                        src={image}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent" />
                      <Icon className="relative z-10 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto my-auto text-white/30" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Everything You Need</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              We make finding the right service provider effortless and reliable
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal
                key={feat.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 text-primary-600 rounded-xl mb-4">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm">{feat.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">What Our Users Say</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Real stories from real people who found what they needed
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal
                key={t.name}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <FiStar key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-darkText mt-3 mb-6">
                Your Trusted Platform for <span className="text-primary-600">Smarter Decisions</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Maliquez Connect is a decision intelligence platform that helps individuals and businesses find, compare, and choose the best service providers across Education, Healthcare, Hospitality, and Logistics. We believe in transparent information, verified listings, and empowering users to make confident choices.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
              >
                Learn More
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </ScrollReveal>
            <ScrollReveal className="grid grid-cols-2 gap-4">
              {[
                { count: '890+', label: 'Verified Listings' },
                { count: '12K+', label: 'Active Users' },
                { count: '4.2K+', label: 'Honest Reviews' },
                { count: '98%', label: 'Satisfaction Rate' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-primary-600">{stat.count}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-purple-500 animate-gradient" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-200/10 rounded-full blur-3xl" />

        <ScrollReveal className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FiAward className="w-16 h-16 text-primary-200 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg text-primary-100/80 mb-10 max-w-2xl mx-auto">
            Join thousands of providers already reaching new customers through Maliquez Connect. List your services for free and start getting discovered today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 rounded-2xl font-bold text-lg transition-all shadow-2xl flex items-center gap-2"
            >
              <FiCheckCircle className="w-5 h-5" />
              Get Started Free
            </Link>
            <Link
              to="/search"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg transition-all border border-white/20 flex items-center gap-2"
            >
              <FiSearch className="w-5 h-5" />
              Browse as Guest
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── BACK TO TOP ─── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-500 transition-all duration-300 flex items-center justify-center ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        aria-label="Back to top"
      >
        <FiArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Home;
