import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import FAQAccordion from "../components/FAQAccordion";

const FAQ_LIST = [
  {
    id: 1,
    category: "general",
    question: "What is JanSeva Connect?",
    answer: "JanSeva Connect is an accessible, multilingual public-interest platform designed to help citizens discover government services, explore welfare schemes, understand eligibility criteria, and connect with official government application portals.",
  },
  {
    id: 2,
    category: "services",
    question: "What are public services?",
    answer: "Public services are essential civil services provided by government departments and municipal bodies under the Maharashtra Right to Public Services Act (RTS), such as income certificates, domicile certificates, caste certificates, birth registrations, and water tap connections.",
  },
  {
    id: 3,
    category: "schemes",
    question: "What are government schemes?",
    answer: "Government schemes are welfare and financial support programs sponsored by central or state governments aimed at uplifting specific segments of society, such as scholarships for students, financial transfers for women and farmers, and health coverage.",
  },
  {
    id: 4,
    category: "services",
    question: "How can I find a public service?",
    answer: "Navigate to the 'Public Services' page from the main menu. You can use the search bar to find services by name or keyword, and filter the list by department, category (Certificates, Municipal, Revenue), or verification status.",
  },
  {
    id: 5,
    category: "eligibility",
    question: "How can I check scheme eligibility?",
    answer: "Visit the 'Eligibility Checker' page and fill in basic details such as your age, state, annual family income, education, and occupation. Our rule-based engine evaluates stored statutory guidelines and classifies schemes into Likely Eligible, Possibly Eligible, or Unlikely Eligible.",
  },
  {
    id: 6,
    category: "eligibility",
    question: "Are the eligibility results official?",
    answer: "No. Eligibility results provided on JanSeva Connect are preliminary informational matches based on published guidelines. Final eligibility and benefit disbursement are strictly decided by the responsible government authority upon physical document verification.",
  },
  {
    id: 7,
    category: "schemes",
    question: "Where can I apply for a scheme?",
    answer: "Every scheme details page contains an 'Apply on Official Website' button that redirects you directly to the verified government portal, such as Aaple Sarkar (aaplesarkar.mahaonline.gov.in), MahaDBT (mahadbt.maharashtra.gov.in), or MyScheme (myscheme.gov.in).",
  },
  {
    id: 8,
    category: "general",
    question: "How are service details verified?",
    answer: "Our research cell cross-references official government gazettes, citizen charters published under the Right to Public Services Act, and official portal URLs. Each record documents its verification date and direct source link.",
  },
  {
    id: 9,
    category: "general",
    question: "What should I do if information is outdated?",
    answer: "If you encounter a broken link, revised fee, or updated guidelines, please let us know immediately via the 'Contact Us' page. Our team reviews submissions and updates the database version snapshots promptly.",
  },
  {
    id: 10,
    category: "general",
    question: "Does JanSeva Connect process government applications?",
    answer: "No. JanSeva Connect is an independent civic information platform and does not process government applications, collect statutory fees, or issue official certificates. Applications are handled solely by designated government portals.",
  },
];

export function HelpFaq() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { key: "all", label: t("help.allCategories") },
    { key: "general", label: t("help.general") },
    { key: "services", label: t("help.services") },
    { key: "schemes", label: t("help.schemes") },
    { key: "eligibility", label: t("help.eligibility") },
  ];

  const filteredFaqs = FAQ_LIST.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={t("help.title")}
        subtitle={t("help.subtitle")}
        breadcrumbs={[{ label: t("nav.help") }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("help.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === c.key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <FAQAccordion items={filteredFaqs} />

        {/* Support Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900">
              {t("help.contactSupport")}
            </h3>
            <p className="text-xs text-slate-600">
              Our team is ready to answer questions about platform usage and scheme verifications.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HelpFaq;
