import React, { useState } from "react";
import background3 from "./assets/background3.jpg";
import "./App.css";

const TriangleDown = ({ size = 24, color = "#000", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 17 L4 7 L20 7 Z" fill={color} />
  </svg>
);

const TriangleUp = ({ size = 24, color = "#000", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 7 L4 17 L20 17 Z" fill={color} />
  </svg>
);

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2 relative">
      {/* Circle with star */}
      <div
        className="absolute left-0 top-0 flex items-center justify-center z-10"
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#0d0d0d",
          transform: "translate(-50%, -50%)"
        }}
      >
        <span
          className="text-white font-bold"
          style={{
            fontSize: "20px",
            transform: "rotate(10deg) translateY(2px)",
            lineHeight: "1"
          }}
        >
          *
        </span>
      </div>

      <div className="w-full bg-white overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white px-4 sm:px-6 py-3 sm:py-4 lg:py-5 flex items-center justify-between text-left transition-all hover:bg-gray-50"
          style={{ fontFamily: "'Namu', 'Manrope', sans-serif" }}
        >
          <span
            className="font-semibold text-base sm:text-lg lg:text-xl uppercase tracking-wide"
            style={{ fontWeight: 600, color: "#731cfe" }}
          >
            {title}
          </span>
          {isOpen ? (
            <TriangleUp size={24} color="#000" className="flex-shrink-0" />
          ) : (
            <TriangleDown size={24} color="#000" className="flex-shrink-0" />
          )}
        </button>
        {isOpen && (
          <div
            className="px-4 sm:px-6 pb-3 sm:pb-4 lg:pb-5 text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg"
            style={{
              fontFamily: "'Namu', 'Manrope', sans-serif",
              fontWeight: 400
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChurchAnnouncements() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "#1a1a1a"
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${background3})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      />

      {/* Верхня права смуга (хедер) */}
      <div
        className="absolute ribbon-unfold-top"
        style={{
          width: "16.67vw",
          height: "0",
          top: "-50vh",
          right: "10px",
          transform: "rotate(-25deg)",
          transformOrigin: "center",
          backgroundColor: "#741dff",
          opacity: 0
        }}
      />

      <div className="relative z-10 container mx-auto px-12 sm:px-12 lg:px-16 xl:px-20 py-8 md:py-12 max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        {/* Header */}
        <div className="mb-10 px-3">
          <h1
            className="text-7xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 tracking-tight leading-none"
            style={{
              fontFamily: "'Namu', 'Manrope', sans-serif",
              fontWeight: 600
            }}
          >
            ОГОЛО
            <br className="sm:hidden" />
            ШЕННЯ
          </h1>
        </div>

        {/* Accordions */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6">
          <Accordion title="Домашні групи">
            <p className="mb-4">
              Інформація про домашні групи, які відбудуться цього тижня.
              Приєднуйтесь до спільноти, діліться життям і зростайте разом у
              вірі!
            </p>
            <a
              href="https://t.me/dyouthhomegroups_bot"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @dyouthhomegroups_bot
            </a>
          </Accordion>

          <Accordion title="Молитва">
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-semibold text-black-700">
                  💬 Молитовний бот
                </p>
                <p className="mb-3">
                  У нашому чаті працює молитовний бот, де ви можете залишити
                  свою молитовну потребу. Спільнота буде молитися за вас!
                </p>
                <a
                  href="https://t.me/dchurch_prayer_bot"
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @dchurch_prayer_bot
                </a>
              </div>

              <div>
                <p className="mb-2 font-semibold text-black-700">
                  🙏 Молитва тут
                </p>
                <p>
                  Це спеціальний час, коли біля сцени вас очікують служителі,
                  готові разом помолитися за вас. Не обов'язково мати особливу
                  потребу — ви можете підійти для молитви благословення на
                  наступний тиждень.
                </p>
              </div>

              <div>
                <p className="mb-2 font-semibold text-black-700">
                  ✨ Молодіжна молитва
                </p>
                <p className="mb-1">📅 Кожен останній вівторок місяця</p>
                <p>📍 Великий зал</p>
              </div>
            </div>
          </Accordion>

          <Accordion title="Членство/Водне хрещення">
            <p className="mb-4">
              Якщо ви ще не є членом нашої церкви або не приймали водне хрещення
              у зрілому віці, заохочуємо зробити цей важливий крок. Запишіться
              за церковним номером телефону, і ми з радістю проведемо вас через
              цей процес.
            </p>
            <a
              href="tel:+380738003737"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              +380738003737
            </a>
          </Accordion>

          <Accordion title="Служіння тут">
            <p className="mb-4">
              Якщо ви член церкви, один з ваших привілеїв — це можливість
              служити Богу в нашій спільноті. За посиланням можна дізнатися
              більше про актуальні служіння, залишити свої контакти та
              долучитися.
            </p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSefJM3KrINTP-_dE8LPBtq_zdAQ9REVzLKu7rxrI3VVq3Te0A/viewform"
              className="text-purple-600 hover:text-purple-700 break-all underline inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Форма для реєстрації служіння
            </a>
          </Accordion>

          <Accordion title="Церковна кав'ярня">
            <p>
              Після служіння запрошуємо вас до нашої церковної кав'ярні. Це
              чудова можливість поспілкуватися, познайомитися з новими людьми та
              провести час у теплій атмосфері спільноти.
            </p>
          </Accordion>

          <Accordion title="Новини в Telegram">
            <p className="mb-4">
              Будьте в курсі всіх подій церкви! Підпішіться на наш
              Telegram-канал, щоб отримувати актуальні новини, оголошення та
              нагадування про заходи.
            </p>
            <a
              href="https://t.me/DYouth_NEWS"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @DYouth_NEWS
            </a>
          </Accordion>
          <Accordion title="Наш Instagram">
            <p className="mb-4">
              Слідкуйте за нашими подіями, фото з заходів та натхненними постами
              у нашому офіційному Instagram-акаунті!
            </p>
            <a
              href="https://www.instagram.com/d.youth.lviv/"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @d.youth.lviv
            </a>
          </Accordion>
        </div>
      </div>

      {/* Нижня ліва смуга (футер) */}
      <div
        className="absolute ribbon-unfold-bottom"
        style={{
          width: "16.67vw",
          height: "0",
          bottom: "-50vh",
          left: "10px",
          transform: "rotate(-25deg)",
          transformOrigin: "center",
          backgroundColor: "#741dff",
          opacity: 0
        }}
      />
    </div>
  );
}
