const CancellationTab = ({ packageData, activeTab }) => {
  console.log("packageDatayyy",packageData)
  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "cancellation" ? "block" : "hidden"
      }`}
    >
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Cancellation Policies</h3>
        {packageData?.data?.cancellation_policies?.map((policy, index) => (
          <div key={policy.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-medium text-gray-900">Policy {index + 1}</span>
              {policy.is_available ? (
                <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded">Available</span>
              ) : (
                <span className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded">Not Available</span>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Refund: </span>
                {policy.refund_percentage}% of the total amount
              </p>
              
              <p className="text-gray-700">
                <span className="font-medium">Cancellation Period: </span>
                {policy.days_type === "days" ? (
                  `${policy.cancellation_days} days before the trip`
                ) : (
                  `${policy.cancellation_days_from} to ${policy.cancellation_days_to} days before the trip`
                )}
              </p>
            </div>
          </div>
        ))}
        
        {(!packageData?.data?.cancellation_policies || packageData?.data?.cancellation_policies?.length === 0) && (
          <p className="text-gray-500 italic">No cancellation policies available for this package.</p>
        )}
      </div>
    </div>
  );
};

export default CancellationTab;
