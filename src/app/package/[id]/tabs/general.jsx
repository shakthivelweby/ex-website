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
    faqs
  } = packageData.data;
 
  return (
    <div
      className={`prose max-w-none text-gray-800 ${activeTab === "details" ? "block" : "hidden"
        }`}
    >
      {/* Main description */}
      {about && <div className="mb-4 render-html" dangerouslySetInnerHTML={{ __html: about }} />}


      {/* Trip details in pill layout with fixed icons */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 border-t border-b border-gray-200  mb-4`}>




        
       

        {pickup_point && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-car-side text-primary-500 text-xl mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Pickup Point</p>
                <p className="font-medium text-gray-700">{pickup_point}</p>
              </div>
            </div>
          </>
        )}

        {pickup_time && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-alarm-clock text-primary-500 text-xl mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Pickup Time</p>
                <p className="font-medium text-gray-700">{pickup_time}</p>
              </div>
            </div>
          </>
        )}

        {dropoff_point && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-map-marker text-primary-500 text-xl mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Drop Off Point</p>
                <p className="font-medium text-gray-700">{dropoff_point}</p>
              </div>
            </div>
          </>
        )}

        {dropoff_time && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-alarm-clock text-primary-500 text-xl mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Drop Off Time</p>
                <p className="font-medium text-gray-700">{dropoff_time}</p>
              </div>
            </div>
          </>
        )}

        {tour_type === "fixed_departure" && (
          <>
            <div className="flex items-start">
              <i className="fi fi-rr-marker text-primary-500 text-xl mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Starting Location</p>
                <p className="font-medium text-gray-800">{starting_location}</p>
              </div>
            </div>

            <div className="flex items-start">
              <i className="fi fi-rr-time-quarter-past text-primary-500 text-xl mt-0.5 mr-3 flex-shrink-0"></i>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-800">
                  {total_days} Days {total_nights} Nights
                </p>
              </div>
            </div>
          
          </>
        )}


      </div>


      {/* Additional Information Section as Accordion */}
      <Accordion title="Additional information" defaultOpen={false}>
        <div
          className="text-gray-800 render-html"
          dangerouslySetInnerHTML={{ __html: additional_info }}
        />
      </Accordion>

      {/* Frequently Asked Questions */}
      <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4">
        Frequently Asked Questions
      </h3>

      {faqs.map((faq) => (
        <Accordion
          key={faq.id}
          title={faq.question}
          defaultOpen={false}
        >
          <p className="text-gray-800">{faq.answer}</p>
        </Accordion>
      ))}

     

     
    </div>
  );
}

export default GeneralTab;
