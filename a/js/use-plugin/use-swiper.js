window.addEventListener("load", function(){
  const swiper_intro = new Swiper('.section--intro .swiper', {
    loop: false,
    grabCursor: true,
    longSwipesRatio: 0.3,
    speed: 500,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      667: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 1,
        spaceBetween: 40,
      },
      1280: {
        slidesPerView: 2,
        spaceBetween: 40,
      }
    },
    navigation: {
      prevEl: '.prev',
      nextEl: '.next',
    },
  });

  const swiper_slider_a_thumb = new Swiper('.section--slider-a .slider-thumb .swiper', {
    loop: false,
    grabCursor: false,
    longSwipesRatio: 0.3,
    speed: 500,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 40,
      },
      1280: {
        slidesPerView: 3,
        spaceBetween: 40,
      },
      1440: {
        slidesPerView: 4,
        spaceBetween: 40,
      },
      1680: {
        slidesPerView: 5,
        spaceBetween: 52,
      }
    },
  });

  const swiper_slider_a_bg = new Swiper('.section--slider-a .slider-bg .swiper', {
    loop: false,
    rewind: true,
    grabCursor: false,
    longSwipesRatio: 0.3,
    speed: 500,
    slidesPerView: 1,
    spaceBetween: 0,
    navigation: {
      prevEl: '.slider-nav .prev',
      nextEl: '.slider-nav .next',
    },
    thumbs: {
      swiper: swiper_slider_a_thumb,
    },
  });

  const swiper_slider_b = new Swiper('.section--slider-b .swiper', {
    loop: false,
    rewind: true,
    grabCursor: true,
    longSwipesRatio: 0.3,
    speed: 500,
    slidesPerView: 1,
    spaceBetween: 0,
    navigation: {
      prevEl: '.slider-nav .prev',
      nextEl: '.slider-nav .next',
    },
  });
});