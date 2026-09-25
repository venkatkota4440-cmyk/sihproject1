// AgriNex AI Assistant Service
// Role-Aware, Context-Driven, Multilingual Knowledge & Action Engine

const db = require('../config/db');
const marketDataService = require('./marketDataService');
const pricePredictionService = require('./pricePredictionService');

class AssistantService {
  constructor() {
    this.historyCollection = 'assistantHistory';
  }

  // Detect script/language from text if explicit lang not passed
  detectLanguage(text, explicitLang) {
    if (explicitLang && explicitLang !== 'en') return explicitLang;
    if (!text) return 'en';

    // Devanagari script (Hindi / Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
      // Basic heuristic for Marathi vs Hindi
      if (/आहे|नाही|कसे|काय|शेतकरी|बाजार/.test(text)) return 'mr';
      return 'hi';
    }
    // Telugu script
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    // Tamil script
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    // Kannada script
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';

    return explicitLang || 'en';
  }

  // Generate intelligent role-aware answer with real platform data integration
  async generateResponse(user, message, lang = 'en') {
    const role = user?.role || 'GUEST';
    const effectiveLang = this.detectLanguage(message, lang);

    if (!message || typeof message !== 'string') {
      return this.getFallbackGreeting(role, effectiveLang);
    }

    const query = message.trim().toLowerCase();

    // 1. Farmer Specific Queries
    if (role === 'FARMER') {
      // Query: Active Crop Listings / My Crops
      if (query.includes('my crop') || query.includes('active listing') || query.includes('crops listed') ||
          query.includes('मेरी फसल') || query.includes('నా పంటలు') || query.includes('माझे पीक')) {
        const myCrops = db.find('crops', { farmerId: user.id }) || [];
        if (myCrops.length === 0) {
          if (effectiveLang === 'hi') {
            return {
              reply: `एग्रीनेक्स पर वर्तमान में आपकी कोई सक्रिय फसल लिस्टिंग नहीं है। क्या आप अभी अपनी फसल जोड़ना चाहते हैं?`,
              action: { label: '🌱 अपनी पहली फसल जोड़ें', path: '/farmer/add-crop' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: "वर्तमान में आपकी कोई फसल लिस्टिंग नहीं है। आप अभी अपनी पहली फसल जोड़ सकते हैं।"
            };
          }
          if (effectiveLang === 'te') {
            return {
              reply: `అగ్రినెక్స్‌లో ప్రస్తుతం మీ క్రియాశీల పంట జాబితాలు లేవు. మీరు ఇప్పుడే ఒక పంటను జోడించాలనుకుంటున్నారా?`,
              action: { label: '🌱 మీ మొదటి పంటను జోడించండి', path: '/farmer/add-crop' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: "ప్రస్తుతం మీ పంట జాబితాలు ఏవీ లేవు. మీరు ఇప్పుడే పంట వివరాలు నమోదు చేయవచ్చు."
            };
          }
          if (effectiveLang === 'mr') {
            return {
              reply: `ॲग्रीनेक्सवर सध्या आपली कोणतीही सक्रिय पीक लिस्टिंग नाही. आपण आता नवीन पीक जोडू इच्छिता का?`,
              action: { label: '🌱 पहिले पीक जोडा', path: '/farmer/add-crop' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: "सध्या आपली कोणतीही पीक नोंदणी नाही. आपण आता नवीन पीक जोडू शकता."
            };
          }

          return {
            reply: `You currently do not have any active crop listings on AgriNex. Would you like to add one right now?`,
            action: { label: '🌱 Add Your First Crop', path: '/farmer/add-crop' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: "You currently have no active crop listings. You can add your first crop now."
          };
        }

        const cropSummary = myCrops.slice(0, 4).map(c => `• **${c.cropName} (${c.variety || 'Standard'})**: ${c.quantityKg} kg @ ₹${c.pricePerKg}/kg (${c.status || 'Active'})`).join('\n');
        
        if (effectiveLang === 'hi') {
          return {
            reply: `आपकी **${myCrops.length} सक्रिय फसल लिस्टिंग(s)** हैं:\n\n${cropSummary}\n\nआप अपने डैशबोर्ड से भाव, मात्रा या नई तस्वीरें अपडेट कर सकते हैं।`,
            action: { label: '🌾 मेरी सभी फसलें देखें', path: '/farmer/my-crops' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: `आपकी ${myCrops.length} फसल लिस्टिंग सक्रिय हैं। विवरण के लिए अपनी फसल सूची देखें।`
          };
        }
        if (effectiveLang === 'te') {
          return {
            reply: `మీ వద్ద **${myCrops.length} క్రియాశీల పంట జాబితా(లు)** ఉన్నాయి:\n\n${cropSummary}\n\nమీరు పంటల విభాగం నుండి ధరలు లేదా ఫోటోలను నవీకరించవచ్చు.`,
            action: { label: '🌾 నా పంటలన్నీ చూడండి', path: '/farmer/my-crops' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: `మీ వద్ద ${myCrops.length} యాక్టివ్ పంట లిస్టింగ్‌లు ఉన్నాయి. మరిన్ని వివరాలు డాష్‌బోర్డ్‌లో చూడండి.`
          };
        }

        return {
          reply: `You have **${myCrops.length} active crop listing(s)**:\n\n${cropSummary}\n\nYou can update prices, quantities, or upload new harvest photos from your crops panel.`,
          action: { label: '🌾 View All My Crops', path: '/farmer/my-crops' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: `You have ${myCrops.length} active crop listings. Check your crops page for details.`
        };
      }

      // Query: Offers Received
      if (query.includes('offer') || query.includes('bid') || query.includes('counter') ||
          query.includes('ऑफर') || query.includes('ఆఫర్లు') || query.includes('बोली')) {
        const offers = db.find('offers', { farmerId: user.id }) || [];
        const pendingOffers = offers.filter(o => o.status === 'PENDING' || o.status === 'COUNTERED');
        if (pendingOffers.length === 0) {
          if (effectiveLang === 'hi') {
            return {
              reply: `वर्तमान में आपके पास कोई लंबित ऑफर नहीं है। खरीदार द्वारा फसल देखने पर ऑफर सीधे आपके डैशबोर्ड पर आएंगे।`,
              action: { label: '📊 ऑफर इतिहास देखें', path: '/farmer/offers' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: "अभी आपके पास कोई लंबित ऑफर नहीं है।"
            };
          }
          if (effectiveLang === 'te') {
            return {
              reply: `ప్రస్తుతం మీకు ఎలాంటి పెండింగ్ ఆఫర్‌లు లేవు. కొనుగోలుదారులు మీ పంటను చూసినప్పుడు నేరుగా ఆఫర్లు పంపుతారు.`,
              action: { label: '📊 ఆఫర్ల చరిత్ర చూడండి', path: '/farmer/offers' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: "ప్రస్తుతం మీకు ఎటువంటి పెండింగ్ ఆఫర్లు లేవు."
            };
          }

          return {
            reply: `You have no pending offers right now. Active buyers browsing the marketplace will send counter-offers directly to your dashboard once they view your produce.`,
            action: { label: '📊 View Offers History', path: '/farmer/offers' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: "You have no pending offers right now."
          };
        }

        const firstOffer = pendingOffers[0];
        if (effectiveLang === 'hi') {
          return {
            reply: `आपके पास **${pendingOffers.length} लंबित ऑफर** समीक्षा के लिए उपलब्ध हैं!\n\n**${firstOffer.cropName || 'फसल'}** के लिए ताज़ा प्रस्ताव: ₹${firstOffer.offeredPricePerKg}/kg (${firstOffer.quantityKg} kg के लिए)।\n\nआप 100% सुरक्षित एस्क्रो के साथ स्वीकार या काउंटर-ऑफर कर सकते हैं।`,
            action: { label: '🤝 ऑफर समीक्षा व बातचीत', path: '/farmer/offers' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: `आपके पास ${pendingOffers.length} नए ऑफर आए हुए हैं।`
          };
        }
        if (effectiveLang === 'te') {
          return {
            reply: `మీ సమీక్ష కోసం **${pendingOffers.length} పెండింగ్ ఆఫర్‌లు** వేచి ఉన్నాయి!\n\n**${firstOffer.cropName || 'పంట'}** కోసం తాజా ఆఫర్: ₹${firstOffer.offeredPricePerKg}/కేజీ (${firstOffer.quantityKg} కేజీలకు).\n\nమీరు 100% ఎస్క్రో భద్రతతో దీన్ని అంగీకరించవచ్చు లేదా కౌంటర్ ఆఫర్ పంపవచ్చు.`,
            action: { label: '🤝 ఆఫర్ల సమీక్ష', path: '/farmer/offers' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: `మీ వద్ద ${pendingOffers.length} పెండింగ్ ఆఫర్లు ఉన్నాయి.`
          };
        }

        return {
          reply: `You have **${pendingOffers.length} pending offer(s)** waiting for your review!\n\nLatest offer for **${firstOffer.cropName || 'Crop'}**: ₹${firstOffer.offeredPricePerKg}/kg for ${firstOffer.quantityKg} kg.\n\nYou can accept, reject, or submit a counter-offer with 100% escrow protection.`,
          action: { label: '🤝 Review & Negotiate Offers', path: '/farmer/offers' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: `You have ${pendingOffers.length} pending offers waiting for your review.`
        };
      }

      // Query: Earnings & Payouts
      if (query.includes('earning') || query.includes('payout') || query.includes('money') || query.includes('profit') ||
          query.includes('कमाई') || query.includes('आवक') || query.includes('చెల్లింపు') || query.includes('ఆదాయం')) {
        const orders = db.find('orders', { farmerId: user.id }) || [];
        const completed = orders.filter(o => o.status === 'DELIVERED' || o.paymentStatus === 'RELEASED');
        const totalEarnings = completed.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        if (effectiveLang === 'hi') {
          return {
            reply: `आपकी कुल पूरी हुई बिक्री आय **₹${totalEarnings.toLocaleString('en-IN')}** है (${completed.length} सफल ऑर्डर)।\n\nडिलीवरी ओटीपी सत्यापन के तुरंत बाद सभी एस्क्रो फंड सीधे आपके बैंक खाते में 0% कटौती के साथ जमा हो जाते हैं।`,
            action: { label: '💰 मेरी कमाई देखें', path: '/farmer/earnings' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: `आपकी कुल बिक्री आय ₹${totalEarnings.toLocaleString('en-IN')} रुपये है। सभी भुगतान 100% सुरक्षित हैं।`
          };
        }
        if (effectiveLang === 'te') {
          return {
            reply: `మీ మొత్తం పూర్తయిన అమ్మకాల ఆదాయం **₹${totalEarnings.toLocaleString('en-IN')}** (${completed.length} విజయవంతమైన ఆర్డర్లు).\n\nడెలివరీ ఓటీపీ ధృవీకరించిన వెంటనే అన్ని ఎస్క్రో నిధులు సున్నా శాతం కమీషన్‌తో నేరుగా మీ బ్యాంకు ఖాతాకు బదిలీ చేయబడతాయి.`,
            action: { label: '💰 నా సంపాదన వివరాలు', path: '/farmer/earnings' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: `మీ మొత్తం ఆదాయం ₹${totalEarnings.toLocaleString('en-IN')} రూపాయలు.`
          };
        }

        return {
          reply: `Your total completed sales earnings stand at **₹${totalEarnings.toLocaleString('en-IN')}** across ${completed.length} successfully delivered orders.\n\nAll escrow funds are released instantly to your bank account upon delivery OTP verification.`,
          action: { label: '💰 Check My Earnings', path: '/farmer/earnings' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: `Your total completed earnings stand at ${totalEarnings.toLocaleString('en-IN')} rupees.`
        };
      }
    }

    // 2. Buyer Specific Queries
    if (role === 'BUYER') {
      if (query.includes('order') || query.includes('status') || query.includes('shipment') || query.includes('ऑर्डर') || query.includes('ఆర్డర్')) {
        const myOrders = db.find('orders', { buyerId: user.id }) || [];
        if (myOrders.length === 0) {
          if (effectiveLang === 'hi') {
            return {
              reply: `आपने अभी तक कोई ऑर्डर नहीं दिया है। आप थोक मंडी से ताज़ा फसल खोज सकते हैं और सीधे ऑफर भेज सकते हैं।`,
              action: { label: '🛒 मार्केटप्लेस देखें', path: '/marketplace' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: "आपने अभी तक कोई ऑर्डर नहीं दिया है। मार्केटप्लेस पर ताज़ा फसल खोजें।"
            };
          }
          if (effectiveLang === 'te') {
            return {
              reply: `మీరు ఇంకా ఎలాంటి ఆర్డర్‌లు ఇవ్వలేదు. ధృవీకరించబడిన రైతుల పంటలను చూడటానికి మార్కెట్‌ప్లేస్‌ను సందర్శించండి.`,
              action: { label: '🛒 మార్కెట్‌ప్లేస్ చూడండి', path: '/marketplace' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: "మీరు ఇంకా ఎటువంటి ఆర్డర్లు ఇవ్వలేదు. మార్కెట్‌ప్లేస్ బ్రౌజ్ చేయండి."
            };
          }
        }
      }
    }

    // 3. Complete App Features Guide (All 10 Core Features)
    if (query.includes('all feature') || query.includes('every feature') || query.includes('explain the app') ||
        query.includes('how to use') || query.includes('what can this app do') || query.includes('app guide') ||
        query.includes('complete guide') || query.includes('features and benefits') || query.includes('how does agrinex work') ||
        query.includes('सभी फीचर') || query.includes('యాప్ ఫీచర్లు') || query.includes('सर्व वैशिष्ट्ये')) {

      if (effectiveLang === 'hi') {
        return {
          reply: `🌟 **एग्रीनेक्स — सम्पूर्ण ऐप फीचर्स एवं उपयोग मार्गदर्शिका**
 
एग्रीनेक्स भारत का आधुनिक कृषि ट्रेडिंग और मूल्य खोज मंच है, जो किसानों को सीधे संस्थागत थोक खरीदारों से जोड़ता है।

यहाँ **10 मुख्य फीचर्स**, उनके **लाभ** और **उपयोग का तरीका** दिया गया है:

1. **🌾 थोक मंडी मार्केटप्लेस (/marketplace)**:
   • *लाभ*: किसान सीधे 15%–25% अधिक मुनाफे पर फसल बेचते हैं, बिचौलियों का कमीशन समाप्त।
   • *उपयोग*: फोटो, जीपीएस और ग्रेड देखकर कस्टम ऑफर दें या कार्ट में जोड़ें।

2. **📊 सरकारी एग्मार्कनेट लाइव मंडी भाव (/prices)**:
   • *लाभ*: भारत सरकार (data.gov.in) के आधिकारिक आंकड़ों से 3,000+ मंडियों के ताज़ा मॉडल, न्यूनतम व अधिकतम भाव।

3. **🔮 एआई मूल्य भविष्यवाणी (मशीन लर्निंग) (/prices)**:
   • *लाभ*: अगले 7 से 30 दिनों के मंडी भाव के अनुमान और ट्रेंड ग्राफिक्स।

4. **❄️ कोल्ड स्टोरेज बनाम तत्काल बिक्री सलाहकार (/prices)**:
   • *लाभ*: फसल के वजन में कमी और गोदाम किराए की तुलना भविष्य के भाव से करके स्पष्ट निर्णय (\`होल्ड\` या \`अभी बेचें\`) देता है।

5. **🤝 स्मार्ट सोर्सिंग व काउंटरपार्टी मैचमेकर (/prices)**:
   • *लाभ*: थोक खरीदारों की मांग को प्रमाणित किसानों के स्टॉक से तुरंत मिलाता है।

6. **⚖️ मल्टी-मंडी आर्बिट्राज डेस्क (/prices)**:
   • *लाभ*: विभिन्न मंडियों के मूल्य अंतर की पहचान कर उच्चतम मूल्य वाली मंडी में गाड़ी भेजता है।

7. **🛰️ लाइव जीपीएस फ्लीट कोल्ड-चेन ट्रैकिंग (/fleet)**:
   • *लाभ*: वातानुकूलित कंटेनर तापमान (-18°C से +4°C) और लाइव मार्ग निगरानी।

8. **🔍 एआई फसल रोग स्कैनर (/crop-scanner)**:
   • *लाभ*: पत्ती की फोटो से रोग पहचान और जैविक व रासायनिक उपचार सलाह।

9. **🔒 100% सुरक्षित एस्क्रो पेमेंट्स (/payments)**:
   • *लाभ*: UPI, कार्ड, नेट बैंकिंग या बैंक ट्रांसफर से भुगतान। डिलीवरी ओटीपी सत्यापन पर किसान को तत्काल ट्रांसफर।

10. **💰 किसान डायरेक्ट सेटलमेंट (/farmer/earnings)**:
    • *लाभ*: एनपीसीआई पेनी-ड्रॉप बैंक सत्यापन, 0% शुल्क और सीधे बैंक खाते में भुगतान।`,
          action: { label: '🧭 प्राइस डिस्कवरी हब खोलें', path: '/prices' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "एग्रीनेक्स में 10 मुख्य फीचर्स हैं: थोक मार्केटप्लेस, सरकारी एग्मार्कनेट लाइव मंडी भाव, एआई भाव भविष्यवाणी, कोल्ड स्टोरेज सलाहकार, स्मार्ट मैचमेकर, मंडी आर्बिट्राज, जीपीएस कोल्ड-चेन फ्लीट, एआई फसल स्कैनर, सुरक्षित एस्क्रो भुगतान और किसान बैंक सेटलमेंट। आप किसी भी फीचर के बारे में पूछ सकते हैं।"
        };
      }

      if (effectiveLang === 'te') {
        return {
          reply: `🌟 **అగ్రినెక్స్ — పూర్తి ఫీచర్లు మరియు ప్రయోజనాల గైడ్**

అగ్రినెక్స్ భారతదేశపు ఆధునిక వ్యవసాయ ప్లాట్‌ఫారమ్. రైతులకు మరియు సంస్థాగత కొనుగోలుదారులకు నేరుగా అనుసంధానం చేస్తుంది.

ఇక్కడ **10 ముఖ్య ఫీచర్లు**, వాటి **ప్రయోజనాలు** మరియు **ఎలా ఉపయోగించాలి**:

1. **🌾 ఫార్మ్-గేట్ హోల్‌సేల్ మార్కెట్‌ప్లేస్ (/marketplace)**:
   • *ప్రయోజనం*: దళారుల కమీషన్ లేకుండా రైతులకు 15%–25% అధిక లాభం.
   • *విధానం*: పంట వివరాలు పరిశీలించి కస్టమ్ ఆఫర్ పంపండి లేదా కొనుగోలు చేయండి.

2. **📊 ప్రభుత్వ ఎగ్మార్క్‌నెట్ లైవ్ మార్కెట్ ధరలు (/prices)**:
   • *ప్రయోజనం*: 3,000 కంటే ఎక్కువ మార్కెట్లలో తాజా కనీస, గరిష్ట మరియు మోడల్ ధరలు.

3. **🔮 ఏఐ ధరల అంచనా (మెషిన్ లెర్నింగ్) (/prices)**:
   • *ప్రయోజనం*: రాబోయే 7 నుండి 30 రోజుల ధరల ట్రెండ్‌ను ముందే తెలుసుకోవచ్చు.

4. **❄️ కోల్డ్ స్టోరేజ్ అడ్వైజర్ (/prices)**:
   • *ప్రయోజనం*: నిల్వ ఖర్చులు మరియు తేమ నష్టాన్ని లెక్కిస్తూ పంటను నిల్వ ఉంచాలా లేదా ఇప్పుడే విక్రయించాలా అని సూచిస్తుంది.

5. **🤝 స్మార్ట్ కౌంటర్‌పార్టీ మ్యాచ్‌మేకర్ (/prices)**:
   • *ప్రయోజనం*: కొనుగోలుదారుల అవసరాలను రైతుల పంటలతో రియల్ టైమ్‌లో సరిపోల్చుతుంది.

6. **⚖️ మార్కెట్ ఆర్బిట్రాజ్ & రవాణా (/prices)**:
   • *ప్రయోజనం*: ఎక్కువ ధర పలికే ఇతర మార్కెట్లకు శీతల వాహనాల్లో తరలించే సదుపాయం.

7. **🛰️ లైవ్ జీపీఎస్ శీతల రవాణా ట్రాకింగ్ (/fleet)**:
   • *ప్రయోజనం*: పంట పాడవకుండా కంటైనర్ ఉష్ణోగ్రత మరియు లైవ్ లొకేషన్ పర్యవేక్షణ.

8. **🔍 ఏఐ పంట తెగుళ్ల స్కానర్ (/crop-scanner)**:
   • *ప్రయోజనం*: ఆకుల ఫోటో తీసి పంట వ్యాధులు మరియు రసాయన/సేంద్రీయ పరిష్కారాలు పొందండి.

9. **🔒 100% సేఫ్ ఎస్క్రో పేమెంట్స్ (/payments)**:
   • *ప్రయోజనం*: యూపీఐ, కార్డులు, నెట్ బ్యాంకింగ్ సదుపాయం. డెలివరీ ఓటీపీ తర్వాత రైతులకు తక్షణ చెల్లింపు.

10. **💰 రైతులకు డైరెక్ట్ బ్యాంక్ బదిలీ (/farmer/earnings)**:
    • *ప్రయోజనం*: పెన్నీ-డ్రాప్ ఖాతా ధృవీకరణ మరియు జీరో ఫీజుతో పూర్తి మొత్తం జమ.`,
          action: { label: '🧭 ప్రైస్ డిస్కవరీ హబ్ చూడండి', path: '/prices' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "అగ్రినెక్స్ ప్లాట్‌ఫారమ్‌లో పది ప్రధాన ఫీచర్లు ఉన్నాయి: హోల్‌సేల్ మార్కెట్‌ప్లేస్, ఎగ్మార్క్‌నెట్ లైవ్ ధరలు, ఏఐ ధర అంచనా, కోల్డ్ స్టోరేజ్ అడ్వైజర్, స్మార్ట్ మ్యాచ్‌మేకర్, ఆర్బిట్రాజ్ లాజిస్టిక్స్, లైవ్ జీపీఎస్ శీతల రవాణా, ఏఐ క్రాప్ స్కానర్, ఎస్క్రో పేమెంట్స్ మరియు రైతులకు నేరుగా బ్యాంక్ చెల్లింపులు."
        };
      }

      if (effectiveLang === 'mr') {
        return {
          reply: `🌟 **ॲग्रीनेक्स — सर्व वैशिष्ट्ये आणि उपयोग मार्गदर्शक**

ॲग्रीनेक्स हे शेतकऱ्यांना थेट मोठ्या खरेदीदारांशी जोडणारे भारतातील आधुनिक कृषी व्यासपीठ आहे.

**10 प्रमुख वैशिष्ट्ये**:
1. **🌾 थेट शेतमाल बाजारपेठ (/marketplace)**: मध्यस्थांशिवाय 15-25% जास्त नफा.
2. **📊 एग्मार्कनेट थेट बाजार भाव (/prices)**: देशभरातील 3,000+ बाजार समित्यांचे अधिकृत दर.
3. **🔮 एआय भाव अंदाज (/prices)**: पुढील 7 ते 30 दिवसांच्या भावाचा अचूक अंदाज.
4. **❄️ कोल्ड स्टोरेज सल्लागार (/prices)**: माल साठवून ठेवावा की लगेच विकावा याचा ताळेबंद.
5. **🤝 स्मार्ट मॅचमेकर (/prices)**: खरेदीदार आणि शेतकरी यांच्यात थेट करार.
6. **⚖️ मल्टी-मंडी आर्बिट्राज (/prices)**: सर्वाधिक दर देणाऱ्या बाजारपेठेत वाहतूक व्यवस्था.
7. **🛰️ थेट जीपीएस रेफ्रिजरेटेड वाहतूक (/fleet)**: खराब न होता मालाची सुरक्षित वाहतूक.
8. **🔍 एआय पीक तपासणी (/crop-scanner)**: पानांच्या फोटोवरून रोगांचे निदान आणि उपाय.
9. **🔒 100% सुरक्षित एस्क्रो पेमेंट्स (/payments)**: युपीआय, कार्ड व नेट बँकिंग सुरक्षा.
10. **💰 थेट बँक खात्यात जमा (/farmer/earnings)**: डिलिव्हरी ओटीपीनंतर 0% शुल्कासह रक्कम थेट खात्यात.`,
          action: { label: '🧭 भाव डिस्कव्हरी हब', path: '/prices' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "ॲग्रीनेक्समध्ये 10 मुख्य वैशिष्ट्ये आहेत: थेट बाजारपेठ, एग्मार्कनेट बाजार भाव, एआय भाव अंदाज, कोल्ड स्टोरेज सल्लागार, स्मार्ट मॅचमेकर, आर्बिट्राज, जीपीएस वाहतूक, पीक रोग तपासणी, एस्क्रो पेमेंट्स आणि थेट बँक खात्यात जमा."
        };
      }

      // Default English Guide
      return {
        reply: `🌟 **AgriNex — Complete App Features & Benefits Guide**

AgriNex is India's premier full-stack agricultural marketplace & price discovery ecosystem connecting farmers directly with institutional buyers.

Here are the **10 Core Features**, their **Benefits**, and **How to Use them**:

1. **🌾 Farm-Gate Wholesale Marketplace** (\`/marketplace\`)
   • *Benefit*: Farmers sell directly to buyers at 15–25% higher margins, eliminating exploitative middlemen.
   • *How to Use*: Browse listings with photos, location, and quality grade. Click **Make Custom Offer** or **Add to Cart**.

2. **📊 AGMARKNET Real-Time Mandi Price Discovery** (\`/prices\`)
   • *Benefit*: Real-time modal, min, and max benchmark rates across 3,000+ mandis from official Government of India (data.gov.in) feeds.

3. **🔮 AI Price Prediction (ML Ensemble)** (\`/prices\`)
   • *Benefit*: 7-to-30 day price corridor forecasts with confidence scores and Mean Absolute Error (MAE) backtesting.

4. **❄️ AI Cold Storage vs. Immediate Liquidation Advisor** (\`/prices\`)
   • *Benefit*: Simulates weight shrinkage loss & warehousing costs against forward APMC forecasts to give a clear **HOLD** or **SELL NOW** verdict.

5. **🤝 Smart Sourcing & Counterparty Matchmaker** (\`/prices\`)
   • *Benefit*: Real-time algorithmic matching between institutional procurement tenders and verified farmer harvest lots.

6. **⚖️ Multi-Mandi Arbitrage & Corridor Logistics** (\`/prices\`)
   • *Benefit*: Scans price differentials across APMC terminals, accounts for freight costs, and dispatches GPS-tracked reefer fleets.

7. **🛰️ Live GPS Fleet Cold-Chain Telematics** (\`/fleet\`)
   • *Benefit*: End-to-end refrigerated transport tracking with live temperature logging (-18°C to +4°C) to prevent in-transit spoilage.

8. **🔍 AI Crop Scanner & Quality Grading** (\`/crop-scanner\`)
   • *Benefit*: Computer vision analysis of crop leaves and produce for chlorophyll health, early blight, rust, and export quality grading.

9. **🔒 Smart Escrow & Multi-Gateway Payments** (\`/payments\`)
   • *Benefit*: 100% payment security. Buyer funds are held in virtual escrow and released directly to the farmer upon delivery OTP sign-off.
   • *Gateways*: BHIM UPI & Dynamic QR, Visa/Mastercard/RuPay Kisan Cards, Net Banking (50+ banks), and NEFT/RTGS Virtual Account Wire.

10. **💰 Farmer Direct Settlement & Aadhaar DBT** (\`/farmer/earnings\`)
    • *Benefit*: Zero payment delays, penny-drop account verification, and immediate direct-to-bank transfers.`,
        action: { label: '🧭 Explore Price Discovery Hub', path: '/prices' },
        quickActions: this.getQuickActions(role, effectiveLang),
        voiceText: "AgriNex provides ten core features: Farm-Gate Marketplace, AGMARKNET Real-Time Mandi Prices, AI Price Prediction, Cold Storage Advisor, Counterparty Matchmaker, Multi-Mandi Arbitrage, GPS Reefer Fleet, AI Crop Scanner, Smart Escrow Payments, and Farmer Aadhaar Payouts. You can ask me about any of these features for step-by-step guidance."
      };
    }

    // 4. Payment Gateways & Escrow Inquiries
    if (query.includes('payment') || query.includes('gateway') || query.includes('escrow') ||
        query.includes('how to pay') || query.includes('how do farmers get paid') || query.includes('payout') ||
        query.includes('upi') || query.includes('card') || query.includes('net banking') ||
        query.includes('भुगतान') || query.includes('पेमेंट') || query.includes('చెల్లింపు') || query.includes('पैसे')) {

      if (effectiveLang === 'hi') {
        return {
          reply: `💳 **एग्रीनेक्स मल्टी-गेटवे पेमेंट्स एवं 100% सुरक्षित एस्क्रो हब**

एग्रीनेक्स पर सभी लेन-देन भारतीय रिजर्व बैंक (RBI) के दिशानिर्देशों के अनुरूप **स्मार्ट एस्क्रो वॉल्ट** द्वारा सुरक्षित हैं।

### 1. सक्रिय भुगतान गेटवे (5 माध्यम)
• **BHIM UPI एवं डायनामिक क्यूआर**: Google Pay, PhonePe, Paytm या BHIM द्वारा तत्काल भुगतान।
• **डेबिट / क्रेडिट कार्ड एवं रुपे किसान कार्ड**: Visa, Mastercard और RuPay 3D-सिक्योर ओटीपी सुरक्षा के साथ।
• **नेट बैंकिंग (50+ भारतीय बैंक)**: SBI, HDFC, ICICI, Axis, PNB आदि प्रमुख बैंकों से सीधा इंटरनेट बैंकिंग।
• **NEFT / RTGS / IMPS बैंक वायर**: समर्पित वर्चुअल एस्क्रो खाते (\`AGXVAULT\`) में सीधा ट्रांसफर।
• **एग्रीनेक्स एग्री-क्रेडिट लाइन**: संस्थागत थोक खरीदारों के लिए ₹2,50,000 तक की स्वीकृत क्रेडिट सुविधा।

### 2. एस्क्रो प्रणाली कैसे काम करती है?
1. **रकम लॉक करना**: ऑर्डर की पुष्टि पर खरीदार की राशि एस्क्रो वॉल्ट में सुरक्षित रूप से लॉक हो जाती है।
2. **फसल प्रेषण**: किसान को सूचित किया जाता है कि 100% राशि लॉक है और वे निश्चिंत होकर माल भेज सकते हैं।
3. **जांच व 6-अंकीय ओटीपी**: गोदाम पर माल पहुंचने पर खरीदार गुणवत्ता जांच करता है।
4. **किसान को तत्काल भुगतान**: खरीदार द्वारा डिलीवरी ओटीपी दर्ज करते ही पूरी राशि बिना किसी कटौती के किसान के बैंक खाते या UPI में स्थानांतरित हो जाती है।`,
          action: { label: '💳 पेमेंट्स एवं एस्क्रो हब खोलें', path: '/payments' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "एग्रीनेक्स पर भुगतान 100% सुरक्षित एस्क्रो सिस्टम से होता है। खरीदार UPI, कार्ड या नेट बैंकिंग से पैसे जमा करते हैं। माल पहुंचने और डिलीवरी ओटीपी सत्यापन के तुरंत बाद पैसे सीधे किसान के बैंक खाते में बिना किसी शुल्क के पहुंच जाते हैं।"
        };
      }

      if (effectiveLang === 'te') {
        return {
          reply: `💳 **అగ్రినెక్స్ మల్టీ-గేట్‌వే చెల్లింపులు & 100% సేఫ్ ఎస్క్రో హబ్**

అగ్రినెక్స్ ఆర్‌బీఐ నిబంధనల ప్రకారం **స్మార్ట్ ఎస్క్రో సిస్టమ్** ద్వారా కొనుగోలుదారు మరియు రైతు ఇద్దరికీ పూర్తి రక్షణ కల్పిస్తుంది.

### 1. అందుబాటులో ఉన్న 5 పేమెంట్ గేట్‌వేలు
• **భీమ్ యూపీఐ & డైనమిక్ క్యూఆర్**: Google Pay, PhonePe, Paytm లేదా BHIM ద్వారా సులభ చెల్లింపు.
• **క్రెడిట్/డెబిట్ కార్డులు & రూపే కిసాన్ కార్డ్**: Visa, Mastercard, RuPay 3D సెక్యూర్ ధృవీకరణ.
• **నెట్ బ్యాంకింగ్ (50+ బ్యాంకులు)**: ఎస్‌బీఐ, హెచ్‌డీఎఫ్‌సీ, ఐసీఐసీఐ, యాక్సిస్ వంటి 50 ప్రముఖ బ్యాంకులు.
• **NEFT / RTGS బ్యాంక్ ట్రాన్స్‌ఫర్**: వర్చువల్ ఎస్క్రో ఖాతాకు నేరుగా బదిలీ.
• **అగ్రి-క్రెడిట్ లైన్**: హోల్‌సేల్ కొనుగోలుదారులకు ₹2,50,000 వరకు ముందస్తు క్రెడిట్.

### 2. ఎస్క్రో ప్రక్రియ ఎలా పనిచేస్తుంది?
1. **డబ్బు లాక్ అవ్వడం**: ఆర్డర్ ఖరారైన వెంటనే కొనుగోలుదారు చెల్లించిన మొత్తం సురక్షితమైన ఎస్క్రో వాల్ట్‌లో భద్రపరచబడుతుంది.
2. **రవాణా**: డబ్బు లాక్ అయినట్లు రైతుకు నిర్ధారణ సందేశం వెళ్తుంది. రైతు పంటను శీతల వాహనంలో పంపుతారు.
3. **తనిఖీ & 6-అంకెల డెలివరీ ఓటీపీ**: సరుకు చేరిన తర్వాత కొనుగోలుదారు నాణ్యతను తనిఖీ చేస్తారు.
4. **రైతుకు తక్షణ చెల్లింపు**: డెలివరీ ఓటీపీని ధృవీకరించిన వెంటనే సున్నా శాతం కమీషన్‌తో పూర్తి మొత్తం రైతు ఖాతాలో జమ అవుతుంది.`,
          action: { label: '💳 పేమెంట్స్ హబ్ చూడండి', path: '/payments' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "అగ్రినెక్స్‌లో చెల్లింపులు 100% సురక్షితమైన ఎస్క్రో వాల్ట్ ద్వారా జరుగుతాయి. యూపీఐ, కార్డులు, నెట్ బ్యాంకింగ్ అందుబాటులో ఉన్నాయి. పంట డెలివరీ అయినప్పుడు 6-అంకెల ఓటీపీ ధృవీకరించిన వెంటనే డబ్బులు రైతుల ఖాతాలో సున్నా శాతం ఫీజుతో జమ చేయబడతాయి."
        };
      }

      if (effectiveLang === 'mr') {
        return {
          reply: `💳 **ॲग्रीनेक्स मल्टि-गेटवे पेमेंट्स आणि 100% सुरक्षित एस्क्रो हब**

ॲग्रीनेक्सवर सर्व व्यवहार रिझर्व्ह बँकेच्या नियमांनुसार **स्मार्ट एस्क्रो प्रणाली** द्वारे 100% सुरक्षित आहेत.

• **उपलब्ध 5 पेमेंट पर्याय**: UPI QR (GPay, PhonePe), RuPay किसान कार्ड, डेबिट/क्रेडिट कार्ड, 50+ बँकांचे नेट बँकिंग आणि NEFT/RTGS वायर.
• **कार्यपद्धती**: ऑर्डर निश्चित झाल्यावर खरेदीदाराचे पैसे एस्क्रो खात्यात सुरक्षित होतात. माल पोहोचल्यावर आणि 6-अंकी डिलिव्हरी ओटीपी सत्यापित झाल्यावर तात्काळ शेतकऱ्यांच्या बँक खात्यात 0% शुल्कासह जमा होतात.`,
          action: { label: '💳 पेमेंट्स हब उघडा', path: '/payments' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "ॲग्रीनेक्सवर पेमेंट 100% सुरक्षित एस्क्रो व्हॉल्टद्वारे संरक्षित आहे. युपीआय, कार्ड किंवा नेट बँकिंगद्वारे भरणा केला जातो. माल पोहोचल्यावर 6 अंकी डिलिव्हरी ओटीपी सत्यापित होताच पैसे थेट शेतकऱ्यांच्या खात्यात जमा होतात."
        };
      }

      // Default English
      return {
        reply: `💳 **AgriNex Multi-Gateway Payment & Escrow Hub**

AgriNex integrates an RBI-compliant **Smart Escrow System** with 5 fully activated payment gateway channels:

### 1. Active Payment Gateways
• **BHIM UPI & Dynamic QR**: Instant intent checkout via GPay, PhonePe, Paytm, or BHIM. Scan dynamic QR code with custom amount & beneficiary.
• **Credit & Debit Cards / RuPay Kisan Credit Card**: Full Visa, Mastercard, and RuPay support with 3D-Secure bank OTP verification.
• **Net Banking (50+ Indian Scheduled Banks)**: Direct internet banking integration with SBI, HDFC, ICICI, Axis, PNB, Kotak, and 40+ scheduled banks.
• **NEFT / RTGS / IMPS Bank Transfer**: Direct wire transfer into a dedicated virtual escrow trust account (\`AGXVAULT\`) with instant UTR matching.
• **AgriNex Agri-Credit Line**: Pre-approved credit facility up to ₹2,50,000 for institutional wholesale buyers.

### 2. How the Escrow Payment Works (Step-by-Step)
1. **Locking Funds**: When an order or offer is confirmed, the buyer deposits the contract amount into the Escrow Vault using any gateway above.
2. **Harvest & Dispatch**: The farmer is notified that **100% of funds are locked and guaranteed**. Produce is packed and dispatched via reefer transport.
3. **Inspection & Delivery OTP**: When goods arrive at the destination warehouse, the buyer inspects quality and weight.
4. **Instant Payout Release**: The buyer shares the **6-digit delivery OTP**. The escrow system immediately transfers funds directly to the farmer's bank account or UPI VPA with **0% commission cut**.

### 3. Penny-Drop Verification
Before releasing large payouts, our automated NPCI penny-drop service tests the farmer's bank account with a ₹1 micro-deposit to confirm recipient name and active IFSC.`,
        action: { label: '💳 Open Payments & Escrow Hub', path: '/payments' },
        quickActions: this.getQuickActions(role, effectiveLang),
        voiceText: "AgriNex supports five payment gateways: BHIM UPI, Credit and Debit cards including RuPay Kisan Card, Net Banking across fifty banks, NEFT or RTGS Bank Wire, and Agri-Credit Wallet. Buyer funds are locked securely in Escrow and released immediately to the farmer upon delivery OTP verification."
      };
    }

    // 5. Cold Storage vs. Immediate Liquidation Advisor Inquiries
    if (query.includes('cold storage') || query.includes('storage advisor') || query.includes('liquidation') ||
        query.includes('hold or sell') || query.includes('sell now') || query.includes('कोल्ड स्टोरेज') || query.includes('కోల్డ్ స్టోరేజ్')) {

      if (effectiveLang === 'hi') {
        return {
          reply: `❄️ **एआई कोल्ड स्टोरेज बनाम तत्काल बिक्री सलाहकार**

### यह क्या करता है:
यह सलाहकार गणना करता है कि किसान को अपनी फसल अभी मंडी में तत्काल बेचनी चाहिए या किसी सत्यापित कोल्ड स्टोरेज में **15, 30, 45, 60, या 90 दिनों** के लिए रखना चाहिए।

### गणित एवं एआई विश्लेषण:
• **भविष्य के मंडी भाव**: ऐतिहासिक मौसमी रुझानों के आधार पर आगे के भाव का अनुमान।
• **वजन में कमी (डिहाइड्रेशन)**: प्राकृतिक नमी की हानि (0.5%–4.5%) घटाता है।
• **भंडारण किराया**: साधारण वेंटिलेटेड (₹0.85/किग्रा/माह) या सीए वॉल्ट (₹1.20/किग्रा/माह) का शुल्क घटाता है।
• **अंतिम निर्णय**: स्पष्ट फैसला (\`होल्ड करें\` या \`अभी बेचें\`) और शुद्ध अतिरिक्त मुनाफे की गणना।`,
          action: { label: '❄️ कोल्ड स्टोरेज सलाहकार खोलें', path: '/prices' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "कोल्ड स्टोरेज सलाहकार फसल के वजन घटने और भंडारण शुल्क की तुलना भविष्य के मंडी भाव से करता है। यह आपको स्पष्ट बताता है कि माल को रोक कर रखना चाहिए या तुरंत बेचना चाहिए।"
        };
      }

      if (effectiveLang === 'te') {
        return {
          reply: `❄️ **ఏఐ కోల్డ్ స్టోరేజ్ వర్సెస్ తక్షణ విక్రయ సలహాదారు**

### ఇది ఏమి చేస్తుంది:
రైతు తన పంటను స్థానిక మార్కెట్‌లో ఇప్పుడే అమ్మాలా లేదా ధృవీకరించబడిన శీతల గిడ్డంగిలో **15, 30, 45, 60, లేదా 90 రోజులు** నిల్వ ఉంచాలా అని లెక్కిస్తుంది.

### ప్రధాన అంశాలు:
• **భవిష్యత్ ధరల అంచనా**: గత సీజన్ల డేటా ఆధారంగా రాబోయే ధరను లెక్కిస్తుంది.
• **తేమ మరియు బరువు నష్టం**: పంట రకాన్ని బట్టి 0.5% నుండి 4.5% వరకు తగ్గే బరువును తగ్గిస్తుంది.
• **నిల్వ అద్దె ఖర్చులు**: గిడ్డంగి అద్దె ఖర్చులను మినహాయిస్తుంది.
• **స్పష్టమైన తీర్పు**: పంటను నిల్వ ఉంచితే (\`HOLD\`) ఎంత నికర లాభం వస్తుందో లేదా ఇప్పుడే అమ్మాలా (\`SELL NOW\`) స్పష్టంగా చెబుతుంది.`,
          action: { label: '❄️ కోల్డ్ స్టోరేజ్ అడ్వైజర్ తెరవండి', path: '/prices' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "కోల్డ్ స్టోరేజ్ అడ్వైజర్ నిల్వ ఖర్చులు మరియు తేమ నష్టాన్ని పరిగణనలోకి తీసుకుని పంటను నిల్వ ఉంచాలా లేదా ఇప్పుడే విక్రయించాలా అనే స్పష్టమైన నిర్ణయాన్ని మీ ముందుకు తెస్తుంది."
        };
      }

      return {
        reply: `❄️ **AI Cold Storage vs. Immediate Liquidation Advisor**

### What It Does:
The Advisor simulates whether a farmer should sell their harvest lot immediately at the local mandi spot rate or store it in a verified cold storage facility for **15, 30, 45, 60, or 90 days**.

### Real-Time Math & AI Forecast:
• **Forward Modal APMC Forecast**: Uses historical seasonal trend cycles to estimate future crop rates.
• **Dehydration & Weight Shrinkage Loss**: Subtracts natural moisture weight loss (0.5%–4.5% based on crop perishability).
• **Storage Rental Costs**: Subtracts warehousing fees (Ventilated at ₹0.85/kg/mo vs. Controlled Atmosphere CA Vault at ₹1.20/kg/mo).
• **Net Financial Outcome**: Calculates the exact net profit or loss difference in Indian Rupees.`,
        action: { label: '❄️ Open Cold Storage Advisor', path: '/prices' },
        quickActions: this.getQuickActions(role, effectiveLang),
        voiceText: "The Cold Storage Advisor calculates forward price forecasts, dehydration weight loss, and storage fees to tell you whether holding produce in cold storage yields a higher net profit than selling immediately."
      };
    }

    // 6. Smart Sourcing & Counterparty Matchmaker Inquiries
    if (query.includes('matchmaker') || query.includes('sourcing') || query.includes('counterparty') ||
        query.includes('find buyer') || query.includes('find seller') || query.includes('मैचमेकर') || query.includes('మ్యాచ్‌మేకర్')) {

      if (effectiveLang === 'hi') {
        return {
          reply: `🤝 **स्मार्ट सोर्सिंग एवं काउंटरपार्टी मैचमेकर**

• **मैच अनुकूलता स्कोर**: फसल, मात्रा, दूरी और भाव के आधार पर 90%+ अनुकूलता वाले सौदे खोजता है।
• **दोहरा दृष्टिकोण**: 
  - *खरीदार दृश्य*: प्रमाणित किसानों की फसलें और ग्रेड देखें।
  - *किसान बिक्री दृश्य*: संस्थागत खरीदारों (BigBasket, FreshDirect आदि) की बोलियां देखें।
• **1-क्लिक अनुबंध**: सीधे डिजिटल अनुबंध स्वीकारें या +₹2/किग्रा का काउंटर ऑफर दें।`,
          action: { label: '🤝 मैचमेकर खोलें', path: '/prices' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "स्मार्ट सोर्सिंग और मैचमेकर थोक खरीदारों की मांग को प्रमाणित किसानों की फसल से तुरंत मैच करता है। आप सीधे डिजिटल अनुबंध स्वीकार कर सकते हैं।"
        };
      }

      if (effectiveLang === 'te') {
        return {
          reply: `🤝 **స్మార్ట్ సోర్సింగ్ & కౌంటర్‌పార్టీ మ్యాచ్‌మేకర్**

• **మ్యాచ్ స్కోర్**: పంట రకం, పరిమాణం మరియు ధరల ఆధారంగా అత్యుత్తమ కొనుగోలుదారులను వెతుకుతుంది.
• **ద్విముఖ వీక్షణ**: కొనుగోలుదారుల అవసరాలు మరియు రైతుల విక్రయ జాబితాలను వేర్వేరుగా చూడవచ్చు.
• **సింగిల్ క్లిక్ ఒప్పందం**: ఎస్క్రో భద్రతతో తక్షణ డిజిటల్ ఒప్పందాన్ని ఆమోదించవచ్చు.`,
          action: { label: '🤝 మ్యాచ్‌మేకర్ తెరవండి', path: '/prices' },
          quickActions: this.getQuickActions(role, effectiveLang),
          voiceText: "స్మార్ట్ సోర్సింగ్ మ్యాచ్‌మేకర్ కొనుగోలుదారుల అవసరాలను రైతుల పంట నిల్వలతో రియల్ టైమ్‌లో అనుసంధానిస్తుంది."
        };
      }

      return {
        reply: `🤝 **Smart Sourcing & Counterparty Matchmaker**

### What It Does:
The Matchmaker connects active buyer procurement requirements with certified farmer harvest inventories in real time with zero empty states.

### Key Capabilities:
• **Match Compatibility Score**: Evaluates crop variety, volume, distance, and price compatibility (e.g. 96% Match).
• **Dual Perspective Switching**:
  - *Buyer Procurement View*: Explore certified farm harvests with export grades, asking prices, and producer ratings.
  - *Farmer Sales View*: Explore active institutional buyer bids with offered rates and escrow guarantees.
• **1-Click Actions**: Make Custom Offer, Accept & Lock Escrow, or Counter (+₹2/kg).`,
        action: { label: '🤝 Open Counterparty Matchmaker', path: '/prices' },
        quickActions: this.getQuickActions(role, effectiveLang),
        voiceText: "Smart Sourcing and Matchmaker connects bulk buyer procurement tenders directly with certified farmer harvests in real time with automated match scores and one-click escrow contract acceptance."
      };
    }

    // 7. Mandi Prices & Price Discovery
    if (query.includes('price') || query.includes('mandi') || query.includes('rate') ||
        query.includes('भाव') || query.includes('दाम') || query.includes('ధర') || query.includes('రేటు')) {

      let matchedCrop = null;
      if (query.includes('tomato') || query.includes('tamatar') || query.includes('टमाटर') || query.includes('టమోటా')) matchedCrop = 'Tomato';
      else if (query.includes('rice') || query.includes('paddy') || query.includes('चावल') || query.includes('వరి')) matchedCrop = 'Rice / Paddy';
      else if (query.includes('wheat') || query.includes('गेहूं') || query.includes('గోధుమ')) matchedCrop = 'Wheat';
      else if (query.includes('onion') || query.includes('प्याज') || query.includes('ఉల్లిపాయ')) matchedCrop = 'Red Onion';

      if (matchedCrop) {
        const latest = marketDataService.getLatestPrice(matchedCrop);
        if (latest) {
          const quintal = latest.pricePerQuintal || Math.round(latest.modalPrice * 100);

          if (effectiveLang === 'hi') {
            return {
              reply: `🌾 **${latest.commodity || matchedCrop} का ताज़ा मंडी भाव**\n\n• **मॉडल भाव**: **₹${latest.modalPrice} / किलो** (₹${quintal} / क्विंटल)\n• **दायरा**: न्यूनतम ₹${latest.minPrice} • अधिकतम ₹${latest.maxPrice}/किग्रा\n• **मंडी**: ${latest.market} (${latest.district}, ${latest.state})\n• **रुझान**: ${latest.trend === 'UP' ? '📈 ऊपर' : '📉 स्थिर'}\n• **स्रोत**: AGMARKNET (data.gov.in)`,
              action: { label: '📈 भाव चार्ट्स देखें', path: '/prices' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: `${latest.commodity || matchedCrop} का ताज़ा मॉडल भाव ₹${latest.modalPrice} प्रति किलो है ${latest.market} मंडी में।`
            };
          }

          if (effectiveLang === 'te') {
            return {
              reply: `🌾 **${latest.commodity || matchedCrop} తాజా మార్కెట్ ధర**\n\n• **మోడల్ ధర**: **₹${latest.modalPrice} / కేజీ** (₹${quintal} / క్వింటా)\n• **ధర పరిధి**: కనీసం ₹${latest.minPrice} • గరిష్టం ₹${latest.maxPrice}/కేజీ\n• **మార్కెట్**: ${latest.market} (${latest.state})\n• **ట్రెండ్**: ${latest.trend === 'UP' ? '📈 పెరుగుదల' : '📉 స్థిరంగా'}\n• **మూలం**: AGMARKNET (data.gov.in)`,
              action: { label: '📈 ధరల చార్ట్ చూడండి', path: '/prices' },
              quickActions: this.getQuickActions(role, effectiveLang),
              voiceText: `${latest.commodity || matchedCrop} తాజా మార్కెట్ ధర ${latest.market} లో కేజీకి ₹${latest.modalPrice} రూపాయలు.`
            };
          }

          return {
            reply: `🌾 **Latest Market Price for ${latest.commodity || matchedCrop}**\n\n• **Modal Benchmark**: **₹${latest.modalPrice} / kg** (₹${quintal} / quintal)\n• **Range**: Min ₹${latest.minPrice}/kg • Max ₹${latest.maxPrice}/kg\n• **Market / Mandi**: ${latest.market} (${latest.district}, ${latest.state})\n• **Price Trend**: ${latest.trend === 'UP' ? '📈 Up' : '📉 Steady'}\n• **Source**: AGMARKNET (data.gov.in)`,
            action: { label: '📈 Full Historical Charts', path: '/prices' },
            quickActions: this.getQuickActions(role, effectiveLang),
            voiceText: `Latest modal price for ${latest.commodity || matchedCrop} is ₹${latest.modalPrice} per kg at ${latest.market}.`
          };
        }
      }

      // Default Mandi overview
      const pricesRes = marketDataService.getMarketPrices({ limit: 4 });
      const sample = (pricesRes.records || []).slice(0, 4).map(p =>
        `• **${p.commodity || p.cropName}**: ₹${p.modalPrice}/kg (₹${p.pricePerQuintal}/quintal) at ${p.market}, ${p.state}`
      ).join('\n');

      if (effectiveLang === 'hi') {
        return {
          reply: `सरकारी एग्मार्कनेट के ताज़ा प्रमुख मंडी भाव:\n\n${sample}\n\n• **डेटा वर्गीकरण**: [वास्तविक सरकारी मंडी डेटा]\n• **स्रोत**: AGMARKNET (data.gov.in)`,
          action: { label: '📈 मंडी भाव हब खोलें', path: '/prices' },
          voiceText: "यहाँ प्रमुख फसलों के ताज़ा मंडी भाव हैं। अधिक विवरण के लिए भाव हब देखें।"
        };
      }
      if (effectiveLang === 'te') {
        return {
          reply: `అధికారిక ఎగ్మార్క్‌నెట్ నుండి తాజా మార్కెట్ ధరలు:\n\n${sample}\n\n• **మూలం**: AGMARKNET (data.gov.in)`,
          action: { label: '📈 ప్రైస్ డిస్కవరీ హబ్', path: '/prices' },
          voiceText: "ఇవి అధికారిక ఎగ్మార్క్‌నెట్ తాజా మార్కెట్ ధరలు. వివరాల కోసం ప్రైస్ డిస్కవరీ చూడండి."
        };
      }

      return {
        reply: `Here are the latest available market prices from official AGMARKNET records:\n\n${sample}\n\n• **Data Classification**: [REAL MARKET DATA]\n• **Source**: AGMARKNET (data.gov.in)`,
        action: { label: '📈 Open Price Discovery Hub', path: '/prices' },
        voiceText: "Here are the latest verified mandi benchmark prices from AGMARKNET."
      };
    }

    // Default Fallback
    return this.getFallbackGreeting(role, effectiveLang);
  }

  getFallbackGreeting(role, lang) {
    if (lang === 'hi') {
      return {
        reply: `मैं आपकी निम्नलिखित विषयों में मदद कर सकता हूँ:\n• **एग्रीनेक्स के सभी फीचर्स और उपयोग का तरीका**\n• **पेमेंट गेटवे, एस्क्रो सुरक्षा और किसान भुगतान**\n• **लाइव एग्मार्कनेट मंडी भाव और एआई मूल्य पूर्वानुमान**\n• **कोल्ड स्टोरेज बनाम तत्काल बिक्री सलाहकार**\n• **स्मार्ट सोर्सिंग और मैचमेकर**\n• **एआई फसल रोग स्कैनर और जीपीएस फ्लीट ट्रैकिंग**\n\nआप अपनी मातृभाषा में जो भी पूछना चाहें, पूछ सकते हैं!`,
        quickActions: this.getQuickActions(role, lang),
        voiceText: "मैं आपको एग्रीनेक्स के सभी फीचर्स, एस्क्रो पेमेंट्स, कोल्ड स्टोरेज सलाह और लाइव मंडी भाव के बारे में आपकी भाषा में पूरी जानकारी दे सकता हूँ। आप क्या जानना चाहते हैं?"
      };
    }

    if (lang === 'te') {
      return {
        reply: `నేను ఈ క్రింది అంశాలలో మీకు సహాయం చేయగలను:\n• **అగ్రినెక్స్ పూర్తి ఫీచర్లు మరియు ప్రయోజనాలు**\n• **చెల్లింపు గేట్‌వేలు, ఎస్క్రో రక్షణ & రైతు చెల్లింపులు**\n• **లైవ్ ఎగ్మార్క్‌నెట్ మార్కెట్ ధరలు & ఏఐ అంచనాలు**\n• **కోల్డ్ స్టోరేజ్ వర్సెస్ తక్షణ విక్రయ సలహాదారు**\n• **స్మార్ట్ సోర్సింగ్ & మ్యాచ్‌మేకర్**\n• **ఏఐ క్రాప్ స్కానర్ & జీపీఎస్ రవాణా ట్రాకింగ్**\n\nమీరు మీ మాతృభాషలో ఏదైనా అడగవచ్చు!`,
        quickActions: this.getQuickActions(role, lang),
        voiceText: "నేను అగ్రినెక్స్ అన్ని ఫీచర్లు, ఎస్క్రో పేమెంట్స్, కోల్డ్ స్టోరేజ్ సలహాలు మరియు మార్కెట్ ధరల గురించి మీ మాతృభాషలో వివరించగలను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?"
      };
    }

    if (lang === 'mr') {
      return {
        reply: `मी आपणास खालील बाबींमध्ये मदत करू शकतो:\n• **ॲग्रीनेक्सची सर्व वैशिष्ट्ये आणि उपयोग**\n• **पेमेंट गेटवे, एस्क्रो सुरक्षा आणि शेतकरी पैसे जमा**\n• **थेट बाजार भाव आणि एआय अंदाज**\n• **कोल्ड स्टोरेज सल्लागार**\n• **स्मार्ट मॅचमेकर आणि पीक रोग तपासणी**\n\nआपण आपल्या मातृभाषेत कोणताही प्रश्न विचारू शकता!`,
        quickActions: this.getQuickActions(role, lang),
        voiceText: "मी आपल्याला ॲग्रीनेक्सची सर्व वैशिष्ट्ये, एस्क्रो पेमेंट्स आणि थेट बाजार भावाची माहिती आपल्या मातृभाषेत देऊ शकतो. आपण काय विचारू इच्छिता?"
      };
    }

    return {
      reply: `I can assist you with:
• **Every feature of AgriNex & how to use it**
• **Payment Gateways, Escrow protection & Farmer Payouts**
• **Live APMC Mandi Prices & ML Price Forecasts**
• **Cold Storage vs. Immediate Liquidation Advisor**
• **Smart Sourcing & Counterparty Matchmaker**
• **AI Crop Disease & Freshness Scanner**
• **Live GPS Fleet Cold-Chain Tracking**

What would you like me to explain or guide you through?`,
      quickActions: this.getQuickActions(role, lang),
      voiceText: "I can explain every feature of AgriNex, payment gateways and escrow details, cold storage advice, price discovery, and order tracking in your preferred language. What would you like to know?"
    };
  }

  getQuickActions(role, lang = 'en') {
    if (lang === 'hi') {
      if (role === 'FARMER') {
        return [
          { label: '🌱 फसल जोड़ें', path: '/farmer/add-crop' },
          { label: '🤝 मेरे ऑफर', path: '/farmer/offers' },
          { label: '💰 मेरी कमाई', path: '/farmer/earnings' },
          { label: '📈 मंडी भाव', path: '/prices' }
        ];
      }
      return [
        { label: '🛒 मार्केटप्लेस', path: '/marketplace' },
        { label: '📈 मंडी भाव', path: '/prices' },
        { label: '🔍 फसल स्कैनर', path: '/crop-scanner' },
        { label: '🛰️ जीपीएस फ्लीट', path: '/fleet' }
      ];
    }

    if (lang === 'te') {
      if (role === 'FARMER') {
        return [
          { label: '🌱 పంట నమోదు', path: '/farmer/add-crop' },
          { label: '🤝 నా ఆఫర్లు', path: '/farmer/offers' },
          { label: '💰 నా సంపాదన', path: '/farmer/earnings' },
          { label: '📈 మార్కెట్ ధరలు', path: '/prices' }
        ];
      }
      return [
        { label: '🛒 మార్కెట్‌ప్లేస్', path: '/marketplace' },
        { label: '📈 మార్కెట్ ధరలు', path: '/prices' },
        { label: '🔍 క్రాప్ స్కానర్', path: '/crop-scanner' },
        { label: '🛰️ జీపీఎస్ ఫ్లీట్', path: '/fleet' }
      ];
    }

    if (role === 'FARMER') {
      return [
        { label: '🌱 List My Crop', path: '/farmer/add-crop' },
        { label: '🤝 Check Offers', path: '/farmer/offers' },
        { label: '📦 Check Orders', path: '/farmer/orders' },
        { label: '💰 My Earnings', path: '/farmer/earnings' },
        { label: '📈 Price Discovery', path: '/prices' },
        { label: '🔍 AI Crop Scanner', path: '/crop-scanner' }
      ];
    }
    return [
      { label: '🛒 Marketplace', path: '/marketplace' },
      { label: '📈 Mandi Prices', path: '/prices' },
      { label: '🔍 AI Scanner', path: '/crop-scanner' },
      { label: '🛰️ GPS Fleet', path: '/fleet' }
    ];
  }

  // Voice Context for First-Time Voice Welcome
  getVoiceWelcome(user, lang = 'en') {
    const role = user?.role || 'FARMER';
    const name = user?.name ? user.name.split(' ')[0] : '';

    if (lang === 'hi') {
      return {
        title: `एग्रीनेक्स में आपका स्वागत है${name ? ', ' + name : ''}!`,
        text: `नमस्ते! मैं आपका एग्रीनेक्स सम्पूर्ण गाइड और वॉयस असिस्टेंट हूँ। मैं आपको प्लेटफॉर्म के सभी फीचर्स, सुरक्षित एस्क्रो पेमेंट्स, कोल्ड स्टोरेज निर्णय और मंडी भाव की पूरी जानकारी आपकी मातृभाषा में दे सकता हूँ।`,
        speechText: `नमस्ते! मैं आपका एग्रीनेक्स वॉयस असिस्टेंट हूँ। मैं आपको सभी फीचर्स और पेमेंट्स की जानकारी आपकी मातृभाषा में दे सकता हूँ।`,
        role
      };
    }

    if (lang === 'te') {
      return {
        title: `అగ్రినెక్స్‌కు స్వాగతం${name ? ', ' + name : ''}!`,
        text: `నమస్కారం! నేను మీ అగ్రినెక్స్ గైడ్ మరియు వాయిస్ అసిస్టెంట్‌ని. ప్లాట్‌ఫారమ్ ఫీచర్లు, ఎస్క్రో చెల్లింపులు, కోల్డ్ స్టోరేజ్ మరియు మార్కెట్ ధరల గురించి మీ మాతృభాషలో వివరించగలను.`,
        speechText: `నమస్కారం! నేను మీ అగ్రినెక్స్ వాయిస్ అసిస్టెంట్‌ని. ప్లాట్‌ఫారమ్ ఫీచర్లు మరియు చెల్లింపుల వివరాలను మీ మాతృభాషలో తెలుసుకోవచ్చు.`,
        role
      };
    }

    return {
      title: `Welcome to AgriNex${name ? ', ' + name : ''}!`,
      text: `Welcome to AgriNex. I am your AgriNex Complete Guide & Voice Assistant. I can explain every feature of the app, guide you through multi-gateway escrow payments, and answer any questions by text or voice in your preferred language.`,
      speechText: `Welcome to AgriNex${name ? ' ' + name : ''}. I am your AgriNex assistant. I can explain every feature of the app and guide you through payments and market prices. How can I help you today?`,
      role
    };
  }

  saveHistory(userId, message, response) {
    if (!userId) return null;
    return db.insert(this.historyCollection, {
      userId,
      userMessage: message,
      assistantReply: response.reply,
      action: response.action || null,
      timestamp: new Date().toISOString()
    });
  }

  getHistory(userId, limit = 20) {
    if (!userId) return [];
    const list = db.find(this.historyCollection, { userId }) || [];
    return list.slice(-limit);
  }

  clearHistory(userId) {
    if (!userId) return false;
    const all = db.find(this.historyCollection);
    const filtered = all.filter(h => h.userId !== userId);
    db.collections[this.historyCollection] = filtered;
    db.saveToDisk(this.historyCollection);
    return true;
  }
}

module.exports = new AssistantService();
