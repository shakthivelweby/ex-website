import RichTextContent from "@/components/common/RichTextContent";

const TermsConditionTab = ({ packageData, activeTab }) => {
  const { terms_and_conditions } = packageData.data;
  return (
    <div
      className={`w-full min-w-0 max-w-full text-gray-800 ${
        activeTab === "terms" ? "block" : "hidden"
      }`}
    >
      <h3 className="text-lg font-medium text-gray-800 mb-6">
        Terms and Conditions
      </h3>
      <RichTextContent html={terms_and_conditions} />
    </div>
  );
};

export default TermsConditionTab;
