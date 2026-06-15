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
  const nav      = document.getElementById('mainNav');
  const burger   = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-link, .btn');

  /** Переключение класса scrolled при прокрутке страницы */
  function handleScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  /** Открытие/закрытие мобильного меню */
  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    // Блокируем скролл при открытом меню
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  /** Закрытие меню при клике по ссылке */
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  window.addEventListener('scroll', handleScroll, { passive: true });
  burger.addEventListener('click', toggleMenu);
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
  if (typeof Rellax !== 'undefined') {
    // Отключаем на мобильных (сенсорная прокрутка там иная)
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      try {
        const rellax = new Rellax('.rellax', {
          speed:    -2,        // дефолтная скорость (переопределяется data-атрибутом)
          center:   false,
          vertical: true,
          horizontal: false,
          round:    true,
          wrapper:  null,
        });
      } catch (e) {
        console.warn('Rellax init failed:', e);
      }
    }
  }

  /**
   * Дополнительный параллакс: движение ближних букв за мышью
   * Создаёт эффект «глубины» при перемещении курсора по Hero
   */
  const hero       = document.getElementById('hero');
  const nearLayer  = document.querySelector('.layer-near');
  const midLayer   = document.querySelector('.layer-mid');

  if (!hero || !nearLayer || !midLayer) return;

  let rafId = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  function onMouseMove(e) {
    const rect   = hero.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    // Нормализованное смещение от центра (-1 .. +1)
    targetX = (e.clientX - rect.left - centerX) / centerX;
    targetY = (e.clientY - rect.top  - centerY) / centerY;
  }

  function animate() {
    // Инерционное сглаживание (lerp)
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    const nearOffX = currentX * 18;  // px смещения для ближнего слоя
    const nearOffY = currentY * 10;
    const midOffX  = currentX * 8;
    const midOffY  = currentY * 5;

    nearLayer.style.transform = `translate(${nearOffX}px, ${nearOffY}px)`;
    midLayer.style.transform  = `translate(${midOffX}px, ${midOffY}px)`;

    rafId = requestAnimationFrame(animate);
  }

  hero.addEventListener('mousemove', onMouseMove, { passive: true });
  hero.addEventListener('mouseenter', () => { rafId = requestAnimationFrame(animate); });
  hero.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafId);
    // Плавный возврат к 0
    targetX = 0; targetY = 0;
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
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold:  0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
})();


/* ============================================================
   4. GALLERY SLIDER
   ============================================================ */
