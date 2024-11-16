import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Image from 'next/image';


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
// Import Swiper styles
function Slider() {
  return (
    <Swiper
    modules={[Navigation, Pagination, Scrollbar, A11y]}
    spaceBetween={50}
    slidesPerView={2}
    navigation
    pagination={{ clickable: true }}
    scrollbar={{ draggable: true }}
    >
      <SwiperSlide style={{width: "100%"}}>
        <Image width={500} height={500} alt="placeholder" src="/download.jpg"  />
      </SwiperSlide>
      <SwiperSlide style={{width: "100%"}}>
      <Image width={500} height={500} alt="placeholder" src="/download (1).jpg"  />
      </SwiperSlide>
      <SwiperSlide style={{width: "100%"}}>
      <Image width={500} height={500} alt="placeholder" src="/download (2).jpg"  />
      </SwiperSlide>
      <SwiperSlide style={{width: "100%"}}>
      <Image width={500} height={500} alt="placeholder" src="/download (3).jpg"  />
      </SwiperSlide>
    </Swiper>
  )
}

export default Slider