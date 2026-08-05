/**
 * app.js — Логопед-Дефектолог Landing Page
 * =========================================================
 * Чистый Vanilla JS (ES6+), без зависимостей (кроме Rellax.js)
 * Модули:
 *   1. Navbar (scroll-state + mobile menu)
 *   2. Parallax (инициализация Rellax + fallback)
 *   3. Scroll Reveal (Intersection Observer)
 *   4. Gallery Slider (кастомный carousel + touch-swipe + dots)
 *   5. Reviews (data-hydration из mock-массива 2GIS)
 *   6. Rating Stars (рендер звёзд)
 *   7. Contact Form (валидация + submit)
 *   8. Scroll-to-Top Button
 *   9. Phone mask
 * =========================================================
 */

/* ============================================================
   1. NAVBAR
   ============================================================ */
(function initNavbar() {
	const nav = document.getElementById("mainNav");
	const burger = document.getElementById("navBurger");
	const mobileMenu = document.getElementById("mobileMenu");
	const mobileLinks = mobileMenu.querySelectorAll(".mobile-link, .btn");

	/** Переключение класса scrolled при прокрутке страницы */
	function handleScroll() {
		if (window.scrollY > 50) {
			nav.classList.add("scrolled");
		} else {
			nav.classList.remove("scrolled");
		}
	}

	/** Открытие/закрытие мобильного меню */
	function toggleMenu() {
		const isOpen = mobileMenu.classList.toggle("open");
		burger.classList.toggle("open", isOpen);
		burger.setAttribute("aria-expanded", isOpen);
		// Блокируем скролл при открытом меню
		document.body.style.overflow = isOpen ? "hidden" : "";
	}

	/** Закрытие меню при клике по ссылке */
	mobileLinks.forEach((link) => {
		link.addEventListener("click", () => {
			mobileMenu.classList.remove("open");
			burger.classList.remove("open");
			burger.setAttribute("aria-expanded", "false");
			document.body.style.overflow = "";
		});
	});

	window.addEventListener("scroll", handleScroll, { passive: true });
	burger.addEventListener("click", toggleMenu);
	handleScroll(); // начальное состояние
})();

/* ============================================================
   2. PARALLAX — Rellax.js + мышиный параллакс на Hero
   ============================================================ */
(function initParallax() {
	/**
	 * Инициализируем Rellax для всех элементов с классом .rellax
	 * data-rellax-speed задаётся прямо в HTML:
	 *   -6 = дальний слой (самый медленный)
	 *   -3 = средний слой
	 *   -1 = ближний слой (быстрее всего движется)
	 */
	if (typeof Rellax !== "undefined") {
		// Отключаем на мобильных (сенсорная прокрутка там иная)
		const isMobile = window.innerWidth <= 768;
		if (!isMobile) {
			try {
				const rellax = new Rellax(".rellax", {
					speed: -2, // дефолтная скорость (переопределяется data-атрибутом)
					center: false,
					vertical: true,
					horizontal: false,
					round: true,
					wrapper: null,
				});
			} catch (e) {
				console.warn("Rellax init failed:", e);
			}
		}
	}

	/**
	 * Дополнительный параллакс: движение ближних букв за мышью
	 * Создаёт эффект «глубины» при перемещении курсора по Hero
	 */
	const hero = document.getElementById("hero");
	const nearLayer = document.querySelector(".layer-near");
	const midLayer = document.querySelector(".layer-mid");

	if (!hero || !nearLayer || !midLayer) return;

	let rafId = null;
	let targetX = 0,
		targetY = 0;
	let currentX = 0,
		currentY = 0;

	function onMouseMove(e) {
		const rect = hero.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		// Нормализованное смещение от центра (-1 .. +1)
		targetX = (e.clientX - rect.left - centerX) / centerX;
		targetY = (e.clientY - rect.top - centerY) / centerY;
	}

	function animate() {
		// Инерционное сглаживание (lerp)
		currentX += (targetX - currentX) * 0.06;
		currentY += (targetY - currentY) * 0.06;

		const nearOffX = currentX * 18; // px смещения для ближнего слоя
		const nearOffY = currentY * 10;
		const midOffX = currentX * 8;
		const midOffY = currentY * 5;

		nearLayer.style.transform = `translate(${nearOffX}px, ${nearOffY}px)`;
		midLayer.style.transform = `translate(${midOffX}px, ${midOffY}px)`;

		rafId = requestAnimationFrame(animate);
	}

	hero.addEventListener("mousemove", onMouseMove, { passive: true });
	hero.addEventListener("mouseenter", () => {
		rafId = requestAnimationFrame(animate);
	});
	hero.addEventListener("mouseleave", () => {
		cancelAnimationFrame(rafId);
		// Плавный возврат к 0
		targetX = 0;
		targetY = 0;
		rafId = requestAnimationFrame(animate);
	});
})();

