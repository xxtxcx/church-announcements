// import React, { useState } from "react";
// import { ChevronDown, ChevronUp } from "lucide-react";
// import background1 from "./assets/background1.jpg"; // Розкоментуйте після додавання файлу
// import background2 from "./assets/background2.jpg"; // Розкоментуйте після додавання файлу

// const Accordion = ({ title, children, defaultOpen = false }) => {
//   const [isOpen, setIsOpen] = useState(defaultOpen);

//   return (
//     <div className="mb-3">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-full bg-white px-6 py-4 flex items-center justify-between text-left transition-all hover:bg-gray-50 rounded-sm"
//         style={{ fontFamily: "'Namu', 'Manrope', sans-serif" }}
//       >
//         <span
//           className="text-purple-600 font-semibold text-lg uppercase tracking-wide"
//           style={{ fontWeight: 600 }}
//         >
//           {title}
//         </span>
//         {isOpen ? (
//           <ChevronUp className="text-gray-800 flex-shrink-0" size={24} />
//         ) : (
//           <ChevronDown className="text-gray-800 flex-shrink-0" size={24} />
//         )}
//       </button>
//       {isOpen && (
//         <div
//           className="bg-white px-6 py-4 text-gray-700 leading-relaxed border-t border-gray-200 rounded-b-sm"
//           style={{
//             fontFamily: "'Namu', 'Manrope', sans-serif",
//             fontWeight: 400
//           }}
//         >
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// export default function ChurchAnnouncements() {
//   return (
//     <div
//       className="min-h-screen relative overflow-hidden"
//       style={{
//         background: "#1a1a1a", // Fallback color
//         backgroundImage: `url(${background1})`, // Розкоментуйте після додавання файлу
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed"
//       }}
//     >
//       {/* Purple accent stripes */}

//       <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
//         {/* Header */}
//         <div className="mb-8 md:mb-12">
//           <h1
//             className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-tight leading-none"
//             style={{
//               fontFamily: "'Namu', 'Manrope', sans-serif",
//               fontWeight: 800
//             }}
//           >
//             ОГОЛО
//             <br />
//             ШЕННЯ
//           </h1>
//           <p
//             className="text-white text-lg md:text-xl opacity-90 leading-snug"
//             style={{
//               fontFamily: "'Namu', 'Manrope', sans-serif",
//               fontWeight: 400
//             }}
//           >
//             КОЖЕН
//             <br />
//             ОСТАННІЙ
//             <br />
//             ВІВТОРОК
//             <br />
//             МІСЯЦЯ
//           </p>
//         </div>

//         {/* Accordions */}
//         <div className="space-y-0">
//           <div className="flex items-start mb-3">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Домашні групи цього тижня" defaultOpen={true}>
//                 <p className="mb-4">
//                   Інформація про домашні групи, які відбудуться цього тижня.
//                   Приєднуйтесь до спільноти, діліться життям і зростайте разом у
//                   вірі!
//                 </p>
//                 <a
//                   href="https://t.me/dyouthhomegroups_bot"
//                   className="text-purple-600 hover:text-purple-700 font-medium underline"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   @dyouthhomegroups_bot
//                 </a>
//               </Accordion>
//             </div>
//           </div>

//           <div className="flex items-start mb-3">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Молитва в Zoom">
//                 <p className="mb-3">
//                   Нагадуємо, що у нас проходить спільна молитва в Zoom
//                   щопонеділка, середи та п'ятниці.
//                 </p>
//                 <p className="mb-3 font-semibold">
//                   Графік: понеділок, середа, п'ятниця
//                 </p>
//                 <a
//                   href="https://us02web.zoom.us/j/89175725904?pwd=Ky9BYTZLV2pzVXc5b0VNQWl1UnhyZz09"
//                   className="text-purple-600 hover:text-purple-700 break-all underline inline-block"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   Приєднатися до Zoom
//                 </a>
//                 <p className="mt-3 text-sm text-gray-600">
//                   Посилання також доступне в нашому чаті
//                 </p>
//               </Accordion>
//             </div>
//           </div>

//           <div className="flex items-start mb-3">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Молитовний бот">
//                 <p className="mb-4">
//                   У нашому чаті працює молитовний бот, де ви можете залишити
//                   свою молитовну потребу. Спільнота буде молитися за вас!
//                 </p>
//                 <a
//                   href="https://t.me/dchurch_prayer_bot"
//                   className="text-purple-600 hover:text-purple-700 font-medium underline"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   @dchurch_prayer_bot
//                 </a>
//               </Accordion>
//             </div>
//           </div>

//           <div className="flex items-start mb-3">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Членство/Водне хрещення">
//                 <p>
//                   Якщо ви ще не є членом нашої церкви або не приймали водне
//                   хрещення у зрілому віці, заохочуємо зробити цей важливий крок.
//                   Запишіться за церковним номером телефону, і ми з радістю
//                   проведемо вас через цей процес.
//                 </p>
//               </Accordion>
//             </div>
//           </div>

//           <div className="flex items-start mb-3">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Служіння тут">
//                 <p className="mb-4">
//                   Якщо ви член церкви, одна з ваших привілей — це можливість
//                   служити Богу в нашій спільноті. За QR-кодом можна дізнатися
//                   більше про актуальні служіння, залишити свої контакти та
//                   долучитися.
//                 </p>
//                 <a
//                   href="https://docs.google.com/forms/d/e/1FAIpQLSefJM3KrINTP-_dE8LPBtq_zdAQ9REVzLKu7rxrI3VVq3Te0A/viewform"
//                   className="text-purple-600 hover:text-purple-700 break-all underline inline-block"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   Форма для реєстрації служіння
//                 </a>
//               </Accordion>
//             </div>
//           </div>

