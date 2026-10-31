import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No questions matched your search criteria.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`border rounded-xl transition-all overflow-hidden ${
              isOpen
                ? "bg-white border-blue-300 shadow-xs"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 focus:outline-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className={`w-4 h-4 shrink-0 ${isOpen ? "text-blue-600" : "text-slate-400"}`} />
                <span className="text-sm sm:text-base leading-snug">{item.question}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FAQAccordion;
