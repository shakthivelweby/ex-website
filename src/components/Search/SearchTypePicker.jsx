"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Popup from "../Popup";
import SearchInputBox from "./SearchInputBox";

const ACCENT_STYLES = {
  emerald: {
    selected: "bg-emerald-50 ring-1 ring-emerald-200",
    iconBg: "bg-emerald-50",
    icon: "text-emerald-600",
    check: "border-emerald-600 bg-emerald-600",
    spin: "border-t-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  rose: {
    selected: "bg-rose-50 ring-1 ring-rose-200",
    iconBg: "bg-rose-50",
    icon: "text-rose-600",
    check: "border-rose-600 bg-rose-600",
    spin: "border-t-rose-600",
    button: "bg-rose-600 hover:bg-rose-700",
  },
  amber: {
    selected: "bg-amber-50 ring-1 ring-amber-200",
    iconBg: "bg-amber-50",
    icon: "text-amber-600",
    check: "border-amber-600 bg-amber-600",
    spin: "border-t-amber-600",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  indigo: {
    selected: "bg-indigo-50 ring-1 ring-indigo-200",
    iconBg: "bg-indigo-50",
    icon: "text-indigo-600",
    check: "border-indigo-600 bg-indigo-600",
    spin: "border-t-indigo-600",
    button: "bg-indigo-600 hover:bg-indigo-700",
  },
};

export default function SearchTypePicker({
  label,
  title,
  value = "",
  onChange,
  items = [],
  isLoading = false,
  isMobile = false,
  accent = "emerald",
  allOption = { label: "All", description: "Browse all types" },
  mobilePlaceholder = "Tap to choose",
  desktopEmptyLabel = "All types",
  searchPlaceholder = "Search types",
  fallbackIcon = "fi-rr-apps",
  required = false,
}) {
  const searchInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.emerald;

  const selectedItem = useMemo(
    () => items.find((item) => item.value === value),
    [items, value],
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const normalized = query.toLowerCase();
    return items.filter((item) => item.label?.toLowerCase().includes(normalized));
  }, [items, query]);

  useEffect(() => {
    if (!isOpen || !isMobile) return undefined;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [isOpen, isMobile]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setQuery("");
    setIsOpen(false);
  };

  const renderOptions = () => {
    const allSelected = !value;

    const allButton = (
      <button
        key="all-types"
        type="button"
        onClick={() => handleSelect("")}
        className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
          allSelected ? styles.selected : "hover:bg-[#FAFAFA]"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}
        >
          <i className={`fi fi-rr-apps text-sm ${styles.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#222222]">
            {allOption.label}
          </p>
          <p className="truncate text-xs text-[#717171]">{allOption.description}</p>
        </div>
        <div
          className={`fi-box h-5 w-5 shrink-0 rounded-full border ${
            allSelected ? `${styles.check} text-white` : "border-[#DDDDDD]"
          }`}
        >
          {allSelected ? (
            <i className="fi fi-rr-check text-[10px]" aria-hidden="true" />
          ) : null}
        </div>
      </button>
    );

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div
            className={`h-6 w-6 animate-spin rounded-full border-2 border-[#EBEBEB] ${styles.spin}`}
          />
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <>
          {allButton}
          <p className="py-6 text-center text-sm text-[#717171]">No types found</p>
        </>
      );
    }

    return (
      <>
        {allButton}
        {filteredItems.map((item) => {
          const selected = value === item.value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.value)}
              className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                selected ? styles.selected : "hover:bg-[#FAFAFA]"
              }`}
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#EBEBEB]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <i className={`fi ${item.icon || fallbackIcon} text-sm ${styles.icon}`} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#222222]">
                  {item.label}
                </p>
                <p className="truncate text-xs text-[#717171]">
                  {item.description || "Type"}
                </p>
              </div>
              <div
                className={`fi-box h-5 w-5 shrink-0 rounded-full border ${
                  selected ? `${styles.check} text-white` : "border-[#DDDDDD]"
                }`}
              >
                {selected ? (
                  <i className="fi fi-rr-check text-[10px]" aria-hidden="true" />
                ) : null}
              </div>
            </button>
          );
        })}
      </>
    );
  };

  return (
    <>
      <SearchInputBox label={label}>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex min-h-[22px] w-full items-center text-left"
          >
            <span
              className={`text-sm font-medium ${
                selectedItem ? "text-[#222222]" : "text-[#B0B0B0]"
              }`}
            >
              {selectedItem?.label ||
                (isLoading ? "Loading types..." : mobilePlaceholder)}
            </span>
          </button>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-medium text-[#222222] focus:outline-none [&:invalid]:text-[#B0B0B0]"
          >
            <option value="" disabled={required}>
              {isLoading ? "Loading types..." : desktopEmptyLabel}
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        )}
      </SearchInputBox>

      {isMobile ? (
        <Popup
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          showCloseButton={false}
          pos="bottom"
          draggable
          className="w-full overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          pannelStyle="h-[88vh] max-h-[88vh]"
          overlayClassName="bg-black/30 backdrop-blur-[2px]"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-[#EBEBEB] px-5 pb-3 pt-1 text-center sm:px-8">
              <h2 className="text-lg font-medium leading-tight text-[#222222]">
                {title || label}
              </h2>
            </header>

            <section className="shrink-0 border-b border-[#EBEBEB] px-5 py-4 sm:px-8">
              <SearchInputBox label={`Search ${label.toLowerCase()}`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full border-0 bg-transparent p-0 text-sm font-medium text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                />
              </SearchInputBox>
            </section>

            <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 [-webkit-overflow-scrolling:touch] sm:px-8">
              <div className="sticky top-0 z-10 mb-2 border-b border-[#EBEBEB] bg-white py-2">
                <p className="text-xs font-medium text-[#717171]">
                  {selectedItem
                    ? `${selectedItem.label} selected`
                    : `Select a type or browse all`}
                  {!isLoading ? (
                    <span className="float-right text-[#B0B0B0]">
                      {filteredItems.length}
                    </span>
                  ) : null}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <div
                      className={`h-6 w-6 animate-spin rounded-full border-2 border-[#EBEBEB] ${styles.spin}`}
                    />
                    <p className="mt-3 text-xs text-[#717171]">Loading...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="types"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1"
                  >
                    {renderOptions()}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-[#EBEBEB] bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:px-8">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-colors ${styles.button}`}
              >
                {selectedItem ? "Done" : "Close"}
              </button>
            </section>
          </div>
        </Popup>
      ) : null}
    </>
  );
}
