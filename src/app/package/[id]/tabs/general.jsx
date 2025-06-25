import Accordion from "@/components/Accordion";

function GeneralTab({ packageData, activeTab }) {
  const {
    about,
    additional_info,
    starting_location,
    pickup_point,
    dropoff_point,
    pickup_time,
    dropoff_time,
    total_days,
    total_nights,
    tour_type,
  } = packageData.data;
  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "details" ? "block" : "hidden"
      }`}
    >
      {/* Main description */}
      {about && <div className="mb-4" dangerouslySetInnerHTML={{ __html: about }} />}

    
          {/* Trip details in pill layout with fixed icons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 py-6 border-t border-b border-gray-200  mb-4">
      


        
            <div className="flex items-start">
              <i className="fi fi-rr-time-quarter-past text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-800">
                  {total_days} Days {total_nights} Nights
                </p>
              </div>
        </div>
          {tour_type === "fixed_departure" && (
            <>
            <div className="flex items-start">
              <i className="fi fi-rr-marker text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Starting Location</p>
                <p className="font-medium text-gray-800">{starting_location}</p>
              </div>
            </div>
            </>
          )}

         {pickup_point && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-car-side text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Pickup Point</p>
                <p className="font-medium text-gray-800">{pickup_point}</p>
              </div>
            </div>
            </>
         )}

         {pickup_time && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-alarm-clock text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Pickup Time</p>
                <p className="font-medium text-gray-800">{pickup_time}</p>
              </div>
            </div>
            </>
         )}

         {dropoff_point && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-map-marker text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Drop Off Point</p>
                <p className="font-medium text-gray-800">{dropoff_point}</p>
              </div>
            </div>
            </>
         )}

         {dropoff_time && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-alarm-clock text-primary-500 text-lg mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Drop Off Time</p>
                <p className="font-medium text-gray-800">{dropoff_time}</p>
              </div>
            </div>
            </>
         )}
      

          </div>
      

      {/* Additional Information Section as Accordion */}
      <Accordion title="Additional information"  defaultOpen={false}>
        <div
          className="text-gray-800"
          dangerouslySetInnerHTML={{ __html: additional_info }}
        />
      </Accordion>

      {/* Frequently Asked Questions */}
      <h3 className="text-base font-semibold text-gray-800 mt-8 mb-4">
        Frequently Asked Questions
      </h3>

      <Accordion
        title="What is the best time to take this tour?"
        defaultOpen={false}
      >
        <p className="text-gray-800">
          The ideal time to take this tour is from October to March, when the
          weather is cool and comfortable. This season is perfect for exploring
          destinations like Rajasthan and Kashmir, which are at their scenic
          best.
        </p>
      </Accordion>

      <Accordion title="Are meals included in the package?" defaultOpen={false}>
        <p className="text-gray-800">
          Yes, most meals are included. The package includes daily breakfast at
          all hotels, lunch during sightseeing days, and dinner at select
          locations. Some meals may be at your own expense to allow you to
          explore local cuisine on your own.
        </p>
      </Accordion>

      <Accordion
        title="Is this trip suitable for children or elderly travelers?"
        defaultOpen={false}
      >
        <p className="text-gray-800">
          This tour is suitable for children above 5 years and adults up to 70
          years who are in good health. Some destinations involve walking on
          uneven terrain and stairs. For elderly travelers or those with
          mobility concerns, we can customize the itinerary to ensure comfort.
        </p>
      </Accordion>

      <Accordion title="How do I book the tour?" defaultOpen={false}>
        <p className="text-gray-800">
          Booking is simple! You can book directly through our website by
          selecting your preferred dates and number of travelers, then following
          the checkout process. Alternatively, you can contact our customer
          service team by phone or email for assistance with your booking. A 25%
          deposit is required to confirm your reservation, with the balance due
          30 days before departure.
        </p>
      </Accordion>
    </div>
  );
}

export default GeneralTab;
