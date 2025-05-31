const CancellationTab = ({ packageData, activeTab }) => {
  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "cancellation" ? "block" : "hidden"
      }`}
    >
      CancellationTab
    </div>
  );
};

export default CancellationTab;
