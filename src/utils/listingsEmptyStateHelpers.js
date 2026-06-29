export function getCategoryNameBySlug(categories, slug) {
  if (!slug || !Array.isArray(categories)) return null;
  const match = categories.find((c) => c.slug === slug);
  return match?.name || null;
}

export function buildListingFilterLabels(filters, { categories = [], selectedLocation } = {}) {
  if (!filters) return [];
  const labels = [];

  const categoryName = getCategoryNameBySlug(categories, filters.category);
  if (categoryName) labels.push(categoryName);

  if (filters.location) labels.push(filters.location);

  const dateFrom = filters.date_from || filters.date;
  const dateTo = filters.date_to;
  if (dateFrom) {
    labels.push(dateTo && dateTo !== dateFrom ? `${dateFrom} → ${dateTo}` : dateFrom);
  }

  if (filters.language) {
    labels.push(
      String(filters.language)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ")
    );
  }

  if (filters.rating) labels.push(`${filters.rating}+ stars`);

  if (filters.price_from || filters.price_to) {
    const from = filters.price_from || "0";
    const to = filters.price_to || "1000+";
    labels.push(`₹${from} – ₹${to}`);
  }

  if (filters.longitude && filters.latitude) {
    labels.push(selectedLocation || filters.location || "Map area");
  }

  if (filters.form_type) {
    labels.push(
      String(filters.form_type)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }
  if (filters.sub_category) labels.push(filters.sub_category);
  if (filters.transmission) labels.push(filters.transmission);
  if (filters.fuel_type) labels.push(filters.fuel_type);
  if (filters.seats) labels.push(`${filters.seats} seats`);
  if (filters.search) labels.push(`"${filters.search}"`);

  return labels;
}

export function buildCategorySuggestions(categories, currentSlug, onSelectCategory) {
  if (!Array.isArray(categories) || !onSelectCategory) return [];
  return categories
    .filter((c) => c.slug && c.slug !== currentSlug)
    .slice(0, 5)
    .map((category) => ({
      id: category.id,
      label: category.name,
      icon: "fi fi-rr-tag",
      onClick: () => onSelectCategory(category.slug),
    }));
}

export function buildListingEmptyCopy({
  itemLabel = "results",
  categoryName,
}) {
  const titled = categoryName ? `Nothing in ${categoryName}` : "No matches";
  const description = categoryName
    ? `We couldn't find ${itemLabel} in this category with your current search. Explore other options or reset filters to see everything nearby.`
    : undefined;

  return { subtitle: titled, description };
}
