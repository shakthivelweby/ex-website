export const RENTAL_FORM_TYPE_LABELS = {
  vehicle: "Vehicle",
  clothing: "Clothing",
  gadgets: "Gadgets",
  camera: "Camera",
  party: "Party & events",
  furniture: "Furniture",
  sports: "Sports",
  outdoor: "Outdoor gear",
  electronics: "Electronics",
  luxury: "Luxury",
};

export const RENTAL_FORM_TYPE_ICONS = {
  vehicle: "fi fi-rr-car",
  clothing: "fi fi-rr-shirt",
  gadgets: "fi fi-rr-laptop",
  camera: "fi fi-rr-camera",
  party: "fi fi-rr-party-horn",
  furniture: "fi fi-rr-sofa",
  sports: "fi fi-rr-trophy",
  outdoor: "fi fi-rr-camping",
  electronics: "fi fi-rr-plug",
  luxury: "fi fi-rr-diamond",
};

export function formTypeLabel(formType) {
  const key = String(formType || "").trim().toLowerCase();
  return RENTAL_FORM_TYPE_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formTypeIcon(formType) {
  const key = String(formType || "").trim().toLowerCase();
  return RENTAL_FORM_TYPE_ICONS[key] || "fi fi-rr-tag";
}

export function isVehicleFormType(formType) {
  return String(formType || "").trim().toLowerCase() === "vehicle";
}

/** Build unique category types from rental categories (grouped by form_type). */
export function buildCategoryTypesFromCategories(categories = []) {
  const byFormType = new Map();

  for (const category of categories) {
    const formType = String(category?.form_type || "").trim().toLowerCase();
    if (!formType) continue;

    const existing = byFormType.get(formType);
    if (!existing) {
      byFormType.set(formType, {
        form_type: formType,
        label: formTypeLabel(formType),
        icon: formTypeIcon(formType),
      });
      continue;
    }
  }

  return Array.from(byFormType.values()).sort((a, b) => a.label.localeCompare(b.label));
}