/* ============================================================
   3. SCROLL REVEAL — Intersection Observer
   ============================================================ */
(function initScrollReveal() {
	/**
	 * Наблюдаем за всеми .reveal элементами.
	 * Когда 15% элемента входит в viewport — добавляем .visible
	 * и отключаем наблюдение (одноразовый триггер).
	 */
	const revealEls = document.querySelectorAll(".reveal");

	if (!revealEls.length) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target); // fire once
				}
			});
		},
		{
			threshold: 0.12,
			rootMargin: "0px 0px -40px 0px",
		},
	);

	revealEls.forEach((el) => observer.observe(el));
})();

/* ============================================================
   GALLERY SLIDERS & LIGHTBOX
   ============================================================ */
(function () {
	/* ── 1. Полноэкранный просмотр (Lightbox) ── */
	const lightbox = document.getElementById("lightbox");
	const lightboxImg = document.getElementById("lightboxImg");
	const lightboxClose = document.querySelector(".lightbox-close");

	function openLightbox(src) {
		if (!lightbox || !lightboxImg) return;
		lightboxImg.src = src;
		lightbox.classList.add("active");
		document.body.style.overflow = "hidden"; // Блокируем скролл сайта
	}

	function closeLightbox() {
		if (!lightbox) return;
		lightbox.classList.remove("active");
		document.body.style.overflow = ""; // Возвращаем скролл
	}

	lightboxClose?.addEventListener("click", closeLightbox);
	lightbox?.addEventListener("click", (e) => {
		if (e.target === lightbox) closeLightbox();
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeLightbox();
	});

	/* ── 2. Универсальная инициализация слайдеров ── */
	function initSliders() {
		const sliderWraps = document.querySelectorAll(".slider-wrap");

		sliderWraps.forEach((wrap) => {
			const track = wrap.querySelector(".slider-track");
			const dotsWrap = wrap.querySelector(".slider-dots");
			const prevBtn = wrap.querySelector(".slider-btn--prev");
			const nextBtn = wrap.querySelector(".slider-btn--next");

			if (!track) return;

			const slides = track.querySelectorAll(".slide");
			const total = slides.length;
			let currentIndex = 0;
			let autoplayTimer = null;
			let isDragging = false;
			let dragOffset = 0;

			/* Создание точек-пагинации */
			if (dotsWrap) {
				dotsWrap.innerHTML = "";
				slides.forEach((_, i) => {
					const dot = document.createElement("button");
					dot.className = "slider-dot" + (i === 0 ? " active" : "");
					dot.setAttribute("aria-label", `Слайд ${i + 1}`);
					dot.addEventListener("click", () => goTo(i));
					dotsWrap.appendChild(dot);
				});
			}

			const dots = dotsWrap ? dotsWrap.querySelectorAll(".slider-dot") : [];

			/* Переход к слайду */
			function goTo(index) {
				currentIndex = (index + total) % total;
				track.style.transform = `translateX(-${currentIndex * 100}%)`;
				dots.forEach((d, i) =>
					d.classList.toggle("active", i === currentIndex),
				);
				resetAutoplay();
			}

			function goNext() {
				goTo(currentIndex + 1);
			}
			function goPrev() {
				goTo(currentIndex - 1);
			}

			/* Кнопки навигации */
			nextBtn?.addEventListener("click", goNext);
			prevBtn?.addEventListener("click", goPrev);

			/* Автопрокрутка */
			function startAutoplay() {
				autoplayTimer = setInterval(goNext, 4500);
			}

			function resetAutoplay() {
				clearInterval(autoplayTimer);
				startAutoplay();
			}

			startAutoplay();

			/* Пауза при наведении */
			wrap.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
			wrap.addEventListener("mouseleave", startAutoplay);

			/* Клик по слайду -> Полноэкранный просмотр */
			slides.forEach((slide) => {
				const img = slide.querySelector("img");
				if (!img) return;

				slide.addEventListener("click", () => {
					// Открываем модальное окно только если не происходил свайп
					if (Math.abs(dragOffset) < 10) {
						openLightbox(img.src);
					}
				});
			});

			/* Touch / Swipe поддержка */
			let startX = 0;
			let startY = 0;
			const SWIPE_THRESHOLD = 50;

			track.addEventListener(
				"touchstart",
				(e) => {
					startX = e.changedTouches[0].clientX;
					startY = e.changedTouches[0].clientY;
					dragOffset = 0; // Сбрасываем смещение в начале касания
					isDragging = true;
				},
				{ passive: true },
			);

			track.addEventListener(
				"touchmove",
				(e) => {
					if (!isDragging) return;
					const currentX = e.changedTouches[0].clientX;
					dragOffset = currentX - startX; // Фиксируем движение пальца
				},
				{ passive: true },
			);

			track.addEventListener(
				"touchend",
				(e) => {
					if (!isDragging) return;
					isDragging = false;

					const deltaX = e.changedTouches[0].clientX - startX;
					const deltaY = e.changedTouches[0].clientY - startY;
					dragOffset = deltaX;

					if (
						Math.abs(deltaX) > Math.abs(deltaY) &&
						Math.abs(deltaX) > SWIPE_THRESHOLD
					) {
						if (deltaX < 0) goNext();
						else goPrev();
					}
				},
				{ passive: true },
			);

			/* Drag (Мышь) */
			track.addEventListener("mousedown", (e) => {
				startX = e.clientX;
				dragOffset = 0;
				isDragging = true;
				track.style.cursor = "grabbing";
			});

			track.addEventListener("mouseup", (e) => {
				if (!isDragging) return;
				isDragging = false;
				track.style.cursor = "";
				const deltaX = e.clientX - startX;
				dragOffset = deltaX;

				if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
					if (deltaX < 0) goNext();
					else goPrev();
				}
			});

			track.addEventListener("mouseleave", () => {
				isDragging = false;
				track.style.cursor = "";
			});
		});
	}

	initSliders();
})();

