import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  MessageSquare, 
  Link as LinkIcon, 
  Phone, 
  Image as ImageIcon, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Activity,
  Upload,
  RefreshCw,
  Tag,
  Percent,
  X,
  Database,
  Info,
  Calendar,
  Plus
} from 'lucide-react';

// --- Mock Data ---
const MOCK_TRENDS = [
  { type: 'Macau Scam', count: 1240, trend: '+12%' },
  { type: 'APK Phishing', count: 850, trend: '+5%' },
  { type: 'Job Scam', count: 620, trend: '-2%' },
];

const DONUT_DATA = [
  { name: 'Confirmed', value: 448, color: '#ef4444' }, // red-500
  { name: 'Suspicious', value: 312, color: '#eab308' }, // yellow-500
  { name: 'Safe', value: 204, color: '#10b981' }, // emerald-500
];

const FREQUENCY_DATA = [
  { type: 'Job Scam', count: 156, max: 200 },
  { type: 'Macau Scam', count: 98, max: 200 },
  { type: 'Parcel Scam', count: 74, max: 200 },
  { type: 'Love Scam', count: 42, max: 200 },
  { type: 'Investment', count: 29, max: 200 },
];

const RECENT_REPORTS = [
  { id: 1, risk: 'HIGH RISK', title: 'Job Scam', source: 'Verified by AI Sentinel', time: '2m ago', color: 'red', details: 'User reported receiving a WhatsApp message offering a part-time job reviewing products for RM500/day. The sender asked for an upfront "registration fee" of RM50.' },
  { id: 2, risk: 'SUSPICIOUS', title: 'Macau Scam', source: 'Community flagged', time: '15m ago', color: 'yellow', details: 'Caller claimed to be from LHDN stating there was an outstanding tax balance of RM3,400. They requested immediate transfer to a third-party bank account to avoid court action.' },
  { id: 3, risk: 'HIGH RISK', title: 'APK Phishing', source: 'Verified by AI Sentinel', time: '1h ago', color: 'red', details: 'A link was sent via SMS claiming a parcel was stuck at customs. The link directs to a fake PosLaju website asking users to download an APK file to track the package.' },
  { id: 4, risk: 'SAFE', title: 'Bank Promo', source: 'System verified', time: '2h ago', color: 'emerald', details: 'Verified promotional SMS from Maybank regarding a new credit card cashback campaign. Link directs to the official Maybank2u website.' },
];

type RiskLevel = 'safe' | 'suspicious' | 'danger';

interface AnalysisResult {
  level: RiskLevel;
  title: string;
  scamType: string;
  confidence: string;
  description: string;
  flags: string[];
  actions: { step: number | string; title: string; desc: string }[];
}

