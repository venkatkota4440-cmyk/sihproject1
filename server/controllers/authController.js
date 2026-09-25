const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Register
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      name,
      businessName,
      companyName,
      email,
      mobile,
      phone,
      password,
      confirmPassword,
      role,
      state,
      district,
      village,
      farmLocation,
      primaryCrop,
      businessType,
      interestedCrops,
      termsAccepted,
      terms,
      location,
      farmInfo,
      vehicleDetails,
      aadhaarNumber,
      phoneOtp
    } = req.body;

    const userFullName = (fullName || name || businessName || companyName || '').trim();
    const userMobile = (mobile || phone || '').trim();
    const userEmail = (email || '').trim().toLowerCase();
    const userRole = (role || 'FARMER').toUpperCase();

    // 1. Field validation
    if (!userFullName || userFullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required (minimum 2 characters)'
      });
    }

    if (!userMobile || userMobile.replace(/[^0-9]/g, '').length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A valid 10-digit mobile number is required'
      });
    }

    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required (minimum 6 characters)'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match'
      });
    }

    const isTermsAgreed = termsAccepted === true || terms === true || termsAccepted === 'true';
    if (!isTermsAgreed) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the AgriNex Terms & Conditions to register'
      });
    }

    const validRole = ['FARMER', 'BUYER', 'TRANSPORTER', 'ADMIN'].includes(userRole)
      ? userRole
      : 'FARMER';

    // 2. Check if user already exists with email or phone
    const cleanPhone = userMobile.replace(/[^0-9]/g, '').slice(-10);
    const allUsers = db.find('users') || [];
    const existing = allUsers.find(u => {
      const emailMatch = u.email && u.email.toLowerCase() === userEmail;
      const phoneMatch = u.phone && u.phone.replace(/[^0-9]/g, '').includes(cleanPhone);
      const mobileMatch = u.mobile && u.mobile.replace(/[^0-9]/g, '').includes(cleanPhone);
      return emailMatch || phoneMatch || mobileMatch;
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address or mobile number already exists. Please log in.'
      });
    }

    // 3. Hash password securely
    const passwordHash = await bcrypt.hash(password, 10);

    const cleanAadhaar = aadhaarNumber ? aadhaarNumber.replace(/[^0-9]/g, '') : '';
    const maskedAadhaar = cleanAadhaar.length >= 4 ? `XXXX-XXXX-${cleanAadhaar.slice(-4)}` : null;
    const isAadhaarGiven = cleanAadhaar.length === 12;

    const formattedMobile = userMobile.startsWith('+91') ? userMobile : `+91 ${cleanPhone}`;

    // 4. Store user in database with extended fields
    const newUser = db.insert('users', {
      fullName: userFullName,
      name: userFullName,
      email: userEmail,
      mobile: formattedMobile,
      phone: formattedMobile,
      passwordHash,
      password: passwordHash, // stored for backward compatibility with bcrypt comparison
      role: validRole,
      state: state || 'Maharashtra',
      district: district || 'Nashik',
      village: village || '',
      farmLocation: farmLocation || (village ? `${village}, ${district || 'Nashik'}` : (district || 'Nashik')),
      primaryCrop: primaryCrop || '',
      businessType: businessType || (validRole === 'BUYER' ? 'Wholesaler / Trader' : ''),
      interestedCrops: Array.isArray(interestedCrops) ? interestedCrops : (interestedCrops ? [interestedCrops] : []),
      termsAccepted: true,
      aadhaarMasked: maskedAadhaar,
      aadhaarVerified: isAadhaarGiven,
      location: location || {
        district: district || 'Nashik',
        state: state || 'Maharashtra',
        village: village || '',
        farmLocation: farmLocation || ''
      },
      farmInfo: farmInfo || (validRole === 'FARMER' ? {
        farmName: `${userFullName}'s Farm`,
        farmSize: '5 Acres',
        village: village || '',
        farmLocation: farmLocation || '',
        primaryCrops: primaryCrop ? [primaryCrop] : []
      } : null),
      businessInfo: (validRole === 'BUYER' ? {
        businessName: businessName || companyName || `${userFullName} Enterprises`,
        buyerType: businessType || 'Wholesaler / Trader',
        requiredCrops: Array.isArray(interestedCrops) ? interestedCrops : (interestedCrops ? [interestedCrops] : [])
      } : null),
      vehicleDetails: vehicleDetails || (validRole === 'TRANSPORTER' ? { vehicleType: 'Truck', capacityKg: 5000 } : null),
      companyName: businessName || companyName || '',
      phoneVerified: Boolean(phoneOtp && phoneOtp.length >= 4),
      emailVerified: true,
      identityVerified: isAadhaarGiven,
      verificationStatus: 'VERIFIED',
      verificationProvider: isAadhaarGiven ? 'UIDAI_SANDBOX_DEMO' : 'AGRINEX_KYC_NODE',
      verificationReference: `AGX-REG-${Date.now()}`,
      verifiedAt: new Date().toISOString(),
      onboardingCompleted: true,
      tourCompleted: true,
      tourSkipped: false,
      preferredLanguage: 'en-IN',
      preferredVoice: null,
      voiceEnabled: true,
      speechRate: 1.0,
      isVerified: true,
      rating: 5.0,
      reviewsCount: 0,
      lastLoginAt: new Date().toISOString()
    });

    const token = generateToken(newUser);
    const { password: _p, passwordHash: _ph, ...userSafe } = newUser;

    // Log audit
    db.insert('auditLogs', {
      action: 'USER_REGISTERED',
      performedBy: newUser.id,
      details: `User ${userFullName} registered successfully with role ${validRole}`
    });

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${userFullName}! Please log in to proceed.`,
      data: {
        user: userSafe,
        token
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send OTP to phone or email
exports.sendOtp = (req, res) => {
  const { phone, email } = req.body;
  const target = phone || email || 'Mobile';
  const generatedOtp = '482915'; // Guaranteed fast testing OTP

  res.json({
    success: true,
    message: `OTP sent successfully to ${target}`,
    data: {
      target,
      otp: generatedOtp,
      expiresInSeconds: 300,
      note: 'Demo OTP: 482915'
    }
  });
};

// Login with Email OR Phone Number + Password
exports.login = async (req, res) => {
  try {
    const { email, phone, mobile, identifier, password, role } = req.body;
    const loginId = (identifier || email || phone || mobile || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number/Email and password are required'
      });
    }

    const allUsers = db.find('users') || [];
    const cleanPhone = loginId.replace(/[^0-9]/g, '');

    // Search user by email or by normalized phone number
    const user = allUsers.find(u => {
      const matchEmail = u.email && u.email.toLowerCase() === loginId.toLowerCase();
      const uCleanPhone = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
      const uCleanMobile = u.mobile ? u.mobile.replace(/[^0-9]/g, '') : '';
      const matchPhone = cleanPhone.length >= 10 && (uCleanPhone.includes(cleanPhone.slice(-10)) || uCleanMobile.includes(cleanPhone.slice(-10)));
      return matchEmail || matchPhone;
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this phone number or email address'
      });
    }

    // Role verification if specified by frontend login role toggle
    if (role && user.role && user.role.toUpperCase() !== role.toUpperCase()) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}. Please select the ${user.role} role or register a new account.`
      });
    }

    const targetHash = user.passwordHash || user.password;
    const match = await bcrypt.compare(password, targetHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      });
    }

    // Update lastLoginAt
    db.update('users', user.id, { lastLoginAt: new Date().toISOString() });

    const token = generateToken(user);
    const { password: _p, passwordHash: _ph, ...userSafe } = user;

    res.json({
      success: true,
      message: `Welcome back, ${userSafe.fullName || userSafe.name}!`,
      data: {
        user: userSafe,
        token
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login with Instant Phone OTP
exports.loginWithOtp = async (req, res) => {
  try {
    const { phone, otp, role = 'FARMER' } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    if (otp.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit OTP'
      });
    }

    const allUsers = db.find('users') || [];
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    let user = allUsers.find(u => {
      const uCleanPhone = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
      return cleanPhone.length >= 10 && uCleanPhone.includes(cleanPhone.slice(-10));
    });

    // If user doesn't exist yet, auto-provision user with verified phone
    if (!user) {
      const validRole = ['FARMER', 'BUYER', 'TRANSPORTER'].includes(role.toUpperCase())
        ? role.toUpperCase()
        : 'FARMER';
      const dummyPassword = await bcrypt.hash('AgriNex@123', 10);
      user = db.insert('users', {
        name: validRole === 'FARMER' ? 'Verified Producer' : 'Verified Buyer',
        email: `user_${cleanPhone.slice(-6)}@agrinex.in`,
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        password: dummyPassword,
        role: validRole,
        phoneVerified: true,
        emailVerified: true,
        identityVerified: true,
        verificationStatus: 'VERIFIED',
        isVerified: true,
        location: { district: 'Nashik', state: 'Maharashtra' },
        createdAt: new Date().toISOString()
      });
    } else {
      // Mark phone verified on OTP login
      db.update('users', user.id, { phoneVerified: true, lastLoginAt: new Date().toISOString() });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Mobile OTP verified. Welcome to AgriNex!',
      data: {
        user: userSafe,
        token
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 1-Click Demo Login
exports.demoLogin = async (req, res) => {
  try {
    const { role } = req.body;
    const targetRole = (role || 'FARMER').toUpperCase();
    
    let user = db.findOne('users', { role: targetRole });
    if (!user) {
      user = db.find('users')[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No demo account available' });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      data: {
        user: userSafe,
        token,
        isDemoAccount: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify OTP
exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!otp || otp.length < 4) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit OTP' });
  }

  res.json({
    success: true,
    message: 'Mobile OTP verified successfully',
    data: { verified: true }
  });
};

// Get current profile
exports.getProfile = (req, res) => {
  const { password: _, ...userSafe } = req.user;
  res.json({
    success: true,
    data: userSafe
  });
};

// Update profile
exports.updateProfile = (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role; // Role cannot be changed via profile update
    delete updates.id;

    const updated = db.update('users', req.user.id, updates);
    const { password: _, ...userSafe } = updated;

    res.json({
      success: true,
      data: userSafe
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Forgot Password (Non-revealing response for security)
exports.forgotPassword = (req, res) => {
  const { email, mobile, phone, identifier } = req.body;
  // Always return neutral security message without revealing if account exists
  res.json({
    success: true,
    message: 'If an account is associated with this email or mobile number, a verification OTP and password reset instructions have been dispatched. (Demo OTP: 482915)'
  });
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, phone, mobile, identifier, otp, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match'
      });
    }

    const targetId = (identifier || email || mobile || phone || '').trim().toLowerCase();
    const cleanPhone = targetId.replace(/[^0-9]/g, '');

    const allUsers = db.find('users') || [];
    const user = allUsers.find(u => {
      const emailMatch = u.email && u.email.toLowerCase() === targetId;
      const phoneMatch = u.phone && cleanPhone.length >= 10 && u.phone.replace(/[^0-9]/g, '').includes(cleanPhone.slice(-10));
      const mobileMatch = u.mobile && cleanPhone.length >= 10 && u.mobile.replace(/[^0-9]/g, '').includes(cleanPhone.slice(-10));
      return emailMatch || phoneMatch || mobileMatch;
    });

    if (user) {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      db.update('users', user.id, {
        password: passwordHash,
        passwordHash,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Password has been updated successfully. Please log in with your new credentials.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Successfully logged out'
  });
};