/* ============================================================
   5. REVIEWS DATA — Mock 2GIS
   ============================================================ */
(function initReviews() {
	/**
	 * Mock-данные, смоделированные по формату профиля 2GIS:
	 * https://2gis.ru/novosibirsk/firm/70000001064307042/tab/reviews
	 *
	 * Каждый объект содержит:
	 *  - author  : имя автора
	 *  - rating  : оценка (1–5)
	 *  - date    : дата отзыва (строка)
	 *  - text    : текст отзыва
	 *  - link    : прямая ссылка на профиль 2GIS
	 *  - avatarBg: цвет аватара (генерируется по первой букве)
	 */
	const REVIEWS_DATA = [
		{
			author: "Виктория Воробьева",
			rating: 5,
			date: "11 апреля 2026",
			text: "Добрый день.Ирина -специалист высочайшего уровня! Ходили всего 2 месяца, результат не заставил себя ждать, уже через пару занятий был виден прогресс. Ставили букву Р и шипящие, у нас был не стандартный случай и не самый простой. И, конечно, нам было важно отношение , дочь «влюбилась» в Ирину с первого занятия.С удовольствием и нетерпением ждали занятия у логопеда❤️ Спасибо Вам огромное Ирина! Однозначно рекомендую всем знакомым только Вас ! ❤️",
			avatarBg: "#0D9488",
		},
		{
			author: "Галина К",
			rating: 5,
			date: "4 марта 2026",
			text: "Нам очень посчастливилось попасть в такие замечательные руки Ирины. Ирина, я считаю, логопед с большой буквы, обратились к ней по рекомендации знакомых, ни единого дня не пожалела. Ирина очень компетентная, профессионал своего дела. Разговорить нашу нехочуху удалось за 2 месяца. Я очень рада и благодарна Ирине, если будет возможность, мы сново пойдем на занятия",

			avatarBg: "#6366F1",
		},
		{
			author: "Валерия Фёдорова",
			rating: 5,
			date: "22 декабря 2025",
			text: "Выражаю благодарность Ирине за её работу и подход к моему сыну😌🌺 Нам очень нравилось ходить на занятие,ребенок всегда заходил и выходил с улыбкой на лице😊 Будем скучать🥹💔",

			avatarBg: "#F43F5E",
		},
		{
			author: "Валентина Руденко",
			rating: 5,
			date: "18 декабря 2025",
			text: "Искала логопеда у которого будут хорошие отзывы и так, чтобы было недалеко от дома, а нашла золото 😃Обратились с дочкой, которой на тот момент почти исполнилось семь лет, позади два года логопедической группы в саду. Шипящие и свистящие вроде бы присутствовали, но постоянно путались, речь невнятная, звуков «л» и «р» не было. Результат было слышно после каждого занятия и для меня до сих пор это так удивительно, так как я себя морально настраивала на долгосрочное сотрудничество😂 Вот что называется - попали в нужные руки.Домашние задания были, но не отнимающие много времени или даже в игровой форме, тогда подключалась вся семья. Многие задания дочка выполняла самостоятельно по несколько раз в день. Ну и конечно же, ходила на занятия всегда с огромным удовольствием. Ирина, огромное Вам спасибо! Вы самая настоящая волшебница, которая помогает детям.",

			avatarBg: "#F59E0B",
		},
		{
			author: "Мария Т",
			rating: 5,
			date: "24 ноября 2025",
			text: "Ирину посоветовал нам наш педиатр. Решили попробовать, сходить на несколько занятий, т к живем далеко (на правом берегу) и ездить было не совсем удобно. Но после первых же занятий, решили продолжить посещения. Нам очень понравилась методика. Занятия проходили интересно, разнообразно. Чередуя задания сидя за столом с подвижными упражнениями, чтобы ребенок не заскучал. Ирине можно дать телефон для записи, и потом дома повторять упражнения для лучшего результата. К Ирине мы пришли в первую очередь как к дефектологу. Сыну было на тот момент три с небольшим года. И было отставание в речи. Ирина легко нашла подход к ребенку. Появились предложения из нескольких слов, увеличился словарный запас, были поставлены ВСЕ звуки. Однозначно рекомендую Ирину! Она очень добрая, отзывчивая, профессионал своего дела. Видно что нацелена на результат. Спасибо ей за это!",

			avatarBg: "#10B981",
		},
	];

	const grid = document.getElementById("reviewsGrid");
	if (!grid) return;

	/**
	 * Рендерим каждую карточку отзыва из массива данных
	 */
	REVIEWS_DATA.forEach((review, index) => {
		const firstLetter = review.author.charAt(0).toUpperCase();
		const stars = generateStars(review.rating);

		const card = document.createElement("article");
		card.className = "review-card reveal";
		// Stagger-задержка для каждой карточки
		card.style.transitionDelay = `${index * 0.1}s`;

		card.innerHTML = `
      <div class="review-header">
        <div class="review-avatar" style="background:${review.avatarBg};">${firstLetter}</div>
        <div class="review-meta">
          <div class="review-author">${escapeHTML(review.author)}</div>
          <div class="review-date">${escapeHTML(review.date)}</div>
        </div>
      </div>
      <div class="review-stars">${stars}</div>
      <p class="review-text">${escapeHTML(review.text)}</p>
      <a
        href="${review.link}"
        target="_blank"
        rel="noopener noreferrer"
        class="review-source-link"
        aria-label="Читать отзыв ${escapeHTML(review.author)} на 2GIS"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
        Источник: 2GIS
      </a>
    `;

		grid.appendChild(card);
	});

	// Переинициализируем Intersection Observer для новых элементов
	reinitReveal(grid.querySelectorAll(".reveal"));
})();

