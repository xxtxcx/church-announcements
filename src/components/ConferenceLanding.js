import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import "../App.css";
import "./ConferenceLanding.css";

const FOOTER_BG = "#7926FF"; // як у Figma для футера та кнопок

// Секції для навбару (порядок як на сторінці)
// Блок "Любов" тепер включає в себе й фотогалерею, тому окремого пункту "Фотогалерея" в навбарі немає
const NAV_SECTIONS = [
  { id: "values", label: "Любов" },
  { id: "schedule", label: "Розклад" },
  { id: "speakers", label: "Спікери" },
  { id: "registration", label: "Реєстрація" },
  { id: "faq", label: "FAQ" },
  { id: "contacts", label: "Контакти" }
];

// Ресурси інтро: поклади у public/assets/ — star.svg, jesus.gif, flame.gif, head.gif
const INTRO_ASSETS = {
  star: "/assets/star.png",
  jesus: "/assets/jesus.gif",
  flame: "/assets/flame.gif",
  head: "/assets/head.gif"
};

// Фотогалерея — коло з фото поверх слів "Любов / Спільність / ..."
const GALLERY_IMAGES = [
  "/assets/d7b2a3ac465efa5671f2cbf107bcb1f44d72378e.jpg",
  "/assets/c42340f9bc284f06b323c6e1fc5a14977e313745.jpg",
  "/assets/92249a08ab01e73eb3addb5bf3e45ffff8662286.jpg",
  "/assets/355bfcc5018386977f9e6dc33341cf5d2f682255.jpg",
  "/assets/91cb2d98421f89d23f977f5ea7cb68c07b764c25.jpg",
  "/assets/58e7c1c13b611305300265e3c721a3b269c825f3.jpg",
  "/assets/8a27126b03d4444e6e2216a40463bd035b73962f.jpg",
  "/assets/7a3064d4f21b53788c6a27f1ae16294f2f5128ab.jpg",
  "/assets/3fb15b679992ccc2546de7c460cab1cc4754a182.jpg",
  "/assets/1b777a7bead9c05e127dc78d1bb54c6b9b52afd2.jpg"
];

// Таймлайн інтро (мс): зірка + ісус одночасно → Power Place → полум'я → палай → head → зростай → кінець
const INTRO_DURATION_STAR = 1200;
const INTRO_DURATION_JESUS_IN = 1000;
const INTRO_DURATION_POWER_PLACE = 1200;
const INTRO_DURATION_FLAME_IN = 1000;
const INTRO_DURATION_FLAME_OUT = 600;
const INTRO_DURATION_PALAI = 1000;
const INTRO_DURATION_HEAD_IN = 1000;
const INTRO_DURATION_HEAD_OUT = 600;
const INTRO_DURATION_ZROSTAI = 1000;
const INTRO_DURATION_FINAL = 800;

// Фон з легким зерном (текстура)
const grainStyle = {
  backgroundImage: "url('/assets/background-confa.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundColor: "#202020"
};

