import React, { useState } from "react";
import background from "../assets/background.jpg";
import "../App.css";
import telegramIcon from "../assets/telegram.png";
import logo from "../assets/logo.svg";

const StarCircleIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    width={size}
    height={size}
    className={className}
  >
    <circle cx="200" cy="200" r="180" fill="transparent" />

    <g transform="translate(200, 200) rotate(7)">
      <line x1="0" y1="0" x2="0" y2="-100" stroke="white" strokeWidth="45" />
      <line x1="0" y1="0" x2="95" y2="-31" stroke="white" strokeWidth="45" />
      <line x1="0" y1="0" x2="58" y2="81" stroke="white" strokeWidth="45" />
      <line x1="0" y1="0" x2="-58" y2="81" stroke="white" strokeWidth="45" />
      <line x1="0" y1="0" x2="-95" y2="-31" stroke="white" strokeWidth="45" />
    </g>
  </svg>
);

const InstagramIcon = ({ size = 48, color = "white", className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    width={size}
    height={size}
    className={className}
  >
    <rect
      x="60"
      y="45"
      width="280"
      height="280"
      rx="70"
      ry="70"
      fill="none"
      stroke={color}
      strokeWidth="35"
    />
    <circle
      cx="200"
      cy="185"
      r="70"
      fill="none"
      stroke={color}
      strokeWidth="35"
    />
    <circle cx="287" cy="110" r="15" fill={color} />
  </svg>
);

const TriangleDown = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 17 L4 7 L20 7 Z" fill="#202020" />
  </svg>
);

const TriangleUp = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 7 L4 17 L20 17 Z" fill="#202020" />
  </svg>
);

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2 relative">
      {/* Circle with star */}
      <div
        className="absolute left-0 top-0 z-10 transition-transform duration-500"
        style={{
          transform: `translate(-50%, -50%) ${
            isOpen ? "rotate(35deg)" : "rotate(0deg)"
          }`
        }}
      >
        <StarCircleIcon size={20} />
      </div>
      <div className="w-full bg-white overflow-visible accordion-corner-cut relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white px-4 sm:px-6 py-3 sm:py-4 lg:py-5 flex items-center justify-between text-left transition-all hover:bg-gray-50 relative z-0"
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