const TRANSLATIONS = {
  en: {
    navAnalyze: 'Analyze',
    navTrends: 'Trends',
    navReport: 'Report',
    heroTitle1: 'Protect yourself from',
    heroTitle2: 'digital scams instantly.',
    heroDesc: 'Paste a suspicious message, link, or phone number. Our AI cross-references with PDRM & BNM databases in real-time.',
    tabMessage: 'Message',
    tabLink: 'Link',
    tabPhone: 'Phone Number',
    tabImage: 'Screenshot',
    placeholderText: 'Paste the suspicious SMS, WhatsApp message, or email here...',
    placeholderUrl: 'Paste the suspicious website link (e.g., https://...)',
    placeholderPhone: 'Enter the phone number (e.g., +60123456789)',
    uploadDrag: 'Click to upload or drag and drop',
    uploadSub: 'SVG, PNG, JPG or GIF (max. 5MB)',
    tryExample: 'Try an example:',
    btnHighRisk: 'High Risk',
    btnSuspicious: 'Suspicious',
    btnSafe: 'Safe',
    btnAnalyze: 'Analyze with AI',
    analyzingTitle: 'Analyzing Patterns...',
    analyzingStep1: 'Cross-referencing PDRM database',
    analyzingStep2: 'Checking BNM alert lists',
    resConfidence: 'Confidence',
    resScamType: 'Scam Type:',
    resFlags: 'Detected Flags',
    resActionGuide: 'Recommended Action Guide',
    btnAnalyzeAnother: 'Analyze Another',
    btnContribute: 'Contribute to Database',
    trendsTitle: 'Scam Trends',
    trendsDesc: 'Last 30 days overview',
    trendsFilter: 'Filter',
    statTotal: 'Total Analyses',
    statTop: 'Top Type',
    statDetected: 'Detected',
    freqTitle: 'Frequency by Type',
    distTitle: 'Distribution',
    recentTitle: 'Recent Reports',
    seeAll: 'See All',
    reportTitle: 'Report a Scam',
    reportDesc: 'Help protect others by reporting suspicious messages, links, or numbers directly to our database.',
    reportNotice: 'Your report will be anonymized and added to our public database to help train our AI models. No personal data is required.',
    lblScamContent: 'Scam Content',
    lblPlatform: 'Platform Received On',
    lblScammerDetails: 'Scammer Details (Optional)',
    reportDetailsPlaceholder: 'e.g., Phone number, email, or website URL used by the scammer',
    lblUpload: 'Upload Evidence (Optional)',
    btnSubmitReport: 'Submit Report',
    btnSubmitting: 'Submitting...',
    footerText: 'ScamShield — Protecting Malaysians from digital scams, one message at a time.',
    modalThankYou: 'Thank You!',
    modalThankYouDesc: 'Your report has been added to the community database. You are helping protect others from this scam.',
    modalContributeTitle: 'Contribute to Database',
    modalContributeNotice: 'By submitting this, you help train our AI and alert other Malaysians. No personal data or login is required. The content will be anonymized before being added to the public RAG database.',
    lblScamContentAnon: 'Scam Content (Anonymized)',
    btnCancel: 'Cancel',
    btnSubmitAnon: 'Submit Anonymously',
    modalReportDetails: 'Report Details',
    lblDescription: 'Description',
    
    // Results
    resSafeTitle: 'LIKELY SAFE',
    resSafeType: 'None Detected',
    resSafeDesc: 'We did not find any known scam patterns in this input.',
    resSafeFlag1: 'No malicious links detected',
    resSafeFlag2: 'Sender not in BNM watchlist',
    resSafeActTitle: 'No immediate action required.',
    resSafeActDesc: 'However, always remain vigilant online.',

    resSuspTitle: 'SUSPICIOUS ACTIVITY',
    resSuspType: 'Potential Phishing / Spam',
    resSuspDesc: 'This contains elements commonly found in unsolicited marketing or minor scams.',
    resSuspFlag1: 'Unsolicited offer or prize',
    resSuspFlag2: 'Contains unverified shortened URL',
    resSuspFlag3: 'Creates mild urgency',
    resSuspAct1Title: 'Verify the source independently.',
    resSuspAct1Desc: 'Contact the company directly using official channels.',
    resSuspAct2Title: 'Do not provide personal information.',
    resSuspAct2Desc: 'Legitimate organizations will not ask for passwords or OTPs.',

    resDangerTitle: 'HIGH RISK SCAM DETECTED',
    resDangerType: 'Macau Scam / Impersonation',
    resDangerDesc: 'This matches known Macau Scam / Phishing patterns in Malaysia.',
    resDangerFlag1: 'Creates false sense of urgency',
    resDangerFlag2: 'Requests unauthorized bank transfer',
    resDangerFlag3: 'Spoofs official PDRM/BNM identity',
    resDangerAct1Title: 'Do not reply or click any links.',
    resDangerAct1Desc: 'Engaging confirms your number is active.',
    resDangerAct2Title: 'Block and report the sender.',
    resDangerAct2Desc: "Use your phone's built-in block feature.",
    resDangerAct3Title: 'Report to NSRC (National Scam Response Centre).',
    resDangerAct3Desc: 'Call 997 immediately if you have transferred money.',
  },
  bm: {
    navAnalyze: 'Analisis',
    navTrends: 'Trend',
    navReport: 'Lapor',
    heroTitle1: 'Lindungi diri daripada',
    heroTitle2: 'penipuan digital segera.',
    heroDesc: 'Tampal mesej, pautan, atau nombor telefon yang mencurigakan. AI kami menyemak silang dengan pangkalan data PDRM & BNM dalam masa nyata.',
    tabMessage: 'Mesej',
    tabLink: 'Pautan',
    tabPhone: 'Nombor Telefon',
    tabImage: 'Tangkap Layar',
    placeholderText: 'Tampal SMS, mesej WhatsApp, atau e-mel yang mencurigakan di sini...',
    placeholderUrl: 'Tampal pautan tapak web yang mencurigakan (cth., https://...)',
    placeholderPhone: 'Masukkan nombor telefon (cth., +60123456789)',
    uploadDrag: 'Klik untuk muat naik atau seret dan lepas',
    uploadSub: 'SVG, PNG, JPG atau GIF (maks. 5MB)',
    tryExample: 'Cuba contoh:',
    btnHighRisk: 'Berisiko Tinggi',
    btnSuspicious: 'Mencurigakan',
    btnSafe: 'Selamat',
    btnAnalyze: 'Analisis dengan AI',
    analyzingTitle: 'Menganalisis Corak...',
    analyzingStep1: 'Menyemak silang pangkalan data PDRM',
    analyzingStep2: 'Menyemak senarai amaran BNM',
    resConfidence: 'Keyakinan',
    resScamType: 'Jenis Penipuan:',
    resFlags: 'Petunjuk Dikesan',
    resActionGuide: 'Panduan Tindakan Disyorkan',
    btnAnalyzeAnother: 'Analisis Lain',
    btnContribute: 'Sumbang ke Pangkalan Data',
    trendsTitle: 'Trend Penipuan',
    trendsDesc: 'Gambaran keseluruhan 30 hari lalu',
    trendsFilter: 'Tapis',
    statTotal: 'Jumlah Analisis',
    statTop: 'Jenis Tertinggi',
    statDetected: 'Dikesan',
    freqTitle: 'Kekerapan mengikut Jenis',
    distTitle: 'Taburan',
    recentTitle: 'Laporan Terkini',
    seeAll: 'Lihat Semua',
    reportTitle: 'Lapor Penipuan',
    reportDesc: 'Bantu lindungi orang lain dengan melaporkan mesej, pautan, atau nombor yang mencurigakan terus ke pangkalan data kami.',
    reportNotice: 'Laporan anda akan dirahsiakan identiti dan ditambah ke pangkalan data awam kami untuk membantu melatih model AI kami. Tiada data peribadi diperlukan.',
    lblScamContent: 'Kandungan Penipuan',
    lblPlatform: 'Platform Diterima',
    lblScammerDetails: 'Butiran Penipu (Pilihan)',
    reportDetailsPlaceholder: 'cth., Nombor telefon, e-mel, atau URL tapak web yang digunakan oleh penipu',
    lblUpload: 'Muat Naik Bukti (Pilihan)',
    btnSubmitReport: 'Hantar Laporan',
    btnSubmitting: 'Sedang Dihantar...',
    footerText: 'ScamShield — Melindungi rakyat Malaysia daripada penipuan digital, satu mesej pada satu masa.',
    modalThankYou: 'Terima Kasih!',
    modalThankYouDesc: 'Laporan anda telah ditambah ke pangkalan data komuniti. Anda membantu melindungi orang lain daripada penipuan ini.',
    modalContributeTitle: 'Sumbang ke Pangkalan Data',
    modalContributeNotice: 'Dengan menghantar ini, anda membantu melatih AI kami dan memberi amaran kepada rakyat Malaysia yang lain. Tiada data peribadi atau log masuk diperlukan. Kandungan akan dirahsiakan identiti sebelum ditambah ke pangkalan data RAG awam.',
    lblScamContentAnon: 'Kandungan Penipuan (Dirahsiakan)',
    btnCancel: 'Batal',
    btnSubmitAnon: 'Hantar Secara Tanpa Nama',
    modalReportDetails: 'Butiran Laporan',
    lblDescription: 'Penerangan',

    // Results
    resSafeTitle: 'MUNGKIN SELAMAT',
    resSafeType: 'Tiada Dikesan',
    resSafeDesc: 'Kami tidak menemui sebarang corak penipuan yang diketahui dalam input ini.',
    resSafeFlag1: 'Tiada pautan berniat jahat dikesan',
    resSafeFlag2: 'Pengirim tiada dalam senarai pantau BNM',
    resSafeActTitle: 'Tiada tindakan segera diperlukan.',
    resSafeActDesc: 'Walau bagaimanapun, sentiasa berwaspada dalam talian.',

    resSuspTitle: 'AKTIVITI MENCURIGAKAN',
    resSuspType: 'Potensi Pancingan Data / Spam',
    resSuspDesc: 'Ini mengandungi elemen yang biasa ditemui dalam pemasaran yang tidak diminta atau penipuan kecil.',
    resSuspFlag1: 'Tawaran atau hadiah yang tidak diminta',
    resSuspFlag2: 'Mengandungi URL dipendekkan yang tidak disahkan',
    resSuspFlag3: 'Mewujudkan sedikit keadaan tergesa-gesa',
    resSuspAct1Title: 'Sahkan sumber secara bebas.',
    resSuspAct1Desc: 'Hubungi syarikat secara terus menggunakan saluran rasmi.',
    resSuspAct2Title: 'Jangan berikan maklumat peribadi.',
    resSuspAct2Desc: 'Organisasi yang sah tidak akan meminta kata laluan atau OTP.',

    resDangerTitle: 'PENIPUAN BERISIKO TINGGI DIKESAN',
    resDangerType: 'Macau Scam / Penyamaran',
    resDangerDesc: 'Ini sepadan dengan corak Macau Scam / Pancingan Data yang diketahui di Malaysia.',
    resDangerFlag1: 'Mewujudkan keadaan tergesa-gesa palsu',
    resDangerFlag2: 'Meminta pemindahan bank tanpa kebenaran',
    resDangerFlag3: 'Memalsukan identiti rasmi PDRM/BNM',
    resDangerAct1Title: 'Jangan balas atau klik sebarang pautan.',
    resDangerAct1Desc: 'Membalas mengesahkan nombor anda aktif.',
    resDangerAct2Title: 'Sekat dan lapor pengirim.',
    resDangerAct2Desc: 'Gunakan ciri sekat terbina dalam telefon anda.',
    resDangerAct3Title: 'Lapor kepada NSRC (Pusat Respons Scam Kebangsaan).',
    resDangerAct3Desc: 'Hubungi 997 segera jika anda telah memindahkan wang.',
  }
};

