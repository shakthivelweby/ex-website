import apiServerMiddleware from "../../api/serverMiddleware";

// Mock data for attraction details
const mockAttractionDetails = {
  id: 1,
  name: "Gateway of India",
  description: "An iconic monument and tourist attraction in Mumbai, built during the British Raj. The Gateway of India is an arch-monument built in the early 20th century in the city of Mumbai, in the Indian state of Maharashtra. It was erected to commemorate the landing of King-Emperor George V and Queen-Empress Mary at Apollo Bunder, Mumbai when they visited India in 1911.",
  location: "Apollo Bandar, Colaba, Mumbai",
  city: "Mumbai",
  latitude: 18.9220,
  longitude: 72.8347,
  price: 0,
  rating: 4.5,
  review_count: 1250,
  duration: "1-2 hours",
  best_time_to_visit: "Evening",
  features: ["Historical", "Photography", "Free Entry", "Architecture", "Monument"],
  promoted: true,
  interest_count: 500,
  opening_hours: "24/7",
  address: "Apollo Bandar, Colaba, Mumbai, Maharashtra 400001",
  attraction_category_master: {
    id: 1,
    name: "Historical Monuments",
    slug: "historical-monuments"
  },
  thumb_image: "/images/attractions/card-img.jpg",
  cover_image: "/images/attractions/card-img.jpg",
  map_link: "https://maps.google.com/?q=Gateway+of+India+Mumbai",
  faqs: [
    {
      question: "Is there parking available?",
      answer: "Limited parking will be available on a first-come, first-served basis. We highly encourage the use of public transport!"
    },
    {
      question: "Can I get a refund if I can't visit the attraction?",
      answer: "No refunds on purchased tickets are possible, even in case of any rescheduling."
    },
    {
      question: "Is the venue wheelchair accessible?",
      answer: "Yes, the Gateway of India area is wheelchair accessible with ramps and designated pathways for visitors with mobility needs."
    },
    {
      question: "Will food & beverages be available at the venue?",
      answer: "Yes, there are several food stalls and restaurants in the surrounding area. However, food and beverages are not allowed inside the monument area itself."
    }
  ],
  terms_and_conditions: [
    {
      description: "Please carry a valid ID proof along with you.\n\nNo refunds on purchased tickets are possible, even in case of any rescheduling.\n\nSecurity procedures, including frisking remain the right of the management.\n\nNo dangerous or potentially hazardous objects including but not limited to weapons, knives, guns, fireworks, helmets, laser devices, bottles, musical instruments will be allowed in the venue and may be ejected with or without the owner from the venue.\n\nThe sponsors/performers/organizers are not responsible for any injury or damage occurring due to the attraction visit.\n\nAny claims regarding the same would be settled in courts in Mumbai.\n\nPeople in an inebriated state may not be allowed entry.\n\nOrganizers hold the right to deny late entry to the attraction.\n\nVenue rules apply."
    }
  ]
};

const mockAttractionGallery = [
  {
    id: 1,
    image_url: "/images/attractions/card-img.jpg",
    alt_text: "Gateway of India main view"
  },
  {
    id: 2,
    image_url: "/images/attractions/card-img.jpg",
    alt_text: "Gateway of India from sea"
  },
  {
    id: 3,
    image_url: "/images/attractions/card-img.jpg",
    alt_text: "Gateway of India at sunset"
  }
];

// Get attraction details by ID
export const attractionInfo = async (id) => {
  // For now, return mock data. Later replace with actual API call
  // Return the mock data with the requested ID
  const attractionData = {
    ...mockAttractionDetails,
    id: parseInt(id) || 1
  };
  
  return {
    data: attractionData,
    success: true,
    message: "Attraction details fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get(`/attractions/${id}`);
  // return response.data;
};

// Get attraction gallery images
export const getAttractionGallery = async (id) => {
  // For now, return mock data. Later replace with actual API call
  return {
    data: {
      attraction_images: mockAttractionGallery
    },
    success: true,
    message: "Attraction gallery fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get(`/attractions/${id}/gallery`);
  // return response.data;
};

// Get attraction booking details (for ticket selection)
export const getDetailsForBooking = async (id) => {
  // Mock booking data with different ticket types
  const mockBookingData = [
    {
      id: 1,
      date: new Date().toISOString().split('T')[0], // Today
      attraction_ticket_prices: [
        {
          id: 1,
          attraction_ticket_type_id: 1,
          price: "0",
          available_slots: 1000,
          maximum_allowed_bookings_per_user: 10,
          description: "Free entry to the monument",
          attraction_ticket_type: {
            attraction_ticket_type_master: {
              name: "General Entry",
              description: "Free entry for all visitors"
            }
          }
        },
        {
          id: 2,
          attraction_ticket_type_id: 2,
          price: "50",
          available_slots: 100,
          maximum_allowed_bookings_per_user: 5,
          description: "Guided tour with audio guide",
          attraction_ticket_type: {
            attraction_ticket_type_master: {
              name: "Guided Tour",
              description: "Includes audio guide and historical information"
            }
          }
        }
      ]
    }
  ];

  return {
    data: mockBookingData,
    success: true,
    message: "Booking details fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get(`/attractions/${id}/booking-details`);
  // return response.data;
};

// Get attraction tickets for booking
export const getAttractionTickets = async (id) => {
  // Mock ticket data
  const mockTicketData = [
    {
      id: 1,
      name: "General Entry",
      price: "0",
      available_slots: 1000,
      maximum_allowed_bookings_per_user: 10,
      description: "Free entry to the monument. Explore the iconic Gateway of India at your own pace.",
      discount: 0
    },
    {
      id: 2,
      name: "Guided Tour",
      price: "50",
      available_slots: 100,
      maximum_allowed_bookings_per_user: 5,
      description: "Includes audio guide and historical information. Learn about the rich history and significance of this architectural marvel.",
      discount: 0
    },
    {
      id: 3,
      name: "Premium Experience",
      price: "150",
      available_slots: 50,
      maximum_allowed_bookings_per_user: 3,
      description: "Exclusive access to restricted areas, professional photography session, and complimentary refreshments.",
      discount: 10
    }
  ];

  return {
    data: mockTicketData,
    success: true,
    message: "Attraction tickets fetched successfully"
  };
  
  // Uncomment when API is ready
  // const response = await apiServerMiddleware.get(`/attractions/${id}/tickets`);
  // return response.data;
};