"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Tab from "./Tab";
import Form from "./Form";
import MobileCarousel from "./mobileCarousel";
import StayCategory from "./StayCategory";
import { usePackageRate } from "./query";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import PackageDuration from "../packageDuration";
import Popup from "@/components/Popup";
import { downloadItinerary } from "./service";
import isLogin from "@/utils/isLogin";


export default function ClientWrapper({
  packageData,
  date,
  packagePriceData,
  packageStayCategory,
  packageCombinations,
  supplierInfo
}) {







  /* all states */
  const [selectedStayCategory, setSelectedStayCategory] = useState({
    stay_category_id: packageStayCategory.stay_category_id,
    package_stay_category_id: packageStayCategory.id,
  });
  const [packagePrice, setPackagePrice] = useState(packagePriceData.adultPrice);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: packageRate } = usePackageRate(
    packageData.data.id,
    selectedStayCategory.package_stay_category_id,
    date
  );




  const [enquireOnly, setEnquireOnly] = useState(false);

  const [isClient, setIsClient] = useState(false);

  // Add ref for scroll container
  const scrollContainerRef = useRef(null);

  // Handle scroll animation when popup opens
  useEffect(() => {
    if (showMobileForm && scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Initial scroll down after a short delay
      const timeoutId = setTimeout(() => {
        container.scrollTo({
          top: 300,
          behavior: 'smooth'
        });

        // Scroll back up after another delay
        setTimeout(() => {
          container.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 600);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [showMobileForm]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {

      setEnquireOnly(!packagePriceData.rateAvailable);
    }
  }, [isClient, packagePriceData.rateAvailable]);

  /* end all states */

  // Handle body scroll lock
  useEffect(() => {
    if (showMobileForm) {
      // Save current scroll position and add styles
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showMobileForm]);

  // update rate
  useEffect(() => {
    if (packageRate?.data) {
      console.log(packageRate)
      setPackagePrice(packageRate.data.adultPrice);
      setEnquireOnly(!packageRate.data.rateAvailable);
    }
  }, [packageRate, selectedStayCategory]);

  // Handle itinerary download
  const downloadHandler = async (e) => {
    e.preventDefault(); // Prevent default button behavior

    if (!isLogin()) {
      // Show login modal
      const event = new CustomEvent('showLogin');
      window.dispatchEvent(event);
      return;
    }

    try {
      setIsDownloading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL + '/api/web';
      const url = `${baseUrl}/package-download-itinerary/${packageData.data.id}?stay_category_id=${selectedStayCategory.stay_category_id}`;

      // Fetch the PDF as blob
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${packageData.data.name}-itinerary.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading itinerary:', error);
      alert('Failed to download itinerary. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  const { images, name, inclusions, package_stay_categories } =
    packageData.data;

  return (
    <div>

      <ImageViewer
        images={images}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />

      {/* Mobile Form Popup */}
      <Popup
        isOpen={showMobileForm}
        onClose={() => setShowMobileForm(false)}
        title="Book Your Trip"
        pos="bottom"
        draggable={true}
        className="lg:hidden w-full rounded-t-3xl"
        pannelStyle="h-[75vh]"
      >
        <div className="flex-1 overflow-y-auto p-4">
          <Form
            date={date}
            packageData={packageData}
            selectedStayCategory={selectedStayCategory}
            packagePrice={packagePrice}
            enquireOnly={enquireOnly}
            setEnquireOnly={setEnquireOnly}
            packagePriceData={packagePriceData}
            isMobilePopup={true}
            downloadHandler={downloadHandler}
            isDownloading={isDownloading}
          />
        </div>
      </Popup>

      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-8 pb-24 md:pb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left content */}
            <div className="w-full lg:w-2/3">
              {/* Image Gallery */}
              <div className="mb-3 overflow-hidden">
                {/* Mobile View */}
                <div className="block md:hidden relative">
                  <MobileCarousel
                    packageData={packageData}
                    onViewAllClick={() => setIsImageViewerOpen(true)}
                  />
                </div>

                {/* Desktop View */}
                <div className="relative">
                  <div className="hidden md:grid grid-cols-4 gap-4">
                    <div className="col-span-4 md:col-span-2 lg:col-span-2 relative rounded-tl-2xl rounded-bl-2xl overflow-hidden">
                      <div className="relative aspect-[3/2] h-full w-full">
                        <Image
                          src={images[0].image_url}
                          alt={images[0].image_name}
                          fill
                          className="object-cover"
                          blurDataURL="/blur.webp"
                          placeholder="blur"
                          priority
                        />
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 lg:col-span-1 grid grid-rows-2 gap-4">
                      <div className="relative overflow-hidden aspect-square">
                        <Image
                          src={images[1].image_url}
                          alt={images[1].image_name}
                          fill
                          blurDataURL="/blur.webp"
                          placeholder="blur"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative overflow-hidden aspect-square">
                        <Image
                          src={images[2].image_url}
                          alt={images[2].image_name}
                          fill
                          blurDataURL="/blur.webp"
                          placeholder="blur"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 lg:col-span-1 grid grid-rows-2 gap-4">
                      <div className="relative rounded-tr-2xl overflow-hidden aspect-square">
                        <Image
                          src={images[3].image_url}
                          alt={images[3].image_name}
                          fill
                          blurDataURL="/blur.webp"
                          placeholder="blur"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative rounded-br-2xl overflow-hidden aspect-square">
                        <Image
                          src={images[4].image_url}
                          alt={images[4].image_name}
                          fill
                          blurDataURL="/blur.webp"
                          placeholder="blur"
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute bottom-4 left-0 right-3 flex justify-end">
                          <button
                            onClick={() => setIsImageViewerOpen(true)}
                            className="bg-black bg-opacity-50 w-[85%] h-8 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer"
                          >
                            <span>See all photos ({images.length})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* provided by supplier */}
              <div className="flex items-center mb-2">
                <span className="text-xs font-normal text-gray-500">
                  Package provided by
                </span>
                <h4 className="text-xs font-normal text-gray-800 ml-2 underline">
                  {supplierInfo?.supplier_details?.company_name || 'Unknown Supplier'}

                </h4>

              </div>
              <h1 className="text-2xl md:text-3xl tracking-tight font-medium text-gray-800 mb-6 mt-2">
                {name}
              </h1>

              {packageCombinations.data.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base font-normal text-gray-800 mb-4 ">
                    Choose Trip Duration
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <PackageDuration combinationData={packageCombinations.data} date={date} packageId={packageData.data.id} />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-base font-normal text-gray-800 mb-4">
                  Choose Stay Category
                </h3>
                <div className="flex flex-wrap gap-4">
                  <StayCategory
                    stays={package_stay_categories}
                    selectedStayCategory={selectedStayCategory}
                    setSelectedStayCategory={setSelectedStayCategory}
                  />
                </div>
              </div>

              {/* Download Itinerary Button - Mobile Only */}
              <div className="lg:hidden">
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className="fi fi-rr-document-signed text-gray-600 text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800 mb-1">
                        Detailed Itinerary
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        Download the complete day-by-day travel plan and inclusions
                      </p>
                      <button
                        onClick={downloadHandler}
                        className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <i className="fi fi-rr-download mr-2"></i>
                        )}
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-6 border-t border-gray-200 my-7 mb-0">
                <h3 className="text-base font-normal text-gray-800 mb-4">
                  Including
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                  {inclusions.map((item) => {
                    const { icon_url, name, id } = item.inclusion_master;
                    return (
                      <div key={id} className="flex items-center">
                        <img
                          src={icon_url}
                          alt={name}
                          className="w-5 h-5 mr-2"
                        />
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Tab
                packageData={packageData}
                selectedStayCategory={selectedStayCategory}
              />
            </div>

            {/* Right side booking form */}
            <div className="w-full lg:w-1/3 hidden lg:block">
              <Form
                date={date}
                packageData={packageData}
                selectedStayCategory={selectedStayCategory}
                packagePrice={packagePrice}
                enquireOnly={enquireOnly}
                setEnquireOnly={setEnquireOnly}
                packagePriceData={packagePriceData}
                downloadHandler={downloadHandler}
                isDownloading={isDownloading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Mobile Booking Button */}
      <div className="fixed bottom-16 left-4 right-4 lg:hidden z-40">
        <button
          onClick={() => setShowMobileForm(true)}
          className={`w-full ${enquireOnly ? 'bg-yellow-500' : 'bg-primary-500'} text-white py-3 px-6 rounded-full font-medium flex items-center justify-between shadow-lg`}
        >
          <div className="flex items-center">
            <span className="text-sm">{enquireOnly ? 'Send Enquiry' : 'Check Availability'}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-bold">₹{packagePrice}</span>
            <i className={`${enquireOnly ? 'fi fi-rr-envelope' : 'fi fi-rr-calendar-clock'} ml-2 text-sm`}></i>
          </div>
        </button>
      </div>
    </div>
  );
}
