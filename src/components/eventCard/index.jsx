import Image from 'next/image';
import Link from 'next/link';

const EventCard = ({ event }) => {
  const { title, date, venue, type, image, price, promoted } = event;

  return (
    <Link href="#" className="block group">
      <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Promoted Tag */}
        {promoted && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
              Promoted
            </span>
          </div>
        )}

        {/* Background Image */}
        <div className="relative w-full h-[350px] overflow-hidden shrink-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Date and Time */}
          <p className="text-primary-600 font-medium text-sm mb-2">{date}</p>

          {/* Title */}
          <h3 className="font-medium text-base text-gray-800 line-clamp-2 mb-2 transition-colors">
            {title}
          </h3>

          {/* Venue */}
          <div className="flex items-center gap-2 mb-3">
            <i className="fi fi-rr-marker text-gray-400 text-sm"></i>
            <p className="text-gray-600 text-sm line-clamp-1">{venue}</p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium text-sm">
              {typeof price === 'string' ? price : `₹${price} onwards`}
            </p>
            <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
              Book Now <i className="fi fi-rr-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard; 