function BottomNavPill({ href, children, active = false, pillRef, onClick }) {
  const base =
    "whitespace-nowrap px-5 py-2 rounded-full text-xs font-normal uppercase tracking-[0.12em] border transition-colors conference-font-namu flex-shrink-0";
  const palette = active
    ? "bg-white text-black border-white"
    : "bg-black text-white border-white";

  return (
    <a
      ref={pillRef}
      href={href}
      className={`${base} ${palette}`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

function AccordionItem({ title, children, open, onToggle }) {
  return (
    <div className="border-b border-white/20">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left text-white"
      >
        <span className="conference-faq-title">{title}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="pb-4 text-white/80 text-sm leading-relaxed"
          style={{ fontFamily: "'Namu', sans-serif" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const SPEAKERS = [
  {
    name: "МИКОЛА САВЧУК",
    bio: "Єпископ, якому є що розказати про особисті чудеса і ріст — і він не соромиться говорити прямо. На Power Place поділиться тим, як євангелізм стає не програмою, а способом жити.",
    image: "/assets/speakers/mykola-savchuk.png",
    nameSvg: "/assets/speakers/savchuk.svg",
    nameSvgWidth: "16rem",
    nameSvgTop: "-top-14"
  },
  {
    name: "ВОЛОДИМИР БІЛИК",
    bio: "У 2015-му прийняв одну з найстаріших харизматичних церков Львова і повів її далі. Знає, що будувати — це не про натхнення, а про рішення. Поговоримо про ідентичність лідера.",
    image: "/assets/speakers/volodymyr-bilyk.jpg",
    nameSvg: "/assets/speakers/bilyk.svg",
    nameSvgWidth: "16rem",
    nameSvgScale: "scale-110",
    nameSvgTop: "-top-8"
  },
  {
    name: "ІГОР НОВОСЕЛЬЦЕВ",
    bio: "Молодіжний пастор, який говорить із молоддю — не до молоді. Якщо ти думав, що служіння це важко і нудно, він змінить твою думку за перші п'ять хвилин.",
    image: "/assets/speakers/ihor-novoseltsev.jpg",
    nameSvg: "/assets/speakers/novoselcev.svg",
    nameSvgWidth: "15rem",
    nameSvgTop: "-top-8",
    nameSvgScale: "scale-110"
  },
  {
    name: "ТОБІАС ТОТ",
    bio: "Будує церкву одночасно в Будапешті і Словаччині. Привезе погляд на першу любов і лідерство з зовсім іншого контексту — і це буде саме те, чого не вистачало.",
    image: "/assets/speakers/tobias-tot.jpg",
    nameSvg: "/assets/speakers/Tobias.svg",
    nameSvgWidth: "11rem"
  }
];

const SCHEDULE_DAYS = [
  {
    day: "П'ятниця",
    items: [
      { time: "9:15", text: "Реєстрація, конект, ді-джей" },
      { time: "10:00", text: "Прославлення, відкриття (Білик)" },
      { time: "11:30", text: "Перерва" },
      { time: "12:00", text: "Сесія (Тобіас Тот)" },
      { time: "13:30", text: "Обід" },
      { time: "14:30", text: "Норм чи стрьом (ток-шоу)" },
      { time: "15:30", text: "Перерва" },
      { time: "16:00", text: "Сесія (Ігор Н.), прославлення" },
      { time: "17:00", text: "Перерва" },
      { time: "17:30", text: "Вечір хвали" },
      { time: "18:30", text: "Чіл тайм" }
    ]
  },
  {
    day: "Субота",
    items: [
      { time: "8:30", text: "Сніданок для лідерів (сирники)" },
      { time: "9:15", text: "Реєстрація, конект" },
      { time: "10:00", text: "Сесія (Савчук М.)" },
      { time: "11:30", text: "Перерва" },
      { time: "12:00", text: "Сесія (Тобіас Тот)" },
      { time: "13:30", text: "Обід" },
      { time: "14:30", text: "Про стосунки (ток-шоу)" },
      { time: "15:30", text: "Перерва" },
      { time: "16:00", text: "Сесія (Савчук М.)" },
      { time: "17:00", text: "Перерва" },
      { time: "17:45", text: "Година з Богом, акустика «Я вирішив»" }
    ]
  }
];

const FAQ_ITEMS = [
  {
    q: "Коли і де?",
    a: "Конференція Power Place відбудеться у Львові, за адресою Замарстинівська, 37. Точну дату та час уточнюйте у організаторів."
  },
  {
    q: "Скільки коштує участь?",
    a: "Вартість залежить від формату участі. П’ятниця без обіду — 300 грн. Деталі при реєстрації."
  },
  {
    q: "Як зареєструватися?",
    a: "Заповніть форму вище та натисніть «Зареєструватись». Ми зв’яжемося з вами для підтвердження."
  },
  {
    q: "Я з іншого міста, де зупинитися?",
    a: "Напишіть нам за номером або контактом нижче — підкажемо варіанти житла поблизу."
  },
  {
    q: "Що взяти з собою?",
    a: "Документ, хороший настрій та бажання палати і зростати разом із нами."
  },
  {
    q: "Залишились питання?",
    a: "Телефонуйте: 097 093 48 63 або напишіть Марті Бугиль."
  }
];

export default function ConferenceLanding() {
  const [introDone, setIntroDone] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);
  const [activeSection, setActiveSection] = useState(NAV_SECTIONS[0].id);
  const [scheduleDayIndex, setScheduleDayIndex] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    birthDate: "",
    ministry: "",
    role: "Помічник",
    format: ""
  });

  const navScrollRef = useRef(null);
  const pillRefs = useRef({});
  const isScrollingFromClick = useRef(false);
  const galleryScrollRef = useRef(null);
  const galleryDirectionRef = useRef(1);
  const galleryIsUserInteractingRef = useRef(false);
  const galleryLastInteractionRef = useRef(
    typeof performance !== "undefined" ? performance.now() : Date.now()
  );
  const galleryLastScrollLeftRef = useRef(0);
  const galleryIsProgrammaticRef = useRef(false);

  // Scroll spy: підсвічувати кнопку секції, що в зоні видимості
  const observerCallback = useCallback((entries) => {
    if (isScrollingFromClick.current) return;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = entry.target.id;
      if (NAV_SECTIONS.some((s) => s.id === id)) {
        setActiveSection(id);
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0
    });
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [observerCallback]);

  // Після кліку по пілу — прокрутити навбар так, щоб активний піл був видно
  useEffect(() => {
    const pillEl = pillRefs.current[activeSection];
    const navEl = navScrollRef.current;
    if (pillEl && navEl) {
      pillEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [activeSection]);

  // Карусель фотогалереї: імітація безкінечної стрічки (3 копії ряду)
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;

    const initId = requestAnimationFrame(() => {
      const totalWidth = el.scrollWidth;
      if (!totalWidth) return;
      const singleSetWidth = totalWidth / 3;
      el.scrollLeft = singleSetWidth; // стартуємо з центральної копії
      galleryLastScrollLeftRef.current = el.scrollLeft;
    });

    const handleScroll = () => {
      if (!galleryScrollRef.current) return;

      const totalWidth = el.scrollWidth;
      if (!totalWidth) return;
      const singleSetWidth = totalWidth / 3;
      const current = el.scrollLeft;

      const delta = current - galleryLastScrollLeftRef.current;
      galleryLastScrollLeftRef.current = current;

      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      // Якщо скрол ініційований користувачем — оновити напрямок і поставити паузу автопрокрутки
      if (!galleryIsProgrammaticRef.current && Math.abs(delta) > 0.2) {
        galleryDirectionRef.current = delta > 0 ? 1 : -1;
        galleryIsUserInteractingRef.current = true;
        galleryLastInteractionRef.current = now;
      }

      if (current < singleSetWidth * 0.5) {
        // перескочити на таку ж позицію в наступній копії праворуч
        el.scrollLeft = current + singleSetWidth;
      } else if (current > singleSetWidth * 1.5) {
        // перескочити в копію ліворуч
        el.scrollLeft = current - singleSetWidth;
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(initId);
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Автопрокрутка фотокаруселі: повільний рух, який зупиняється при взаємодії
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;

    const handlePointerDown = () => {
      galleryIsUserInteractingRef.current = true;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      galleryLastInteractionRef.current = now;
    };

    const handlePointerUpOrLeave = () => {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      galleryLastInteractionRef.current = now;
      // Позначаємо, що після невеликої паузи можна знову автоскролити
      galleryIsUserInteractingRef.current = false;
    };

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointerup", handlePointerUpOrLeave);
    el.addEventListener("pointercancel", handlePointerUpOrLeave);
    el.addEventListener("pointerleave", handlePointerUpOrLeave);

    let frameId;
    const tick = () => {
      const node = galleryScrollRef.current;
      if (node) {
        const now =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        const idle =
          !galleryIsUserInteractingRef.current &&
          now - galleryLastInteractionRef.current > 1000;

        if (idle) {
          const speed = 0.25; // пікселів за кадр — дуже повільно
          const totalWidth = node.scrollWidth;
          if (totalWidth > 0) {
            const singleSetWidth = totalWidth / 3;
            const current = node.scrollLeft;

            galleryIsProgrammaticRef.current = true;
            node.scrollLeft =
              current + galleryDirectionRef.current * speed;
            galleryIsProgrammaticRef.current = false;

            // Обробка стрибків для "безкінечності" делегується scroll-обробнику вище
            if (node.scrollLeft < 0) {
              node.scrollLeft = 0;
            } else if (node.scrollLeft > totalWidth - node.clientWidth) {
              node.scrollLeft = totalWidth - node.clientWidth;
            }
          }
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointerup", handlePointerUpOrLeave);
      el.removeEventListener("pointercancel", handlePointerUpOrLeave);
      el.removeEventListener("pointerleave", handlePointerUpOrLeave);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  const handleNavClick = (id) => {
    isScrollingFromClick.current = true;
    setActiveSection(id);
    setTimeout(() => {
      isScrollingFromClick.current = false;
    }, 1200);
  };

  useEffect(() => {
    if (introDone) return;
    if (introStep >= 8) {
      const t = setTimeout(() => setIntroDone(true), 650);
      return () => clearTimeout(t);
    }
    const delays = [
      INTRO_DURATION_STAR,
      INTRO_DURATION_JESUS_IN,
      INTRO_DURATION_POWER_PLACE,
      INTRO_DURATION_FLAME_IN,
      INTRO_DURATION_FLAME_OUT + INTRO_DURATION_PALAI,
      INTRO_DURATION_HEAD_IN,
      INTRO_DURATION_HEAD_OUT + INTRO_DURATION_ZROSTAI,
      INTRO_DURATION_FINAL
    ];
    const t = setTimeout(
      () => setIntroStep((s) => s + 1),
      delays[introStep] ?? 600
    );
    return () => clearTimeout(t);
  }, [introDone, introStep]);

  const toggleFaq = (i) => setFaqOpen((prev) => (prev === i ? null : i));

  const loopedGalleryImages = [
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES,
    ...GALLERY_IMAGES
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: відправка на бекенд або збір даних
    alert("Дякуємо! Реєстрацію буде підтверджено по телефону.");
  };

  const showIntro = !introDone;

  return (
    <div
      className="conference-page min-h-screen text-white overflow-x-hidden overflow-y-auto h-screen"
      style={grainStyle}
    >
      {/* Інтро: зірка → ісус → Power Place → полум'я → палай → head → зростай → кінець */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center max-w-[389px] mx-auto px-4 ${
            introStep >= 8 ? "intro-overlay-exit" : ""
          }`}
          style={grainStyle}
        >
          {/* Крок 0: зірка вгорі справа, крутиться вліво; гіфка Ісуса знизу виїзжає до низу екрану — стартують одночасно */}
          {introStep >= 0 && introStep < 1 && (
            <img
              src={INTRO_ASSETS.star}
              alt=""
              className="absolute top-0 right-0 w-64 h-64 object-contain intro-star-move"
            />
          )}

          {/* Гіфка з Ісусом: з кроку 0, виїзд знизу екрану; фініш — низ гіфки по низу екрану */}
          {introStep >= 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none">
              <img
                src={INTRO_ASSETS.jesus}
                alt=""
                className={`max-w-xs w-full object-contain object-bottom ${introStep === 0 ? "intro-slide-up" : ""}`}
                style={introStep > 0 ? { animation: "none" } : {}}
              />
            </div>
          )}

          {/* Крок 2: напис Power Place */}
          {introStep >= 2 && (
            <h1
              className={`uppercase text-center tracking-[0.08em] mt-4 ${introStep === 2 ? "intro-fade-in" : ""}`}
              style={{
                fontFamily: "'Namu', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(48px, 18vw, 84px)",
                lineHeight: 0.8
              }}
            >
              Power
              <br />
              Place
            </h1>
          )}

          {/* Крок 3: гіфка полум'я виїзжає знизу; на кроку 4 воно вже не показується */}
          {introStep === 3 && (
            <img
              src={INTRO_ASSETS.flame}
              alt=""
              className="w-full max-w-xs object-contain mt-4 intro-slide-up"
            />
          )}

          {/* Крок 4: полум'я зникло, з'являється "палай" */}
          {introStep >= 4 && (
            <p
              className={`text-2xl uppercase tracking-[0.12em] mt-4 ${introStep === 4 ? "intro-fade-in" : ""}`}
            >
              палай
            </p>
          )}

          {/* Крок 5: гіфка head виїзжає знизу; на кроку 6 вже не показується */}
          {introStep === 5 && (
            <img
              src={INTRO_ASSETS.head}
              alt=""
              className="w-full max-w-xs object-contain mt-4 intro-slide-up"
            />
          )}

          {/* Крок 6: head зникає, з'являється "зростай" */}
          {introStep >= 6 && (
            <p
              className={`text-2xl uppercase tracking-[0.12em] mt-4 ${introStep === 6 ? "intro-fade-in" : ""}`}
            >
              зростай
            </p>
          )}

          {/* Крок 7–8: пауза, потім оверлей зникає */}
        </div>
      )}

      <div className="max-w-[390px] mx-auto w-full px-4 sm:px-6 relative pb-24">
        {/* ========== HEADER / HERO ========== */}
        <header className="relative w-full flex flex-col justify-between min-h-[calc(100vh-77px)]">
          {/* Зірка з анімації залишається в лівому верхньому куті після інтро */}
          {introDone && (
            <img
              src={INTRO_ASSETS.star}
              alt=""
              className="absolute left-0 top-0 w-40 h-40 object-contain pointer-events-none z-10"
              style={{ maxWidth: "180px" }}
            />
          )}
          <div className="flex flex-col items-center pt-24">
            <h1 className="conference-hero-title uppercase text-white">
              Power
              <br />
              <span className="conference-hero-place">Place</span>
            </h1>
          </div>
          {/* Невеликий відступ знизу, щоб кнопка не прилипала до навбару */}
          <div className="flex flex-col items-center px-4 pb-8">
            <div className="conference-hero-sub w-full max-w-[350px] flex justify-between text-white">
              <span>палай</span>
              <span>зростай</span>
            </div>
            <a
              href="#registration"
              className="conference-btn-text mt-6 w-full max-w-[350px] h-[57px] flex items-center justify-center rounded-[147px] text-white uppercase hover:opacity-95 transition-opacity"
              style={{ backgroundColor: FOOTER_BG }}
            >
              Зареєструватись
            </a>
          </div>
        </header>

        {/* ========== VALUES (ЛЮБОВ + ФОТОГАЛЕРЕЯ-КАРУСЕЛЬ) ========== */}
        <section
          id="values"
          className="conference-values-fullbleed relative py-10 overflow-hidden min-h-[460px]"
        >
          <div className="relative">
            {/* Слова-цінності як фон */}
            <div className="space-y-6 pl-5">
              <h2 className="conference-words-title text-white uppercase w-full">
                Любов
              </h2>
              <h2 className="conference-words-title text-white uppercase w-full">
                Спільність
              </h2>
              <h2 className="conference-words-title text-white uppercase w-full">
                Підтримка
              </h2>
              <h2 className="conference-words-title text-white uppercase w-full">
                Молитва
              </h2>
              <h2 className="conference-words-title text-white uppercase w-full">
                Прославлення
              </h2>
            </div>

            {/* Карусель круглих фото поверх слів */}
            <div className="conference-gallery-layer">
              <div
                ref={galleryScrollRef}
                className="conference-gallery-carousel"
              >
                {loopedGalleryImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="conference-gallery-item"
                  >
                    <img
                      src={src}
                      alt={`Power Place фото ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== Розклад ========== */}
        <section id="schedule" className="py-10 px-4 flex flex-col items-center gap-[50px]">
          <div className="conference-schedule-tabs">
            {SCHEDULE_DAYS.map(({ day }, i) => (
              <button
                key={day}
                type="button"
                className={`conference-schedule-tab ${scheduleDayIndex === i ? "active" : ""}`}
                onClick={() => setScheduleDayIndex(i)}
              >
                {day}
              </button>
            ))}
          </div>
          <ul className="flex flex-col items-center gap-[50px] w-full max-w-[280px]">
            {SCHEDULE_DAYS[scheduleDayIndex].items.map((item, i) => (
              <li key={i} className="flex flex-col items-center w-full">
                <span className="conference-schedule-label text-center flex-1 mb-[-10px] block w-full">
                  {item.text}
                </span>
                <span className="conference-schedule-time w-full text-center block">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ========== SPEAKERS ========== */}
        <section id="speakers" className="py-10">
          <ul className="space-y-10">
            {SPEAKERS.map((s, i) => (
              <li key={i} className="flex flex-col items-center pt-8">
                <div className="relative w-56 h-[240px] mx-auto overflow-visible">
                  <div className="absolute top-4 left-0 w-56 h-56 rounded-full overflow-hidden bg-white/10">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-white/50 bg-white/15">
                        ?
                      </div>
                    )}
                  </div>
                  {/* Ім'я: SVG-файл (за замовчуванням w-44, -top-16; можна перевизначити nameSvgWidth, nameSvgTop) або текст по дузі */}
                  {s.nameSvg ? (
                    <img
                      src={s.nameSvg}
                      alt={s.name}
                      style={{
                        width: s.nameSvgWidth || "11rem",
                        maxWidth: "none",
                        ...(s.nameSvgTranslateXValue
                          ? { transform: `translateX(${s.nameSvgTranslateXValue})` }
                          : {})
                      }}
                      className={`absolute left-1/2 -translate-x-1/2 h-auto object-contain pointer-events-none ${s.nameSvgTop ?? "-top-16"} ${s.nameSvgScale ?? ""} ${s.nameSvgTranslateX ?? ""}`}
                    />
                  ) : (
                    <svg
                      className="absolute top-0 left-0 w-full h-56 pointer-events-none"
                      viewBox="0 0 200 200"
                      aria-hidden="true"
                    >
                      <defs>
                        <path
                          id={`speaker-arc-${i}`}
                          d="M 20 20 A 80 80 0 0 1 180 20"
                        />
                      </defs>
                      <text className="conference-speaker-name">
                        <textPath
                          href={`#speaker-arc-${i}`}
                          startOffset="50%"
                          textAnchor="middle"
                        >
                          {s.name}
                        </textPath>
                      </text>
                    </svg>
                  )}
                </div>
                <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-[350px] w-full mx-auto text-justify">
                  {s.bio}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ========== REGISTRATION ========== */}
        <section id="registration" className="py-10">
          <h2 className="conference-registration-title uppercase text-center text-white mb-6 w-full">
            Будеш?
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="conference-field">
              <span className="conference-field-label">ПІП *</span>
              <input
                aria-label="ПІП"
                type="text"
                required
                placeholder="Христос Ісус Йосипович"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div className="conference-field">
              <span className="conference-field-label">Номер телефону *</span>
              <input
                type="tel"
                required
                aria-label="Номер телефону"
                placeholder="099-000-00-00"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="conference-field">
              <span className="conference-field-label">Дата народження</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="25-12-0000"
                  aria-label="Дата народження"
                  className="pr-10"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, birthDate: e.target.value }))
                  }
                />
                <Calendar className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
            </div>
            <div className="conference-field">
              <span className="conference-field-label">Назва служіння</span>
              <div className="relative">
                <select
                  aria-label="Назва служіння"
                  value={form.ministry}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ministry: e.target.value }))
                  }
                >
                  <option value="">Обрати</option>
                  <option value="worship">Прославлення</option>
                  <option value="kids">Діти</option>
                  <option value="youth">Молодь</option>
                  <option value="media">Медія</option>
                  <option value="other">Інше</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
            </div>
            <div className="conference-field">
              <span className="conference-field-label">Роль у служінні</span>
              <input
                type="text"
                placeholder="Помічник"
                aria-label="Роль у служінні"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              />
            </div>
            <div className="conference-field">
              <span className="conference-field-label">Формат участі</span>
              <div className="relative">
                <select
                  aria-label="Формат участі"
                  value={form.format}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, format: e.target.value }))
                  }
                >
                  <option value="">Обрати</option>
                  <option value="fri-no-lunch">
                    П'ятниця (без обіду) — 300 грн
                  </option>
                  <option value="fri-lunch">
                    П'ятниця (з обідом) — 400 грн
                  </option>
                  <option value="full">Повний формат — уточнюйте</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-center pt-1">
              <button
                type="submit"
                className="conference-form-btn-text w-full max-w-[350px] h-12 rounded-[147px] uppercase text-white hover:opacity-95 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: FOOTER_BG }}
              >
                Зареєструватись
              </button>
            </div>
          </form>
        </section>

        {/* ========== FAQ ========== */}
        <section id="faq" className="py-10">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              title={item.q}
              open={faqOpen === i}
              onToggle={() => toggleFaq(i)}
            >
              {item.a}
            </AccordionItem>
          ))}
        </section>
      </div>

      {/* ========== КОНТАКТИ / FOOTER — svg-макет ========== */}
      <footer
        id="contacts"
        className="w-full text-white overflow-hidden min-h-[425px] pb-[6rem]"
      >
        <picture>
          <source
            srcSet="/assets/footer-conference2.svg"
            media="(min-width: 640px)"
          />
          <img
            src="/assets/footer-conference.svg"
            alt="Power Place контакти"
            className="w-full h-auto block"
          />
        </picture>
      </footer>

      {/* Нижній навбар-карусель: горизонтальний скрол, активна кнопка біла, scroll spy */}
      <nav
        ref={navScrollRef}
        className="conference-nav-carousel fixed bottom-0 left-0 right-0 w-full min-w-0 h-[77px] bg-black flex items-center z-30"
        aria-label="Навігація по секціях"
      >
        <div className="flex items-center gap-3 px-4 sm:px-5 overflow-x-auto overflow-y-hidden w-full scrollbar-hide conference-nav-carousel-inner">
          {NAV_SECTIONS.map(({ id, label }) => (
            <BottomNavPill
              key={id}
              href={`#${id}`}
              active={activeSection === id}
              pillRef={(el) => {
                pillRefs.current[id] = el;
              }}
              onClick={() => handleNavClick(id)}
            >
              {label}
            </BottomNavPill>
          ))}
        </div>
      </nav>
    </div>
  );
}
