// AgriNex Farmer Guided Tour Data - 11 Steps in English, Telugu (తెలుగు), and Hindi (हिन्दी)
import {
  LayoutDashboard,
  Sprout,
  Camera,
  ScanLine,
  Store,
  Scale,
  MessageSquare,
  Package,
  Truck,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export const farmerTourSteps = [
  {
    step: 1,
    id: 'dashboard',
    icon: LayoutDashboard,
    color: '#10b981',
    en: {
      title: 'Farmer Dashboard',
      text: 'Welcome to your Farmer Dashboard. Here you can manage your crops, offers, orders, earnings, price alerts and deliveries from one place.',
      voiceText: 'Welcome to your Farmer Dashboard. Here you can manage your crops, offers, orders, earnings, price alerts and deliveries from one place.'
    },
    te: {
      title: 'రైతు డ్యాష్‌బోర్డ్',
      text: 'మీ రైతు డ్యాష్‌బోర్డ్‌కు స్వాగతం. ఇక్కడ మీరు మీ పంటలు, ఆఫర్లు, ఆర్డర్లు, ఆదాయం, ధర హెచ్చరికలు మరియు డెలివరీలను ఒకే చోట నిర్వహించవచ్చు.',
      voiceText: 'మీ రైతు డ్యాష్‌బోర్డ్‌కు స్వాగతం. ఇక్కడ మీరు మీ పంటలు, ఆఫర్లు మరియు ఆదాయాన్ని సులభంగా నిర్వహించవచ్చు.'
    },
    hi: {
      title: 'किसान डैशबोर्ड',
      text: 'आपके किसान डैशबोर्ड में आपका स्वागत है। यहां आप अपनी फसलें, ऑफ़र, ऑर्डर, कमाई, मूल्य अलर्ट और डिलीवरी एक ही स्थान से प्रबंधित कर सकते हैं।',
      voiceText: 'आपके किसान डैशबोर्ड में आपका स्वागत है। यहां आप अपनी फसलें, ऑफ़र और कमाई आसानी से प्रबंधित कर सकते हैं।'
    }
  },
  {
    step: 2,
    id: 'add-crop',
    icon: Sprout,
    color: '#059669',
    en: {
      title: 'Add Your Crop',
      text: 'Use Add Crop to list the crops you want to sell. You can enter the crop name, variety, quantity, expected price, quality, harvest date and location.',
      voiceText: 'Use Add Crop to list the crops you want to sell. Enter crop name, variety, quantity, price, harvest date and location.'
    },
    te: {
      title: 'మీ పంటను జోడించండి',
      text: 'మీరు విక్రయించాలనుకుంటున్న పంటలను జాబితా చేయడానికి పంటను జోడించండి ఉపయోగించండి. పంట పేరు, రకం, పరిమాణం, ఆశించిన ధర, నాణ్యత మరియు తేదీని నమోదు చేయవచ్చు.',
      voiceText: 'మీరు అమ్మాలనుకుంటున్న పంట వివరాలు, పరిమాణం మరియు ధరను జోడించండి.'
    },
    hi: {
      title: 'अपनी फसल जोड़ें',
      text: 'अपनी फसलों को बेचने के लिए फसल जोड़ें विकल्प का उपयोग करें। आप फसल का नाम, किस्म, मात्रा, अपेक्षित मूल्य और स्थान दर्ज कर सकते हैं।',
      voiceText: 'अपनी फसलों को बेचने के लिए फसल जोड़ें विकल्प का उपयोग करें और विवरण दर्ज करें।'
    }
  },
  {
    step: 3,
    id: 'camera',
    icon: Camera,
    color: '#0ea5e9',
    en: {
      title: 'Camera & Photo Upload',
      text: 'You can use your phone camera to capture a photo of your crop. You can review the photo before uploading it.',
      voiceText: 'You can use your phone camera to capture a photo of your crop. You can review the photo before uploading it.'
    },
    te: {
      title: 'కెమెరా మరియు ఫోటో అప్‌లోడ్',
      text: 'మీ పంట ఫోటోను తీయడానికి మీరు మీ ఫోన్ కెమెరాను ఉపయోగించవచ్చు. అప్‌లోడ్ చేయడానికి ముందు మీరు ఫోటోను సమీక్షించవచ్చు.',
      voiceText: 'మీ పంట ఫోటోను కెమెరాతో తీసి సమీక్షించిన తర్వాత అప్‌లోడ్ చేయండి.'
    },
    hi: {
      title: 'कैमरा और फोटो अपलोड',
      text: 'आप अपनी फसल की तस्वीर लेने के लिए अपने फ़ोन कैमरे का उपयोग कर सकते हैं। अपलोड करने से पहले आप तस्वीर की समीक्षा कर सकते हैं।',
      voiceText: 'अपनी फसल की तस्वीर लेने के लिए कैमरे का उपयोग करें और समीक्षा के बाद अपलोड करें।'
    }
  },
  {
    step: 4,
    id: 'crop-scanner',
    icon: ScanLine,
    color: '#8b5cf6',
    en: {
      title: 'AI Crop Scanner',
      text: 'AgriNex can use AI-assisted image analysis to help identify the crop and provide an analysis. AI results may not always be accurate, so verify important information yourself.',
      voiceText: 'AgriNex can use AI-assisted image analysis to help identify the crop and provide leaf analysis. Verify critical info yourself.'
    },
    te: {
      title: 'AI పంట స్కానర్',
      text: 'పంట ఆరోగ్యం మరియు నాణ్యతను విశ్లేషించడానికి అగ్రినెక్స్ AI సాంకేతికతను ఉపయోగిస్తుంది. AI సలహా సహాయక సాధనం, ముఖ్యమైన సమాచారాన్ని స్వయంగా ధృవీకరించుకోండి.',
      voiceText: 'పంట నాణ్యత మరియు ఆకు ఆరోగ్యాన్ని తనిఖీ చేయడానికి AI స్కానర్ ఉపయోగపడుతుంది.'
    },
    hi: {
      title: 'एआई फसल स्कैनर',
      text: 'फसल की गुणवत्ता और स्वास्थ्य का विश्लेषण करने के लिए एआई स्कैनर का उपयोग करें। महत्वपूर्ण जानकारी को स्वयं भी सत्यापित करें।',
      voiceText: 'फसल की गुणवत्ता और स्वास्थ्य विश्लेषण के लिए एआई फसल स्कैनर का उपयोग करें।'
    }
  },
  {
    step: 5,
    id: 'marketplace',
    icon: Store,
    color: '#f59e0b',
    en: {
      title: 'Marketplace Discovery',
      text: 'Your crop listing can be discovered by bulk buyers across India through the AgriNex direct marketplace.',
      voiceText: 'Your crop listing can be discovered by buyers across India through the AgriNex marketplace.'
    },
    te: {
      title: 'మార్కెట్‌ప్లేస్ గుర్తింపు',
      text: 'మీ పంట జాబితాను అగ్రినెక్స్ మార్కెట్‌ప్లేస్ ద్వారా భారతదేశం అంతటా ఉన్న బల్క్ కొనుగోలుదారులు చూడవచ్చు.',
      voiceText: 'మీ పంట జాబితాను దేశవ్యాప్తంగా ఉన్న హోల్‌సేల్ కొనుగోలుదారులు నేరుగా చూడవచ్చు.'
    },
    hi: {
      title: 'मार्केटप्लेस में खोज',
      text: 'आपकी फसल की सूची को भारत भर के खरीदार एग्रीनेक्स मार्केटप्लेस के माध्यम से सीधे देख सकते हैं।',
      voiceText: 'आपकी फसल को देश भर के बड़े खरीदार सीधे मार्केटप्लेस में खोज सकते हैं।'
    }
  },
  {
    step: 6,
    id: 'offers',
    icon: Scale,
    color: '#10b981',
    en: {
      title: 'Offers & Negotiation',
      text: 'Buyers can send offers for your crops. You can accept, reject or send a counter-offer in real time without middlemen.',
      voiceText: 'Buyers can send offers for your crops. You can accept, reject or send a counter-offer in real time.'
    },
    te: {
      title: 'ఆఫర్లు మరియు ధర చర్చలు',
      text: 'కొనుగోలుదారులు మీ పంటలకు ఆఫర్లను పంపవచ్చు. మీరు దళారుల ప్రమేయం లేకుండా అంగీకరించవచ్చు, తిరస్కరించవచ్చు లేదా కౌంటర్-ఆఫర్ పంపవచ్చు.',
      voiceText: 'కొనుగోలుదారుల ఆఫర్లను పరిశీలించి కౌంటర్-ఆఫర్ పంపడం ద్వారా ఉత్తమ ధర పొందవచ్చు.'
    },
    hi: {
      title: 'ऑफ़र और बातचीत',
      text: 'खरीदार आपकी फसलों के लिए ऑफ़र भेज सकते हैं। आप बिना किसी बिचौलिए के ऑफ़र स्वीकार, अस्वीकार या काउंटर-ऑफ़र कर सकते हैं।',
      voiceText: 'खरीदारों के ऑफ़र देखें और सर्वोत्तम मूल्य के लिए तुरंत बातचीत करें।'
    }
  },
  {
    step: 7,
    id: 'chat',
    icon: MessageSquare,
    color: '#06b6d4',
    en: {
      title: 'Secure Buyer Chat',
      text: 'Use secure chat to communicate directly with buyers during negotiation while keeping your contact details safe.',
      voiceText: 'Use secure chat to communicate with buyers during negotiation.'
    },
    te: {
      title: 'సురక్షిత చాట్',
      text: 'చర్చల సమయంలో కొనుగోలుదారులతో నేరుగా మరియు సురక్షితంగా మాట్లాడటానికి చాట్ ఉపయోగించండి.',
      voiceText: 'కొనుగోలుదారులతో నేరుగా సంభాషించడానికి సురక్షిత చాట్ ఉపయోగించండి.'
    },
    hi: {
      title: 'सुरक्षित चैट',
      text: 'बातचीत के दौरान खरीदारों से सीधे और सुरक्षित रूप से संवाद करने के लिए चैट का उपयोग करें।',
      voiceText: 'खरीदारों से सीधे संपर्क के लिए सुरक्षित चैट का उपयोग करें।'
    }
  },
  {
    step: 8,
    id: 'orders',
    icon: Package,
    color: '#3b82f6',
    en: {
      title: 'Order Processing',
      text: 'After accepting an offer, you can follow the order from escrow payment locking through harvest dispatch and delivery.',
      voiceText: 'After accepting an offer, follow the order from payment through delivery.'
    },
    te: {
      title: 'ఆర్డర్ల నిర్వహణ',
      text: 'ఆఫర్‌ను అంగీకరించిన తర్వాత, ఎస్క్రో చెల్లింపు లాకింగ్ నుండి డెలివరీ వరకు ఆర్డర్‌ను ట్రాక్ చేయవచ్చు.',
      voiceText: 'ఆర్డర్ పురోగతిని సులభంగా అనుసరించండి.'
    },
    hi: {
      title: 'ऑर्डर प्रबंधन',
      text: 'ऑफ़र स्वीकार करने के बाद, भुगतान लॉकिंग से लेकर डिलीवरी तक ऑर्डर की स्थिति देखें।',
      voiceText: 'ऑफ़र स्वीकार होने पर डिलीवरी तक ऑर्डर की प्रगति देखें।'
    }
  },
  {
    step: 9,
    id: 'tracking',
    icon: Truck,
    color: '#f97316',
    en: {
      title: 'Live GPS Fleet Tracking',
      text: 'You can track the transporter vehicle and cold-chain temperature progress in real-time until warehouse arrival.',
      voiceText: 'You can track the transporter and delivery progress with GPS telematics.'
    },
    te: {
      title: 'లైవ్ GPS రవాణా ట్రాకింగ్',
      text: 'మీరు ట్రాన్స్‌పోర్టర్ వాహనం మరియు ఉష్ణోగ్రత పురోగతిని నిజ సమయంలో ట్రాక్ చేయవచ్చు.',
      voiceText: 'శీతలీకరించిన వాహనాల రవాణాను లైవ్ GPS తో ట్రాక్ చేయండి.'
    },
    hi: {
      title: 'लाइव जीपीएस फ्लीट ट्रैकिंग',
      text: 'आप वाहन और तापमान की प्रगति को वास्तविक समय में ट्रैक कर सकते हैं।',
      voiceText: 'वाहन और डिलीवरी की प्रगति को लाइव जीपीएस से ट्रैक करें।'
    }
  },
  {
    step: 10,
    id: 'earnings',
    icon: DollarSign,
    color: '#10b981',
    en: {
      title: 'Earnings & Escrow Payouts',
      text: 'After completed orders and OTP verification, your earnings are released directly to your account with zero default risk.',
      voiceText: 'After completed orders, your earnings and transaction history are available in your dashboard.'
    },
    te: {
      title: 'ఆదాయం మరియు చెల్లింపులు',
      text: 'డెలివరీ ధృవీకరణ పూర్తయిన తర్వాత, మీ నిధులు ఎటువంటి నష్టం లేకుండా నేరుగా మీ ఖాతాకు బదిలీ చేయబడతాయి.',
      voiceText: 'ఆర్డర్ పూర్తయిన వెంటనే మీ ఆదాయం సురక్షితంగా అందుతుంది.'
    },
    hi: {
      title: 'कमाई और भुगतान',
      text: 'डिलीवरी सत्यापन के बाद, आपकी कमाई बिना किसी जोखिम के सीधे आपके खाते में जारी की जाती है।',
      voiceText: 'ऑर्डर पूरा होने पर आपकी कमाई सुरक्षित रूप से जारी की जाती है।'
    }
  },
  {
    step: 11,
    id: 'prices',
    icon: TrendingUp,
    color: '#ec4899',
    en: {
      title: 'Price Discovery & APMC Trends',
      text: 'Price Discovery helps you understand live market-price information, modal mandi rates, and seasonal trends to price your crops competitively.',
      voiceText: 'Price Discovery helps you understand available market prices and historical trends.'
    },
    te: {
      title: 'ధర పరిశోధన మరియు APMC పోకడలు',
      text: 'తాజా మార్కెట్ ధరలు మరియు మండి రేట్లను పరిశీలించి మీ పంటకు సరైన ధరను నిర్ణయించుకోవడానికి ఇది సహాయపడుతుంది.',
      voiceText: 'మార్కెట్ మండి ధరల సమాచారం పరిశీలించి సరైన ధర నిర్ణయించండి.'
    },
    hi: {
      title: 'मूल्य खोज और मंडी रुझान',
      text: 'मूल्य खोज आपको वास्तविक समय के बाजार मूल्यों और मंडी दरों को समझकर उचित मूल्य तय करने में मदद करती है।',
      voiceText: 'ताजा मंडी भाव और रुझान देखकर अपनी फसल का सही दाम तय करें।'
    }
  }
];
