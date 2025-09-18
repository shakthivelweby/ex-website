"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.min.css";
export default function ImageSlider({ images }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <Slider {...settings}>
      {images.map((img, i) => (
        <div key={i}>
          <Image
            src={img}
            alt={`slide-${i}`}
            width={800}
            height={600}
            className="object-cover rounded"
          />
        </div>
      ))}
    </Slider>
  );
}
