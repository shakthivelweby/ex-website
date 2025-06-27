const CancellationTab = ({ packageData, activeTab }) => {
  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "cancellation" ? "block" : "hidden"
      }`}
    >
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-3">Cancellation Policies</h3>
        
        {packageData?.data?.cancellation_policies?.length > 0 ? (
          <div className="space-y-4">
            {packageData.data.cancellation_policies.map((policy) => (
              <div 
                key={policy.id} 
                className="bg-white p-4 border border-gray-200 rounded-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {policy.days_type === "days" 
                        ? `${policy.cancellation_days} days before trip`
                        : `${policy.cancellation_days_from}-${policy.cancellation_days_to} days before trip`
                      }
                    </span>
                    <span 
                      className={`px-2 py-1 text-xs rounded ${
                        policy.is_available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {policy.is_available ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Refund amount: </span>
                    <span className="text-gray-700">{policy.refund_percentage}% of total payment</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-gray-500 m-0">No cancellation policies available for this package.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancellationTab;
