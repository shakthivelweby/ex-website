export default function BookingPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Loading booking">
      <div className="max-w-7xl mx-auto px-4 py-4 animate-pulse">
        <div className="hidden lg:block h-4 w-64 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 mt-4 lg:mt-8">
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 space-y-2">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-full max-w-md bg-gray-100 rounded" />
            </div>
            <div className="p-4 sm:p-6 space-y-5">
              <div className="h-11 bg-gray-100 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-11 bg-gray-100 rounded-xl" />
                <div className="h-11 bg-gray-100 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-11 bg-gray-100 rounded-xl" />
                <div className="h-11 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="hidden lg:block space-y-4">
            <div className="bg-white rounded-lg shadow border p-4 space-y-3">
              <div className="aspect-video bg-gray-100 rounded-lg" />
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-100 rounded" />
            </div>
            <div className="bg-white rounded-lg shadow border p-4 space-y-3">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