const getResults = (t: typeof TRANSLATIONS.en): Record<RiskLevel, AnalysisResult> => ({
  safe: {
    level: 'safe',
    title: t.resSafeTitle,
    scamType: t.resSafeType,
    confidence: '95%',
    description: t.resSafeDesc,
    flags: [t.resSafeFlag1, t.resSafeFlag2],
    actions: [
      { step: '✓', title: t.resSafeActTitle, desc: t.resSafeActDesc }
    ]
  },
  suspicious: {
    level: 'suspicious',
    title: t.resSuspTitle,
    scamType: t.resSuspType,
    confidence: '74%',
    description: t.resSuspDesc,
    flags: [t.resSuspFlag1, t.resSuspFlag2, t.resSuspFlag3],
    actions: [
      { step: 1, title: t.resSuspAct1Title, desc: t.resSuspAct1Desc },
      { step: 2, title: t.resSuspAct2Title, desc: t.resSuspAct2Desc }
    ]
  },
  danger: {
    level: 'danger',
    title: t.resDangerTitle,
    scamType: t.resDangerType,
    confidence: '98%',
    description: t.resDangerDesc,
    flags: [t.resDangerFlag1, t.resDangerFlag2, t.resDangerFlag3],
    actions: [
      { step: 1, title: t.resDangerAct1Title, desc: t.resDangerAct1Desc },
      { step: 2, title: t.resDangerAct2Title, desc: t.resDangerAct2Desc },
      { step: 3, title: t.resDangerAct3Title, desc: t.resDangerAct3Desc }
    ]
  }
});