/* ============================================================
   6. RATING STARS RENDER
   ============================================================ */
(function initRatingStars() {
	const starsContainer = document.getElementById("ratingStars");
	if (!starsContainer) return;

	const OVERALL_RATING = 5.0;
	starsContainer.innerHTML = generateStars(OVERALL_RATING, "1.4rem");
})();

/**
 * Генерирует HTML-строку со звёздами рейтинга
 * @param {number} rating  — оценка (0–5, поддерживает дробные)
 * @param {string} size    — размер иконок (CSS font-size)
 * @returns {string}
 */
function generateStars(rating, size = "1rem") {
	const full = Math.floor(rating);
	const half = rating % 1 >= 0.3 && rating % 1 < 0.8;
	const empty = 5 - full - (half ? 1 : 0);

	const starStyle = `font-size:${size};color:#F59E0B;`;

	return (
		"★"
			.repeat(full)
			.split("")
			.map(() => `<span class="review-star" style="${starStyle}">★</span>`)
			.join("") +
		(half
			? `<span class="review-star" style="${starStyle}opacity:.5;">★</span>`
			: "") +
		"★"
			.repeat(empty)
			.split("")
			.map(
				() =>
					`<span class="review-star" style="font-size:${size};color:#D1D5DB;">★</span>`,
			)
			.join("")
	);
}

