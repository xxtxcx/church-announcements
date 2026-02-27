import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import "../App.css";
import "./ConferenceLanding.css";

const FOOTER_BG = "#7926FF"; // як у Figma для футера та кнопок

// Секції для навбару (порядок як на сторінці)
const NAV_SECTIONS = [
  { id: "values", label: "Любов" },
  { id: "gallery", label: "Фотогалерея" },
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
  backgroundColor: "#0a0a0b"
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
        <span
          className="conference-faq-title"
          style={{
            fontFamily: "'Namu', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            lineHeight: "29px",
            letterSpacing: 0,
            color: "rgba(255,255,255,0.8)"
          }}
        >
          {title}
        </span>
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
    imagePlaceholder: true
  },
  {
    name: "ВОЛОДИМИР БІЛИК",
    bio: "У 2015-му прийняв одну з найстаріших харизматичних церков Львова і повів її далі. Знає, що будувати — це не про натхнення, а про рішення. Поговоримо про ідентичність лідера.",
    imagePlaceholder: true
  },
  {
    name: "ІГОР НОВОСЕЛЬЦЕВ",
    bio: "Молодіжний пастор, який говорить із молоддю — не до молоді. Якщо ти думав, що служіння це важко і нудно, він змінить твою думку за перші п'ять хвилин.",
    imagePlaceholder: true
  },
  {
    name: "ТОБІАС ТОТ",
    bio: "Будує церкву одночасно в Будапешті і Словаччині. Привезе погляд на першу любов і лідерство з зовсім іншого контексту — і це буде саме те, чого не вистачало.",
    imagePlaceholder: true
  }
];

const SCHEDULE = [
  { time: "11:00", text: "Час прославлення та поклоніння" },
  { time: "12:00", text: "Проповідь від пастора із Словаччини" },
  { time: "13:00", text: "Це сюрприз" },
  { time: "13:30", text: "Спілкування та обід" }
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
        <header className="relative h-[775px] max-h-[775px] w-full flex flex-col">
          {/* Зірка з анімації залишається в лівому верхньому куті після інтро */}
          {introDone && (
            <img
              src={INTRO_ASSETS.star}
              alt=""
              className="absolute left-0 top-0 w-40 h-40 object-contain pointer-events-none z-10"
              style={{ maxWidth: "180px" }}
            />
          )}
          <div className="flex flex-col items-center flex-1 min-h-0 pt-24">
            <h1 className="conference-hero-title uppercase text-center text-white">
              Power
              <br />
              Place
            </h1>
          </div>
          {/* Відступ знизу = висота навбару (77px) + зазор, щоб контент не закривала навігація */}
          <div className="flex flex-col items-center px-4 pb-[8rem]">
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

        {/* ========== VALUES (ЛЮБОВ) ========== */}
        <section
          id="values"
          className="py-10 border-t border-blue-500/40 border-dotted w-full"
        >
          <h2 className="conference-words-title text-white uppercase mb-6 w-full">
            Любов
          </h2>
          <h2 className="conference-words-title text-white uppercase mb-6 w-full">
            Спільність
          </h2>
          <h2 className="conference-words-title text-white uppercase mb-6 w-full">
            Підтримка
          </h2>
          <h2 className="conference-words-title text-white uppercase mb-6 w-full">
            Молитва
          </h2>
          <h2 className="conference-words-title text-white uppercase mb-6 w-full">
            Прославлення
          </h2>
        </section>

        {/* ========== GALLERY PLACEHOLDER ========== */}
        <section id="gallery" className="py-8">
          <h2 className="conference-font-namu text-xl uppercase text-white">
            Фотогалерея
          </h2>
          <p className="mt-2 text-white/70 text-sm">
            Тут з’являться фото з попередніх подій Power Place.
          </p>
        </section>

        {/* ========== SCHEDULE ========== */}
        <section
          id="schedule"
          className="py-10 border border-blue-500/40 border-dotted rounded-2xl px-4 flex flex-col items-center gap-[50px]"
        >
          <h2 className="conference-font-namu text-white uppercase text-2xl">
            Розклад
          </h2>
          <ul className="flex flex-col items-center gap-[50px] w-full max-w-[280px]">
            {SCHEDULE.map((item) => (
              <li key={item.time} className="flex flex-col items-center w-full">
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
          <h2 className="conference-font-namu text-2xl uppercase mb-8 text-white">
            Спікери
          </h2>
          <ul className="space-y-10">
            {SPEAKERS.map((s, i) => (
              <li key={i} className="text-center">
                <p
                  className="conference-font-namu text-sm uppercase tracking-wide mb-3 text-white"
                  style={{ transform: "scaleY(1.1)" }}
                >
                  {s.name}
                </p>
                <div className="w-32 h-32 rounded-full bg-white/15 mx-auto flex items-center justify-center text-4xl text-white/50">
                  {s.imagePlaceholder ? "?" : null}
                </div>
                <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-md mx-auto">
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
            <div>
              <label className="block text-sm uppercase mb-1">ПІП *</label>
              <input
                type="text"
                required
                placeholder="Христос Ісус Йосипович"
                className="w-full px-4 py-3 rounded-xl border border-white/60 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-white"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">
                Номер телефону *
              </label>
              <input
                type="tel"
                required
                placeholder="099-000-00-00"
                className="w-full px-4 py-3 rounded-xl border border-white/60 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-white"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">
                Дата народження
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="25-12-0000"
                  className="w-full px-4 py-3 rounded-xl border border-white/60 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-white pr-10"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, birthDate: e.target.value }))
                  }
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">
                Назва служіння
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-xl border border-white/60 bg-black/40 text-white focus:outline-none focus:border-white appearance-none cursor-pointer"
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">
                Роль у служінні
              </label>
              <input
                type="text"
                placeholder="Помічник"
                className="w-full px-4 py-3 rounded-xl border border-white/60 bg-transparent text-white placeholder-white/50 focus:outline-none focus:border-white"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm uppercase mb-1">
                Формат участі
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-xl border border-white/60 bg-black/40 text-white focus:outline-none focus:border-white appearance-none cursor-pointer"
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
            </div>
            <button
              type="submit"
              className="conference-form-btn-text w-full max-w-[350px] h-12 rounded-[147px] uppercase text-white hover:opacity-95 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: FOOTER_BG }}
            >
              Зареєструватись
            </button>
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

      {/* ========== КОНТАКТИ / FOOTER — на всю ширину, до низу (Figma: container) ========== */}
      <footer
        id="contacts"
        className="conference-footer-full conference-footer-container w-full text-white overflow-hidden min-h-[410px] pb-[6rem]"
        style={{ backgroundColor: FOOTER_BG }}
      >
        <div className="conference-footer-inner">
          <img
            src="/assets/logo.svg"
            alt="Power Place"
            className="conference-footer-logo-img"
          />
          <div className="flex flex-col items-center gap-0 w-full text-left conference-footer-contacts">
            <p className="conference-footer-contact-name w-full">
              Марти Бугиль
            </p>
            <a
              href="tel:0970934863"
              className="conference-footer-phone w-full hover:opacity-90 transition-opacity mt-1 block"
            >
              0970934863
            </a>
            <p className="conference-footer-address w-full mt-1">
              Львів, Замарстинівська, 37
            </p>
          </div>
        </div>
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
