import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  Globe,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("janseva_language", lng);
    setLangMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/schemes", label: t("nav.schemes") },
    { to: "/eligibility-checker", label: t("nav.checker") },
    { to: "/about", label: t("nav.about") },
    { to: "/help", label: t("nav.help") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const currentLangLabel = {
    en: "English",
    hi: "हिंदी",
    mr: "मराठी",
  }[i18n.language] || "English";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Government Disclaimer & Source Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>JanSeva Connect Civic Platform &bull; Citizen Public Services & Schemes Module</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>Verified Sources: Aaple Sarkar | MahaDBT | MyScheme</span>
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                JanSeva <span className="text-blue-700">Connect</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide block uppercase">
                {t("nav.portalSubtitle")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "text-blue-700 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action & Language Selector */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentLangLabel}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg border border-slate-200 shadow-md py-1 z-50">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                      i18n.language === "en" ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("hi")}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                      i18n.language === "hi" ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    onClick={() => changeLanguage("mr")}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                      i18n.language === "mr" ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action: Eligibility */}
            <Link
              to="/eligibility-checker"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("home.checkEligibility")}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => changeLanguage(i18n.language === "en" ? "hi" : i18n.language === "hi" ? "mr" : "en")}
              className="p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
              title="Toggle Language"
            >
              {currentLangLabel.slice(0, 2)}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-semibold ${
                  isActive
                    ? "text-blue-700 bg-blue-50"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link
              to="/eligibility-checker"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm shadow-xs"
            >
              {t("home.checkEligibility")}
            </Link>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>Language:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-1 rounded border text-xs font-semibold ${i18n.language === "en" ? "bg-blue-50 border-blue-600 text-blue-700" : "border-slate-200"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("hi")}
                  className={`px-2 py-1 rounded border text-xs font-semibold ${i18n.language === "hi" ? "bg-blue-50 border-blue-600 text-blue-700" : "border-slate-200"}`}
                >
                  HI
                </button>
                <button
                  onClick={() => changeLanguage("mr")}
                  className={`px-2 py-1 rounded border text-xs font-semibold ${i18n.language === "mr" ? "bg-blue-50 border-blue-600 text-blue-700" : "border-slate-200"}`}
                >
                  MR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
