import ActivityDetailClient from "./clientWrapper";
import { getActivityDetails, getActivityGallery } from "../service";

// Dummy/Mock Activity Data for testing
const getDummyActivityData = (id) => {
  const dummyActivities = {
    1: {
      id: 1,
      name: "River Rafting Adventure",
      description: `<p>Experience the thrill of white water rafting in the pristine rivers of Jammu & Kashmir. This exhilarating adventure takes you through challenging rapids and serene stretches, offering the perfect blend of excitement and natural beauty.</p>
        <p>Our certified guides ensure your safety while you navigate through Grade III and IV rapids. The activity includes all safety equipment, professional photography, and a memorable experience that will last a lifetime.</p>
        <p>Perfect for adventure enthusiasts, this activity is suitable for beginners and experienced rafters alike. You'll be provided with helmets, life jackets, paddles, and all necessary safety gear.</p>`,
      location: "Jammu and Kashmir",
      city: "Jammu and Kashmir",
      address: "Rishikesh, Jammu and Kashmir, India",
      activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
      cover_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
      thumb_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      price: { rate_type: "pax", adult_price: 2500, full_rate: 2500 },
      rating: 4.8,
      review_count: 342,
      start_time: "09:00:00",
      duration: "2-3 hours",
      best_time_to_visit: "Morning (6 AM - 10 AM)",
      opening_hours: "9:00 AM - 6:00 PM",
      features: ["Safety Equipment", "Expert Guide", "Photography", "Refreshments", "Certificate"],
      activity_highlights: [
        { highlights: "Navigate through Grade III and IV rapids" },
        { highlights: "Professional safety equipment included" },
        { highlights: "Expert certified guides" },
        { highlights: "Action photography available" },
        { highlights: "Suitable for beginners and experienced rafters" },
        { highlights: "Beautiful scenic river routes" }
      ],
      faqs: [
        {
          question: "What is the minimum age requirement for river rafting?",
          answer: "The minimum age requirement is 12 years. Children between 12-18 years must be accompanied by a parent or guardian."
        },
        {
          question: "What should I wear for river rafting?",
          answer: "We recommend wearing quick-dry clothing, a swimsuit underneath, and water shoes or sandals with straps. Avoid cotton clothing as it becomes heavy when wet."
        },
        {
          question: "Is prior experience required?",
          answer: "No prior experience is required. Our guides provide comprehensive safety briefing and instruction before the activity begins."
        },
        {
          question: "What is included in the package?",
          answer: "The package includes all safety equipment (helmet, life jacket, paddle), professional guide, safety briefing, and basic refreshments after the activity."
        },
        {
          question: "What happens in case of bad weather?",
          answer: "Safety is our priority. In case of severe weather conditions, the activity will be rescheduled or a full refund will be provided."
        }
      ],
      terms_and_conditions: [
        {
          description: `<p><strong>Booking Terms:</strong></p>
            <ul>
              <li>Booking confirmation is required 24 hours in advance</li>
              <li>Full payment is required at the time of booking</li>
              <li>Refunds available for cancellations made 48 hours before the activity</li>
            </ul>
            <p><strong>Safety Guidelines:</strong></p>
            <ul>
              <li>Follow all instructions from the guide</li>
              <li>Wear provided safety equipment at all times</li>
              <li>Inform guide of any medical conditions</li>
              <li>No alcohol consumption before or during the activity</li>
            </ul>
            <p><strong>Disclaimer:</strong></p>
            <p>Participants engage in this activity at their own risk. The company is not liable for any injuries or damages that may occur during the activity.</p>`
        }
      ],
      latitude: 30.0869,
      longitude: 78.2676,
      map_link: "https://www.google.com/maps/search/?api=1&query=30.0869,78.2676",
      promoted: true,
      popular: "1",
      recommended: "0"
    },
    2: {
      id: 2,
      name: "Paragliding Experience",
      description: `<p>Soar through the skies with breathtaking views of the mountains in Bir Billing, one of the world's best paragliding destinations. This once-in-a-lifetime experience offers you the freedom to fly like a bird over stunning landscapes.</p>
        <p>Experience the thrill of tandem paragliding with certified instructors who have years of experience. The flight takes you up to 8000 feet above sea level, providing panoramic views of the Dhauladhar mountain range.</p>
        <p>This activity is perfect for thrill seekers and adventure enthusiasts. No prior experience is needed as you'll be flying with a professional tandem pilot.</p>`,
      location: "Bir Billing",
      city: "Bir Billing",
      address: "Bir Billing, Himachal Pradesh, India",
      activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
      cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
      thumb_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      price: { rate_type: "pax", adult_price: 600, full_rate: 600 },
      rating: 4.9,
      review_count: 521,
      start_time: "07:00:00",
      duration: "15-20 minutes flight",
      best_time_to_visit: "Early Morning (6 AM - 9 AM)",
      opening_hours: "7:00 AM - 5:00 PM",
      features: ["Certified Instructor", "Safety Gear", "Video Recording", "GoPro Footage", "Certificate"],
      activity_highlights: [
        { highlights: "Fly up to 8000 feet above sea level" },
        { highlights: "Panoramic views of Dhauladhar mountain range" },
        { highlights: "Tandem flight with certified pilot" },
        { highlights: "Professional video recording included" },
        { highlights: "No prior experience required" },
        { highlights: "World-class paragliding destination" }
      ],
      faqs: [
        {
          question: "What is the weight limit for paragliding?",
          answer: "The weight limit is between 40 kg to 100 kg for tandem flights. Please inform us if you're outside this range."
        },
        {
          question: "How long is the flight duration?",
          answer: "The actual flight duration is 15-20 minutes, depending on weather conditions. The entire experience including briefing and preparation takes about 2-3 hours."
        },
        {
          question: "Is it safe for beginners?",
          answer: "Yes, it's completely safe for beginners. You'll be flying with an experienced tandem pilot who handles all the technical aspects. You just need to enjoy the ride!"
        },
        {
          question: "What is the best time to go paragliding?",
          answer: "Early morning (6 AM - 9 AM) is the best time as weather conditions are most favorable with good thermal currents for longer flights."
        }
      ],
      terms_and_conditions: [
        {
          description: `<p><strong>Weather Conditions:</strong></p>
            <ul>
              <li>Flights are weather-dependent</li>
              <li>Activity may be rescheduled in case of unfavorable conditions</li>
              <li>Full refund available if activity cannot be conducted</li>
            </ul>
            <p><strong>Safety Requirements:</strong></p>
            <ul>
              <li>All safety equipment must be worn</li>
              <li>Follow all instructions from the pilot</li>
              <li>Medical fitness certificate may be required</li>
            </ul>`
        }
      ],
      latitude: 32.0621,
      longitude: 76.7460,
      map_link: "https://www.google.com/maps/search/?api=1&query=32.0621,76.7460",
      promoted: false,
      popular: "1",
      recommended: "1"
    },
    3: {
      id: 3,
      name: "Scuba Diving Session",
      description: `<p>Explore the underwater world with professional scuba diving in the pristine waters of Andaman Islands. Discover vibrant marine life, colorful coral reefs, and stunning underwater landscapes.</p>
        <p>Our PADI certified instructors provide comprehensive training for beginners and advanced divers. The experience includes all necessary equipment, underwater photography, and guidance from expert divers.</p>
        <p>Whether you're a first-time diver or looking to enhance your skills, this activity offers an unforgettable adventure beneath the waves.</p>`,
      location: "Andaman Islands",
      city: "Port Blair",
      address: "Port Blair, Andaman and Nicobar Islands, India",
      activity_category_master: { name: "Water Sports", slug: "water-sports" },
      cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200",
      thumb_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      price: { rate_type: "pax", adult_price: 4500, full_rate: 4500 },
      rating: 4.7,
      review_count: 234,
      start_time: "10:00:00",
      duration: "2-3 hours (including briefing)",
      best_time_to_visit: "Morning (10 AM - 2 PM)",
      opening_hours: "10:00 AM - 4:00 PM",
      features: ["PADI Certified", "Equipment Included", "Underwater Photography", "Professional Guide", "Certificate"],
      activity_highlights: [
        { highlights: "PADI certified instructors" },
        { highlights: "Explore vibrant coral reefs" },
        { highlights: "See diverse marine life" },
        { highlights: "All equipment provided" },
        { highlights: "Underwater photography available" },
        { highlights: "Suitable for all skill levels" }
      ],
      faqs: [
        {
          question: "Do I need to know swimming for scuba diving?",
          answer: "Basic swimming skills are recommended but not mandatory. Non-swimmers can also participate with proper guidance and safety measures."
        },
        {
          question: "What is the minimum age for scuba diving?",
          answer: "The minimum age is 10 years for junior programs and 15 years for regular scuba diving sessions."
        },
        {
          question: "What equipment is provided?",
          answer: "All essential equipment including wetsuit, BCD, regulator, mask, fins, and weights are provided. You just need to bring a swimsuit."
        }
      ],
      terms_and_conditions: [
        {
          description: `<p><strong>Medical Requirements:</strong></p>
            <ul>
              <li>Medical fitness certificate required</li>
              <li>No diving within 24 hours of flying</li>
              <li>Inform about any medical conditions</li>
            </ul>`
        }
      ],
      latitude: 11.6234,
      longitude: 92.7265,
      map_link: "https://www.google.com/maps/search/?api=1&query=11.6234,92.7265",
      promoted: true,
      popular: "0",
      recommended: "1"
    }
  };

  // Default activity if ID doesn't match
  return dummyActivities[id] || dummyActivities[1];
};

