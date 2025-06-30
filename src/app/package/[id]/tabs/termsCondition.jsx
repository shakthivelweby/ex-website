const TermsConditionTab = ({ packageData, activeTab }) => {
  const { terms_and_conditions } = packageData.data;
  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "terms" ? "block" : "hidden"
      }`}
    >
      <h3 className="text-lg font-medium text-gray-800 mb-6">
        Terms and Conditions
      </h3>
      <div className="render-html">
        {terms_and_conditions && (
          <div dangerouslySetInnerHTML={{ __html: terms_and_conditions }} />
        )}
      </div>
    </div>
  );
};

export default TermsConditionTab;
