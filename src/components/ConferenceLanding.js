import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import "../App.css";
import "./ConferenceLanding.css";

const FOOTER_BG = "#7926FF"; // як у Figma для футера та кнопок
const MONOBANK_JAR_URL = "https://send.monobank.ua/jar/9HKpA3Sjge";

// Google Form: Power Place реєстрація. Усі питання — «Коротка відповідь», включно з датою народження.
const GOOGLE_FORM = {
  formId: "1FAIpQLSciTF6E-ISRi9nhogllDbCHp7u51ZHIUAPDVlnvsT8_6i-kyw",
  entries: {
    fullName: "entry.725838874",
    phone: "entry.1275835305",
    birthDate: "entry.1380077094", // у формі — тип «Коротка відповідь», не «Дата»
    ministry: "entry.2123999587",
    role: "entry.104208223",
    format: "entry.901496433"
  }
};

const MINISTRY_LABELS = {
  "": "—",
  worship: "Прославлення",
  kids: "Діти",
  youth: "Молодь",
  media: "Медія",
  other: "Інше"
};

const FORMAT_LABELS = {
  "": "—",
  "fri-no": "П'ятниця, без обіду - 300 грн",
  "sat-no": "Субота, без обіду - 300 грн",
  "fri-sat-no": "П'ятниця + Субота, без обідів - 500 грн",
  "fri-lunch": "П'ятниця, з обідом - 600 грн",
  "sat-lunch": "Субота, з обідом - 600 грн",
  "fri-sat-lunch": "П'ятниця + Субота, з обідами - 1100 грн"
};

// Фрази замість «Please fill out this field» — нагадування в контексті конференції
const VALIDATION_PHRASES = [
  "Ти ж з нами? Напиши хоч як звуть і номер :)",
  "Без тебе не зберуть список - заповни, будь ласка",
  "Power Place потребує твоєї відповіді тут",
  "Хочемо знати, хто приходить - дай знати",
  "Йоу, заповни це - ми ж маємо сконтактувати",
  "Не залишай порожнім - як ми тебе знайдемо?",
  "Це обов'язкове: тоді точно будеш у списку",
  "Реєстрація = твої дані тут. Заповни, пліз!",
  "Поле чекає на тебе - палай, заповняй",
  "Зростай у вірності: почни з цього поля"
];

function getRandomValidationPhrase() {
  return VALIDATION_PHRASES[Math.floor(Math.random() * VALIDATION_PHRASES.length)];
}