/**
 * Экранирует HTML-спецсимволы для безопасной вставки текста
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Повторно запускает Intersection Observer для динамически добавленных элементов
 * @param {NodeList} elements
 */
function reinitReveal(elements) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
	);

	elements.forEach((el) => observer.observe(el));
}

/* ============================================================
   7. CONTACT FORM — Валидация + Submit
   ============================================================ */
(function initContactForm() {
	const form = document.getElementById("contactForm");
	const submitBtn = document.getElementById("formSubmitBtn");
	const successMsg = document.getElementById("formSuccess");

	if (!form) return;

	/** Конфигурация полей: id, id ошибки, правило валидации, сообщение */
	const FIELDS_CONFIG = [
		{
			inputId: "fieldName",
			errorId: "errorName",
			validate: (v) => v.trim().length >= 2,
			message: "Введите имя (минимум 2 символа)",
		},
		{
			inputId: "fieldPhone",
			errorId: "errorPhone",
			validate: (v) => /^[\d\s\+\-\(\)]{10,18}$/.test(v.trim()),
			message: "Введите корректный номер телефона",
		},
		{
			inputId: "fieldAge",
			errorId: "errorAge",
			validate: (v) => v !== "",
			message: "Выберите возраст ребёнка",
		},
	];

	/**
	 * Валидация одного поля.
	 * Возвращает true если поле прошло, false — если нет.
	 */
	function validateField(config) {
		const input = document.getElementById(config.inputId);
		const error = document.getElementById(config.errorId);
		const isValid = config.validate(input.value);

		input.classList.toggle("error", !isValid);
		error.textContent = isValid ? "" : config.message;

		return isValid;
	}

	/** Валидация всей формы */
	function validateForm() {
		let allValid = true;
		FIELDS_CONFIG.forEach((cfg) => {
			if (!validateField(cfg)) allValid = false;
		});
		return allValid;
	}

	/** Сброс ошибок при вводе */
	FIELDS_CONFIG.forEach((cfg) => {
		const input = document.getElementById(cfg.inputId);
		input?.addEventListener("input", () => validateField(cfg));
		input?.addEventListener("change", () => validateField(cfg));
	});

	/**
	 * Обработка отправки формы.
	 * В реальном проекте здесь будет fetch() к бэкенду или API.
	 */
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		// Состояние загрузки
		submitBtn.disabled = true;
		submitBtn.textContent = "Отправляем...";

		// Имитация задержки сети
		await new Promise((resolve) => setTimeout(resolve, 1200));

		// Показываем успех
		successMsg.classList.add("show");

		// Через 6 секунд сбрасываем форму
		setTimeout(() => {
			successMsg.classList.remove("show");
			form.reset();
			submitBtn.disabled = false;
			submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Отправить заявку
      `;
		}, 6000);
	});
})();

/* ============================================================
   8. SCROLL-TO-TOP BUTTON
   ============================================================ */
(function initScrollTop() {
	const btn = document.getElementById("scrollTopBtn");
	if (!btn) return;

	/** Показываем кнопку после 400px прокрутки */
	window.addEventListener(
		"scroll",
		() => {
			btn.classList.toggle("visible", window.scrollY > 400);
		},
		{ passive: true },
	);

	btn.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
})();

/* ============================================================
   9. PHONE INPUT MASK
   ============================================================ */
(function initPhoneMask() {
	const phoneInput = document.getElementById("fieldPhone");
	if (!phoneInput) return;

	/**
	 * Простая маска для российского телефона: +7 (000) 000-00-00
	 * Срабатывает на каждый ввод символа
	 */
	phoneInput.addEventListener("input", (e) => {
		let val = e.target.value.replace(/\D/g, ""); // только цифры

		// Убираем ведущую 7 или 8 если есть
		if (val.startsWith("7") || val.startsWith("8")) {
			val = val.slice(1);
		}

		// Ограничиваем до 10 цифр
		val = val.slice(0, 10);

		let formatted = "+7";
		if (val.length > 0) formatted += " (" + val.slice(0, 3);
		if (val.length >= 3) formatted += ") " + val.slice(3, 6);
		if (val.length >= 6) formatted += "-" + val.slice(6, 8);
		if (val.length >= 8) formatted += "-" + val.slice(8, 10);

		e.target.value = formatted;
	});

	// Предотвращаем ввод нецифровых символов (кроме спец-клавиш)
	phoneInput.addEventListener("keydown", (e) => {
		const allowedKeys = [
			"Backspace",
			"Delete",
			"Tab",
			"Escape",
			"Enter",
			"ArrowLeft",
			"ArrowRight",
			"ArrowUp",
			"ArrowDown",
			"Home",
			"End",
		];
		if (allowedKeys.includes(e.key)) return;
		if (e.ctrlKey || e.metaKey) return; // разрешаем Ctrl+C/V/A и т.д.
		if (!/\d/.test(e.key)) e.preventDefault();
	});
})();

/* ============================================================
   10. SMOOTH ANCHOR LINKS — компенсация высоты navbar
   ============================================================ */
(function initSmoothAnchors() {
	const NAV_HEIGHT = 72; // --nav-height

	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", (e) => {
			const targetId = anchor.getAttribute("href");
			const targetEl = document.querySelector(targetId);

			if (!targetEl || targetId === "#") return;

			e.preventDefault();

			const targetTop =
				targetEl.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
			window.scrollTo({ top: targetTop, behavior: "smooth" });
		});
	});
})();

/* ============================================================
   11. HERO LETTERS — добавляем анимации при скролле
   ============================================================ */
(function initHeroLetterEffects() {
	/**
	 * При наведении на крупные буквы добавляем тень-свечение
	 * (класс hover-wiggle уже обрабатывает transform через CSS)
	 */
	const nearLetters = document.querySelectorAll(".near-letter");
	const colors = ["#F43F5E", "#0D9488", "#F59E0B", "#6366F1", "#10B981"];

	nearLetters.forEach((letter, i) => {
		letter.addEventListener("mouseenter", () => {
			const color = colors[i % colors.length];
			letter.style.textShadow = `0 0 30px ${color}80, 0 0 60px ${color}40`;
			letter.style.zIndex = "10";
		});

		letter.addEventListener("mouseleave", () => {
			letter.style.textShadow = "";
			letter.style.zIndex = "";
		});
	});
})();

document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("contactForm");
	const submitBtn = document.getElementById("formSubmitBtn");
	const successMessage = document.getElementById("formSuccess");

	// URL вашего веб-приложения Google Apps Script
	const GOOGLE_SCRIPT_URL =
		"https://script.google.com/macros/s/AKfycby3rNlcAvqJyFS6r4Qd-moliRjoDF4jH4s76i4UUN63UBjQvAxXLy0ER9FRQ8wsVzaL/exec";

	// Исходное содержимое кнопки (чтобы восстановить в случае ошибки)
	const originalBtnHTML = submitBtn.innerHTML;

	// Иконка-спиннер (SVG вращающееся колесико)
	const spinnerSVG = `
    <svg class="btn-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
      <path d="M12 2 a10 10 0 0 1 10 10" stroke-linecap="round" />
    </svg>
  `;

	form.addEventListener("submit", function (e) {
		e.preventDefault();

		// 1. Собираем данные формы
		const formData = new FormData(this);
		const data = {
			name: formData.get("name") ? formData.get("name").trim() : "",
			phone: formData.get("phone") ? formData.get("phone").trim() : "",
			msg: formData.get("description")
				? formData.get("description").trim()
				: "",
		};

		// Простая проверка обязательных полей
		if (!data.name || !data.phone) {
			alert("Пожалуйста, заполните имя и телефон");
			return;
		}

		// 2. Блокируем кнопку и включаем лоадер
		submitBtn.disabled = true;
		submitBtn.classList.add("loading");
		submitBtn.innerHTML = `${spinnerSVG} Отправляю...`;

		// 3. Отправляем данные на Google Apps Script
		fetch(GOOGLE_SCRIPT_URL, {
			method: "POST",
			mode: "no-cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then(() => {
				// 4. Успешная отправка: скрываем поля формы и мягко проявляем сообщение
				form.classList.add("is-sent");

				if (successMessage) {
					// Вызываем через requestAnimationFrame/setTimeout для запуска CSS-перехода
					successMessage.style.display = "block";
					setTimeout(() => {
						successMessage.classList.add("is-visible");
					}, 20);
				}

				form.reset();
			})
			.catch((error) => {
				console.error("Ошибка отправки:", error);
				alert("Произошла ошибка при отправке заявки. Попробуйте еще раз.");

				// При ошибке разблокируем кнопку
				submitBtn.disabled = false;
				submitBtn.classList.remove("loading");
				submitBtn.innerHTML = originalBtnHTML;
			});
	});
});
