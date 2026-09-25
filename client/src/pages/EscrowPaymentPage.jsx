import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  TrendingUp,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Coins,
  ShieldAlert,
  Copy,
  Search,
  Filter,
  Printer,
  ExternalLink,
  UserCheck,
  X,
  ChevronRight,
  FileText,
  Smartphone
} from 'lucide-react';
import UpiQRCode from '../components/common/UpiQRCode';

export default function EscrowPaymentPage() {
  const { user } = useAuth();
  const { showToast } = useCart();

  // Active section tab: 'upi' | 'escrow' | 'payouts' | 'ledger'
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (['upi', 'escrow', 'payouts', 'ledger'].includes(hash)) return hash;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (['upi', 'escrow', 'payouts', 'ledger'].includes(tabParam)) return tabParam;
    return 'upi';
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
    const labels = {
      upi: '⚡ UPI Instant Terminal',
      escrow: '🔒 Escrow Digital Vault',
      payouts: '👤 Farmer Payout Profiles',
      ledger: '📜 Transaction Ledger & Invoices'
    };
    if (showToast) {
      showToast(`Active Feature: ${labels[tabId] || tabId}`);
    }
  };

  const [stats, setStats] = useState({
    totalEscrowVolume: 4904000,
    totalLockedInEscrow: 1304000,
    totalReleasedToFarmers: 3600000,
    activeProtectedTrades: 19,
    disputeRate: 0,
    settlementTimeMinutes: 1.5,
    rbiCompliant: true,
    escrowPartner: 'ICICI Bank Smart Escrow / Yes Bank Node'
  });

  const [ledger, setLedger] = useState([
    {
      id: 'escrow_init_1',
      orderId: 'AGX-ORD-88401',
      cropName: 'Basmati Rice (Pusa 1121)',
      farmerName: 'Ramesh Patel (Nashik)',
      payerName: 'FreshDirect Wholesalers',
      farmerUpi: 'rameshpatel@okhdfcbank',
      quantityKg: 2000,
      amount: 144000,
      paymentMethod: 'UPI',
      escrowReference: 'AGX-VAULT-994821',
      transactionId: 'UPI/389102948192/APMC',
      releaseOtp: '884920',
      status: 'HELD_IN_ESCROW',
      paidAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'escrow_init_2',
      orderId: 'AGX-ORD-77219',
      cropName: 'Nashik Red Onion (Export Grade)',
      farmerName: 'Sanjay Shinde (Lasalgaon)',
      payerName: 'Metro Cash & Carry',
      farmerUpi: 'sanjayshinde@oksbi',
      quantityKg: 5000,
      amount: 140000,
      paymentMethod: 'UPI',
      escrowReference: 'AGX-VAULT-662190',
      transactionId: 'UPI/381928491028/APMC',
      releaseOtp: '123456',
      status: 'RELEASED_TO_FARMER',
      paidAt: new Date(Date.now() - 86400000).toISOString(),
      releasedAt: new Date(Date.now() - 72000000).toISOString()
    },
    {
      id: 'escrow_init_3',
      orderId: 'AGX-ORD-65104',
      cropName: 'Sona Masuri Premium Paddy',
      farmerName: 'Venkat Reddy (Kurnool)',
      payerName: 'Apex Grains Ltd',
      farmerUpi: 'venkatreddy@okaxis',
      quantityKg: 4000,
      amount: 192000,
      paymentMethod: 'UPI',
      escrowReference: 'AGX-VAULT-331902',
      transactionId: 'UPI/991029384716/APMC',
      releaseOtp: '492810',
      status: 'RELEASED_TO_FARMER',
      paidAt: new Date(Date.now() - 172800000).toISOString(),
      releasedAt: new Date(Date.now() - 150000000).toISOString()
    }
  ]);

  // UPI Terminal State
  const [upiPayee, setUpiPayee] = useState('Ramesh Patel (Nashik)');
  const [upiPayeeVpa, setUpiPayeeVpa] = useState('rameshpatel@okhdfcbank');
  const [upiPayAmount, setUpiPayAmount] = useState('48000');
  const [upiCropTitle, setUpiCropTitle] = useState('Wheat (Sharbati) - Lot #882');
  const [upiPinModal, setUpiPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [isProcessingUpi, setIsProcessingUpi] = useState(false);
  const [upiReceipt, setUpiReceipt] = useState(null);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Location & Cart Integration
  const location = useLocation();
  useEffect(() => {
    if (location.state?.depositAmount) {
      setAmount(String(location.state.depositAmount));
      setUpiPayAmount(String(location.state.depositAmount));
    }
    if (location.state?.cropsSummary) {
      setUpiCropTitle(location.state.cropsSummary);
    }
  }, [location.state]);

  // Escrow Vault Simulator State
  const [cropSelection, setCropSelection] = useState('Wheat (Sharbati) - Ramesh Patel (₹32/kg)');
  const [amount, setAmount] = useState('48000');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING' | 'NEFT' | 'WALLET' | 'RAZORPAY'
  const [upiId, setUpiId] = useState('wholesale.buyer@okaxis');
  const [loadingDeposit, setLoadingDeposit] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(null);

  // 1. Debit & Credit Cards / RuPay Kisan Card State
  const [cardHolder, setCardHolder] = useState('Rajesh Sharma (Wholesale Agribusiness)');
  const [cardNumber, setCardNumber] = useState('6071 8829 4410 9921');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardType, setCardType] = useState('RUPAY_KISAN'); // 'RUPAY_KISAN' | 'VISA' | 'MASTERCARD'
  const [saveCardToken, setSaveCardToken] = useState(true);
  const [showCardOtpModal, setShowCardOtpModal] = useState(false);
  const [cardOtpInput, setCardOtpInput] = useState('');
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  // 2. Net Banking Gateway State
  const [selectedNetBank, setSelectedNetBank] = useState('State Bank of India');
  const [showNetBankingModal, setShowNetBankingModal] = useState(false);
  const [netBankUserId, setNetBankUserId] = useState('CORP_AGRI_8892');
  const [netBankPassword, setNetBankPassword] = useState('••••••••••');
  const [isProcessingNetBanking, setIsProcessingNetBanking] = useState(false);

  // 3. NEFT / RTGS Wire Transfer (Virtual Escrow Account) State
  const [virtualAccountNo, setVirtualAccountNo] = useState('AGXVAULT772091');
  const [escrowIfsc, setEscrowIfsc] = useState('ICIC0000104');
  const [utrInput, setUtrInput] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [copiedVan, setCopiedVan] = useState(false);

  // 4. AgriNex Agri-Credit Wallet State
  const [walletBalance, setWalletBalance] = useState(150000);
  const [walletCreditLimit, setWalletCreditLimit] = useState(250000);

  // 5. Razorpay Unified Gateway State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);

  // OTP Release State
  const [activeReleasePayment, setActiveReleasePayment] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [releasing, setReleasing] = useState(false);
  const [releaseMsg, setReleaseMsg] = useState({ text: '', isError: false });

  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Penny-Drop Verification State
  const [testingPenny, setTestingPenny] = useState(false);
  const [pennyStatus, setPennyStatus] = useState(null);

  // Search & Filters in Ledger
  const [ledgerFilter, setLedgerFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Load stats from backend
  const loadStats = async () => {
    try {
      const res = await api.get('/payments/escrow-stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
      const payRes = await api.get('/payments');
      if (payRes.success && payRes.data && payRes.data.length > 0) {
        setLedger(prev => {
          const ids = new Set(prev.map(p => p.id));
          const newOnes = payRes.data.filter(p => !ids.has(p.id));
          return [...newOnes, ...prev];
        });
      }
    } catch (e) {
      console.warn('Escrow stats fallback:', e.message);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Keyboard shortcut listener for feature keys: 1, 2, 3, 4 (and u, e, p, l, arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when user is typing into input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === '1' || e.key.toLowerCase() === 'u') {
        handleTabChange('upi');
      } else if (e.key === '2' || e.key.toLowerCase() === 'e') {
        handleTabChange('escrow');
      } else if (e.key === '3' || e.key.toLowerCase() === 'p') {
        handleTabChange('payouts');
      } else if (e.key === '4' || e.key.toLowerCase() === 'l') {
        handleTabChange('ledger');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const tabs = ['upi', 'escrow', 'payouts', 'ledger'];
        const currIdx = tabs.indexOf(activeTab);
        if (currIdx !== -1) {
          const nextIdx = e.key === 'ArrowRight'
            ? (currIdx + 1) % tabs.length
            : (currIdx - 1 + tabs.length) % tabs.length;
          handleTabChange(tabs[nextIdx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // UPI Deep Link String
  const upiUriString = `upi://pay?pa=${upiPayeeVpa}&pn=${encodeURIComponent(upiPayee)}&am=${upiPayAmount || 0}&cu=INR&tn=${encodeURIComponent(`AgriNex_Escrow_${upiCropTitle.replace(/\s+/g, '_')}`)}`;

  const handleCopyUpiVpa = (vpa) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(vpa);
    }
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
    showToast(`✓ Farmer UPI ID copied: ${vpa}`);
  };

  // Trigger simulated UPI PIN keypad
  const handleOpenUpiPin = (e) => {
    e.preventDefault();
    if (!upiPayAmount || Number(upiPayAmount) <= 0) {
      showToast('Please specify a valid payment amount');
      return;
    }
    setEnteredPin('');
    setUpiPinModal(true);
  };

  // Complete simulated UPI PIN authorization
  const handleAuthorizeUpiPayment = async () => {
    if (enteredPin.length < 4) {
      showToast('Please enter your 4 or 6 digit UPI MPIN');
      return;
    }

    setIsProcessingUpi(true);

    try {
      const res = await api.post('/payments/escrow-deposit', {
        amount: Number(upiPayAmount),
        cropName: upiCropTitle,
        farmerName: upiPayee,
        paymentMethod: 'UPI',
        quantityKg: Math.round(Number(upiPayAmount) / 30)
      });

      setIsProcessingUpi(false);
      setUpiPinModal(false);

      const txnData = res.success ? res.data : {
        id: `txn_${Date.now()}`,
        orderId: `AGX-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        cropName: upiCropTitle,
        farmerName: upiPayee,
        payerName: user?.name || 'Wholesale Buyer',
        farmerUpi: upiPayeeVpa,
        quantityKg: Math.round(Number(upiPayAmount) / 30),
        amount: Number(upiPayAmount),
        paymentMethod: 'UPI',
        escrowReference: `AGX-VAULT-${Math.floor(100000 + Math.random() * 900000)}`,
        transactionId: `UPI/${Date.now()}/APMC`,
        releaseOtp: Math.floor(100000 + Math.random() * 900000).toString(),
        status: 'HELD_IN_ESCROW',
        paidAt: new Date().toISOString()
      };

      setUpiReceipt(txnData);
      setLedger(prev => [txnData, ...prev]);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      showToast(`🎉 ₹${Number(upiPayAmount).toLocaleString('en-IN')} UPI Escrow Secured for ${upiPayee}!`);
      loadStats();
    } catch (err) {
      setIsProcessingUpi(false);
      setUpiPinModal(false);
      showToast(`UPI simulated transaction completed`);
    }
  };

  // Generic Multi-Gateway Escrow Deposit
  const executeEscrowDeposit = async (methodName, details = {}) => {
    setLoadingDeposit(true);
    try {
      const parts = cropSelection.split(' - ');
      const cropName = parts[0] || 'Wheat (Sharbati)';
      const farmerName = parts[1] ? parts[1].split(' (')[0] : 'Ramesh Patel';

      const res = await api.post('/payments/escrow-deposit', {
        amount: Number(amount),
        cropName,
        farmerName,
        paymentMethod: methodName || paymentMethod,
        quantityKg: Math.round(Number(amount) / 30),
        ...details
      });

      setLoadingDeposit(false);

      const depositData = res.success ? res.data : {
        id: `dep_${Date.now()}`,
        orderId: `AGX-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        cropName,
        farmerName,
        payerName: user?.name || 'Wholesale Buyer',
        farmerUpi: 'farmer.direct@okhdfcbank',
        quantityKg: Math.round(Number(amount) / 30),
        amount: Number(amount),
        paymentMethod: methodName || paymentMethod,
        escrowReference: `AGX-VAULT-${Math.floor(100000 + Math.random() * 900000)}`,
        transactionId: `${methodName.split(' ')[0]}/${Date.now()}/ESCROW`,
        releaseOtp: Math.floor(100000 + Math.random() * 900000).toString(),
        status: 'HELD_IN_ESCROW',
        paidAt: new Date().toISOString()
      };

      setDepositSuccess(depositData);
      setLedger(prev => [depositData, ...prev]);

      try {
        confetti({
          particleCount: 95,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      showToast(`✓ ₹${Number(amount).toLocaleString('en-IN')} locked safely in Escrow via ${methodName}!`);
      loadStats();
      return depositData;
    } catch (err) {
      setLoadingDeposit(false);
      showToast(err.message || 'Deposit simulation completed');
    }
  };

  // 1. Card Submit -> Triggers 3D Secure Bank OTP Modal
  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.length < 12) {
      showToast('Please enter a valid card number');
      return;
    }
    setCardOtpInput('');
    setShowCardOtpModal(true);
  };

  // 1.1 Confirm Card 3D Secure OTP
  const handleConfirmCardOtp = async (e) => {
    e.preventDefault();
    setIsProcessingCard(true);
    setTimeout(async () => {
      setIsProcessingCard(false);
      setShowCardOtpModal(false);
      await executeEscrowDeposit(`CARD (${cardType === 'RUPAY_KISAN' ? 'RuPay Kisan' : cardType})`, {
        cardNumber: cardNumber.slice(-4),
        cardHolder
      });
    }, 1200);
  };

  // 2. Net Banking Submit -> Triggers Bank Login Modal
  const handleNetBankingSubmit = (e) => {
    e.preventDefault();
    setShowNetBankingModal(true);
  };

  // 2.1 Confirm Net Banking Auth
  const handleConfirmNetBanking = async (e) => {
    e.preventDefault();
    setIsProcessingNetBanking(true);
    setTimeout(async () => {
      setIsProcessingNetBanking(false);
      setShowNetBankingModal(false);
      await executeEscrowDeposit(`NETBANKING (${selectedNetBank})`, {
        bankName: selectedNetBank,
        userId: netBankUserId
      });
    }, 1400);
  };

  // 3. NEFT / RTGS Wire Transfer Verification
  const handleVerifyUtrSubmit = async (e) => {
    e.preventDefault();
    if (!utrInput || utrInput.trim().length < 8) {
      showToast('Please enter a valid 12-to-16 digit UTR or Transaction reference');
      return;
    }
    setIsVerifyingUtr(true);
    setTimeout(async () => {
      setIsVerifyingUtr(false);
      const utrVal = utrInput.trim();
      setUtrInput('');
      await executeEscrowDeposit(`NEFT / RTGS Bank Wire`, {
        utrNumber: utrVal,
        virtualAccount: virtualAccountNo
      });
    }, 1300);
  };

  // 4. Agri-Credit Wallet Debit
  const handleWalletDebitSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) > walletBalance) {
      showToast('Amount exceeds available credit line balance');
      return;
    }
    setWalletBalance(prev => prev - Number(amount));
    await executeEscrowDeposit('AgriNex Agri-Credit Line', {
      creditLimit: walletCreditLimit
    });
  };

  // 5. Razorpay Unified Gateway Checkout Simulation
  const handleRazorpayCheckout = async () => {
    setRazorpayProcessing(true);
    setTimeout(async () => {
      setRazorpayProcessing(false);
      setShowRazorpayModal(false);
      await executeEscrowDeposit('Razorpay Smart Gateway', {
        gatewayRef: `RZP-${Date.now()}`
      });
    }, 1500);
  };

  // Standard Deposit Dispatcher based on active selection
  const handleDeposit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'CARD') return handleCardSubmit(e);
    if (paymentMethod === 'NETBANKING') return handleNetBankingSubmit(e);
    if (paymentMethod === 'NEFT') return handleVerifyUtrSubmit(e);
    if (paymentMethod === 'WALLET') return handleWalletDebitSubmit(e);
    if (paymentMethod === 'RAZORPAY') return setShowRazorpayModal(true);
    return executeEscrowDeposit('UPI Instant / Dynamic QR');
  };

  // Escrow OTP Release
  const handleReleaseOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      setReleaseMsg({ text: 'Please enter the 6-digit delivery OTP (try 123456 or 884920)', isError: true });
      return;
    }

    setReleasing(true);
    setReleaseMsg({ text: '', isError: false });

    try {
      const res = await api.post('/payments/escrow-release', {
        paymentId: activeReleasePayment.id,
        otp: otpInput
      });

      setReleasing(false);

      if (res.success) {
        setReleaseMsg({ text: res.message, isError: false });
        setLedger(prev => prev.map(p => p.id === activeReleasePayment.id ? { ...p, status: 'RELEASED_TO_FARMER', releasedAt: new Date().toISOString() } : p));
        showToast(`✓ Escrow Released: Funds transferred to farmer's UPI account!`);

        try {
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.5 }
          });
        } catch (e) {}

        setTimeout(() => {
          setActiveReleasePayment(null);
          setOtpInput('');
          setReleaseMsg({ text: '', isError: false });
          loadStats();
        }, 1600);
      } else {
        setReleaseMsg({ text: res.message || 'Invalid delivery OTP', isError: true });
      }
    } catch (err) {
      setReleasing(false);
      setReleaseMsg({ text: err.message || 'Verification failed', isError: true });
    }
  };

  // Penny-Drop Test Simulator
  const handleRunPennyDrop = (farmerName, bank) => {
    setTestingPenny(true);
    setPennyStatus(null);
    setTimeout(() => {
      setTestingPenny(false);
      setPennyStatus({
        farmer: farmerName,
        bank,
        ref: `NPCI/PD/${Date.now()}`,
        status: 'SUCCESS'
      });
      showToast(`✓ ₹1 Penny-Drop Successful: ${farmerName}'s ${bank} account verified!`);
    }, 1200);
  };

  // Filtered Ledger
  const filteredLedger = ledger.filter(item => {
    if (ledgerFilter === 'LOCKED' && item.status !== 'HELD_IN_ESCROW') return false;
    if (ledgerFilter === 'RELEASED' && item.status !== 'RELEASED_TO_FARMER') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (item.cropName || '').toLowerCase().includes(q) ||
                    (item.farmerName || '').toLowerCase().includes(q) ||
                    (item.orderId || '').toLowerCase().includes(q) ||
                    (item.escrowReference || '').toLowerCase().includes(q) ||
                    (item.transactionId || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '36px 16px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Payments Hub Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1.5px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '28px',
        padding: '32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 800 }}>
              <ShieldCheck size={16} style={{ marginRight: '6px' }} /> 100% ESCROW PROTECTED PAYMENTS
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 700 }}>
              🏛️ {stats.escrowPartner}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#2563eb',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}>
              NPCI DBT Direct Settlement
            </span>
          </div>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: '0 0 10px' }}>
          Payments & Digital Escrow Hub
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '780px', margin: 0, lineHeight: 1.6 }}>
          Direct, instant UPI transfers and RBI-compliant digital escrow protection for agricultural procurement. Funds are held in virtual vault and disbursed directly to farmers upon 6-digit delivery OTP verification.
        </p>

        {/* Section Navigation Tabs & Feature Keys */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '24px',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px'
        }}>
          {[
            { id: 'upi', label: 'UPI Instant Terminal', icon: QrCode, badge: 'FAST', keyNum: '1' },
            { id: 'escrow', label: 'Escrow Digital Vault', icon: Lock, badge: 'PROTECTED', keyNum: '2' },
            { id: 'payouts', label: 'Farmer Payout Profiles', icon: UserCheck, badge: 'VERIFIED', keyNum: '3' },
            { id: 'ledger', label: 'Transaction Ledger & Invoices', icon: FileText, badge: `${ledger.length} TXNS`, keyNum: '4' }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`btn ${active ? 'btn-aurora' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  fontSize: '0.875rem',
                  fontWeight: active ? 800 : 700,
                  cursor: 'pointer',
                  border: active ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid var(--border-color)',
                  boxShadow: active ? '0 0 24px var(--btn-aura-color, rgba(14, 165, 233, 0.7))' : 'none'
                }}
                title={`Press [${tab.keyNum}] on keyboard to activate ${tab.label}`}
              >
                <kbd style={{
                  fontSize: '0.6875rem',
                  fontWeight: 900,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: active ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-card)',
                  color: active ? '#ffffff' : 'var(--color-primary-600)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.12)'
                }}>
                  Key {tab.keyNum}
                </kbd>
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: active ? 'rgba(255, 255, 255, 0.28)' : 'rgba(14, 165, 233, 0.15)',
                    color: active ? '#ffffff' : 'var(--color-primary-500)',
                    border: active ? 'none' : '1px solid rgba(14, 165, 233, 0.3)'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust & Vault Key Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '22px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Total Protected Volume</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
            ₹{stats.totalEscrowVolume.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across 80+ crop trade categories
          </div>
        </div>

        <div className="card" style={{ padding: '22px', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Locked in Active Escrow</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0ea5e9' }}>
            ₹{stats.totalLockedInEscrow.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting 6-digit delivery OTP release
          </div>
        </div>

        <div className="card" style={{ padding: '22px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Released to Farmers</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>
            ₹{stats.totalReleasedToFarmers.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Direct instant UPI/NEFT payout
          </div>
        </div>

        <div className="card" style={{ padding: '22px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Average Payout Speed</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8b5cf6' }}>
            {stats.settlementTimeMinutes} mins
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
            ✓ 0% Default Risk
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UPI INSTANT PAYMENT TERMINAL */}
      {/* ========================================================================= */}
      {activeTab === 'upi' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
          {/* Terminal Input Form */}
          <div className="glass-card" style={{ padding: '32px 28px', borderRadius: '24px', border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>UPI Instant Escrow Terminal</h2>
                <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>Direct UPI intent or scan dynamic QR code</span>
              </div>
            </div>

            <form onSubmit={handleOpenUpiPin} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Select Farmer / Beneficiary</label>
                <select
                  className="form-control"
                  value={upiPayee}
                  onChange={(e) => {
                    const name = e.target.value;
                    setUpiPayee(name);
                    if (name.includes('Ramesh')) setUpiPayeeVpa('rameshpatel@okhdfcbank');
                    else if (name.includes('Sanjay')) setUpiPayeeVpa('sanjayshinde@oksbi');
                    else if (name.includes('Venkat')) setUpiPayeeVpa('venkatreddy@okaxis');
                    else setUpiPayeeVpa('farmer.direct@okhdfcbank');
                  }}
                >
                  <option value="Ramesh Patel (Nashik)">Ramesh Patel (Nashik) • Wheat & Dhaniya</option>
                  <option value="Sanjay Shinde (Lasalgaon)">Sanjay Shinde (Lasalgaon) • Red Onion</option>
                  <option value="Venkat Reddy (Kurnool)">Venkat Reddy (Kurnool) • Sona Masuri Rice</option>
                  <option value="Ratnagiri Orchards">Ratnagiri Orchards • Alphonso Mangoes</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, margin: 0 }}>Farmer UPI VPA</label>
                  <button
                    type="button"
                    onClick={() => handleCopyUpiVpa(upiPayeeVpa)}
                    style={{ background: 'transparent', border: 'none', color: copiedVpa ? '#10b981' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedVpa ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {copiedVpa ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={upiPayeeVpa}
                  onChange={(e) => setUpiPayeeVpa(e.target.value)}
                  placeholder="farmer@okhdfcbank"
                  style={{ fontWeight: 800, color: '#10b981' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Procurement Lot Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={upiCropTitle}
                  onChange={(e) => setUpiCropTitle(e.target.value)}
                  placeholder="e.g. Wheat (Sharbati) - Lot #882"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Payment Amount (₹)</label>
                <div className="input-group">
                  <span className="input-icon">₹</span>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={upiPayAmount}
                    onChange={(e) => setUpiPayAmount(e.target.value)}
                    placeholder="e.g. 48000"
                    style={{ fontSize: '1.25rem', fontWeight: 900 }}
                  />
                </div>

                {/* Amount Quick Chips */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {['5000', '15000', '48000', '144000'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setUpiPayAmount(p)}
                      className={`btn ${upiPayAmount === p ? 'btn-aurora btn-sm' : 'btn-secondary btn-sm'}`}
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      ₹{Number(p).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <button
                  type="submit"
                  className="btn btn-aurora"
                  style={{
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '14px'
                  }}
                >
                  <Lock size={18} /> Enter UPI MPIN & Lock in Escrow
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { name: 'GPay', color: '#2563eb' },
                    { name: 'PhonePe', color: '#7c3aed' },
                    { name: 'Paytm', color: '#0284c7' },
                    { name: 'BHIM', color: '#16a34a' }
                  ].map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => {
                        showToast(`Opened ${app.name} Instant UPI Terminal`);
                        setEnteredPin('1234');
                        setUpiPinModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: app.color, fontWeight: 900, textAlign: 'center', padding: '10px 4px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Dynamic UPI QR Terminal Card */}
          <div className="glass-card" style={{ padding: '32px 28px', borderRadius: '24px', border: '1.5px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <span className="badge badge-success" style={{ marginBottom: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
              <ShieldCheck size={14} style={{ marginRight: '4px' }} /> DYNAMIC BHIM UPI QR TERMINAL
            </span>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 4px' }}>
              Scan to Pay ₹{Number(upiPayAmount || 0).toLocaleString('en-IN')}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 20px', maxWidth: '300px' }}>
              Funds will be held securely in virtual escrow and credited to {upiPayee} upon harvest delivery.
            </p>

            <UpiQRCode
              value={upiUriString}
              size={210}
              payeeName={upiPayee}
              amount={upiPayAmount}
              vpa={upiPayeeVpa}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ESCROW DIGITAL VAULT */}
      {/* ========================================================================= */}
      {activeTab === 'escrow' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
          {/* Deposit Form */}
          <div className="glass-card" style={{ padding: '32px 28px', borderRadius: '24px', border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Deposit into Escrow Vault</h2>
                <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>Multi-channel buyer fund locking</span>
              </div>
            </div>

            <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Select Crop Harvest & Farmer</label>
                <select
                  className="form-control"
                  value={cropSelection}
                  onChange={(e) => setCropSelection(e.target.value)}
                >
                  <option value="Wheat (Sharbati) - Ramesh Patel (₹32/kg)">Wheat (Sharbati) - Ramesh Patel (₹32/kg)</option>
                  <option value="Sona Masuri Rice - Venkat Reddy (₹48/kg)">Sona Masuri Rice - Venkat Reddy (₹48/kg)</option>
                  <option value="Nashik Red Onion - Sanjay Shinde (₹28/kg)">Nashik Red Onion - Sanjay Shinde (₹28/kg)</option>
                  <option value="Alphonso Mango - Ratnagiri Orchards (₹120/kg)">Alphonso Mango - Ratnagiri Orchards (₹120/kg)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Deposit Amount (INR)</label>
                <div className="input-group">
                  <span className="input-icon">₹</span>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 48000"
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700, margin: 0 }}>
                    Select Payment Gateway
                  </label>
                  <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                    100% Escrow Protected
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'UPI', label: 'BHIM UPI & QR', icon: QrCode, badge: 'Instant' },
                    { id: 'CARD', label: 'Cards / RuPay Kisan', icon: CreditCard, badge: 'RuPay/Visa' },
                    { id: 'NETBANKING', label: 'Net Banking', icon: Building2, badge: '50+ Banks' },
                    { id: 'NEFT', label: 'NEFT / RTGS Wire', icon: FileCheck, badge: 'VAN' },
                    { id: 'WALLET', label: 'Agri-Credit Line', icon: Wallet, badge: 'NABARD' },
                    { id: 'RAZORPAY', label: 'Razorpay Gateway', icon: Sparkles, badge: 'Unified' }
                  ].map(m => {
                    const Icon = m.icon;
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id);
                          showToast(`Selected ${m.label} Gateway`);
                        }}
                        className={`btn ${active ? 'btn-aurora' : 'btn-secondary'}`}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '6px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Icon size={18} color={active ? '#ffffff' : 'var(--color-primary-500)'} />
                          <span style={{
                            fontSize: '0.625rem',
                            fontWeight: 900,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(14, 165, 233, 0.15)',
                            color: active ? '#ffffff' : 'var(--color-primary-500)'
                          }}>
                            {m.badge}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: active ? 800 : 700 }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC PAYMENT GATEWAY DETAILS PANEL */}
              {/* 1. CARD PAYMENT GATEWAY */}
              {paymentMethod === 'CARD' && (
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#2563eb' }}>
                      💳 CREDIT / DEBIT / RUPAY KISAN CARD
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      3D Secure 2.0
                    </span>
                  </div>

                  {/* Quick Test Cards */}
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Quick 1-Click Demo Cards:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'RuPay Kisan Card (Demo)', num: '6071 8829 4410 9921', holder: 'Ramesh Patel', exp: '08/29', cvv: '842', type: 'RUPAY_KISAN' },
                        { label: 'HDFC Visa Business', num: '4532 9910 8821 3491', holder: 'FreshDirect Wholesale Ltd', exp: '11/28', cvv: '492', type: 'VISA' },
                        { label: 'SBI Corporate Mastercard', num: '5241 6610 8820 9104', holder: 'Metro Cash & Carry', exp: '04/30', cvv: '294', type: 'MASTERCARD' }
                      ].map((tc, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setCardNumber(tc.num);
                            setCardHolder(tc.holder);
                            setCardExpiry(tc.exp);
                            setCardCvv(tc.cvv);
                            setCardType(tc.type);
                            showToast(`Loaded ${tc.label}`);
                          }}
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: cardNumber === tc.num ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-muted)',
                            color: cardNumber === tc.num ? '#10b981' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {tc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Number & Brand Badge */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Card Number:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="6071 •••• •••• 9921"
                        className="form-control"
                        style={{ fontWeight: 800, paddingRight: '90px' }}
                        required
                      />
                      <span style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: cardType === 'RUPAY_KISAN' ? '#16a34a' : '#2563eb',
                        color: '#fff'
                      }}>
                        {cardType === 'RUPAY_KISAN' ? 'RuPay Kisan' : cardType}
                      </span>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Cardholder Name:
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on Card"
                      className="form-control"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Expiry MM/YY:
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="form-control"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        CVV / CVC:
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={saveCardToken}
                      onChange={(e) => setSaveCardToken(e.target.checked)}
                    />
                    <span>Securely tokenize card as per RBI digital compliance guidelines.</span>
                  </label>
                </div>
              )}

              {/* 2. NET BANKING GATEWAY */}
              {paymentMethod === 'NETBANKING' && (
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#059669' }}>
                      🏛️ INTERNET BANKING (50+ BANKS)
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                      Instant Settlement
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Select Your Scheduled Bank:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                      {[
                        'State Bank of India',
                        'HDFC Bank',
                        'ICICI Bank',
                        'Axis Bank',
                        'Kotak Mahindra',
                        'Punjab National Bank'
                      ].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedNetBank(b)}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '10px',
                            border: `1.5px solid ${selectedNetBank === b ? '#10b981' : 'var(--border-color)'}`,
                            background: selectedNetBank === b ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-muted)',
                            color: selectedNetBank === b ? '#10b981' : 'var(--text-main)',
                            fontSize: '0.73rem',
                            fontWeight: selectedNetBank === b ? 800 : 600,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>

                    <select
                      className="form-control"
                      value={selectedNetBank}
                      onChange={(e) => setSelectedNetBank(e.target.value)}
                    >
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="Federal Bank">Federal Bank</option>
                      <option value="IDBI Bank">IDBI Bank</option>
                    </select>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span>You will be routed to {selectedNetBank}'s secure Net Banking gateway to authorize escrow lock.</span>
                  </div>
                </div>
              )}

              {/* 3. NEFT / RTGS WIRE TRANSFER */}
              {paymentMethod === 'NEFT' && (
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#d97706' }}>
                      🏦 DIRECT NEFT / RTGS / IMPS ESCROW WIRE
                    </span>
                    <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                      Large Volume
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-muted)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.78125rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Virtual Escrow A/C (VAN):</span>
                      <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {virtualAccountNo}
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(virtualAccountNo);
                            setCopiedVan(true);
                            setTimeout(() => setCopiedVan(false), 2000);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedVan ? '#10b981' : 'var(--text-muted)' }}
                        >
                          {copiedVan ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        </button>
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Escrow IFSC Code:</span>
                      <strong>{escrowIfsc} (ICICI Bank Smart Escrow)</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Beneficiary Name:</span>
                      <strong>AgriNex Escrow Trust Account</strong>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Enter Bank UTR Reference Number:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="e.g. UTR884920194821"
                        className="form-control"
                        style={{ fontWeight: 800 }}
                      />
                      <button
                        type="button"
                        onClick={() => setUtrInput(`UTR${Date.now().toString().slice(-10)}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap', fontSize: '0.72rem' }}
                      >
                        Auto-fill UTR
                      </button>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Wire funds from your corporate bank portal and submit the UTR to match.
                    </span>
                  </div>
                </div>
              )}

              {/* 4. AGRINEX AGRI-CREDIT WALLET */}
              {paymentMethod === 'WALLET' && (
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#8b5cf6' }}>
                      💳 AGRINEX PRE-APPROVED TRADE CREDIT LINE
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                      NABARD Backed
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: 'var(--bg-muted)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Available Credit Limit:</span>
                      <strong style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{walletBalance.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Approved Facility:</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>₹{walletCreditLimit.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Instant 1-click debit without third-party redirects. Repayable within 30 days post delivery.
                  </div>
                </div>
              )}

              {/* 5. RAZORPAY UNIFIED GATEWAY */}
              {paymentMethod === 'RAZORPAY' && (
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 800, color: '#0284c7' }}>
                      ⚡ RAZORPAY SMART MULTI-GATEWAY CHECKOUT
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                      All Indian Methods
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Launch the official Razorpay multi-payment dialog supporting UPI AutoPay, Credit/Debit cards, Net Banking, and PayLater in a single interface.
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON WITH METHOD CONTEXT */}
              <button
                type="submit"
                disabled={loadingDeposit}
                className="btn btn-aurora btn-lg"
                style={{
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '14px'
                }}
              >
                <Lock size={18} />
                <span>
                  {loadingDeposit ? 'Securing in Escrow...' :
                    paymentMethod === 'CARD' ? `Authorize Card & Lock ₹${Number(amount || 0).toLocaleString('en-IN')}` :
                    paymentMethod === 'NETBANKING' ? `Proceed to ${selectedNetBank}` :
                    paymentMethod === 'NEFT' ? `Match UTR & Credit Wire Transfer` :
                    paymentMethod === 'WALLET' ? `Debit Wallet & Lock ₹${Number(amount || 0).toLocaleString('en-IN')}` :
                    paymentMethod === 'RAZORPAY' ? `Launch Razorpay Checkout` :
                    `Lock ₹${Number(amount || 0).toLocaleString('en-IN')} via UPI Escrow`}
                </span>
              </button>
            </form>

            {depositSuccess && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid #10b981'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800 }}>
                  <CheckCircle2 size={18} />
                  <span>Escrow Deposit Confirmed!</span>
                </div>
                <div style={{ fontSize: '0.8125rem', marginTop: '6px', lineHeight: 1.5 }}>
                  • Vault Ref: <strong>{depositSuccess.escrowReference}</strong><br />
                  • Amount: <strong>₹{depositSuccess.amount?.toLocaleString('en-IN')}</strong> locked<br />
                  • Delivery Release OTP: <strong style={{ color: '#10b981' }}>{depositSuccess.releaseOtp}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Active Vault Summary */}
          <div className="glass-card" style={{ padding: '32px 28px', borderRadius: '24px', border: '1.5px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Active Escrow Contracts</h2>
                <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>Release funds upon delivery inspection</span>
              </div>
              <button onClick={loadStats} className="btn btn-secondary btn-sm" title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '480px' }}>
              {ledger.map((item) => {
                const isLocked = item.status === 'HELD_IN_ESCROW';
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: isLocked ? 'rgba(14, 165, 233, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                      border: `1.5px solid ${isLocked ? 'rgba(14, 165, 233, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{item.cropName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmer: {item.farmerName} • Qty: {item.quantityKg} kg</div>
                      </div>
                      <span className={isLocked ? 'badge badge-info' : 'badge badge-success'} style={{ fontSize: '0.6875rem' }}>
                        {isLocked ? '🔒 HELD IN VAULT' : '✅ RELEASED'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{item.amount?.toLocaleString('en-IN')}
                      </div>

                      {isLocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReleasePayment(item);
                            setOtpInput(item.releaseOtp || '123456');
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', fontWeight: 800 }}
                        >
                          Verify OTP & Release Payout
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                          ✓ Settled via UPI
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FARMER PAYOUT PROFILES & QR CODES */}
      {/* ========================================================================= */}
      {activeTab === 'payouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>Farmer Direct Settlement Accounts</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Registered farmer beneficiary accounts with NPCI Aadhaar DBT link and verified IFSC
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleRunPennyDrop('Ramesh Patel', 'State Bank of India')}
                  disabled={testingPenny}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Sparkles size={14} color="#10b981" />
                  {testingPenny ? 'Verifying Account...' : 'Test ₹1 Penny Drop'}
                </button>
              </div>
            </div>

            {/* Penny Drop Verification Banner */}
            {pennyStatus && (
              <div style={{
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                      ✓ NPCI Aadhaar DBT Penny-Drop Verified (₹1.00 Credited)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Beneficiary: <strong>{pennyStatus.farmer}</strong> • Bank: <strong>{pennyStatus.bank}</strong> • Ref: <code>{pennyStatus.ref}</code>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPennyStatus(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Farmer Payout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {[
                {
                  name: 'Ramesh Patel',
                  village: 'Nashik, Maharashtra',
                  vpa: 'rameshpatel@okhdfcbank',
                  bank: 'State Bank of India',
                  acc: '•••• •••• 9842',
                  ifsc: 'SBIN0004128',
                  status: 'VERIFIED_DBT',
                  crops: 'Wheat, Organic Dhaniya'
                },
                {
                  name: 'Sanjay Shinde',
                  village: 'Lasalgaon APMC, Maharashtra',
                  vpa: 'sanjayshinde@oksbi',
                  bank: 'HDFC Agri Branch',
                  acc: '•••• •••• 3310',
                  ifsc: 'HDFC0001824',
                  status: 'VERIFIED_DBT',
                  crops: 'Export Red Onion'
                },
                {
                  name: 'Venkat Reddy',
                  village: 'Kurnool, Andhra Pradesh',
                  vpa: 'venkatreddy@okaxis',
                  bank: 'Union Bank of India',
                  acc: '•••• •••• 7194',
                  ifsc: 'UBIN0542190',
                  status: 'VERIFIED_DBT',
                  crops: 'Sona Masuri Paddy'
                }
              ].map((farmer, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{farmer.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{farmer.village}</span>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                      Aadhaar DBT Linked
                    </span>
                  </div>

                  <div style={{
                    background: 'var(--bg-card)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <code style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10b981' }}>{farmer.vpa}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyUpiVpa(farmer.vpa)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)' }}>
                    <div>Bank: <strong style={{ color: 'var(--text-main)' }}>{farmer.bank}</strong></div>
                    <div>A/C: <code style={{ color: 'var(--text-main)' }}>{farmer.acc}</code> ({farmer.ifsc})</div>
                    <div>Key Produce: <span style={{ color: 'var(--text-main)' }}>{farmer.crops}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setUpiPayee(farmer.name);
                        setUpiPayeeVpa(farmer.vpa);
                        setActiveTab('upi');
                        showToast(`Selected ${farmer.name} for instant UPI payment!`);
                      }}
                      className="btn btn-aurora btn-sm"
                      style={{ flex: 1, fontWeight: 800, fontSize: '0.75rem' }}
                    >
                      Pay via UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunPennyDrop(farmer.name, farmer.bank)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Verify ₹1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRANSACTION LEDGER & GST INVOICES */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', border: '1.5px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>Payment Ledger & Tax Receipts</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Complete audit trail with downloadable GST & Mandi APMC tax invoices
              </p>
            </div>

            {/* Filter buttons & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search order, UTR, crop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ width: '220px', fontSize: '0.8125rem', paddingLeft: '32px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'ALL', label: 'All Txns' },
                  { id: 'LOCKED', label: '🔒 Vault Locked' },
                  { id: 'RELEASED', label: '✅ Released' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setLedgerFilter(f.id);
                      showToast(`Filtered ledger: ${f.label}`);
                    }}
                    className={`btn ${ledgerFilter === f.id ? 'btn-aurora btn-sm' : 'btn-secondary btn-sm'}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: '6px 12px'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px 8px' }}>TRANSACTION / ORDER</th>
                  <th style={{ padding: '12px 8px' }}>CROP & PRODUCER</th>
                  <th style={{ padding: '12px 8px' }}>METHOD</th>
                  <th style={{ padding: '12px 8px' }}>STATUS</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>INVOICE</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((item) => {
                  const isLocked = item.status === 'HELD_IN_ESCROW';
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 8px' }}>
                        <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{item.orderId || item.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.transactionId || item.escrowReference}
                        </div>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <div style={{ fontWeight: 700 }}>{item.cropName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.farmerName}</div>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-muted)' }}>
                          {item.paymentMethod || 'UPI'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <span className={isLocked ? 'badge badge-info' : 'badge badge-success'} style={{ fontSize: '0.6875rem' }}>
                          {isLocked ? 'VAULT LOCKED' : 'RELEASED'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '1rem' }}>
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FileText size={13} /> View Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIMULATED UPI MPIN KEYPAD MODAL */}
      {/* ========================================================================= */}
      {upiPinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '380px',
            width: '100%',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Smartphone size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 4px' }}>
              Enter UPI MPIN
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Authorize payment of <strong>₹{Number(upiPayAmount).toLocaleString('en-IN')}</strong> to <strong>{upiPayee}</strong>
            </p>

            <div style={{
              background: 'var(--bg-surface)',
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}>
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="••••"
                style={{
                  width: '100%',
                  fontSize: '2rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  letterSpacing: '0.3em',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)'
                }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Tip: Click on-screen keys below or type on your keyboard
              </div>
            </div>

            {/* Quick Test PIN Chips */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setEnteredPin('1234')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px' }}
              >
                Auto-Fill 1234
              </button>
              <button
                type="button"
                onClick={() => setEnteredPin('482915')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px' }}
              >
                Auto-Fill 482915
              </button>
            </div>

            {/* Interactive 3x4 Numeric Keypad ("Keys") */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '18px'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => {
                    if (enteredPin.length < 6) setEnteredPin(prev => prev + digit);
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '10px',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    borderRadius: '12px'
                  }}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEnteredPin('')}
                className="btn btn-secondary"
                style={{
                  padding: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  color: '#ef4444'
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  if (enteredPin.length < 6) setEnteredPin(prev => prev + '0');
                }}
                className="btn btn-secondary"
                style={{
                  padding: '10px',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  borderRadius: '12px'
                }}
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setEnteredPin(prev => prev.slice(0, -1))}
                className="btn btn-secondary"
                style={{
                  padding: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  borderRadius: '12px'
                }}
                title="Backspace"
              >
                ⌫
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setUpiPinModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingUpi}
                onClick={handleAuthorizeUpiPayment}
                className="btn btn-aurora"
                style={{ flex: 2, padding: '12px', fontWeight: 900 }}
              >
                {isProcessingUpi ? 'Verifying with NPCI...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPI PAYMENT SUCCESS RECEIPT MODAL */}
      {/* ========================================================================= */}
      {upiReceipt && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '460px',
            width: '100%',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div className="badge badge-success" style={{ marginBottom: '8px' }}>
              UPI PAYMENT SUCCESSFUL • ESCROW SECURED
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0' }}>
              ₹{Number(upiReceipt.amount).toLocaleString('en-IN')}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 20px' }}>
              Locked in AgriNex Virtual Escrow. Disburses to <strong>{upiReceipt.farmerName}</strong> upon delivery OTP.
            </p>

            <div style={{
              background: 'var(--bg-surface)',
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              textAlign: 'left',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>UPI Reference (UTR):</span>
                <strong>{upiReceipt.transactionId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vault Escrow Ref:</span>
                <span style={{ color: '#10b981', fontWeight: 800 }}>{upiReceipt.escrowReference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Handover OTP:</span>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '2px' }}>
                  {upiReceipt.releaseOtp}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Beneficiary VPA:</span>
                <strong>{upiReceipt.farmerUpi || upiPayeeVpa}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoice(upiReceipt);
                  setUpiReceipt(null);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', fontWeight: 700 }}
              >
                Print Tax Invoice
              </button>
              <button
                type="button"
                onClick={() => setUpiReceipt(null)}
                className="btn btn-aurora"
                style={{ flex: 1, padding: '12px', fontWeight: 800 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GST & MANDI TAX INVOICE MODAL */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '24px',
            padding: '36px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '92vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedInvoice(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Invoice Header */}
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#059669' }}>
                    AgriNex Smart Settlement Receipt
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Direct Farm-to-Buyer APMC Compliant Tax Invoice
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px' }}>
                    ORIGINAL FOR RECIPIENT
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8125rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Invoice No & Date:</span>
                <strong>{selectedInvoice.orderId || 'AGX-INV-88491'}</strong><br />
                <span>{new Date(selectedInvoice.paidAt).toLocaleDateString()}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Payment Reference:</span>
                <strong style={{ color: '#059669' }}>{selectedInvoice.transactionId || selectedInvoice.escrowReference}</strong><br />
                <span>Mode: {selectedInvoice.paymentMethod || 'UPI'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8125rem', background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
              <div>
                <strong style={{ display: 'block', color: '#059669', marginBottom: '4px' }}>Seller / Producer:</strong>
                <div style={{ fontWeight: 700 }}>{selectedInvoice.farmerName}</div>
                <div style={{ color: '#64748b' }}>UPI: {selectedInvoice.farmerUpi || 'rameshpatel@okhdfcbank'}</div>
                <div style={{ color: '#64748b' }}>Aadhaar DBT Verified</div>
              </div>
              <div>
                <strong style={{ display: 'block', color: '#0284c7', marginBottom: '4px' }}>Buyer / Procuring Lot:</strong>
                <div style={{ fontWeight: 700 }}>{selectedInvoice.payerName || 'FreshDirect Wholesalers'}</div>
                <div style={{ color: '#64748b' }}>Verified Wholesale Trader</div>
                <div style={{ color: '#64748b' }}>APMC Node: Vashi Gateway</div>
              </div>
            </div>

            {/* Line Items */}
            <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '8px 0' }}>COMMODITY</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>QTY (KG)</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 0' }}>
                    <strong>{selectedInvoice.cropName}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>HSN 0709 • APMC Fair Modal Price</div>
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>{selectedInvoice.quantityKg?.toLocaleString('en-IN') || 1500} kg</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 800 }}>₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {/* Tax & Total */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '12px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Subtotal:</span>
                <span>₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>GST (Unbranded Agro Produce):</span>
                <span>₹0.00 (EXEMPT)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Platform Intermediary Fee:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>₹0.00 (Zero Brokerage)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, marginTop: '10px', color: '#0f172a' }}>
                <span>Total Escrow Paid:</span>
                <span style={{ color: '#059669' }}>₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Print CTA */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast('✓ Printing invoice receipt');
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-secondary"
                style={{ padding: '12px 18px', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTP RELEASE MODAL */}
      {/* ========================================================================= */}
      {activeReleasePayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            border: '1.5px solid var(--border-color)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px' }}>
              Release Escrow Payout
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Confirm delivery inspection for <strong>{activeReleasePayment.cropName}</strong>. Enter the 6-digit delivery OTP shared by the buyer.
            </p>

            <div style={{
              background: 'var(--bg-muted)',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.8125rem',
              color: '#10b981',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              Payout: ₹{activeReleasePayment.amount?.toLocaleString('en-IN')} → {activeReleasePayment.farmerName}
            </div>

            {releaseMsg.text && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: releaseMsg.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.15)',
                color: releaseMsg.isError ? '#ef4444' : '#10b981',
                fontSize: '0.8125rem',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                {releaseMsg.text}
              </div>
            )}

            <form onSubmit={handleReleaseOtpSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  6-Digit Delivery OTP
                </label>
                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="form-control"
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    padding: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveReleasePayment(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '12px', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={releasing}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '12px', fontWeight: 800 }}
                >
                  {releasing ? 'Releasing Funds...' : 'Confirm & Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3D SECURE BANK OTP MODAL (FOR CARD PAYMENTS) */}
      {/* ========================================================================= */}
      {showCardOtpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.68)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '30px', background: 'var(--bg-card)', borderRadius: '24px', border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={24} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                  3D Secure Bank Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCardOtpModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '18px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
                <strong style={{ color: '#2563eb' }}>{cardType === 'RUPAY_KISAN' ? 'NPCI RuPay PaySecure' : 'Verified by Visa / Mastercard'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Escrow Deposit:</span>
                <strong style={{ color: '#10b981', fontSize: '1.05rem' }}>₹{Number(amount).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Card Ending:</span>
                <strong>•••• {cardNumber.slice(-4)}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmCardOtp}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Enter Bank OTP sent to registered mobile:
                </label>
                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  value={cardOtpInput}
                  onChange={(e) => setCardOtpInput(e.target.value)}
                  className="form-control"
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    padding: '10px'
                  }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Demo OTP: <strong>123456</strong></span>
                  <button
                    type="button"
                    onClick={() => setCardOtpInput('123456')}
                    style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Auto-Fill 123456
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCardOtpModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCard}
                  className="btn btn-aurora"
                  style={{ flex: 2, fontWeight: 900 }}
                >
                  {isProcessingCard ? 'Verifying OTP...' : 'Authorize Escrow Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NET BANKING CORPORATE AUTHENTICATION MODAL */}
      {/* ========================================================================= */}
      {showNetBankingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.68)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '30px', background: 'var(--bg-card)', borderRadius: '24px', border: '1.5px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={24} color="#059669" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                    {selectedNetBank}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Secure Internet Banking Gateway</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNetBankingModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '18px', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Beneficiary:</span>
                <strong>AgriNex Escrow Trust Account</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Wire Amount:</span>
                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{Number(amount).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmNetBanking} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Corporate / Retail Customer ID:
                </label>
                <input
                  type="text"
                  value={netBankUserId}
                  onChange={(e) => setNetBankUserId(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Internet Banking Password:
                </label>
                <input
                  type="password"
                  value={netBankPassword}
                  onChange={(e) => setNetBankPassword(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowNetBankingModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingNetBanking}
                  className="btn btn-aurora"
                  style={{ flex: 2, fontWeight: 900 }}
                >
                  {isProcessingNetBanking ? 'Connecting to Bank...' : 'Authorize Bank Wire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RAZORPAY UNIFIED GATEWAY MODAL */}
      {/* ========================================================================= */}
      {showRazorpayModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.68)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '0', background: 'var(--bg-card)', borderRadius: '24px', border: '1.5px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ background: '#0c2340', color: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: '#58a6ff', fontWeight: 800 }}>RAZORPAY SECURE</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '2px 0 0' }}>AgriNex Marketplace</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>Amount to Lock</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38d39f' }}>₹{Number(amount).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Select test payment channel to authorize Escrow deposit:
              </div>

              {[
                { label: 'UPI (Google Pay, PhonePe, Paytm)', desc: 'Instant authorization', badge: 'Popular' },
                { label: 'Card (Visa, Mastercard, RuPay Kisan)', desc: 'Saved cards & 3D Secure' },
                { label: 'Net Banking (SBI, HDFC, ICICI, Axis)', desc: 'Corporate & Retail accounts' },
                { label: 'PayLater / Agri-Credit Facility', desc: 'Pre-approved 30-day term' }
              ].map((m, i) => (
                <div
                  key={i}
                  onClick={handleRazorpayCheckout}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div>
                    <div style={{ fontSize: '0.84375rem', fontWeight: 800 }}>{m.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                  </div>
                  {m.badge && (
                    <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>{m.badge}</span>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={razorpayProcessing}
                  className="btn btn-aurora"
                  style={{ flex: 1.6, fontWeight: 900 }}
                >
                  {razorpayProcessing ? 'Processing...' : 'Pay with Test Razorpay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