(function initSlider() {
  const track    = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');

  if (!track) return;

  const slides       = track.querySelectorAll('.slide');
  const total        = slides.length;
  let   currentIndex = 0;
  let   autoplayTimer = null;
  let   isDragging    = false;

  /* ── Создаём точки-пагинацию ── */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className   = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Слайд ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.slider-dot');

  /* ── Переход к слайду ── */
  function goTo(index) {
    currentIndex = (index + total) % total;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    // Обновляем точки
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    resetAutoplay();
  }

  function goNext() { goTo(currentIndex + 1); }
  function goPrev() { goTo(currentIndex - 1); }

  /* ── Кнопки навигации ── */
  nextBtn?.addEventListener('click', goNext);
  prevBtn?.addEventListener('click', goPrev);

  /* ── Клавиатурная навигация ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  });

  /* ── Автопрокрутка ── */
  function startAutoplay() {
    autoplayTimer = setInterval(goNext, 4500);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  startAutoplay();

  /* ── Touch / Swipe поддержка ── */
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50; // px

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    isDragging  = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Убеждаемся, что это горизонтальный свайп (не вертикальный скролл)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) goNext();
      else            goPrev();
    }
  }, { passive: true });

  /* ── Drag (мышь) ── */
  let mouseStartX = 0;

  track.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    isDragging  = true;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = '';
    const delta = e.clientX - mouseStartX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) goNext();
      else           goPrev();
    }
  });

  track.addEventListener('mouseleave', () => {
    isDragging = false;
    track.style.cursor = '';
  });

  /* ── Пауза при hover ── */
  const sliderEl = document.getElementById('mainSlider');
  sliderEl?.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  sliderEl?.addEventListener('mouseleave', startAutoplay);
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
      author:   'Марина Соколова',
      rating:   5,
      date:     '14 января 2025',
      text:     'Огромная благодарность Анастасии! Наш сын в 3,5 года почти не говорил, только несколько слов. За 4 месяца работы он заговорил короткими фразами! Специалист очень терпеливый, грамотный, объясняет всё доступно и даёт конкретные задания на дом. Чувствуется большой опыт именно с детьми с РАС.',
      link:     'https://2gis.ru/novosibirsk/firm/70000001064307042/tab/reviews',
      avatarBg: '#0D9488',
    },
    {
      author:   'Дмитрий и Елена Ковалёвы',
      rating:   5,
      date:     '28 декабря 2024',
      text:     'Наша дочь с ЗПР начала заниматься в 4 года. Анастасия — настоящий профессионал своего дела. Использует АВА-терапию, PECS-карточки, игровые методики. Ребёнок очень любит ходить на занятия, что само по себе говорит о многом! Прогресс виден каждую неделю.',
      link:     'https://2gis.ru/novosibirsk/firm/70000001064307042/tab/reviews',
      avatarBg: '#6366F1',
    },
    {
      author:   'Алина Петрова',
      rating:   5,
      date:     '9 ноября 2024',
      text:     'Обратились с проблемой запуска речи у сына (РАС, 2,8 года). После первичной консультации сразу стало понятно — специалист знает, что делает. Прошло полгода — ребёнок называет предметы, просит еду словами, начал повторять слоги. Для нас это настоящее чудо. Рекомендую всем родителям в похожей ситуации!',
      link:     'https://2gis.ru/novosibirsk/firm/70000001064307042/tab/reviews',
      avatarBg: '#F43F5E',
    },
    {
      author:   'Светлана Новикова',
      rating:   5,
      date:     '3 октября 2024',
      text:     'Ходим уже 8 месяцев. Сын (5 лет, ЗРР + СДВГ) стал намного лучше понимать обращённую речь, появились фразы из 2–3 слов. Анастасия всегда объясняет смысл каждого упражнения и как продолжать дома. Очень ценю её подход — без давления, с уважением к ребёнку.',
      link:     'https://2gis.ru/novosibirsk/firm/70000001064307042/tab/reviews',
      avatarBg: '#F59E0B',
    },
    {
      author:   'Игорь Романов',
      rating:   5,
      date:     '17 сентября 2024',
      text:     'Мы из другого города, приезжаем раз в месяц на интенсивную работу + онлайн-консультации между визитами. Формат отлично работает! За 5 месяцев дочь (3 года, РАС) освоила 20 PECS-карточек и начала произносить первые слова. Специалист всегда на связи, отвечает на вопросы даже вечером.',
      link:     'https://2gis.ru/novosibirsk/firm/70000001064307042/tab/reviews',
      avatarBg: '#10B981',
    },
  ];

  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  /**
   * Рендерим каждую карточку отзыва из массива данных
   */
  REVIEWS_DATA.forEach((review, index) => {
    const firstLetter = review.author.charAt(0).toUpperCase();
    const stars       = generateStars(review.rating);

    const card = document.createElement('article');
    card.className = 'review-card reveal';
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
  reinitReveal(grid.querySelectorAll('.reveal'));
})();


/* ============================================================
   6. RATING STARS RENDER
   ============================================================ */
(function initRatingStars() {
  const starsContainer = document.getElementById('ratingStars');
  if (!starsContainer) return;

  const OVERALL_RATING = 4.9;
  starsContainer.innerHTML = generateStars(OVERALL_RATING, '1.4rem');
})();

/**
 * Генерирует HTML-строку со звёздами рейтинга
 * @param {number} rating  — оценка (0–5, поддерживает дробные)
 * @param {string} size    — размер иконок (CSS font-size)
 * @returns {string}
 */
function generateStars(rating, size = '1rem') {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.3 && rating % 1 < 0.8;
  const empty = 5 - full - (half ? 1 : 0);

  const starStyle = `font-size:${size};color:#F59E0B;`;

  return (
    '★'.repeat(full).split('').map(() => `<span class="review-star" style="${starStyle}">★</span>`).join('') +
    (half ? `<span class="review-star" style="${starStyle}opacity:.5;">★</span>` : '') +
    '★'.repeat(empty).split('').map(() => `<span class="review-star" style="font-size:${size};color:#D1D5DB;">★</span>`).join('')
  );
}

/**
 * Экранирует HTML-спецсимволы для безопасной вставки текста
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

/**
 * Повторно запускает Intersection Observer для динамически добавленных элементов
 * @param {NodeList} elements
 */
