"use client";
import Image from "next/image";
import Link from "next/link";

const PackageDuration = ({ combinationData, date, packageId }) => {
  return (
    <>
      {combinationData.map((combination) => {
        const { id, days, night, images } = combination;
        return (
          <Link key={id} href={`/package/${id}?date=${date}`}>
            <div className={`flex items-center bg-white border border-gray-200 rounded-full p-1 transition-colors ${packageId === id ? "border-primary-500" : "border-gray-200"}`}>
              {images[0]?.image_url ? (
                <Image
                  src={images[0]?.image_url}
                  alt={images[0]?.image_name}
                  className="w-6 h-6 mr-2 rounded-full"
                  width={24}
                  height={24}
                />
              ) : (
                <div className="w-6 h-6 mr-2 rounded-full bg-gray-200"></div>
              )}
              <p className="text-sm font-medium text-gray-700">
                {days} days, {night} nights
              </p>
            </div>
          </Link>
        );
      })}
    </>
  );
};

export default PackageDuration;