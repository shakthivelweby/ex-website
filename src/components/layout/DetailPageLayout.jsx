"use client";

/**
 * Two-column detail layout: main content + sticky booking sidebar.
 * min-w-0 on the main column prevents rich text and wide grids from
 * overflowing under the sticky price/booking panel.
 */
const DetailPageLayout = ({
  children,
  sidebar,
  stickyTop = "top-24",
  containerClassName = "",
  mainClassName = "",
  sidebarClassName = "",
}) => {
  return (
    <div
      className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${containerClassName}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div
          className={`w-full min-w-0 max-w-full flex-1 lg:w-2/3 ${mainClassName}`}
        >
          {children}
        </div>
        {sidebar ? (
          <aside
            className={`hidden w-full min-w-0 lg:block lg:w-1/3 lg:max-w-md lg:shrink-0 ${sidebarClassName}`}
          >
            <div className={`sticky ${stickyTop}`}>{sidebar}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
};

export default DetailPageLayout;
