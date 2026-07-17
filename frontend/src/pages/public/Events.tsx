import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { eventApi } from '../../api/authApi';
import SeoHead from '../../components/seo/SeoHead';
import { FiCalendar, FiMapPin, FiClock, FiExternalLink, FiAlertCircle } from 'react-icons/fi';
import { ApiResponse, AppEvent } from '../../types';

const Events = () => {
  const { data, isLoading, error } = useQuery<AxiosResponse<ApiResponse<AppEvent[]>>>({
    queryKey: ['published-events'],
    queryFn: () => eventApi.getPublished(),
  });

  const events: AppEvent[] = data?.data?.data || [];

  return (
    <div>
      <SeoHead
        title="Events & Programs"
        description="Discover upcoming events and programs from Maliquez Connect."
        canonical="/events"
      />

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Events</span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">Events & Programs</h1>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Stay connected with our upcoming events, workshops, and programs.
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="card p-12 text-center">
              <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-600">Failed to load events. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && events.length === 0 && (
            <div className="card p-12 text-center">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming events at the moment. Check back later.</p>
            </div>
          )}

          {!isLoading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  {ev.image && (
                    <img src={ev.image} alt={ev.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-sm text-gray-500 mb-4">{ev.description}</p>
                    )}
                    <div className="mt-auto space-y-2">
                      {ev.date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      )}
                      {ev.time && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiClock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>{ev.time}</span>
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>
                    {ev.linkUrl && (
                      <a
                        href={ev.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Learn More <FiExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
