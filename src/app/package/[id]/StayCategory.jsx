"use client";

const StayCategory = ({
  stays,
  selectedStayCategory,
  setSelectedStayCategory,
}) => {
  return stays.map((stay) => {
    const { title, id } = stay.stay_category;
    return (
      <label
        key={id}
        className={`bg-[#F7F7F7] flex items-center border rounded-full py-2 px-2 text-sm cursor-pointer transition-all ${
          selectedStayCategory.stay_category_id === stay.stay_category_id
            ? "border-primary-100 bg-primary-50 text-primary-600 border-1 !font-medium"
            : "border-gray-200 text-gray-700 hover:bg-gray-50 border-1 hover:border-gray-300 font-medium"
        }`}
      >
        <input
          type="radio"
          name="stayCategory"
          value={stay.id}
          checked={
            selectedStayCategory.stay_category_id === stay.stay_category_id
          }
          className="sr-only"
          onChange={() =>
            setSelectedStayCategory({
              stay_category_id: stay.stay_category_id,
              package_stay_category_id: stay.id,
            })
          }
        />
        <div className="flex items-center">
          <div
            className={`w-4 h-4 rounded-full border flex-shrink-0 flex justify-center items-center mr-2 ${
              selectedStayCategory.stay_category_id === stay.stay_category_id
                ? "border-primary-600 bg-white"
                : "border-gray-400 bg-white"
            }`}
          >
            {selectedStayCategory.stay_category_id ===
              stay.stay_category_id && (
              <div className="w-2 h-2 rounded-full bg-primary-600 m-auto flex items-center justify-center"></div>
            )}
          </div>
          <span
            className={`${
              selectedStayCategory.stay_category_id === stay.stay_category_id
                ? "font-medium"
                : ""
            } whitespace-nowrap`}
          >
            {title}
          </span>
        </div>
      </label>
    );
  });
};

export default StayCategory;
