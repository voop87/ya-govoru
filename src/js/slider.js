// import Swiper JS
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination, Parallax } from "swiper/modules";
// import Swiper styles
import "swiper/css/bundle";

const swiperHero = new Swiper(".swiper-hero", {
	modules: [Autoplay, Navigation, Parallax],
	// Optional parameters
	direction: "horizontal",
	parallax: true,
	loop: false,
	autoplay: {
		delay: 4000,
	},
	// Navigation arrows
	// navigation: {
	// 	nextEl: ".swiper-button-next",
	// 	prevEl: ".swiper-button-prev",
	// },
	// breakpoints: {
	// 	// when window width is >= 480px
	// 	320: {
	// 		navigation: {
	// 			enabled: false,
	// 		},
	// 	},
	// 	1024: {
	// 		navigation: {
	// 			enabled: true,
	// 		},
	// 	},
	// },
});

const swiperReviews = new Swiper(".swiper-reviews", {
	modules: [Autoplay, Pagination],

	// Optional parameters
	direction: "horizontal",
	autoplay: {
		delay: 6000,
	},

	pagination: {
		el: ".swiper-pagination",
		type: "bullets",
		clickable: true,
	},
});