export default function Announcements() {
  const [language, setLanguage] = useState("uk");

  const translations = {
    uk: {
      title: "ОГОЛОШЕННЯ",
      homeGroups: {
        title: "Домашні групи",
        text: "Інформація про домашні групи. Приєднуйтесь до спільноти, діліться життям і зростайте разом у вірі!"
      },
      outreach: {
        title: "Аутріч",
        text: "Ми віримо, що євангелізація — не для особливих, а для всіх, хто любить Ісуса, адже наші слова можуть змінити чиєсь життя у вічності.",
        opportunity:
          "Якщо ти ніколи не розказував про Христа на вулиці, у тебе буде змога зробити це разом з командою citylight.",
        date: "📅 31 жовтня, 17:00",
        location: "📍 Зустріч у церкві — Замарстинівська 37"
      },
      kairos: {
        title: "Курс Кайрос 2025",
        text: "Інтерактивний курс для християн, які хочуть бути учасниками здійснення Божої роботи у світі. Він охоплює біблійну місію, історію, стратегію та культурні бар'єри. Знайдіть своє покликання в глобальному Божому плані!",
        register: "Зареєструватися",
        moreInfo: "Детальна інформація про курс"
      },
      prayer: {
        title: "Молитва",
        bot: "💬 Молитовний бот",
        botText:
          "У нашому чаті працює молитовний бот, де ви можете залишити свою молитовну потребу. Спільнота буде молитися за вас!",
        here: "🙏 Молитва тут",
        hereText:
          "Це спеціальний час, коли біля сцени вас очікують служителі, готові разом помолитися за вас. Не обов'язково мати особливу потребу — ви можете підійти для молитви благословення на наступний тиждень.",
        youth: "✨ Молитва молоді",
        schedule: "📅 Кожен останній вівторок місяця",
        location: "📍 Великий зал"
      },
      membership: {
        title: "Членство/Водне хрещення",
        text: "Якщо ви ще не є членом нашої церкви або не приймали водне хрещення у зрілому віці, заохочуємо зробити цей важливий крок. Запишіться за церковним номером телефону, і ми з радістю проведемо вас через цей процес."
      },
      donations: {
        title: "Пожертви та десятини",
        text: "Десятина та пожертви — це спосіб членів церкви підтримувати Боже діло. Гості та прихожани також можуть долучитися за бажанням, проте це абсолютно добровільно.",
        button: "Пожертвувати"
      },
      ministry: {
        title: "Служіння тут",
        text: "Якщо ви член церкви, один з ваших привілеїв — це можливість служити Богу в нашій спільноті. За посиланням можна дізнатися більше про актуальні служіння, залишити свої контакти та долучитися.",
        link: "Форма для реєстрації служіння"
      },
      cafe: {
        title: "Церковна кав'ярня",
        text: "Після служіння запрошуємо вас до нашої церковної кав'ярні. Це чудова можливість поспілкуватися, познайомитися з новими людьми та провести час у теплій атмосфері спільноти."
      }
    },
    en: {
      title: "ANNOUNCEMENTS",
      homeGroups: {
        title: "Home Groups",
        text: "Information about home groups. Join the community, share life and grow together in faith!"
      },
      outreach: {
        title: "Outreach",
        text: "We believe that evangelism is not for special people, but for everyone who loves Jesus, because our words can change someone's life for eternity.",
        opportunity:
          "If you've never shared about Christ on the streets, you'll have the opportunity to do it together with the citylight team.",
        date: "📅 October 31, 5:00 PM",
        location: "📍 Meeting at the church — Zamarstynivska 37"
      },
      kairos: {
        title: "Kairos Course 2025",
        text: "An interactive course for Christians who want to participate in God's work in the world. It covers biblical mission, history, strategy, and cultural barriers. Find your calling in God's global plan!",
        register: "Register",
        moreInfo: "Detailed course information"
      },
      prayer: {
        title: "Prayer",
        bot: "💬 Prayer Bot",
        botText:
          "Our chat has a prayer bot where you can leave your prayer request. The community will pray for you!",
        here: "🙏 Prayer Here",
        hereText:
          "This is a special time when ministers are waiting by the stage, ready to pray with you. You don't have to have a special need — you can come for a blessing prayer for the next week.",
        youth: "✨ Youth Prayer",
        schedule: "📅 Every last Tuesday of the month",
        location: "📍 Main Hall"
      },
      membership: {
        title: "Membership/Water Baptism",
        text: "If you are not yet a member of our church or have not been water baptized as an adult, we encourage you to take this important step. Sign up by calling the church number, and we will be happy to guide you through this process."
      },
      donations: {
        title: "Donations & Tithes",
        text: "Tithes and donations are how church members support God's work. Guests and visitors are also welcome to contribute if they wish, but it is completely voluntary.",
        button: "Donate"
      },
      ministry: {
        title: "Ministry Here",
        text: "If you are a church member, one of your privileges is the opportunity to serve God in our community. Follow the link to learn more about current ministries, leave your contacts and get involved.",
        link: "Ministry Registration Form"
      },
      cafe: {
        title: "Church Cafe",
        text: "After the service, we invite you to our church cafe. It's a great opportunity to chat, meet new people and spend time in the warm atmosphere of the community."
      }
    }
  };

  const t = translations[language];
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
          backgroundImage: `url(${background})`,
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
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 lg:top-10 lg:right-10 z-20">
          <button
            onClick={() => setLanguage(language === "uk" ? "en" : "uk")}
            className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 shadow-lg"
          >
            <span
              className="text-white font-bold text-md sm:text-sm lg:text-base"
              style={{ fontFamily: "'Namu', 'Manrope', sans-serif" }}
            >
              {language === "uk" ? "EN" : "UA"}
            </span>
          </button>
        </div>
        {/* Header */}
        <div className="mb-10 px-3">
          <h1
            className="text-7xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 tracking-tight leading-none"
            style={{
              fontFamily: "'Namu', 'Manrope', sans-serif",
              fontWeight: 600
            }}
          >
            {language === "uk" ? (
              <>
                ОГОЛО
                <br className="sm:hidden" />
                ШЕННЯ
              </>
            ) : (
              <span className="block text-6xl md:text-6xl lg:text-7xl xl:text-8xl">
                AN
                <br className="sm:hidden" />
                NOUNCE
                <br className="sm:hidden" />
                MENTS
              </span>
            )}
          </h1>
        </div>

        {/* Accordions */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6">
          <Accordion title={t.homeGroups.title}>
            <p className="mb-4">{t.homeGroups.text}</p>
            <a
              href="https://t.me/dyouthhomegroups_bot"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @dyouthhomegroups_bot
            </a>
          </Accordion>

          <Accordion title={t.outreach.title}>
            <p className="mb-3">{t.outreach.text}</p>
            <p className="mb-4">{t.outreach.opportunity}</p>
            <p className="mb-2 font-semibold">{t.outreach.date}</p>
            <p className="font-semibold">{t.outreach.location}</p>
          </Accordion>

          <Accordion title={t.kairos.title}>
            <p className="mb-4">{t.kairos.text}</p>
            <div className="space-y-3">
              <a
                href="https://forms.gle/L2duRuxSmgSXQdGf9"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.kairos.register}
              </a>
              <br />
              <a
                href="https://drive.google.com/file/d/1irbfJ9yoCL49DqHWZQBSQYZjt2Nh1tuV/view?usp=drivesdk"
                className="text-purple-600 hover:text-purple-700 font-medium underline inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.kairos.moreInfo} →
              </a>
            </div>
          </Accordion>

          <Accordion title={t.prayer.title}>
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-semibold text-black-700">
                  {t.prayer.bot}
                </p>
                <p className="mb-3">{t.prayer.botText}</p>
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
                  {t.prayer.here}
                </p>
                <p>{t.prayer.hereText}</p>
              </div>

              <div>
                <p className="mb-2 font-semibold text-black-700">
                  {t.prayer.youth}
                </p>
                <p className="mb-1">{t.prayer.schedule}</p>
                <p>{t.prayer.location}</p>
              </div>
            </div>
          </Accordion>

          <Accordion title={t.membership.title}>
            <p className="mb-4">{t.membership.text}</p>
            <a
              href="tel:+380738003737"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              +380738003737
            </a>
          </Accordion>

          <Accordion title={t.donations.title}>
            <p className="mb-4">{t.donations.text}</p>
            <a
              href="https://dchurch.lviv.ua/donate"
              className="text-purple-600 hover:text-purple-700 break-all underline inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.donations.button}
            </a>
          </Accordion>

          <Accordion title={t.ministry.title}>
            <p className="mb-4">{t.ministry.text}</p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSefJM3KrINTP-_dE8LPBtq_zdAQ9REVzLKu7rxrI3VVq3Te0A/viewform"
              className="text-purple-600 hover:text-purple-700 break-all underline inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.ministry.link}
            </a>
          </Accordion>

          <Accordion title={t.cafe.title}>
            <p>{t.cafe.text}</p>
          </Accordion>
        </div>
        {/* Social Media Icons */}
        <div className="mt-8 flex justify-center items-center gap-6 sm:gap-8 lg:gap-10">
          <a
            href="https://www.instagram.com/d.youth.lviv/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <InstagramIcon
              size={48}
              color="white"
              className="w-10 h-10 sm:w-10 sm:h-10 lg:w-10 lg:h-10"
            />
          </a>

          <a
            href="https://t.me/DYouth_NEWS"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <img
              src={telegramIcon}
              alt="Telegram"
              className="w-10 h-10 sm:w-10 sm:h-10 lg:w-10 lg:h-10"
            />
          </a>

          <a
            href="https://dchurch.lviv.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
            style={{ filter: "brightness(0) invert(1)" }}
          >
            <img
              src={logo}
              alt="D.Church Website"
              className="w-auto h-8 sm:h-8 lg:h-8"
            />
          </a>
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