// Перетворює дату в dd.mm.yyyy для Google Form
function toDateDDMMYYYY(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  const dash = s.replace(/\//g, "-").split("-");
  const dot = s.split(".");
  let d, m, y;
  if (dash.length === 3) {
    if (dash[0].length === 4) {
      [, m, d] = dash;
      y = dash[0];
    } else {
      [d, m, y] = dash;
    }
  } else if (dot.length === 3) {
    if (dot[0].length === 4) {
      [, m, d] = dot;
      y = dot[0];
    } else {
      [d, m, y] = dot;
    }
  } else {
    return s;
  }
  d = d.padStart(2, "0");
  m = m.padStart(2, "0");
  if (y.length === 2) y = parseInt(y, 10) > 50 ? `19${y}` : `20${y}`;
  return `${d}.${m}.${y}`;
}

// Секції для навбару (порядок як на сторінці)
const NAV_SECTIONS = [
  { id: "values", label: "Як це було" },
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

// Таймлайн інтро (мс): зірка + ісус → Power Place → полум'я → палай → head 1,5 с → ховаємо head → кінець
const INTRO_DURATION_STAR = 1200;
const INTRO_DURATION_JESUS_IN = 1000;
const INTRO_DURATION_POWER_PLACE = 1200;
const INTRO_DURATION_FLAME_IN = 1600;
const INTRO_DURATION_FLAME_OUT = 600;
const INTRO_DURATION_PALAI = 1000;
const INTRO_DURATION_HEAD_VISIBLE = 1500;
const INTRO_DURATION_HEAD_EXIT_MS = 840;
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
    "whitespace-nowrap px-5 py-2.5 rounded-[147px] text-sm font-bold uppercase tracking-[0.12em] transition-colors conference-font-namu flex-shrink-0";
  const activeClass = "bg-white text-black border-2 border-white";
  const inactiveClass = "bg-transparent text-white border border-white";

  return (
    <a
      ref={pillRef}
      href={href}
      className={`${base} ${active ? activeClass : inactiveClass}`}
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
        <div className="conference-faq-answer pb-4 text-white/80 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

const SPEAKERS = [
  {
    name: "МИКОЛА САВЧУК",
    bio: "Єпископ, пастор та служитель Об'єднання церков «Спасіння» у м. Вишневе Київської області. Народився в невіруючій сім'ї, але у віці 10 років пережив чудесне зцілення туберкульозу кісток, про що свідчить скрізь, де проповідує. У служінні він особливо фокусується на розвитку домашніх груп, євангелізації, менторстві та підтримці молоді. На конференції Power Place ділитиметься тим, як євангелізація стає не програмою, а способом життя.",
    image: "/assets/speakers/mykola-savchuk.png",
    nameSvg: "/assets/speakers/savchuk.svg",
    nameSvgWidth: "16rem",
    nameSvgTop: "-top-14"
  },
  {
    name: "ВОЛОДИМИР БІЛИК",
    bio: "У 2015-му прийняв одну з найстаріших харизматичних церков Львова і повів її далі. Знає, що будувати - це не про натхнення, а про рішення. Поговоримо про ідентичність лідера.",
    image: "/assets/speakers/volodymyr-bilyk.jpg",
    nameSvg: "/assets/speakers/bilyk.svg",
    nameSvgWidth: "16rem",
    nameSvgScale: "scale-110",
    nameSvgTop: "-top-8"
  },
  {
    name: "ІГОР НОВОСЕЛЬЦЕВ",
    bio: "Молодіжний пастор, який надихає молодь служити та впливати на покоління. Володіє особливим даром віри, який запалює серця і надихає на сміливі кроки у служінні та житті. Ігор є яскравим прикладом сімейних цінностей: разом з дружиною Оленою вони усиновили трьох дітей, даруючи їм любов і турботу. Його життя – поєднання віри, щедрості та великого серця, що мотивує кожного діяти і творити зміни.",
    image: "/assets/speakers/ihor-novoseltsev.jpg",
    nameSvg: "/assets/speakers/novoselcev.svg",
    nameSvgWidth: "15rem",
    nameSvgTop: "-top-8",
    nameSvgScale: "scale-110"
  },
  {
    name: "ТОБІАС ТОТ",
    bio: "Молодіжний пастор церкви Equippers Budapest. Він живе, щоб збудовувати лідерів, допомагати людям ставати учнями та бачити церкви повними молоді, що горить та слідує за Ісусом. Торік вже був на Power Place і залишив слово, яке досі резонує. Цього року чекаємо ще більшого.",
    image: "/assets/speakers/tobias-tot.jpg",
    nameSvg: "/assets/speakers/Tobias.svg",
    nameSvgWidth: "11rem"
  }
];

const SCHEDULE_DAYS = [
  {
    day: "П'ятниця",
    items: [
      { time: "9:15", text: "Реєстрація" },
      { time: "10:00", text: "Відкриття" },
      { time: "11:30", text: "Перерва" },
      { time: "12:00", text: "Сесія 1" },
      { time: "13:30", text: "Обід" },
      { time: "14:30", text: 'Ток шоу "норм чи стрьом"' },
      { time: "15:30", text: "Перерва" },
      { time: "16:00", text: "Сесія 2" },
      { time: "17:00", text: "Перерва" },
      { time: "17:30", text: "Вечір хвали" },
      { time: "18:30", text: "Чіл тайм" }
    ]
  },
  {
    day: "Субота",
    items: [
      { time: "9:15", text: "Реєстрація" },
      { time: "10:00", text: "Сесія 1" },
      { time: "11:30", text: "Перерва" },
      { time: "12:00", text: "Сесія 2" },
      { time: "13:30", text: "Обід" },
      { time: "14:30", text: 'Ток шоу "про стосунки"' },
      { time: "15:30", text: "Перерва" },
      { time: "16:00", text: "Сесія 3" },
      { time: "17:00", text: "Перерва" },
      { time: "17:45", text: "Вечір хвали" }
    ]
  }
];

const FAQ_ITEMS = [
  {
    q: "Коли і де?",
    a: "24 квітня - старт дводенної конференції Power Place. Місце: Львів, вул. Замарстинівська, 37."
  },
  {
    q: "Скільки коштує участь?",
    a: "Вартість залежить від формату: П'ятниця, без обіду - 300 грн. Субота, без обіду - 300 грн. П'ятниця + Субота, без обідів - 500 грн. П'ятниця, з обідом - 600 грн. Субота, з обідом - 600 грн. П'ятниця + Субота, з обідами - 1100 грн."
  },
  {
    q: "Як зареєструватися?",
    a: "Заповни форму вище та натисни «Зареєструватись». Ми зв’яжемося з тобою для підтвердження."
  },
  {
    q: "Як оплатити?",
    a: (
      <>
        Оплатити участь можна за посиланням:{" "}
        <a
          href={MONOBANK_JAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="conference-faq-link"
        >
          Monobank (банка)
        </a>
        . У коментарі до платежу обовʼязково вкажи ПІП, під яким зареєструвався/зареєструвалася - щоб ми могли ідентифікувати оплату.
      </>
    )
  },
  {
    q: "Я з іншого міста, де зупинитися?",
    a: "Напиши нам за номером або контактом нижче - підкажемо варіанти житла поблизу."
  },
  {
    q: "Що взяти з собою?",
    a: "Документ, хороший настрій та бажання палати і зростати разом із нами."
  },
  {
    q: "Залишились питання?",
    a: (
      <>
        Дзвони: 097 093 48 63 або напиши в Telegram -{" "}
        <a
          href="https://t.me/MartaBuhyl"
          target="_blank"
          rel="noopener noreferrer"
          className="conference-faq-link"
        >
          Марта Бугиль (@MartaBuhyl)
        </a>
      </>
    )
  }
];

export default function ConferenceLanding() {
  const [introDone, setIntroDone] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [jesusVisible, setJesusVisible] = useState(true);
  const [zrostaiVisible, setZrostaiVisible] = useState(false);
  const [palaiVisible, setPalaiVisible] = useState(false);
  const [flameExitDone, setFlameExitDone] = useState(true);
  const [headExitDone, setHeadExitDone] = useState(true);
  const [headShowAfterDelay, setHeadShowAfterDelay] = useState(false);
  const [starPosition, setStarPosition] = useState("left");
  const [starClickCount, setStarClickCount] = useState(0);
  const [starRolling, setStarRolling] = useState(false);
  const [starRollDirection, setStarRollDirection] = useState(null);
  const [starRotationOffset, setStarRotationOffset] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);
  const [activeSection, setActiveSection] = useState(NAV_SECTIONS[0].id);
  const [scheduleDayIndex, setScheduleDayIndex] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    birthDate: "",
    ministry: "",
    role: "Помічник",
    format: ""
  });

  const navScrollRef = useRef(null);
  const birthDateInputRef = useRef(null);
  const pillRefs = useRef({});
  const isScrollingFromClick = useRef(false);
  const galleryScrollRef = useRef(null);
  const galleryIdleSinceRef = useRef(0); // Infinity = користувач взаємодіє, число = час останнього відпускання
  const galleryProgrammaticRef = useRef(false);
  const galleryReleaseTimeoutRef = useRef(null);

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

  // Галерея: початкова позиція — середина (одна третина), щоб був безкінечний скрол
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const init = () => {
      const total = el.scrollWidth;
      if (!total) return;
      el.scrollLeft = total / 3;
    };
    const id = requestAnimationFrame(init);
    return () => cancelAnimationFrame(id);
  }, []);

  // Галерея: безкінечний скрол — перестрибування між третинами
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const total = el.scrollWidth;
      if (!total) return;
      const third = total / 3;
      const x = el.scrollLeft;
      if (x < third * 0.5) el.scrollLeft = x + third;
      else if (x > third * 1.5) el.scrollLeft = x - third;
      galleryProgrammaticRef.current = false;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Галерея: пауза при дотику, відновлення після відпускання (на мобільних — таймаут, якщо touchend не прийшов)
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
    const RECOVER_MS = 2000;
    const onTouch = () => {
      galleryIdleSinceRef.current = Infinity;
      if (galleryReleaseTimeoutRef.current) clearTimeout(galleryReleaseTimeoutRef.current);
      galleryReleaseTimeoutRef.current = setTimeout(() => {
        galleryReleaseTimeoutRef.current = null;
        galleryIdleSinceRef.current = now();
      }, RECOVER_MS);
    };
    const onRelease = () => {
      if (galleryReleaseTimeoutRef.current) {
        clearTimeout(galleryReleaseTimeoutRef.current);
        galleryReleaseTimeoutRef.current = null;
      }
      galleryIdleSinceRef.current = now();
    };
    el.addEventListener("pointerdown", onTouch);
    el.addEventListener("touchstart", onTouch);
    el.addEventListener("pointerup", onRelease);
    el.addEventListener("touchend", onRelease);
    el.addEventListener("pointerleave", onRelease);
    el.addEventListener("touchcancel", onRelease);
    return () => {
      if (galleryReleaseTimeoutRef.current) clearTimeout(galleryReleaseTimeoutRef.current);
      el.removeEventListener("pointerdown", onTouch);
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("pointerup", onRelease);
      el.removeEventListener("touchend", onRelease);
      el.removeEventListener("pointerleave", onRelease);
      el.removeEventListener("touchcancel", onRelease);
    };
  }, []);

  // Галерея: автоматичний рух вправо; якщо користувач не взаємодіє (idle) — рухаємо
  useEffect(() => {
    let rafId;
    const IDLE_MS = 800;
    const SPEED = 0.5;
    const tick = () => {
      const el = galleryScrollRef.current;
      if (el) {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const idle = galleryIdleSinceRef.current !== Infinity && (now - galleryIdleSinceRef.current) > IDLE_MS;
        if (idle) {
          const total = el.scrollWidth;
          if (total > 0) {
            const third = total / 3;
            galleryProgrammaticRef.current = true;
            el.scrollLeft += SPEED;
            let x = el.scrollLeft;
            if (third > 0) {
              if (x < third * 0.5) el.scrollLeft = x + third;
              else if (x > third * 1.5) el.scrollLeft = x - third;
            }
            x = el.scrollLeft;
            if (x < 0) el.scrollLeft = 0;
            else if (x > total - el.clientWidth) el.scrollLeft = total - el.clientWidth;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, []);

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
      Math.max(0, INTRO_DURATION_POWER_PLACE - 900),
      INTRO_DURATION_FLAME_IN,
      INTRO_DURATION_FLAME_OUT + INTRO_DURATION_PALAI,
      INTRO_DURATION_HEAD_VISIBLE,
      INTRO_DURATION_HEAD_EXIT_MS,
      INTRO_DURATION_FINAL
    ];
    const t = setTimeout(
      () => setIntroStep((s) => s + 1),
      delays[introStep] ?? 600
    );
    return () => clearTimeout(t);
  }, [introDone, introStep]);

  // Ісус зникає за 0,9 с до кінця кроку 2; перехід на крок 3 синхронізовано — без паузи
  useEffect(() => {
    if (introStep < 2) setJesusVisible(true);
    if (introStep === 2) {
      const t = setTimeout(() => setJesusVisible(false), Math.max(0, INTRO_DURATION_POWER_PLACE - 900));
      return () => clearTimeout(t);
    }
  }, [introStep]);

  // «палай» — у середині гіфки полум'я
  useEffect(() => {
    if (introStep < 3) setPalaiVisible(false);
    if (introStep === 3) {
      const t = setTimeout(() => setPalaiVisible(true), INTRO_DURATION_FLAME_IN / 2);
      return () => clearTimeout(t);
    }
    if (introStep > 3) setPalaiVisible(true);
  }, [introStep]);

  // «зростай» — у середині показу head (1,5 с)
  useEffect(() => {
    if (introStep < 5) setZrostaiVisible(false);
    if (introStep === 5) {
      const t = setTimeout(() => setZrostaiVisible(true), INTRO_DURATION_HEAD_VISIBLE / 2);
      return () => clearTimeout(t);
    }
    if (introStep > 5) setZrostaiVisible(true);
  }, [introStep]);

  // Полум'я: при переході на крок 4 ховається вниз (анімація 0.9s)
  useEffect(() => {
    if (introStep === 3) setFlameExitDone(false);
    if (introStep === 4) {
      const t = setTimeout(() => setFlameExitDone(true), 900);
      return () => clearTimeout(t);
    }
    if (introStep !== 3 && introStep !== 4) setFlameExitDone(true);
  }, [introStep]);

  // Head: затримка 0.02 с після початку кроку 4 (перед появою паралельно з полум'ям)
  useEffect(() => {
    if (introStep < 4) setHeadShowAfterDelay(false);
    if (introStep === 4) {
      const t = setTimeout(() => setHeadShowAfterDelay(true), 20);
      return () => clearTimeout(t);
    }
    if (introStep > 4) setHeadShowAfterDelay(true);
  }, [introStep]);

  // Head: при переході на крок 6 ховається вниз (анімація 0.9s)
  useEffect(() => {
    if (introStep === 5) setHeadExitDone(false);
    if (introStep === 6) {
      const t = setTimeout(() => setHeadExitDone(true), INTRO_DURATION_HEAD_EXIT_MS);
      return () => clearTimeout(t);
    }
    if (introStep !== 5 && introStep !== 6) setHeadExitDone(true);
  }, [introStep]);

  const toggleFaq = (i) => setFaqOpen((prev) => (prev === i ? null : i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { formId, entries } = GOOGLE_FORM;
    if (!formId || formId === "YOUR_GOOGLE_FORM_ID") {
      alert("Налаштуйте GOOGLE_FORM.formId та GOOGLE_FORM.entries у ConferenceLanding.js");
      return;
    }
    const birthDateRaw = form.birthDate.trim();
    const birthDateValue = birthDateRaw ? (toDateDDMMYYYY(form.birthDate) || birthDateRaw) : "";

    const params = new URLSearchParams();
    params.set("draftResponse", "[]");
    params.set("pageHistory", "0");
    params.set(entries.fullName, form.fullName.trim());
    params.set(entries.phone, form.phone.trim());
    params.set(entries.birthDate, birthDateValue);
    params.set(entries.ministry, (MINISTRY_LABELS[form.ministry] ?? form.ministry).trim());
    params.set(entries.role, form.role.trim());
    params.set(entries.format, (FORMAT_LABELS[form.format] ?? form.format).trim());

    const url = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });
    } catch (_err) {
      // no-cors не повертає тіло відповіді; запит може все одно дійти до Google
    }
    setFormSubmitted(true);
  };

  const showIntro = !introDone;

  return (
    <div
      className="conference-page text-white overflow-x-hidden overflow-y-auto"
      style={grainStyle}
    >
      {/* Зірка: клік — обертання на місці; після 3+ кліків — перекочування в протилежний кут */}
      {introStep >= 0 && (
        <button
          type="button"
          aria-label="Зірка"
          onClick={() => {
            if (introStep < 1 || starRolling) return;
            const pos = starPosition;
            const count = starClickCount + 1;
            setStarClickCount(count);
            setStarRotationOffset((o) => o + 360);
            setTimeout(() => {
              if (count > 3) {
                setStarRollDirection(pos === "left" ? "toRight" : "toLeft");
                setStarRolling(true);
              }
            }, 600);
          }}
          onAnimationEnd={(e) => {
            if (e.animationName && (e.animationName.includes("star-roll") || e.animationName.includes("intro-star-roll"))) {
              const dir = starRollDirection;
              setStarPosition((p) => (p === "left" ? "right" : "left"));
              setStarRolling(false);
              setStarRollDirection(null);
              setStarClickCount(0);
              setStarRotationOffset((o) => o + (dir === "toRight" ? 900 : -900));
            }
          }}
          className={`absolute top-0 right-0 w-80 h-80 object-contain z-[60] border-0 bg-transparent p-0 block cursor-pointer touch-manipulation ${
            introStep === 0 ? "intro-star-move pointer-events-none" : ""
          } ${introStep >= 1 && starRolling && starRollDirection === "toRight" ? "intro-star-roll-to-right" : ""} ${
            introStep >= 1 && starRolling && starRollDirection === "toLeft" ? "intro-star-roll-to-left" : ""
          } ${introStep >= 1 && !starRolling ? "conference-star-spin-transition" : ""}`}
          style={{
            maxWidth: "240px",
            ...(introStep >= 1 && {
              ...(starRolling && {
                "--star-roll-from": String(starPosition === "left" ? -900 + starRotationOffset : -1080 + starRotationOffset)
              }),
              ...(!starRolling && {
                transform:
                  starPosition === "left"
                    ? `translate(calc(-100vw + 160px), -140px) rotate(${-900 + starRotationOffset}deg)`
                    : `translate(140px, -140px) rotate(${-1080 + starRotationOffset}deg)`
              })
            })
          }}
        >
          <img src={INTRO_ASSETS.star} alt="" className="w-full h-full object-contain pointer-events-none" />
        </button>
      )}

      {/* Інтро-оверлей: ісус, полум'я, head (зірка винесена зверху) */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center max-w-[389px] mx-auto px-4 ${
            introStep >= 8 ? "intro-overlay-exit" : ""
          }`}
          style={{ backgroundColor: "transparent" }}
        >
          {/* Ісус: показується до кроку 3; зникає на 0,2 с раніше ніж з’являється полум’я */}
          {introStep >= 0 && introStep < 3 && jesusVisible && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-end items-end pointer-events-none w-full">
              <img
                src={INTRO_ASSETS.jesus}
                alt=""
                className={`intro-jesus-img object-contain object-bottom object-right ${introStep === 0 ? "intro-slide-up-from-bottom" : ""}`}
              />
            </div>
          )}

          {/* Крок 3–4: полум'я — з'являється знизу, при зникненні ховається вниз */}
          {(introStep === 3 || (introStep === 4 && !flameExitDone)) && (
            <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center items-end pointer-events-none z-10 intro-flame-wrap">
              <img
                src={INTRO_ASSETS.flame}
                alt=""
                className={`intro-flame-img ${introStep === 4 ? "intro-slide-down" : "intro-slide-up-from-bottom"}`}
              />
            </div>
          )}

          {/* Крок 4–6: гіфка head — з затримкою 0.02 с після початку кроку 4, потім ховається вниз */}
          {((introStep === 4 && headShowAfterDelay) || introStep === 5 || (introStep === 6 && !headExitDone)) && (
            <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center items-end pointer-events-none intro-head-wrap">
              <img
                src={INTRO_ASSETS.head}
                alt=""
                className={`intro-head-img ${introStep === 6 ? "intro-head-slide-down" : "intro-slide-up-from-bottom"}`}
              />
            </div>
          )}

          {/* Крок 7–8: пауза, потім оверлей зникає */}
        </div>
      )}

      <div className="max-w-[390px] mx-auto w-full px-4 sm:px-6 relative pb-24">
        {/* ========== HEADER / HERO — все видно одразу; під час інтро ховаємо кнопку, палай/зростай до своїх моментів */}
        <header className="conference-hero relative w-full flex flex-col justify-between">
          <div className="flex flex-col items-center pt-24">
            <h1 className="conference-hero-title uppercase text-white">
              Power
              <br />
              <span className="conference-hero-place">Place</span>
            </h1>
          </div>
          <div className="flex flex-col items-center px-4 pb-8">
            <div className="conference-hero-sub w-full max-w-[350px] flex justify-between text-white">
              <span style={{ visibility: showIntro && (introStep < 3 || (introStep === 3 && !palaiVisible)) ? "hidden" : "visible" }}>палай</span>
              <span style={{ visibility: showIntro && (introStep < 5 || (introStep === 5 && !zrostaiVisible)) ? "hidden" : "visible" }}>зростай</span>
            </div>
            {(!showIntro || introStep >= 6) && (
              <a
                href="#registration"
                className="conference-btn-text mt-6 w-full max-w-[350px] h-[57px] flex items-center justify-center rounded-[147px] text-white uppercase hover:opacity-95 transition-opacity"
                style={{ backgroundColor: FOOTER_BG }}
              >
                Зареєструватись
              </a>
            )}
          </div>
        </header>

        {/* ========== VALUES (ЛЮБОВ + ФОТОГАЛЕРЕЯ-КАРУСЕЛЬ) ========== */}
        <section
          id="values"
          className="conference-values-fullbleed relative py-20 overflow-hidden min-h-[460px]"
        >
          <div className="relative">
            {/* Слова-цінності як фон; ЛЮБОВ не показуємо на початку (під час інтро) */}
            <div className="space-y-6 pl-5">
              <h2 className="conference-words-title text-white uppercase w-full" style={{ visibility: showIntro ? "hidden" : "visible" }}>
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

            {/* Карусель: тягни вручну + повільна автопрокрутка, рандомний старт */}
            <div className="conference-gallery-layer">
              <div
                ref={galleryScrollRef}
                className="conference-gallery-track"
              >
                <div className="conference-gallery-inner">
                  {[...GALLERY_IMAGES, ...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, index) => (
                    <div key={`${src}-${index}`} className="conference-gallery-item">
                      <img
                        src={src}
                        alt={`Power Place фото ${(index % GALLERY_IMAGES.length) + 1}`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== Розклад ========== */}
        <section id="schedule" className="py-20 px-4 flex flex-col items-center gap-[50px]">
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
        <section id="speakers" className="py-20">
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
                        loading="lazy"
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
                      loading="lazy"
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
        <section id="registration" className="py-20">
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
                onChange={(e) => {
                  e.target.setCustomValidity("");
                  setForm((f) => ({ ...f, fullName: e.target.value }));
                }}
                onInvalid={(e) => e.target.setCustomValidity(getRandomValidationPhrase())}
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
                onChange={(e) => {
                  e.target.setCustomValidity("");
                  setForm((f) => ({ ...f, phone: e.target.value }));
                }}
                onInvalid={(e) => e.target.setCustomValidity(getRandomValidationPhrase())}
              />
            </div>
            <div className="conference-field">
              <span className="conference-field-label">Дата народження</span>
              <div className="relative">
                <input
                  ref={birthDateInputRef}
                  type="date"
                  aria-label="Дата народження"
                  className="conference-date-input pr-10"
                  min="1900-01-01"
                  max={(() => {
                    const d = new Date();
                    return d.toISOString().slice(0, 10);
                  })()}
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, birthDate: e.target.value }))
                  }
                />
                <button
                  type="button"
                  aria-label="Відкрити календар"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-full flex items-center justify-center text-white/50 hover:text-white/70 transition-colors pointer-events-auto"
                  onClick={() => birthDateInputRef.current?.showPicker?.()}
                >
                  <Calendar className="w-5 h-5" />
                </button>
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
                  <option value="">Обери</option>
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
              <div className="relative">
                <select
                  aria-label="Роль у служінні"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="">Обери</option>
                  <option value="Лідер">Лідер</option>
                  <option value="Помічник">Помічник</option>
                  <option value="Служитель">Служитель</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
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
                  <option value="">Обери</option>
                  <option value="fri-no">П'ятниця, без обіду - 300 грн</option>
                  <option value="sat-no">Субота, без обіду - 300 грн</option>
                  <option value="fri-sat-no">П'ятниця + Субота, без обідів - 500 грн</option>
                  <option value="fri-lunch">П'ятниця, з обідом - 600 грн</option>
                  <option value="sat-lunch">Субота, з обідом - 600 грн</option>
                  <option value="fri-sat-lunch">П'ятниця + Субота, з обідами - 1100 грн</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 pt-1">
              <button
                type="submit"
                className="conference-form-btn-text w-full max-w-[350px] h-12 rounded-[147px] uppercase text-white hover:opacity-95 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: FOOTER_BG }}
              >
                Зареєструватись
              </button>
              <a
                href={MONOBANK_JAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-white underline underline-offset-2"
              >
                Оплатити участь (Monobank)
              </a>
            </div>
          </form>
        </section>

        {/* Попап після успішної відправки */}
        {formSubmitted && (
          <div className="conference-success-overlay" role="dialog" aria-modal="true" aria-labelledby="success-title">
            <div className="conference-success-popup">
              <h2 id="success-title" className="conference-success-title">ТИ З НАМИ!</h2>
              <p className="conference-success-text">З тобою сконтактують=)</p>
              <p className="conference-success-text conference-success-hint">
                У коментарі до платежу обовʼязково вкажи ПІП, під яким зареєструвався/зареєструвалася - щоб ми могли ідентифікувати оплату.
              </p>
              <a
                href={MONOBANK_JAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="conference-success-pay"
              >
                Оплатити участь
              </a>
              <button
                type="button"
                className="conference-success-close"
                onClick={() => {
                  setFormSubmitted(false);
                  setForm({ fullName: "", phone: "", birthDate: "", ministry: "", role: "Помічник", format: "" });
                }}
              >
                ЗАКРИТИ
              </button>
            </div>
          </div>
        )}

        {/* ========== FAQ ========== */}
        <section id="faq" className="py-20">
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
        className="w-full text-white overflow-hidden min-h-[425px] pb-[145px] sm:pb-[160px]"
        style={{ backgroundColor: FOOTER_BG }}
      >
        <img
          src="/assets/footer-conference.png"
          alt="Power Place контакти"
          className="w-full h-auto block"
          loading="lazy"
        />
      </footer>

      {/* Нижній навбар — ховається біля футера; пілюля з обводкою */}
      {(!showIntro || introStep >= 6) && (
        <nav
          ref={navScrollRef}
          className="conference-nav-carousel fixed bottom-0 left-0 right-0 w-full flex justify-center px-4 pb-4 z-30 transition-opacity duration-300"
          aria-label="Навігація по секціях"
        >
          <div className="conference-nav-pill flex items-center min-h-[77px] max-w-[calc(100vw-2rem)] w-full rounded-[147px] border-2 border-white overflow-hidden" style={grainStyle}>
            <div className="flex items-center gap-3 px-4 sm:px-5 overflow-x-auto overflow-y-hidden w-full min-w-0 scrollbar-hide conference-nav-carousel-inner">
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
          </div>
        </nav>
      )}
    </div>
  );
}