//           <div className="flex items-start mb-3">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Молитва тут">
//                 <p>
//                   Що це таке? Це спеціальний час, коли біля сцени вас очікують
//                   служителі, готові разом помолитися за вас. Не обов'язково мати
//                   особливу потребу — ви можете підійти для молитви благословення
//                   на наступний тиждень.
//                 </p>
//               </Accordion>
//             </div>
//           </div>

//           <div className="flex items-start mb-3">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Церковна кав'ярня">
//                 <p>
//                   Після служіння запрошуємо вас до нашої церковної кав'ярні. Це
//                   чудова можливість поспілкуватися, познайомитися з новими
//                   людьми та провести час у теплій атмосфері спільноти.
//                 </p>
//               </Accordion>
//             </div>
//           </div>

//           <div className="flex items-start">
//             <span className="text-white text-2xl mr-3 mt-1 font-bold">*</span>
//             <div className="flex-1">
//               <Accordion title="Новини в Telegram">
//                 <p>
//                   Будьте в курсі всіх подій церкви! Підпішіться на наш
//                   Telegram-канал, щоб отримувати актуальні новини, оголошення та
//                   нагадування про заходи.
//                 </p>
//               </Accordion>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import background1 from "./assets/background1.jpg";

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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white px-6 py-4 flex items-center justify-between text-left transition-all hover:bg-gray-50"
        style={{ fontFamily: "'Namu', 'Manrope', sans-serif" }}
      >
        <span
          className="font-semibold text-lg uppercase tracking-wide"
          style={{ fontWeight: 600, color: "#731cfe" }}
        >
          {title}
        </span>
        {isOpen ? (
          <ChevronUp
            className="flex-shrink-0"
            size={24}
            style={{ color: "#000" }}
          />
        ) : (
          <ChevronDown
            className="flex-shrink-0"
            size={24}
            style={{ color: "#000" }}
          />
        )}
      </button>
      {isOpen && (
        <div
          className="bg-white px-6 py-4 text-gray-700 leading-relaxed"
          style={{
            fontFamily: "'Namu', 'Manrope', sans-serif",
            fontWeight: 400
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default function ChurchAnnouncements() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "#1a1a1a",
        backgroundImage: `url(${background1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="relative z-10 container mx-auto px-3 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-10 px-3">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-tight leading-none"
            style={{
              fontFamily: "'Namu', 'Manrope', sans-serif",
              fontWeight: 600
            }}
          >
            ОГОЛОШЕННЯ
          </h1>
        </div>

        {/* Accordions */}
        <div className="space-y-5">
          <Accordion title="Домашні групи цього тижня" defaultOpen={true}>
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

          <Accordion title="Молитва в Zoom">
            <p className="mb-3">
              Нагадуємо, що у нас проходить спільна молитва в Zoom щопонеділка,
              середи та п'ятниці.
            </p>
            <p className="mb-3 font-semibold">
              Графік: понеділок, середа, п'ятниця
            </p>
            <a
              href="https://us02web.zoom.us/j/89175725904?pwd=Ky9BYTZLV2pzVXc5b0VNQWl1UnhyZz09"
              className="text-purple-300 hover:text-purple-700 break-all underline inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Приєднатися до Zoom
            </a>
            <p className="mt-3 text-sm text-gray-600">
              Посилання також доступне в нашому чаті
            </p>
          </Accordion>

          <Accordion title="Молитовний бот">
            <p className="mb-4">
              У нашому чаті працює молитовний бот, де ви можете залишити свою
              молитовну потребу. Спільнота буде молитися за вас!
            </p>
            <a
              href="https://t.me/dchurch_prayer_bot"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @dchurch_prayer_bot
            </a>
          </Accordion>

          <Accordion title="Членство/Водне хрещення">
            <p>
              Якщо ви ще не є членом нашої церкви або не приймали водне хрещення
              у зрілому віці, заохочуємо зробити цей важливий крок. Запишіться
              за церковним номером телефону, і ми з радістю проведемо вас через
              цей процес.
            </p>
          </Accordion>

          <Accordion title="Служіння тут">
            <p className="mb-4">
              Якщо ви член церкви, одна з ваших привілей — це можливість служити
              Богу в нашій спільноті. За QR-кодом можна дізнатися більше про
              актуальні служіння, залишити свої контакти та долучитися.
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

          <Accordion title="Молитва тут">
            <p>
              Що це таке? Це спеціальний час, коли біля сцени вас очікують
              служителі, готові разом помолитися за вас. Не обов'язково мати
              особливу потребу — ви можете підійти для молитви благословення на
              наступний тиждень.
            </p>
          </Accordion>

          <Accordion title="Церковна кав'ярня">
            <p>
              Після служіння запрошуємо вас до нашої церковної кав'ярні. Це
              чудова можливість поспілкуватися, познайомитися з новими людьми та
              провести час у теплій атмосфері спільноти.
            </p>
          </Accordion>

          <Accordion title="Новини в Telegram">
            <p>
              Будьте в курсі всіх подій церкви! Підпішіться на наш
              Telegram-канал, щоб отримувати актуальні новини, оголошення та
              нагадування про заходи.
            </p>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
