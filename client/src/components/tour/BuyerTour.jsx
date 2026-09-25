// AgriNex Buyer Guided Tour Data - 11 Steps in English, Telugu (తెలుగు), and Hindi (हिन्दी)
import {
  LayoutDashboard,
  Store,
  FileText,
  ClipboardList,
  Sparkles,
  Scale,
  MessageSquare,
  FileCheck,
  CreditCard,
  Truck,
  CheckCircle2
} from 'lucide-react';

export const buyerTourSteps = [
  {
    step: 1,
    id: 'dashboard',
    icon: LayoutDashboard,
    color: '#0ea5e9',
    en: {
      title: 'Buyer Dashboard',
      text: 'Welcome to your Buyer Dashboard. Here you can discover crops, manage requirements, offers, orders and purchases.',
      voiceText: 'Welcome to your Buyer Dashboard. Here you can discover crops, manage requirements, offers, orders and purchases.'
    },
    te: {
      title: 'కొనుగోలుదారు డ్యాష్‌బోర్డ్',
      text: 'మీ కొనుగోలుదారు డ్యాష్‌బోర్డ్‌కు స్వాగతం. ఇక్కడ మీరు పంటలను కనుగొనవచ్చు, అవసరాలు, ఆఫర్లు, ఆర్డర్లు మరియు కొనుగోళ్లను నిర్వహించవచ్చు.',
      voiceText: 'మీ కొనుగోలుదారు డ్యాష్‌బోర్డ్‌కు స్వాగతం. మీ కొనుగోళ్లను ఇక్కడ సులభంగా నిర్వహించండి.'
    },
    hi: {
      title: 'क्रेता डैशबोर्ड',
      text: 'आपके क्रेता डैशबोर्ड में आपका स्वागत है। यहां आप फसलें खोज सकते हैं, आवश्यकताओं, ऑफ़र और खरीदारी का प्रबंधन कर सकते हैं।',
      voiceText: 'आपके क्रेता डैशबोर्ड में आपका स्वागत है। यहां आप अपनी थोक खरीद आसानी से प्रबंधित कर सकते हैं।'
    }
  },
  {
    step: 2,
    id: 'marketplace',
    icon: Store,
    color: '#10b981',
    en: {
      title: 'Agricultural Marketplace',
      text: 'Search for crops directly from verified farmers using crop category, location, quantity, quality grade and price filters.',
      voiceText: 'Search for crops from farmers using crop, location, quantity, quality and price filters.'
    },
    te: {
      title: 'వ్యవసాయ మార్కెట్‌ప్లేస్',
      text: 'పంట వర్గం, ప్రాంతం, పరిమాణం, నాణ్యత మరియు ధర ఫిల్టర్లను ఉపయోగించి నేరుగా రైతు పంటలను శోధించండి.',
      voiceText: 'పంట నాణ్యత, ధర మరియు ప్రాంతం ఆధారంగా తాజా పంటలను శోధించండి.'
    },
    hi: {
      title: 'कृषि मार्केटप्लेस',
      text: 'फसल श्रेणी, स्थान, मात्रा, गुणवत्ता और मूल्य फ़िल्टर का उपयोग करके किसानों से सीधे फसलें खोजें।',
      voiceText: 'स्थान, मात्रा और मूल्य के अनुसार किसानों की सीधी फसलें खोजें।'
    }
  },
  {
    step: 3,
    id: 'crop-details',
    icon: FileText,
    color: '#8b5cf6',
    en: {
      title: 'Crop Inspection & Details',
      text: 'Open any crop listing to view the verified farmer profile, harvest photos, quantity, price, location and AI freshness grade.',
      voiceText: 'Open a crop listing to view the farmer, quantity, price, quality, location and availability.'
    },
    te: {
      title: 'పంట పూర్తి వివరాలు',
      text: 'రైతు ప్రొఫైల్, ఫోటోలు, పరిమాణం, ధర, నాణ్యత మరియు అందుబాటును చూడటానికి పంట జాబితాను తెరవండి.',
      voiceText: 'పంట నాణ్యత మరియు రైతు వివరాలను సులభంగా పరిశీలించండి.'
    },
    hi: {
      title: 'फसल का संपूर्ण विवरण',
      text: 'किसान, मात्रा, कीमत, गुणवत्ता, स्थान और उपलब्धता देखने के लिए किसी भी फसल सूची को खोलें।',
      voiceText: 'फसल की गुणवत्ता और किसान विवरण की जांच करें।'
    }
  },
  {
    step: 4,
    id: 'requirements',
    icon: ClipboardList,
    color: '#f59e0b',
    en: {
      title: 'Post Buying Requirements',
      text: 'Create procurement tenders for the crops, quantities, target pricing and delivery locations you need.',
      voiceText: 'Create buying requirements for the crops and quantities you need.'
    },
    te: {
      title: 'కొనుగోలు అవసరాలను పోస్ట్ చేయండి',
      text: 'మీకు అవసరమైన పంటలు, పరిమాణాలు మరియు ధరల కోసం కొనుగోలు అవసరాలను సులభంగా పోస్ట్ చేయండి.',
      voiceText: 'మీకు కావలసిన పంట మరియు పరిమాణం కోసం కొనుగోలు టెండర్ పోస్ట్ చేయండి.'
    },
    hi: {
      title: 'खरीद आवश्यकताएं पोस्ट करें',
      text: 'अपनी आवश्यकता के अनुसार फसलों, मात्राओं और लक्षित कीमतों के लिए आवश्यकताएं बनाएं।',
      voiceText: 'अपनी आवश्यकता के अनुसार फसलों और मात्रा के लिए मांग पोस्ट करें।'
    }
  },
  {
    step: 5,
    id: 'matching',
    icon: Sparkles,
    color: '#06b6d4',
    en: {
      title: 'Smart Farmer Matching',
      text: 'AgriNex uses automated matching to identify regional farmers who match your exact crop, volume, price and logistics needs.',
      voiceText: 'AgriNex can help identify farmers who match your crop, quantity, price, quality and location needs.'
    },
    te: {
      title: 'స్మార్ట్ రైతు సరిపోలిక',
      text: 'మీ పంట, పరిమాణం, ధర మరియు ప్రాంతానికి సరిపోయే సమీప రైతులను అగ్రినెక్స్ ఆటోమేటిక్‌గా గుర్తిస్తుంది.',
      voiceText: 'మీ అవసరాలకు సరిపోయే ఉత్తమ రైతులను అగ్రినెక్స్ సిఫార్సు చేస్తుంది.'
    },
    hi: {
      title: 'स्मार्ट किसान मिलान',
      text: 'एग्रीनेक्स आपकी सटीक फसल, मात्रा, मूल्य और स्थान की जरूरतों से मेल खाने वाले किसानों की पहचान करता है।',
      voiceText: 'आपकी जरूरतों से मेल खाने वाले किसानों को सिस्टम आसानी से खोजता है।'
    }
  },
  {
    step: 6,
    id: 'offers',
    icon: Scale,
    color: '#10b981',
    en: {
      title: 'Direct Counter-Bidding',
      text: 'Send purchase offers directly to farmers and negotiate transparent pricing through structured counter-offers.',
      voiceText: 'Send an offer to a farmer and negotiate the price through counter-offers.'
    },
    te: {
      title: 'ప్రత్యక్ష ధర చర్చలు',
      text: 'రైతుకు నేరుగా ఆఫర్ పంపండి మరియు కౌంటర్-ఆఫర్ల ద్వారా ధరను పారదర్శకంగా చర్చించండి.',
      voiceText: 'రైతుకు ఆఫర్ పంపి సరసమైన ధర కోసం చర్చించండి.'
    },
    hi: {
      title: 'सीधी बातचीत और ऑफ़र',
      text: 'किसान को सीधे ऑफ़र भेजें और काउंटर-ऑफ़र के माध्यम से पारदर्शी बातचीत करें।',
      voiceText: 'किसान को सीधे ऑफ़र भेजें और उचित मूल्य तय करें।'
    }
  },
  {
    step: 7,
    id: 'chat',
    icon: MessageSquare,
    color: '#3b82f6',
    en: {
      title: 'Encrypted Farmer Chat',
      text: 'Use secure chat to communicate harvest specifications, packaging and delivery timelines with the farmer.',
      voiceText: 'Use secure chat to communicate directly with the farmer.'
    },
    te: {
      title: 'ఎన్‌క్రిప్ట్ చేసిన చాట్',
      text: 'ప్యాకింగ్ మరియు డెలివరీ వివరాలను రైతుతో చర్చించడానికి సురక్షిత చాట్ ఉపయోగించండి.',
      voiceText: 'రైతుతో నేరుగా సంభాషించడానికి సురక్షిత చాట్ ఉపయోగించండి.'
    },
    hi: {
      title: 'सुरक्षित चैट',
      text: 'पैकिंग और डिलीवरी के समय पर चर्चा करने के लिए किसान के साथ सुरक्षित चैट का उपयोग करें।',
      voiceText: 'किसान से सीधे संपर्क के लिए सुरक्षित चैट का उपयोग करें।'
    }
  },
  {
    step: 8,
    id: 'contract',
    icon: FileCheck,
    color: '#8b5cf6',
    en: {
      title: 'Digital Legal Contract',
      text: 'After an offer is accepted, AgriNex generates a tamper-proof digital contract defining quantity, price, quality and timeline terms.',
      voiceText: 'After an offer is accepted, AgriNex can generate a digital contract.'
    },
    te: {
      title: 'డిజిటల్ ఒప్పందం',
      text: 'ఆఫర్ ఆమోదించబడిన తర్వాత, నిబంధనలతో కూడిన డిజిటల్ లీగల్ ఒప్పందం ఆటోమేటిక్‌గా రూపొందించబడుతుంది.',
      voiceText: 'ఆఫర్ ఖరారైన తర్వాత డిజిటల్ కాంట్రాక్ట్ రూపొందించబడుతుంది.'
    },
    hi: {
      title: 'डिजिटल अनुबंध',
      text: 'ऑफ़र स्वीकार होने के बाद, एग्रीनेक्स कानूनी शर्तों के साथ एक डिजिटल अनुबंध तैयार करता है।',
      voiceText: 'ऑफ़र पक्का होने पर डिजिटल अनुबंध स्वतः तैयार होता है।'
    }
  },
  {
    step: 9,
    id: 'payment',
    icon: CreditCard,
    color: '#f97316',
    en: {
      title: '100% Escrow Fund Locking',
      text: 'Complete payment into secure escrow. Funds remain protected and are only released after you inspect the delivered produce.',
      voiceText: 'Complete the demo payment using the available payment methods.'
    },
    te: {
      title: 'ఎస్క్రో చెల్లింపు రక్షణ',
      text: 'నిధులను ఎస్క్రో ఖాతాలో భద్రపరచండి. మీరు పంటను పరిశీలించిన తర్వాత మాత్రమే చెల్లింపు విడుదల చేయబడుతుంది.',
      voiceText: 'మీ చెల్లింపు ఎస్క్రోలో పూర్తిగా సురక్షితంగా ఉంటుంది.'
    },
    hi: {
      title: 'एस्क्रो भुगतान सुरक्षा',
      text: 'भुगतान को सुरक्षित एस्क्रो में जमा करें। फसल प्राप्त और सत्यापित करने के बाद ही राशि जारी होती है।',
      voiceText: 'सुरक्षित एस्क्रो भुगतान के साथ पूरी सुरक्षा पाएं।'
    }
  },
  {
    step: 10,
    id: 'tracking',
    icon: Truck,
    color: '#0ea5e9',
    en: {
      title: 'Refrigerated Fleet Tracking',
      text: 'Track the delivery vehicle, ETA, and live compartment temperature in real time from farm gate to your warehouse.',
      voiceText: 'Track the delivery status after a transporter has been assigned.'
    },
    te: {
      title: 'రవాణా వాహన ట్రాకింగ్',
      text: 'ఫామ్ నుండి మీ గిడ్డంగి వరకు వాహనం మరియు ఉష్ణోగ్రతను లైవ్ మ్యాప్‌లో ట్రాక్ చేయండి.',
      voiceText: 'వాహన రాక మరియు ఉష్ణోగ్రతను లైవ్ GPS ద్వారా ట్రాక్ చేయండి.'
    },
    hi: {
      title: 'फ्लीट ट्रैकिंग',
      text: 'खेत से अपने गोदाम तक वाहन और तापमान की वास्तविक समय में निगरानी करें।',
      voiceText: 'वाहन और माल की स्थिति को लाइव जीपीएस से ट्रैक करें।'
    }
  },
  {
    step: 11,
    id: 'delivery',
    icon: CheckCircle2,
    color: '#10b981',
    en: {
      title: 'Delivery Confirmation & Handshake',
      text: 'Confirm physical delivery using the 6-digit delivery OTP once you inspect and approve the harvest quality.',
      voiceText: 'Confirm the delivery using the delivery process and OTP where required.'
    },
    te: {
      title: 'డెలివరీ నిర్ధారణ',
      text: 'పంట నాణ్యతను తనిఖీ చేసిన తర్వాత 6-అంకెల డెలివరీ OTP ఉపయోగించి డెలివరీని ధృవీకరించండి.',
      voiceText: 'పంటను పరిశీలించి డెలివరీ OTP తో ఆర్డర్ పూర్తి చేయండి.'
    },
    hi: {
      title: 'डिलीवरी पुष्टि',
      text: 'फसल की गुणवत्ता जांचने के बाद 6-अंकीय ओटीपी देकर डिलीवरी की पुष्टि करें।',
      voiceText: 'फसल की जांच के बाद ओटीपी देकर सुरक्षित रूप से डिलीवरी पूरी करें।'
    }
  }
];
