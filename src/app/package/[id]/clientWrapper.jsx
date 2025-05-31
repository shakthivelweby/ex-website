"use client";

import { useState } from "react";
import Image from "next/image";
import Tab from "./Tab";
import Form from "./Form";
import MobileCarousel from "./mobileCarousel";
import StayCategory from "./StayCategory";

export default function ClientWrapper({ packageData, params }) {
  const { id } = params;
  const [selectedStayCategory, setSelectedStayCategory] = useState(1);

  const { images, name, inclusions, package_stay_categories } =
    packageData.data;

  return (
    <div>
      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left content */}
            <div className="w-full lg:w-2/3">
              {/* Image Gallery */}
              <div className="mb-3">
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
                        <button className="bg-white bg-opacity-50 w-[85%] h-8 rounded-full flex items-center justify-center text-gray-800 text-sm font-medium cursor-pointer">
                          <span>See all photos (10)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <MobileCarousel packageData={packageData} />
              </div>

              <h1 className="text-2xl md:text-3xl tracking-tight font-semibold text-gray-800 mb-6">
                {name}
              </h1>

              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Choose Trip Duration
                </h3>
              </div>

              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
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

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 py-6 border-t border-gray-200 my-7 mb-0">
                {inclusions.map((item) => {
                  const { icon_url, name, id } = item.inclusion_master;
                  return (
                    <div key={id} className="flex items-center">
                      <img src={icon_url} alt={name} className="w-6 h-6 mr-2" />
                      <p className="text-sm font-medium text-gray-700">
                        {name}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Tab
                packageData={packageData}
                selectedStayCategory={selectedStayCategory}
              />
            </div>

            {/* Right side booking form */}
            <div className="w-full lg:w-1/3 hidden lg:block">
              <Form
                packageData={packageData}
                selectedStayCategory={selectedStayCategory}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