export default function App() {
  const [lang, setLang] = useState<'en' | 'bm'>('en');
  const t = TRANSLATIONS[lang];
  const RESULTS = getResults(t);

  const [activePage, setActivePage] = useState<'analyze' | 'trends' | 'report'>('analyze');
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'phone' | 'image'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultLevel, setResultLevel] = useState<RiskLevel | null>(null);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
  const [aiError, setAiError] = useState(false);
  const result = aiResult ?? (resultLevel ? RESULTS[resultLevel] : null);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof RECENT_REPORTS[0] | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://scamshield-backend-fkkdy7nsga-as.a.run.app';

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (forcedResult?: RiskLevel) => {
    const canAnalyze = activeTab === 'image' ? !!imageFile : !!inputValue.trim();
    if (!canAnalyze && !forcedResult) return;

    setIsAnalyzing(true);
    setResultLevel(null);
    setAiResult(null);
    setAiError(false);

    // Forced demo examples — skip API call
    if (forcedResult) {
      setTimeout(() => {
        setIsAnalyzing(false);
        setResultLevel(forcedResult);
      }, 1000);
      return;
    }

    try {
      let content = inputValue;
      let imageBase64: string | undefined;

      if (activeTab === 'image' && imageFile) {
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve(dataUrl.split(',')[1]); // strip data:image/...;base64, prefix
          };
          reader.readAsDataURL(imageFile);
        });
        content = imageFile.name;
      }

      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType: activeTab,
          content,
          language: lang,
          ...(imageBase64 && { imageBase64, imageMimeType: imageFile!.type }),
        }),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      const parsed = await response.json() as AnalysisResult;
      setAiResult(parsed);
      setResultLevel(parsed.level);
    } catch (err) {
      console.error('Analysis error:', err);
      setAiError(true);
      setResultLevel('suspicious');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadExample = (type: RiskLevel) => {
    setActiveTab('text');
    if (type === 'danger') {
      setInputValue("URGENT: PDRM notice. Your bank account has been frozen due to illegal activities. Transfer your funds to this secure BNM account immediately to avoid arrest: 1234567890");
    } else if (type === 'suspicious') {
      setInputValue("Congratulations! You've been selected to win a free iPhone 15 Pro. Click here to claim your prize: http://bit.ly/free-iphone-my");
    } else {
      setInputValue("Hi, just wanted to check what time our meeting is tomorrow?");
    }
    handleAnalyze(type);
  };

  const reset = () => {
    setInputValue('');
    setResultLevel(null);
    setAiResult(null);
    setAiError(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Close modal after showing success message briefly
      setTimeout(() => {
        setIsContributeModalOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500 via-blue-900/20 to-transparent blur-[100px] z-0"></div>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActivePage('analyze')}>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-shadow">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Scam<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Shield</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            <button 
              onClick={() => setActivePage('analyze')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activePage === 'analyze' ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {t.navAnalyze}
            </button>
            <button 
              onClick={() => setActivePage('trends')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activePage === 'trends' ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {t.navTrends}
            </button>
            <button 
              onClick={() => setActivePage('report')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activePage === 'report' ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {t.navReport}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-full border border-white/5 backdrop-blur-md text-xs font-bold">
            <button 
              onClick={() => setLang('bm')}
              className={`px-3 py-1.5 rounded-full transition-all ${lang === 'bm' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              BM
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-full transition-all ${lang === 'en' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              EN
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12 pb-24 md:pb-12 relative z-10">
        {activePage === 'analyze' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-center gap-2 mb-6"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/40 text-blue-400 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Gemini 2.5 Flash
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-medium">
                  <Database className="w-3 h-3" />
                  Vertex AI Search
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 text-xs font-medium">
                  <Activity className="w-3 h-3" />
                  Firebase Genkit
                </span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
              >
                {t.heroTitle1} <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
                  {t.heroTitle2}
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg max-w-xl mx-auto"
              >
                {t.heroDesc}
              </motion.p>
            </div>

            {/* Main Interaction Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative"
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-cyan-500/10 blur-[100px] pointer-events-none" />

              <AnimatePresence mode="wait">
                {!isAnalyzing && !result && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 sm:p-8 relative z-10"
                  >
                    {/* Tabs */}
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 border-b border-white/5">
                      {[
                        { id: 'text', icon: MessageSquare, label: t.tabMessage },
                        { id: 'url', icon: LinkIcon, label: t.tabLink },
                        { id: 'phone', icon: Phone, label: t.tabPhone },
                        { id: 'image', icon: ImageIcon, label: t.tabImage },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                              ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Input Area */}
                    <div className="mb-4">
                      {activeTab === 'image' ? (
                        <label
                          className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/50 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group block"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageSelect(f); }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
                          />
                          {imagePreview ? (
                            <div className="w-full">
                              <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain mb-3" />
                              <p className="text-cyan-400 text-sm font-medium">{imageFile?.name}</p>
                              <p className="text-slate-500 text-xs mt-1">Click to change image</p>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-cyan-400" />
                              </div>
                              <p className="text-slate-300 font-medium mb-1">{t.uploadDrag}</p>
                              <p className="text-slate-500 text-sm">{t.uploadSub}</p>
                            </>
                          )}
                        </label>
                      ) : (
                        <textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={
                            activeTab === 'text' ? t.placeholderText :
                            activeTab === 'url' ? t.placeholderUrl :
                            t.placeholderPhone
                          }
                          className="w-full h-40 bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none transition-all"
                        />
                      )}
                    </div>

                    {/* Example Triggers */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t.tryExample}</span>
                      <button onClick={() => loadExample('danger')} className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">🔴 {t.btnHighRisk}</button>
                      <button onClick={() => loadExample('suspicious')} className="text-xs px-3 py-1.5 rounded-md bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors">🟡 {t.btnSuspicious}</button>
                      <button onClick={() => loadExample('safe')} className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors">🟢 {t.btnSafe}</button>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAnalyze()}
                      disabled={activeTab === 'image' ? !imageFile : !inputValue.trim()}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-blue-600 disabled:hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      {t.btnAnalyze}
                    </button>
                  </motion.div>
                )}

                {isAnalyzing && (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 flex flex-col items-center justify-center min-h-[400px] relative z-10"
                  >
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
                      ></motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{t.analyzingTitle}</h3>
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
                      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                        {t.analyzingStep1}
                      </motion.p>
                      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
                        {t.analyzingStep2}
                      </motion.p>
                    </div>
                  </motion.div>
                )}

                {result && !isAnalyzing && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 sm:p-8 relative z-10"
                  >
                    {/* Result Header */}
                    <div className={`p-6 rounded-xl border mb-6 flex flex-col sm:flex-row items-start gap-4 ${
                      result.level === 'danger' ? 'bg-rose-950/30 border-rose-900/50' :
                      result.level === 'suspicious' ? 'bg-amber-950/30 border-amber-900/50' :
                      'bg-emerald-950/30 border-emerald-900/50'
                    }`}>
                      <div className={`p-3 rounded-full shrink-0 ${
                        result.level === 'danger' ? 'bg-rose-500/20 text-rose-500' :
                        result.level === 'suspicious' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {result.level === 'danger' ? <ShieldAlert className="w-8 h-8" /> :
                         result.level === 'suspicious' ? <AlertTriangle className="w-8 h-8" /> :
                         <ShieldCheck className="w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h2 className={`text-2xl font-bold ${
                            result.level === 'danger' ? 'text-rose-500' :
                            result.level === 'suspicious' ? 'text-amber-500' :
                            'text-emerald-500'
                          }`}>
                            {result.title}
                          </h2>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            result.level === 'danger' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            result.level === 'suspicious' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            <Percent className="w-3 h-3" />
                            {result.confidence} {t.resConfidence}
                          </div>
                        </div>
                        <p className="text-slate-300 mb-3">
                          {result.description}
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/50 border border-white/5 text-sm">
                          <Tag className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-400">{t.resScamType}</span>
                          <span className="font-semibold text-white">{result.scamType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Red Flags Section */}
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {t.resFlags}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {result.flags.map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-white/5">
                            {result.level === 'danger' ? (
                              <span className="text-rose-500 mt-0.5 shrink-0">●</span>
                            ) : result.level === 'suspicious' ? (
                              <span className="text-amber-500 mt-0.5 shrink-0">●</span>
                            ) : (
                              <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                            )}
                            <span className="text-sm text-slate-300">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Guide */}
                    <div className="bg-slate-950/50 rounded-xl border border-white/5 p-6 mb-6">
                      <h4 className="text-lg font-bold text-white mb-4">{t.resActionGuide}</h4>
                      <div className="space-y-4">
                        {result.actions.map((action, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold shrink-0">
                              {action.step}
                            </div>
                            <div>
                              <p className="font-medium text-white">{action.title}</p>
                              <p className="text-sm text-slate-400">{action.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RAG Sources */}
                    {result.pipeline?.ragMatches?.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Database className="w-4 h-4 text-cyan-400" /> Matched Patterns (Vertex AI Search)
                        </h4>
                        <div className="space-y-2">
                          {result.pipeline.ragMatches.slice(0, 3).map((match: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-cyan-950/20 border border-cyan-800/20 text-xs text-cyan-300/80">
                              <span className="text-cyan-500 shrink-0 mt-0.5">›</span>
                              <span>{match}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={reset}
                        className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" /> {t.btnAnalyzeAnother}
                      </button>
                      <button 
                        onClick={() => setIsContributeModalOpen(true)}
                        className="flex-1 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {t.btnContribute} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {activePage === 'trends' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold text-white">{t.trendsTitle}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-slate-400">{t.trendsDesc}</p>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">Sample Data</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5 text-slate-300 hover:bg-white/5 transition-colors">
                  <Calendar className="w-4 h-4" /> {t.trendsFilter}
                </button>
              </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-3xl font-bold text-cyan-400 mb-1">1,247</h3>
                <p className="text-slate-400 text-sm font-medium">{t.statTotal}</p>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-bold text-white mb-1">Job Scam</h3>
                <p className="text-slate-400 text-sm font-medium">{t.statTop}</p>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-3xl font-bold text-emerald-400 mb-1">92%</h3>
                <p className="text-slate-400 text-sm font-medium">{t.statDetected}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frequency by Type */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">{t.freqTitle}</h3>
                <div className="space-y-5">
                  {FREQUENCY_DATA.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-medium">{item.type}</span>
                        <span className="text-slate-400">{item.count}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / 200) * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribution */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">{t.distTitle}</h3>
                <div className="flex-1 relative min-h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DONUT_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {DONUT_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050B14', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-white">964</span>
                    <span className="text-xs text-slate-400">reports</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                  {DONUT_DATA.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">{t.recentTitle}</h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">{t.seeAll}</button>
              </div>
              <div className="space-y-4">
                {RECENT_REPORTS.map((report) => (
                  <div 
                    key={report.id} 
                    onClick={() => setSelectedReport(report)}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                        report.color === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        report.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {report.risk}
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{report.title}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">{report.source}</p>
                      </div>
                    </div>
                    <span className="text-slate-500 text-xs">{report.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activePage === 'report' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">{t.reportTitle}</h2>
              <p className="text-slate-400">{t.reportDesc}</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8">
              <form onSubmit={handleContributeSubmit} className="space-y-6">
                <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-cyan-200/80">
                    {t.reportNotice}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t.lblScamContent}</label>
                  <textarea 
                    required
                    placeholder={t.placeholderText}
                    className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-lg p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t.lblPlatform}</label>
                  <select className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                    <option>WhatsApp</option>
                    <option>SMS</option>
                    <option>Telegram</option>
                    <option>Facebook / Instagram</option>
                    <option>Email</option>
                    <option>Phone Call</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t.lblScammerDetails}</label>
                  <input type="text" placeholder={t.reportDetailsPlaceholder} className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t.lblUpload}</label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/50 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-cyan-900/30 transition-colors">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                    </div>
                    <p className="text-slate-300 font-medium text-sm mb-1">{t.uploadDrag}</p>
                    <p className="text-slate-500 text-xs">{t.uploadSub}</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                    submitSuccess 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> {t.btnSubmitting}
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> {t.modalThankYou}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" /> {t.btnSubmitReport}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12 py-8 text-center text-slate-500 text-sm">
        <p>{t.footerText}</p>
        <p className="mt-2 text-slate-600">Built with Gemini 2.5 Flash · Vertex AI Search · Firebase Genkit</p>
      </footer>

      {/* Contribute Modal */}
      <AnimatePresence>
        {isContributeModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && !submitSuccess && setIsContributeModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                {submitSuccess ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t.modalThankYou}</h3>
                    <p className="text-slate-400">
                      {t.modalThankYouDesc}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-cyan-400" />
                        {t.modalTitle}
                      </h3>
                      <button 
                        onClick={() => setIsContributeModalOpen(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleContributeSubmit} className="p-6">
                      <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-cyan-200/80">
                          {t.modalContributeNotice}
                        </p>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">{t.lblScamContentAnon}</label>
                          <textarea 
                            readOnly
                            value={inputValue}
                            className="w-full h-24 bg-slate-950/50 border border-white/10 rounded-lg p-3 text-slate-300 text-sm opacity-70 cursor-not-allowed resize-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">{t.lblPlatform}</label>
                          <select className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                            <option>WhatsApp</option>
                            <option>SMS</option>
                            <option>Telegram</option>
                            <option>Facebook / Instagram</option>
                            <option>Email</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">{t.lblScammerDetails}</label>
                          <input type="text" placeholder={t.reportDetailsPlaceholder} className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setIsContributeModalOpen(false)}
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors disabled:opacity-50"
                        >
                          {t.btnCancel}
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> {t.btnSubmitting}
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" /> {t.btnSubmitAnon}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          </>
        )}

        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A1120] border border-blue-900/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between bg-[#050B14]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className={`w-5 h-5 ${
                        selectedReport.color === 'red' ? 'text-red-500' :
                        selectedReport.color === 'yellow' ? 'text-yellow-500' :
                        'text-emerald-500'
                      }`} />
                  {t.reportDetailsTitle}
                </h3>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                    selectedReport.color === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    selectedReport.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {selectedReport.risk}
                  </div>
                  <span className="text-slate-500 text-sm">{selectedReport.time}</span>
                </div>
                
                <h4 className="text-xl font-bold text-white mb-2">{selectedReport.title}</h4>
                <p className="text-sm text-blue-400 mb-6">{selectedReport.source}</p>
                
                <div className="bg-[#050B14] border border-slate-800 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-slate-400 mb-2">{t.reportDetailsDesc}</h5>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {selectedReport.details}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050B14]/90 backdrop-blur-md border-t border-slate-800/50 z-40 pb-safe">
        <div className="flex items-center justify-around p-2">
          <button 
            onClick={() => setActivePage('analyze')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activePage === 'analyze' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Search className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{t.navAnalyze}</span>
          </button>
          <button 
            onClick={() => setActivePage('trends')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activePage === 'trends' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Activity className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{t.navTrends}</span>
          </button>
          <button 
            onClick={() => setActivePage('report')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activePage === 'report' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{t.navReport}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
