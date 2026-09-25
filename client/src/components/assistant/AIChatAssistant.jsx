import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import assistantService from '../../services/assistantService';
import voiceService from '../../services/voiceService';
import AssistantMessage from './AssistantMessage';
import AssistantInput from './AssistantInput';
import AssistantTyping from './AssistantTyping';
import AssistantQuickActions from './AssistantQuickActions';
import {
  Bot,
  X,
  Trash2,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  MessageSquare,
  Square,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Warehouse,
  Truck,
  Scan,
  CreditCard,
  UserCheck,
  Layers,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';

// Comprehensive Directory of all 10 Core AgriNex Features & How-To Guides
const APP_FEATURES_CATALOG = [
  {
    id: 'marketplace',
    title: 'Farm-Gate Wholesale Marketplace',
    icon: ShoppingBag,
    color: '#10b981',
    badge: 'CORE COMMERCE',
    path: '/marketplace',
    shortSummary: 'Direct producer-to-buyer bulk trading with transparent farm-gate pricing.',
    benefits: [
      'Eliminates middleman commission (saving 15%–25% for farmers).',
      'Verified farmer listings with origin GPS, high-res photos & quality grades.',
      'Supports bulk purchase orders, counter-offers, and integrated escrow protection.'
    ],
    howToUse: [
      '1. Open Wholesale Marketplace from the top navigation bar.',
      '2. Use State, District, and Crop Category filters to find matching harvest lots.',
      '3. Click "Make Custom Offer" to negotiate price/quantity or "Add to Cart" to build a consolidated order.',
      '4. Proceed to Escrow Checkout to secure funds until delivery inspection.'
    ],
    audioGuide: 'The Farm-Gate Wholesale Marketplace lets farmers sell directly to institutional buyers at 15 to 25 percent higher margins. Buyers browse verified harvest listings and negotiate custom offers with 100 percent escrow protection.'
  },
  {
    id: 'prices',
    title: 'AGMARKNET Real-Time Mandi Prices',
    icon: TrendingUp,
    color: '#059669',
    badge: 'GOV DATA PIPELINE',
    path: '/prices',
    shortSummary: 'Official Government of India (data.gov.in) daily market prices across 3,000+ mandis.',
    benefits: [
      '100% verified modal, min, and max benchmark prices refreshed every 30 minutes.',
      'Interactive 30, 60, and 90-day historical price trend charts.',
      'Cross-state and cross-district APMC mandi comparisons.'
    ],
    howToUse: [
      '1. Navigate to Price Discovery in the header menu.',
      '2. Select your crop (e.g. Tomato, Wheat, Red Onion, Basmati Rice).',
      '3. Filter by State and District to see exact local APMC terminal rates.',
      '4. Toggle 30D, 60D, or 90D horizons to analyze seasonal market momentum.'
    ],
    audioGuide: 'AGMARKNET Real-Time Mandi Price Discovery connects directly to the Government of India open data platform, providing modal, minimum, and maximum prices across thousands of mandis with historical trend charts.'
  },
  {
    id: 'prediction',
    title: 'AI Price Prediction (ML Ensemble)',
    icon: Sparkles,
    color: '#8b5cf6',
    badge: 'MACHINE LEARNING',
    path: '/prices',
    shortSummary: 'Gradient Boosting and Random Forest models predicting 7-to-30 day price corridors.',
    benefits: [
      'Empowers farmers to time harvest liquidation for maximum profitability.',
      'Provides confidence metrics and backtested Mean Absolute Error (MAE) scores.',
      'Clear [PREDICTED DATA] data transparency labels to prevent misinformation.'
    ],
    howToUse: [
      '1. Open Price Discovery and select the "AI Price Prediction" tab.',
      '2. Select your commodity and forecast window (7 Days to 30 Days).',
      '3. Review the projected price band, confidence percentage, and market momentum indicators.'
    ],
    audioGuide: 'AI Price Prediction uses machine learning ensemble models to forecast 7 to 30 day mandi price corridors, helping producers and buyers schedule harvests and procurement at peak pricing.'
  },
  {
    id: 'coldstorage',
    title: 'AI Cold Storage vs. Immediate Liquidation Advisor',
    icon: Warehouse,
    color: '#2563eb',
    badge: 'HARVEST OPTIMIZATION',
    path: '/prices',
    shortSummary: 'Simulates weight shrinkage loss & storage rent against forward modal forecasts.',
    benefits: [
      'Prevents distress selling during seasonal harvest gluts.',
      'Calculates exact Rupee net profit after storage fees and dehydration loss.',
      'One-click WDRA-accredited cold storage bay booking with IoT temperature logging.'
    ],
    howToUse: [
      '1. Open Price Discovery and switch to the "Cold Storage Advisor" tab.',
      '2. Choose holding duration (15, 30, 45, 60, or 90 Days) and lot quantity.',
      '3. Select storage facility type: Ventilated (18°C) or CA Vault (4°C).',
      '4. Check the Decision Verdict (HOLD or LIQUIDATE NOW) and click "Book Verified Cold Storage Space".'
    ],
    audioGuide: 'The Cold Storage vs. Immediate Liquidation Advisor compares storage costs and dehydration loss against forward market forecasts to give a clear verdict on whether holding produce yields a higher net profit than selling immediately.'
  },
  {
    id: 'matchmaker',
    title: 'Smart Sourcing & Counterparty Matchmaker',
    icon: Layers,
    color: '#0284c7',
    badge: 'AI MATCHING',
    path: '/prices',
    shortSummary: 'Real-time matching of institutional buyer procurement tenders with certified harvest inventory.',
    benefits: [
      'Zero empty states: always surfaces active counterparties with compatibility scores.',
      'Dual view: Buyer Procurement View & Farmer Sales View.',
      '1-click digital contract acceptance, counter-offers (+₹2/kg), and tender broadcasting.'
    ],
    howToUse: [
      '1. Go to Price Discovery and select the "Smart Sourcing & Matchmaker" tab.',
      '2. Toggle between "Buyer Procurement View" and "Farmer Sales View".',
      '3. Use category filter pills (Vegetables, Grains, Fruits, Organic).',
      '4. Click "Accept & Lock Escrow" to sign contracts or "Broadcast Requirement" to notify 14,000+ traders.'
    ],
    audioGuide: 'Smart Sourcing and Counterparty Matchmaker pairs active institutional purchase tenders with farmer harvest lots in real time, featuring compatibility match scores, counter-offers, and instant escrow contract signing.'
  },
  {
    id: 'arbitrage',
    title: 'Multi-Mandi Arbitrage & Freight Desk',
    icon: TrendingUp,
    color: '#d97706',
    badge: 'PROFIT DESK',
    path: '/prices',
    shortSummary: 'Scans price spreads between mandis, factors haulage freight, and dispatches trucks.',
    benefits: [
      'Detects lucrative interstate and inter-district price differentials.',
      'Automatically deducts corridor diesel and toll costs to show net arbitrage margin.',
      'Direct link to temperature-controlled transit corridor fleet dispatch.'
    ],
    howToUse: [
      '1. In Price Discovery, click the "Arbitrage Desk" tab.',
      '2. Select your originating farm mandi and target trade quantity.',
      '3. Identify the highest net spread mandi and click "Dispatch Corridor Reefer".'
    ],
    audioGuide: 'The Arbitrage Desk identifies price spreads between different mandis across India, deducts transport freight costs, and helps you dispatch produce to the highest-paying market terminal.'
  },
  {
    id: 'fleet',
    title: 'Live GPS Fleet Cold-Chain Telematics',
    icon: Truck,
    color: '#059669',
    badge: 'COLD-CHAIN IOT',
    path: '/fleet',
    shortSummary: 'Live tracking of refrigerated transports with continuous temperature logging.',
    benefits: [
      'Real-time GPS vehicle position along major corridors (Nashik, Pune, Mumbai).',
      '24/7 temperature sensor telemetry (-18°C to +4°C) guaranteeing zero spoilage.',
      'Secure 6-digit delivery OTP verification for cargo release.'
    ],
    howToUse: [
      '1. Open "Live GPS Fleet" from the navigation menu.',
      '2. Select an active refrigerated vehicle on the interactive map.',
      '3. Monitor route progress, live container temperature, and estimated time of arrival.'
    ],
    audioGuide: 'Live GPS Fleet Cold-Chain Telematics provides real-time route tracking and temperature monitoring for refrigerated transports from farm gate to wholesale distribution centers.'
  },
  {
    id: 'cropscanner',
    title: 'AI Crop Scanner & Quality Grading',
    icon: Scan,
    color: '#10b981',
    badge: 'COMPUTER VISION',
    path: '/crop-scanner',
    shortSummary: 'Analyzes crop photos for leaf health, diseases, chlorophyll, and freshness grades.',
    benefits: [
      'Instant diagnosis of common crop diseases (Early Blight, Leaf Rust, Powdery Mildew).',
      'Provides agronomic organic and chemical treatment advice.',
      'Assigns an export quality score (Grade A/B/C) to boost buyer confidence.'
    ],
    howToUse: [
      '1. Navigate to Crop Scanner from the header or Farmer Dashboard.',
      '2. Take a photo or upload an image of your harvest produce or plant leaf.',
      '3. Click "Analyze Produce" to receive an instant diagnostic report with health scores.'
    ],
    audioGuide: 'The AI Crop Scanner analyzes plant photos using computer vision to detect crop diseases, assess chlorophyll levels, and provide quality grading for export readiness.'
  },
  {
    id: 'payments',
    title: 'Smart Escrow & Multi-Gateway Payments',
    icon: CreditCard,
    color: '#2563eb',
    badge: '100% ESCROW PROTECTED',
    path: '/payments',
    shortSummary: 'RBI-compliant fund security via UPI, Cards, Net Banking, and NEFT/RTGS with OTP release.',
    benefits: [
      'Zero payment default risk: buyer funds are locked in Escrow before harvest harvest dispatch.',
      'Supports 5 active gateways: UPI QR, RuPay Kisan/Credit Card, Net Banking, Bank Wire, and Agri-Credit.',
      'Instant payout release to farmer bank account upon 6-digit delivery OTP verification with 0% fee.'
    ],
    howToUse: [
      '1. Go to Payments & Escrow Hub (/payments).',
      '2. Select your preferred gateway: UPI QR, Debit/Credit Card, Net Banking, or Bank Transfer.',
      '3. Enter the contract amount and lock funds into the Escrow Vault.',
      '4. When goods arrive, share the 6-digit delivery OTP to instantly release payout to the farmer.'
    ],
    audioGuide: 'AgriNex Smart Escrow protects both buyers and farmers. Funds are locked securely in an RBI-compliant vault through UPI, Cards, Net Banking, or Bank Transfer, and released immediately to the farmer upon delivery OTP verification.'
  },
  {
    id: 'farmerhub',
    title: 'Farmer Direct Settlement & Aadhaar DBT',
    icon: UserCheck,
    color: '#10b981',
    badge: 'FARMER FIRST',
    path: '/farmer/earnings',
    shortSummary: 'Direct-to-bank settlements, penny-drop verification, and zero commission cuts.',
    benefits: [
      'Automated NPCI penny-drop testing verifies farmer bank account before fund transfer.',
      'Immediate UPI VPA and Direct Benefit Transfer (DBT) integration.',
      'Transparent earnings ledger with downloadable GST and APMC compliance receipts.'
    ],
    howToUse: [
      '1. Open Farmer Dashboard → My Earnings.',
      '2. Link your Aadhaar, bank account IFSC, and UPI VPA.',
      '3. Run a ₹1 penny-drop test to verify account ownership.',
      '4. Track live payouts and download digital tax invoices.'
    ],
    audioGuide: 'Farmer Direct Settlement ensures farmers receive 100 percent of their sales directly into their bank accounts or UPI VPAs with zero intermediary deductions and automated penny-drop verification.'
  }
];

export default function AIChatAssistant({ isOpen, onClose }) {
  const { user } = useAuth();
  const { currentLanguage, currentLanguageInfo } = useLanguage();
  const role = user?.role || 'FARMER';
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Active Tab: 'chat' | 'guide'
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedGuideFeature, setSelectedGuideFeature] = useState(null);

  // Map app language code to BCP-47 Speech Synthesis tag
  const getTTSLang = (code) => {
    const map = {
      en: 'en-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      gu: 'gu-IN',
      pa: 'pa-IN'
    };
    return map[code] || 'en-IN';
  };

  // Voice Assistant Controls
  const [autoVoice, setAutoVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial welcome message in user's mother language
  const getInitialWelcome = (lang) => {
    const firstName = user?.name ? user.name.split(' ')[0] : '';
    if (lang === 'hi') {
      return {
        id: 'welcome_hi',
        sender: 'assistant',
        text: `नमस्ते${firstName ? ' ' + firstName : ''}! मैं आपका **एग्रीनेक्स सम्पूर्ण गाइड और वॉयस असिस्टेंट** हूँ।\n\nमैं आपको **मंच के सभी 10 फीचर्स**, **मल्टी-गेटवे एस्क्रो पेमेंट्स**, **कोल्ड स्टोरेज निर्णय**, और **लाइव मंडी भाव** की पूरी जानकारी आपकी अपनी मातृभाषा में दे सकता हूँ।\n\nआप मुझसे बोलकर या लिखकर कुछ भी पूछ सकते हैं!`,
        voiceText: `नमस्ते! मैं आपका एग्रीनेक्स सम्पूर्ण गाइड और वॉयस असिस्टेंट हूँ। मैं आपको सभी फीचर्स और एस्क्रो पेमेंट्स की जानकारी आपकी मातृभाषा में दे सकता हूँ। आप क्या जानना चाहते हैं?`
      };
    }
    if (lang === 'te') {
      return {
        id: 'welcome_te',
        sender: 'assistant',
        text: `నమస్కారం${firstName ? ' ' + firstName : ''}! నేను మీ **అగ్రినెక్స్ కంప్లీట్ గైడ్ & వాయిస్ అసిస్టెంట్**ని.\n\nనేను మీకు **ప్లాట్‌ఫారమ్ యొక్క 10 ప్రధాన ఫీచర్లు**, **మల్టీ-గేట్‌వే ఎస్క్రో చెల్లింపులు**, **కోల్డ్ స్టోరేజ్ సలహాలు** మరియు **లైవ్ మార్కెట్ ధరలు** గురించి మీ మాతృభాషలో వివరించగలను.\n\nఈరోజు మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?`,
        voiceText: `నమస్కారం! నేను మీ అగ్రినెక్స్ వాయిస్ అసిస్టెంట్‌ని. ప్లాట్‌ఫారమ్ ఫీచర్లు మరియు సురక్షిత ఎస్క్రో చెల్లింపుల వివరాలను మీ మాతృభాషలో తెలుసుకోవచ్చు.`
      };
    }
    if (lang === 'mr') {
      return {
        id: 'welcome_mr',
        sender: 'assistant',
        text: `नमस्कार${firstName ? ' ' + firstName : ''}! मी आपला **ॲग्रीनेक्स संपूर्ण मार्गदर्शक आणि व्हॉइस असिस्टंट** आहे.\n\nमी आपल्याला **सर्व 10 वैशिष्ट्ये**, **सुरक्षित एस्क्रो पेमेंट्स**, **कोल्ड स्टोरेज सल्ला** आणि **थेट बाजार भाव** आपल्या मातृभाषेत समजावून सांगू शकतो.`,
        voiceText: `नमस्कार! मी आपला ॲग्रीनेक्स व्हॉइस असिस्टंट आहे. सर्व वैशिष्ट्ये आणि एस्क्रो पेमेंट्सची माहिती आपल्या मातृभाषेत विचारू शकता.`
      };
    }

    return {
      id: 'welcome_en',
      sender: 'assistant',
      text: `Hello${firstName ? ' ' + firstName : ''}! I am your **AgriNex Complete Guide & Voice Assistant**.\n\nI can explain **every feature of the platform**, guide you step-by-step through **multi-gateway payments and escrow**, assist with **cold storage decisions**, and answer any questions you have in your preferred native language by text or voice.\n\nWhat would you like to explore today?`,
      voiceText: `Hello! I am your AgriNex Complete Guide and Voice Assistant. I can explain every feature of the app, guide you through payments and escrow, and answer any questions by text or voice in your preferred language. How can I help you today?`
    };
  };

  const [messages, setMessages] = useState(() => [getInitialWelcome(currentLanguage)]);

  // Update initial message when user changes mother language
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [getInitialWelcome(currentLanguage)];
      }
      return prev;
    });
  }, [currentLanguage]);

  // Subscribe to voice synthesis state changes
  useEffect(() => {
    const unsubscribe = voiceService.subscribe((voiceState) => {
      setIsSpeaking(voiceState.isPlaying);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // Stop speech when assistant modal is closed
  useEffect(() => {
    if (!isOpen) {
      voiceService.stop();
    }
  }, [isOpen]);

  // Quick Questions localized in Mother Language
  const getQuickQuestions = (lang) => {
    if (lang === 'hi') {
      return [
        '🌟 ऐप के सभी फीचर्स और लाभ समझाइए',
        '💳 भुगतान और एस्क्रो कैसे काम करता है? कौन से गेटवे सक्रिय हैं?',
        '💰 किसानों को पैसे कैसे मिलते हैं? क्या कोई शुल्क है?',
        '❄️ कोल्ड स्टोरेज सलाहकार का उपयोग कैसे करें?',
        '📈 मंडी भाव और एआई मूल्य पूर्वानुमान कैसे काम करता है?',
        '🤝 काउंटरपार्टी मैचमेकर कैसे काम करता है?',
        '🚚 जीपीएस फ्लीट और तापमान ट्रैकिंग कैसे काम करती है?',
        '🔍 एआई फसल रोग स्कैनर का उपयोग कैसे करें?'
      ];
    }
    if (lang === 'te') {
      return [
        '🌟 యాప్ పూర్తి ఫీచర్లు మరియు ప్రయోజనాలను వివరించండి',
        '💳 పేమెంట్స్ మరియు ఎస్క్రో ఎలా పనిచేస్తుంది? ఏ గేట్‌వేలు ఉన్నాయి?',
        '💰 రైతులకు చెల్లింపులు ఎలా అందుతాయి? ఏదైనా ఫీజు ఉందా?',
        '❄️ కోల్డ్ స్టోరేజ్ అడ్వైజర్‌ను ఎలా ఉపయోగించాలి?',
        '📈 మార్కెట్ ధరలు & ఏఐ అంచనా ఎలా పనిచేస్తుంది?',
        '🤝 కౌంటర్‌పార్టీ మ్యాచ్‌మేకర్ ఎలా పనిచేస్తుంది?',
        '🚚 జీపీఎస్ శీతల రవాణా ట్రాకింగ్ ఎలా పనిచేస్తుంది?',
        '🔍 ఏఐ క్రాప్ స్కానర్ ఎలా పనిచేస్తుంది?'
      ];
    }
    if (lang === 'mr') {
      return [
        '🌟 ॲपची सर्व वैशिष्ट्ये आणि फायदे स्पष्ट करा',
        '💳 पेमेंट आणि एस्क्रो कसे काम करते? कोणते पर्याय सक्रिय आहेत?',
        '💰 शेतकऱ्यांना पैसे कसे मिळतात? काही शुल्क आहे का?',
        '❄️ कोल्ड स्टोरेज सल्लागार कसा वापरावा?',
        '📈 बाजार भाव आणि एआई अंदाज कसा काम करतो?',
        '🤝 स्मार्ट मॅचमेकर कसा वापरावा?',
        '🚚 थेट जीपीएस वाहतूक कशी तपासावी?',
        '🔍 एआई पीक रोग तपासणी कशी करावी?'
      ];
    }

    return [
      '🌟 Explain all features and benefits of the app',
      '💳 How do payments and escrow work? What gateways are active?',
      '💰 How do farmers get paid? Is there any fee?',
      '❄️ How to use the Cold Storage Advisor?',
      '📈 How does price discovery and AI prediction work?',
      '🤝 How does the Counterparty Matchmaker work?',
      '🚚 How does GPS Fleet and reefer tracking work?',
      '🔍 How does the AI Crop Scanner work?'
    ];
  };

  const quickQuestions = getQuickQuestions(currentLanguage);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    setErrorMsg('');

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send with current mother language code
      const res = await assistantService.sendMessage(text, currentLanguage);
      setLoading(false);

      if (res.success && res.data) {
        const assistantMsg = {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          text: res.data.message,
          action: res.data.action,
          voiceText: res.data.voiceText || res.data.message
        };
        setMessages(prev => [...prev, assistantMsg]);

        // Auto-Voice playback in user's mother language
        if (autoVoice && assistantMsg.voiceText) {
          voiceService.speak(assistantMsg.voiceText, {
            lang: getTTSLang(currentLanguage)
          });
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            text: currentLanguage === 'hi' 
              ? "मैं आपकी सहायता के लिए तैयार हूँ। आप फीचर्स गाइड देख सकते हैं या कोई प्रश्न पूछ सकते हैं।"
              : currentLanguage === 'te'
              ? "నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను. మీరు ఫీచర్స్ గైడ్ బ్రౌజ్ చేయవచ్చు."
              : "I am ready to help. You can explore the Complete App Guide tab or ask me about any specific feature."
          }
        ]);
      }
    } catch (err) {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "I am having trouble connecting to the intelligence server. You can still browse the full App Features Guide in the top tab."
        }
      ]);
    }
  };

  const handleClearHistory = () => {
    voiceService.stop();
    assistantService.clearHistory().catch(() => {});
    setMessages([getInitialWelcome(currentLanguage)]);
  };

  const handleSpeakFeature = (feature) => {
    let textToSpeak = feature.audioGuide || `${feature.title}. ${feature.shortSummary}`;
    if (currentLanguage === 'hi' && feature.audioGuideHi) {
      textToSpeak = feature.audioGuideHi;
    } else if (currentLanguage === 'te' && feature.audioGuideTe) {
      textToSpeak = feature.audioGuideTe;
    }
    voiceService.speak(textToSpeak, {
      lang: getTTSLang(currentLanguage)
    });
  };

  const handleAskAboutFeature = (feature) => {
    setActiveTab('chat');
    handleSend(`Explain how to use ${feature.title} and what are its key benefits?`);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '84px',
      right: '24px',
      zIndex: 9001,
      width: '440px',
      maxWidth: 'calc(100vw - 32px)',
      height: '630px',
      maxHeight: 'calc(100vh - 105px)',
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border-color)',
      borderRadius: '24px',
      boxShadow: '0 24px 60px rgba(0, 0, 0, 0.32)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <Bot size={20} />
            {isSpeaking && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#fef08a',
                boxShadow: '0 0 8px #fef08a'
              }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>AgriNex AI Guide</span>
              <span className="badge badge-warning" style={{ fontSize: '0.625rem', padding: '2px 6px', fontWeight: 800 }}>VOICE ACTIVE</span>
            </div>
            <div style={{ fontSize: '0.6875rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Role: <strong>{role}</strong></span>
              <span>•</span>
              <span style={{ background: 'rgba(255, 255, 255, 0.22)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                🗣️ {currentLanguageInfo?.nativeName || 'English'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Controls: Auto-Voice toggle, Stop voice, Clear & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSpeaking ? (
            <button
              type="button"
              onClick={() => voiceService.stop()}
              title="Stop Speaking"
              style={{
                background: 'rgba(239, 68, 68, 0.85)',
                border: 'none',
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Square size={12} fill="#fff" /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAutoVoice(!autoVoice)}
              title={autoVoice ? 'Auto-Voice is ON' : 'Auto-Voice is OFF'}
              style={{
                background: autoVoice ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.6875rem',
                fontWeight: 700
              }}
            >
              {autoVoice ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear Chat History"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              opacity: 0.85
            }}
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Assistant"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs: Q&A Assistant vs Complete App Guide */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '4px 8px',
        gap: '4px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'chat' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'chat' ? '#10b981' : 'var(--text-muted)',
            fontWeight: activeTab === 'chat' ? 800 : 600,
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: activeTab === 'chat' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <MessageSquare size={15} />
          <span>Ask Q&A & Voice</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'guide' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'guide' ? '#10b981' : 'var(--text-muted)',
            fontWeight: activeTab === 'guide' ? 800 : 600,
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: activeTab === 'guide' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <Compass size={15} />
          <span>All Features Guide ({APP_FEATURES_CATALOG.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CHAT & VOICE Q&A ASSISTANT */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <>
          {/* Quick Prompts Carousel */}
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            padding: '8px 12px',
            background: 'var(--bg-muted)',
            borderBottom: '1px solid var(--border-color)',
            scrollbarWidth: 'none'
          }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div style={{
              padding: '8px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Active Speaking Indicator */}
          {isSpeaking && (
            <div style={{
              padding: '6px 14px',
              background: 'rgba(16, 185, 129, 0.12)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#059669',
              fontWeight: 700
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={14} className="pulse-icon" />
                <span>Voice Assistant Speaking...</span>
              </div>
              <button
                type="button"
                onClick={() => voiceService.stop()}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Mute
              </button>
            </div>
          )}

          {/* Messages Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {messages.map((m) => (
              <AssistantMessage
                key={m.id}
                msg={m}
                onActionClick={(action) => {
                  onClose();
                  if (action?.path) navigate(action.path);
                }}
              />
            ))}

            {loading && <AssistantTyping />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Navigation Buttons */}
          <AssistantQuickActions role={role} onClosePanel={onClose} />

          {/* Input with Voice Mic & Send */}
          <AssistantInput onSend={handleSend} disabled={loading} onError={setErrorMsg} />
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: COMPLETE APP FEATURES & HOW-TO GUIDE EXPLORER */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: 'var(--bg-muted)'
        }}>
          {/* Guide Header Banner */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(37, 99, 235, 0.08))',
            border: '1.5px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                AgriNex Operating System
              </span>
              <button
                type="button"
                onClick={() => {
                  voiceService.speak("Welcome to the AgriNex complete app feature guide. Click any audio guide button to hear how each feature works, or ask questions in the chat assistant.", { lang: 'en-IN' });
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
              >
                <Volume2 size={13} /> Listen Overview
              </button>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, margin: '2px 0 4px', color: 'var(--text-main)' }}>
              10 Core Features & Step-by-Step Instructions
            </h4>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Click any module to read its key benefits and how to use it. You can also listen to audio guides or jump straight to the page.
            </p>
          </div>

          {/* Features List */}
          {APP_FEATURES_CATALOG.map((f, idx) => {
            const Icon = f.icon;
            const isExpanded = selectedGuideFeature === f.id;

            return (
              <div
                key={f.id}
                style={{
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${isExpanded ? f.color : 'var(--border-color)'}`,
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header row */}
                <div
                  onClick={() => setSelectedGuideFeature(isExpanded ? null : f.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `rgba(${f.color === '#10b981' ? '16, 185, 129' : '37, 99, 235'}, 0.15)`,
                      color: f.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 800, color: f.color }}>
                          {f.badge}
                        </span>
                      </div>
                      <h5 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-main)' }}>
                        {idx + 1}. {f.title}
                      </h5>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    color="var(--text-muted)"
                    style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {f.shortSummary}
                </div>

                {/* Expanded Details: Benefits & Step-by-Step */}
                {isExpanded && (
                  <div style={{
                    marginTop: '4px',
                    paddingTop: '10px',
                    borderTop: '1px dashed var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontSize: '0.78125rem'
                  }}>
                    {/* Benefits */}
                    <div>
                      <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px' }}>
                        🌟 Key Transformative Benefits:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-main)' }}>
                        {f.benefits.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    {/* How to use */}
                    <div>
                      <strong style={{ color: '#2563eb', display: 'block', marginBottom: '4px' }}>
                        📋 How to Use Step-by-Step:
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-main)' }}>
                        {f.howToUse.map((step, i) => (
                          <div key={i} style={{ lineHeight: 1.4 }}>{step}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(f.path);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '6px 12px',
                      flex: 1
                    }}
                  >
                    <ArrowRight size={13} /> Open Feature
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSpeakFeature(f)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '6px 12px'
                    }}
                  >
                    <Volume2 size={13} color="#10b981" /> Listen Guide
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskAboutFeature(f)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '6px 10px'
                    }}
                  >
                    <MessageSquare size={13} /> Ask Q&A
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
