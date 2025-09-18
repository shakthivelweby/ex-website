import Image from "next/image";
import Link from "next/link";

const DestinationCard = ({ destination }) => {
  const { name, image, packageCount, description = "Discover amazing tour packages", trending = false } = destination;

  return (
    <div className="relative h-[500px] w-full rounded-2xl overflow-hidden group cursor-pointer border border-gray-200 bg-white">
      {/* Background Image */}
      <Image 
        src={image} 
        alt={name} 
        fill 
        className="object-cover transition-transform duration-700 group-hover:scale-110" 
      />
      
             {/* Package Count Badge */}
       <div className="absolute top-4 left-4 z-10 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg bg-gray-800/50">
         {`${packageCount || 0} Tour Packages`}
       </div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-white/90 text-sm mb-4">{description}</p>
        
        {/* View Packages Button */}
        <Link href={`/packages/${name.toLowerCase().replace(/\s+/g, '-')}`}>
          <button className="relative bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-3 group-hover/btn:bg-primary-500 transition-all duration-300 w-full">
            <div className="flex items-center justify-between">
            View Packages
            <i className="fi fi-rr-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DestinationCard;
