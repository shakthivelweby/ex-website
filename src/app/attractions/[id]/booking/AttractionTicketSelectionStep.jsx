"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EventTicketOptionCard from "@/app/events/[id]/booking/EventTicketOptionCard";
import RichTextContent from "@/components/common/RichTextContent";

const WALLET_BG = "#e9e9ec";

function AccordionChevron({ expanded }) {
  return (
    <span className="fi-box h-8 w-8 shrink-0 rounded-full bg-gray-100 text-gray-600" aria-hidden="true">
      <i
        className={`fi fi-br-angle-down text-[14px] transition-transform duration-200 ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </span>
  );
}

function IconBox({ icon, className = "" }) {
  return (
    <span
      className={`fi-box h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 ${className}`}
    >
      <i className={`${icon} text-[15px]`} aria-hidden="true" />
    </span>
  );
}

export default function AttractionTicketSelectionStep({
  selectedDate,
  onDateChange,
  isDateDisabled,
  ticketPrices,
  adultChildTickets,
  expandedTicketType,
  onTicketTypeClick,
  onAdultChildQuantityChange,
  getSelectedCountForTicketType,
  getTotalSelectedTickets,
  getTicketFromPrice,
  getTicketUnitPrices,
  getAvailabilityMeta,
  getLineMaxQty,
  needGuide,
  onNeedGuideChange,
  guideRate,
  formatDate,
}) {
  const visitDateObj = selectedDate ? new Date(`${selectedDate}T12:00:00`) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
              Step 1 of 2
            </p>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight text-gray-900">
              Select tickets
            </h2>
          </div>
          {getTotalSelectedTickets() > 0 ? (
            <div className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Selected
              </p>
              <p className="text-lg font-bold leading-none tabular-nums text-gray-900">
                {getTotalSelectedTickets()}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 bg-gray-50/50 p-3 sm:p-4">
        {/* Visit date */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
            <div
              className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border ${
                selectedDate
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              {selectedDate ? (
                <>
                  <span className="text-[9px] font-semibold uppercase tracking-wide opacity-80">
                    {visitDateObj.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-lg font-bold leading-none">
                    {visitDateObj.getDate()}
                  </span>
                </>
              ) : (
                <i className="fi fi-rr-calendar text-sm" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                Visit date
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                {selectedDate ? formatDate(selectedDate) : "Choose a date"}
              </p>
            </div>
            <div className="shrink-0">
              <DatePicker
                selected={visitDateObj}
                onChange={onDateChange}
                minDate={new Date()}
                filterDate={(date) => !isDateDisabled(date)}
                dateFormat="dd/MM/yyyy"
                className="w-[5.5rem] cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-center text-xs font-medium text-gray-700 outline-none transition-colors hover:bg-gray-100 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                popperPlacement="bottom-end"
              />
            </div>
          </div>
        </div>

        {/* Ticket types */}
        {ticketPrices?.map((ticket) => {
          const ticketTypeId = ticket.attraction_ticket_type_id;
          const ticketName =
            ticket.attraction_ticket_type?.attraction_ticket_type_master?.name ||
            "Ticket";
          const typeSelected = getSelectedCountForTicketType(ticketTypeId);
          const isExpanded = expandedTicketType === ticketTypeId;
          const tickets = adultChildTickets[ticketTypeId] || { adult: 0, child: 0 };
          const unitPrices = getTicketUnitPrices(ticket);
          const availability = getAvailabilityMeta(ticket.available_slots);
          const isSoldOut = ticket.available_slots != null && Number(ticket.available_slots) <= 0;
          const adultMax = getLineMaxQty(ticket, "adult", tickets);
          const childMax = getLineMaxQty(ticket, "child", tickets);

          return (
            <div
              key={ticket.id}
              className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                isExpanded ? "border-gray-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <button
                type="button"
                className={`w-full px-3 py-3 text-left transition-colors sm:px-4 ${
                  isExpanded ? "bg-white" : "bg-white hover:bg-gray-50/80"
                }`}
                onClick={() => onTicketTypeClick(ticketTypeId)}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <IconBox
                      icon="fi fi-rr-ticket"
                      className={isExpanded ? "border-gray-300 bg-gray-100 text-gray-700" : ""}
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-gray-900">{ticketName}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">{availability.label}</span>
                        {unitPrices.hasDiscount ? (
                          <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                            Sale
                          </span>
                        ) : null}
                        {typeSelected > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {typeSelected} selected
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <div className="hidden min-w-[4.5rem] text-right sm:block">
                      <p className="text-[10px] font-medium uppercase tracking-wide leading-none text-gray-400">
                        From
                      </p>
                      <p className="mt-1 text-base font-semibold tabular-nums leading-none text-gray-900">
                        ₹{getTicketFromPrice(ticket)}
                      </p>
                    </div>
                    <AccordionChevron expanded={isExpanded} />
                  </div>
                </div>
              </button>

              {isExpanded ? (
                <div
                  className="mx-2 mb-2.5 mt-0.5 space-y-1.5 rounded-lg p-2 sm:mx-3"
                  style={{ backgroundColor: WALLET_BG }}
                >
                  {ticket.description ? (
                    <RichTextContent
                      html={ticket.description}
                      className="mb-1 px-1 text-[11px] leading-relaxed text-gray-600"
                    />
                  ) : null}

                  <EventTicketOptionCard
                    name="Adult"
                    price={
                      unitPrices.hasDiscount
                        ? unitPrices.adult.final.toFixed(2)
                        : String(unitPrices.adult.afterAdmin)
                    }
                    originalPrice={String(unitPrices.adult.afterAdmin)}
                    hasDiscount={unitPrices.hasDiscount}
                    availability="Over 18+"
                    maxQty={adultMax}
                    isSoldOut={isSoldOut}
                    qty={tickets.adult}
                    isSelected={tickets.adult > 0}
                    lineTotal={
                      tickets.adult > 0
                        ? `₹${(unitPrices.adult.final * tickets.adult).toFixed(2)}`
                        : null
                    }
                    onDecrease={() => onAdultChildQuantityChange(ticketTypeId, "adult", -1)}
                    onIncrease={() => onAdultChildQuantityChange(ticketTypeId, "adult", 1)}
                  />

                  <EventTicketOptionCard
                    name="Child"
                    price={
                      unitPrices.hasDiscount
                        ? unitPrices.child.final.toFixed(2)
                        : String(unitPrices.child.afterAdmin)
                    }
                    originalPrice={String(unitPrices.child.afterAdmin)}
                    hasDiscount={unitPrices.hasDiscount}
                    availability="Under 18"
                    maxQty={childMax}
                    isSoldOut={isSoldOut}
                    qty={tickets.child}
                    isSelected={tickets.child > 0}
                    lineTotal={
                      tickets.child > 0
                        ? `₹${(unitPrices.child.final * tickets.child).toFixed(2)}`
                        : null
                    }
                    onDecrease={() => onAdultChildQuantityChange(ticketTypeId, "child", -1)}
                    onIncrease={() => onAdultChildQuantityChange(ticketTypeId, "child", 1)}
                  />
                </div>
              ) : null}
            </div>
          );
        })}

        {getTotalSelectedTickets() === 0 ? (
          <p className="py-1 text-center text-[11px] text-gray-400">
            Use + on a ticket to add passes
          </p>
        ) : null}

        {guideRate > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
              <div className="flex items-center gap-3">
                <IconBox icon="fi fi-rr-user-guide" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Need a guide</p>
                  <p className="text-xs text-gray-500">₹{guideRate} per booking</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNeedGuideChange(!needGuide)}
                aria-pressed={needGuide}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                  needGuide ? "bg-gray-900" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    needGuide ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
