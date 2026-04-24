"use client";

import AttractionFilters from "@/components/AttractionFilters/AttractionFilters";

// Rentals use the same filter UI as Attractions for consistency.
// The backend rentals endpoint supports: location, category (slug), search, price_from, price_to.
const RentalFilters = (props) => {
  return <AttractionFilters {...props} categoryTitle="Category Type" />;
};

export default RentalFilters;