// Dummy Gallery Data
const getDummyGallery = (id) => {
  const galleries = {
    1: [
      { image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
      { image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
      { image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" },
      { image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800" },
      { image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800" },
      { image: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800" }
    ],
    2: [
      { image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
      { image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
      { image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" },
      { image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800" }
    ],
    3: [
      { image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" },
      { image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
      { image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" },
      { image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800" },
      { image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800" }
    ]
  };
  return galleries[id] || galleries[1];
};

// Dummy Ticket Options Data
const getDummyTicketOptions = (id) => {
  const ticketOptions = {
    1: [
      {
        id: 1,
        type: "Standard Rafting Package",
        name: "Standard Rafting Package",
        price: 2500,
        originalPrice: 3000,
        rateType: "pax",
        features: [
          "Safety Equipment Included",
          "Expert Guide",
          "Professional Photography",
          "Basic Refreshments",
          "Certificate of Completion",
          "Insurance Coverage"
        ],
        description: "<p>Our standard rafting package includes all essential safety equipment, a certified guide, and basic refreshments. Perfect for first-time rafters and those looking for a safe, enjoyable experience.</p>"
      },
      {
        id: 2,
        type: "Premium Rafting Package",
        name: "Premium Rafting Package",
        price: 3500,
        originalPrice: 4000,
        rateType: "pax",
        features: [
          "All Standard Features",
          "GoPro Video Recording",
          "Premium Refreshments",
          "Extended Duration (4-5 hours)",
          "Lunch Included",
          "Priority Booking"
        ],
        description: "<p>Upgrade to our premium package for an extended adventure with GoPro video recording, premium refreshments, and lunch included. Ideal for adventure enthusiasts seeking the complete experience.</p>"
      },
      {
        id: 3,
        type: "Group Rafting Package",
        name: "Group Rafting Package (6+ people)",
        price: 2200,
        originalPrice: 2500,
        rateType: "pax",
        features: [
          "All Standard Features",
          "Group Discount (10% off)",
          "Dedicated Group Guide",
          "Group Photography",
          "Team Building Activities",
          "Flexible Timing"
        ],
        description: "<p>Perfect for groups of 6 or more! Enjoy special group rates, a dedicated guide, and team-building activities. Great for corporate outings, friends, or family gatherings.</p>"
      }
    ],
    2: [
      {
        id: 1,
        type: "Tandem Paragliding Flight",
        name: "Tandem Paragliding Flight",
        price: 600,
        originalPrice: 750,
        rateType: "pax",
        features: [
          "Certified Tandem Pilot",
          "Safety Gear Included",
          "Video Recording",
          "GoPro Footage",
          "Certificate of Flight",
          "Insurance Coverage"
        ],
        description: "<p>Experience the thrill of flying with our certified tandem pilot. Includes all safety equipment, video recording, and a certificate of your flight experience.</p>"
      },
      {
        id: 2,
        type: "Extended Flight Package",
        name: "Extended Flight Package (20+ minutes)",
        price: 900,
        originalPrice: 1100,
        rateType: "pax",
        features: [
          "All Standard Features",
          "Extended Flight Duration",
          "Professional Video Editing",
          "Premium GoPro Footage",
          "Priority Takeoff",
          "Refreshments Included"
        ],
        description: "<p>For the ultimate paragliding experience, choose our extended flight package with longer duration and premium video editing services.</p>"
      }
    ],
    3: [
      {
        id: 1,
        type: "Discover Scuba Diving",
        name: "Discover Scuba Diving (Beginners)",
        price: 4500,
        originalPrice: 5000,
        rateType: "pax",
        features: [
          "PADI Certified Instructor",
          "All Equipment Provided",
          "Underwater Photography",
          "Safety Briefing",
          "Certificate of Experience",
          "Insurance Coverage"
        ],
        description: "<p>Perfect for first-time divers! Our PADI certified instructors will guide you through a safe and memorable underwater experience with all equipment provided.</p>"
      },
      {
        id: 2,
        type: "Advanced Scuba Diving",
        name: "Advanced Scuba Diving",
        price: 6000,
        originalPrice: 7000,
        rateType: "pax",
        features: [
          "All Beginner Features",
          "Deeper Dive Sites",
          "Extended Dive Time",
          "Multiple Dive Locations",
          "Professional Video",
          "Lunch Included"
        ],
        description: "<p>For certified divers seeking more adventure. Explore deeper dive sites with extended dive times and multiple locations throughout the day.</p>"
      },
      {
        id: 3,
        type: "Snorkeling Package",
        name: "Snorkeling Package",
        price: 2500,
        originalPrice: 3000,
        rateType: "pax",
        features: [
          "Snorkeling Equipment",
          "Expert Guide",
          "Multiple Snorkel Sites",
          "Underwater Photography",
          "Refreshments",
          "No Certification Required"
        ],
        description: "<p>Perfect for those who want to explore the underwater world without scuba certification. Includes all snorkeling equipment and expert guidance.</p>"
      }
    ]
  };
  return ticketOptions[id] || ticketOptions[1];
};

const ActivityDetailPage = async ({ params }) => {
  const { id } = await params;
  const activityResponse = await getActivityDetails(id);
  const galleryResponse = await getActivityGallery(id);

  // Use dummy data if API fails or returns no data
  let activity = activityResponse?.data;
  let getGalleryData = galleryResponse?.data?.activity_images || [];

  if (!activity || !activityResponse?.data) {
    console.log("API failed or returned no data, using dummy content");
    activity = getDummyActivityData(parseInt(id) || 1);
    getGalleryData = getDummyGallery(parseInt(id) || 1);
  }

  // If gallery is empty, use dummy gallery
  if (!getGalleryData || getGalleryData.length === 0) {
    getGalleryData = getDummyGallery(parseInt(id) || 1);
  }

  // Calculate price
  const price = activity.price?.rate_type === "full" 
    ? activity.price?.full_rate 
    : activity.price?.rate_type === "pax" 
      ? activity.price?.adult_price 
      : activity.price?.full_rate || activity.price || 0;

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return "TBD";
    }
  };

  const activityDetails = {
    id: activity.id,
    title: activity.name,
    categories: [activity.activity_category_master?.name || "Activity"],
    location: activity.location || activity.city,
    address: activity.address || "",
    price: price > 0 ? `₹${price}` : 'Price TBA',
    image: activity.cover_image || activity.thumb_image || activity.image,
    description: activity.description || "",
    activityGuide: {
      duration: activity.duration || 'TBD',
      startTime: formatTime(activity.start_time),
      bestTimeToVisit: activity.best_time_to_visit || 'TBD',
      openingHours: activity.opening_hours || 'TBD',
    },
    features: activity.features || [],
    highlights: activity.activity_highlights?.map((highlight) => highlight.highlights) || [],
    faqs: activity.faqs?.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })) || [],
    terms: activity.terms_and_conditions?.[0]?.description || '',
    rating: activity.rating || 0,
    reviewCount: activity.review_count || 0,
    latitude: activity.latitude,
    longitude: activity.longitude,
    mapLink: activity.map_link,
    gallery: getGalleryData || [],
    promoted: activity.promoted || false,
    popular: activity.popular === "1" || activity.popular === 1,
    recommended: activity.recommended === "1" || activity.recommended === 1,
    ticketOptions: activity.ticket_options || activity.activity_ticket_options || getDummyTicketOptions(parseInt(id) || 1),
  };

  return <ActivityDetailClient activityDetails={activityDetails} />;
};

export default ActivityDetailPage;