function reinitReveal(elements) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   7. CONTACT FORM — Валидация + Submit
   ============================================================ */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('formSubmitBtn');
  const successMsg = document.getElementById('formSuccess');

  if (!form) return;

  /** Конфигурация полей: id, id ошибки, правило валидации, сообщение */
  const FIELDS_CONFIG = [
    {
      inputId:  'fieldName',
      errorId:  'errorName',
      validate: (v) => v.trim().length >= 2,
      message:  'Введите имя (минимум 2 символа)',
    },
    {
      inputId:  'fieldPhone',
      errorId:  'errorPhone',
      validate: (v) => /^[\d\s\+\-\(\)]{10,18}$/.test(v.trim()),
      message:  'Введите корректный номер телефона',
    },
    {
      inputId:  'fieldAge',
      errorId:  'errorAge',
      validate: (v) => v !== '',
      message:  'Выберите возраст ребёнка',
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

    input.classList.toggle('error', !isValid);
    error.textContent = isValid ? '' : config.message;

    return isValid;
  }

  /** Валидация всей формы */
  function validateForm() {
    let allValid = true;
    FIELDS_CONFIG.forEach(cfg => {
      if (!validateField(cfg)) allValid = false;
    });
    return allValid;
  }

  /** Сброс ошибок при вводе */
  FIELDS_CONFIG.forEach(cfg => {
    const input = document.getElementById(cfg.inputId);
    input?.addEventListener('input', () => validateField(cfg));
    input?.addEventListener('change', () => validateField(cfg));
  });

  /**
   * Обработка отправки формы.
   * В реальном проекте здесь будет fetch() к бэкенду или API.
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Состояние загрузки
    submitBtn.disabled     = true;
    submitBtn.textContent  = 'Отправляем...';

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Показываем успех
    successMsg.classList.add('show');

    // Через 6 секунд сбрасываем форму
    setTimeout(() => {
      successMsg.classList.remove('show');
      form.reset();
      submitBtn.disabled    = false;
      submitBtn.innerHTML   = `
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
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  /** Показываем кнопку после 400px прокрутки */
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   9. PHONE INPUT MASK
   ============================================================ */
(function initPhoneMask() {
  const phoneInput = document.getElementById('fieldPhone');
  if (!phoneInput) return;

  /**
   * Простая маска для российского телефона: +7 (000) 000-00-00
   * Срабатывает на каждый ввод символа
   */
  phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, ''); // только цифры

    // Убираем ведущую 7 или 8 если есть
    if (val.startsWith('7') || val.startsWith('8')) {
      val = val.slice(1);
    }

    // Ограничиваем до 10 цифр
    val = val.slice(0, 10);

    let formatted = '+7';
    if (val.length > 0) formatted += ' (' + val.slice(0, 3);
    if (val.length >= 3) formatted += ') ' + val.slice(3, 6);
    if (val.length >= 6) formatted += '-' + val.slice(6, 8);
    if (val.length >= 8) formatted += '-' + val.slice(8, 10);

    e.target.value = formatted;
  });

  // Предотвращаем ввод нецифровых символов (кроме спец-клавиш)
  phoneInput.addEventListener('keydown', (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
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

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId  = anchor.getAttribute('href');
      const targetEl  = document.querySelector(targetId);

      if (!targetEl || targetId === '#') return;

      e.preventDefault();

      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
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
  const nearLetters = document.querySelectorAll('.near-letter');
  const colors = ['#F43F5E', '#0D9488', '#F59E0B', '#6366F1', '#10B981'];

  nearLetters.forEach((letter, i) => {
    letter.addEventListener('mouseenter', () => {
      const color = colors[i % colors.length];
      letter.style.textShadow = `0 0 30px ${color}80, 0 0 60px ${color}40`;
      letter.style.zIndex = '10';
    });

    letter.addEventListener('mouseleave', () => {
      letter.style.textShadow = '';
      letter.style.zIndex = '';
    });
  });
})();


/* ============================================================
   12. PERFORMANCE — Preload & Init logging
   ============================================================ */
window.addEventListener('load', () => {
  // Логируем время загрузки в дев-режиме
  if (window.performance && console) {
    const loadTime = Math.round(performance.now());
    console.info(`%c🗣 Логопед-Дефектолог | Страница загружена за ${loadTime}ms`, 'color:#0D9488;font-weight:bold;');
  }
});
