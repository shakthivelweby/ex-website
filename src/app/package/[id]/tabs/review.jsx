const ReviewTab = ({ packageData, activeTab }) => {
  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "reviews" ? "block" : "hidden"
      }`}
    >
      ReviewTab
    </div>
  );
};

export default ReviewTab;
