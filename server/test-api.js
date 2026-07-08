import { database, dbInitialized } from './database.js';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  await dbInitialized;
  console.log("\n==================================================");
  console.log("    DEVSETU SRS API INTEGRATION TEST SUITE        ");
  console.log("==================================================\n");

  let passes = 0;
  let fails = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passes++;
    } else {
      console.error(`[FAIL] ${message}`);
      fails++;
    }
  }

  // Helper fetch function
  async function apiRequest(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // No JSON body
    }
    return { status: response.status, data };
  }

  try {
    // Check if server is running
    try {
      await fetch(API_BASE + '/bookings');
    } catch (e) {
      console.error("[CRITICAL] Backend server is not running on http://localhost:5000. Please start the server first.");
      process.exit(1);
    }

    // Define test variables
    const testEmail = "srstestrunner@gmail.com";
    const testPhone = "9988998899";
    const testPassword = "123456"; // 6-digit Login PIN
    const testName = "SRS Test Astrologer";
    
    let createdBookingId = null;
    let createdTicketId = null;
    
    // Initial Database Cleanup to prevent residual failure from interrupted runs
    const initUsers = await database.getCollection('users');
    const filterEmails = [testEmail, "otptestrunner@gmail.com", "otpresetrunner@gmail.com"];
    await database.saveCollection('users', initUsers.filter(u => !filterEmails.includes(u.email)));

    const initNotifs = await database.getCollection('notifications');
    await database.saveCollection('notifications', initNotifs.filter(n => !filterEmails.includes(n.userEmail)));

    // --------------------------------------------------
    // TEST 1: User Signup Validation & Notifications (SRS Section 4)
    // --------------------------------------------------
    console.log("Running Test 1: User Registration...");
    
    const signupPayload = {
      name: testName,
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      state: "Maharashtra",
      city: "Pune",
      experience: "7 Years"
    };

    const signupRes = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupPayload)
    });

    assert(signupRes.status === 201, "Signup returned status 201 (Created).");
    assert(signupRes.data && signupRes.data.user, "Signup returned registered user object.");
    let testProfileId = null;
    if (signupRes.data && signupRes.data.user) {
      assert(signupRes.data.user.email === testEmail, "Registered user email matches.");
      assert(signupRes.data.user.name === testName, "Registered user name matches.");
      assert(signupRes.data.user.profileId.startsWith("DEV-AST-"), "Generated unique profile ID format is correct.");
      testProfileId = signupRes.data.user.profileId;
    }

    // Try registering duplicate email
    const duplicateRes = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupPayload)
    });
    assert(duplicateRes.status === 400, "Registering duplicate email rejected with status 400.");

    // Check if welcome notification is generated
    const notifsAfterSignup = await apiRequest(`/notifications?email=${testEmail}`);
    assert(notifsAfterSignup.status === 200, "Fetched user notifications list successfully.");
    const welcomeNotif = notifsAfterSignup.data.find(n => n.title === "Welcome to DEVSETU CONNECT");
    assert(!!welcomeNotif, "Welcome notification successfully pushed into the user's In-App feed.");
    if (welcomeNotif) {
      assert(welcomeNotif.read === false, "Welcome notification is initially unread.");
    }

    // --------------------------------------------------
    // TEST 2: User Login Methods & Verification Block (SRS Section 4)
    // --------------------------------------------------
    console.log("\nRunning Test 2: User Login Flows & Approval Restrictions...");

    // Login should be blocked when account is pending verification
    const pendingLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'phone',
        phone: testPhone,
        password: testPassword
      })
    });
    assert(pendingLoginRes.status === 403, "Login via Mobile is blocked with 403 when account is pending verification.");
    assert(pendingLoginRes.data && pendingLoginRes.data.profileId === testProfileId, "Verification block payload contains correct Profile ID.");

    // Admin approves the new account
    console.log("Admin approving registered user account...");
    const approveUserRes = await apiRequest(`/users/${testEmail}/status`, {
      method: 'PUT',
      body: JSON.stringify({ accountStatus: 'approved' })
    });
    assert(approveUserRes.status === 200, "Admin approval endpoint returned 200.");
    assert(approveUserRes.data && approveUserRes.data.accountStatus === 'approved', "Account status successfully updated to approved.");

    // Email login should be rejected with 401 for astrologers (No Email Login allowed)
    const emailLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'email',
        email: testEmail,
        password: testPassword
      })
    });
    assert(emailLoginRes.status === 401, "Email login is blocked/rejected with status 401 for astrologers.");

    // Phone + PIN login (now approved)
    const phoneLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'phone',
        phone: testPhone,
        password: testPassword
      })
    });
    assert(phoneLoginRes.status === 200, "Login via Mobile Number + PIN returned status 200.");
    assert(phoneLoginRes.data && phoneLoginRes.data.user, "Mobile login returned user object.");

    // Incorrect password login
    const badLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'phone',
        phone: testPhone,
        password: '999999'
      })
    });
    assert(badLoginRes.status === 401, "Login with incorrect PIN rejected with status 401.");

    // --------------------------------------------------
    // TEST 3: Booking Creation with Hierarchical Venue (SRS Section 8)
    // --------------------------------------------------
    console.log("\nRunning Test 3: Pooja Booking Creation...");

    const bookingPayload = {
      astrologerName: testName,
      serviceId: "mahamrityunjaya",
      packageName: "Ekam Shanti (1 Pandit)",
      amount: 5100,
      astroFee: 500,
      clientName: "SRS Client",
      clientMobile: "9876543299",
      city: "Wagholi, Pune, Maharashtra", // Hierarchical Location
      date: "2026-07-15",
      notes: "SRS system validation booking"
    };

    const bookingRes = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload)
    });

    assert(bookingRes.status === 201, "Booking creation returned status 201 (Created).");
    assert(bookingRes.data && bookingRes.data.id, "Booking created and ID returned.");
    if (bookingRes.data) {
      createdBookingId = bookingRes.data.id;
      assert(bookingRes.data.status === 'created', "Initial booking status is set to 'created'.");
      assert(bookingRes.data.city === "Wagholi, Pune, Maharashtra", "Hierarchical venue location saved correctly.");
    }

    // --------------------------------------------------
    // TEST 4: Payment Submission (SRS Section 9)
    // --------------------------------------------------
    console.log("\nRunning Test 4: Payment Submission & Verification Pending...");

    const paymentPayload = {
      txnId: "TXN_SRS_TEST_100",
      screenshot: "data:image/png;base64,srs_test_mock_receipt"
    };

    const paymentRes = await apiRequest(`/bookings/${createdBookingId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentPayload)
    });

    assert(paymentRes.status === 200, "Payment submission returned status 200.");
    assert(paymentRes.data && paymentRes.data.status === 'submitted', "Booking status updated to 'submitted' (Verification Pending).");
    if (paymentRes.data) {
      assert(paymentRes.data.txnId === "TXN_SRS_TEST_100", "Transaction reference matches payload.");
      assert(paymentRes.data.screenshot === "data:image/png;base64,srs_test_mock_receipt", "Receipt screenshot saved successfully.");
    }

    // --------------------------------------------------
    // TEST 5: Support Tickets & Chats (SRS Section 12)
    // --------------------------------------------------
    console.log("\nRunning Test 5: Support Chats & Ticketing...");

    const ticketPayload = {
      category: "Payment Issues",
      subject: `Verify payment for Booking ID: ${createdBookingId}`
    };

    const ticketRes = await apiRequest('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketPayload)
    });

    assert(ticketRes.status === 201, "Support ticket creation returned status 201.");
    assert(ticketRes.data && ticketRes.data.id, "Ticket created and ID returned.");
    if (ticketRes.data) {
      createdTicketId = ticketRes.data.id;
      assert(ticketRes.data.status === 'Open', "Ticket status is initialized as 'Open'.");
    }

    const chatPayload = {
      ticketId: createdTicketId,
      sender: "astrologer",
      text: "Please verify transaction TXN_SRS_TEST_100",
      category: "Payment Issues"
    };

    const chatRes = await apiRequest('/chats', {
      method: 'POST',
      body: JSON.stringify(chatPayload)
    });

    assert(chatRes.status === 201, "Chat message posted returned status 201.");
    assert(chatRes.data && chatRes.data.text === chatPayload.text, "Chat message text matches.");

    // --------------------------------------------------
    // TEST 6: Admin Approval & Alerts Dispatch (SRS Section 18/19)
    // --------------------------------------------------
    console.log("\nRunning Test 6: Admin Payment Verification and Booking Approval...");

    const approveRes = await apiRequest(`/bookings/${createdBookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' })
    });

    assert(approveRes.status === 200, "Admin approval returned status 200.");
    assert(approveRes.data && approveRes.data.status === 'approved', "Booking status updated to 'approved' successfully.");

    // Check if Booking Approved notification was dispatched
    const notifsAfterApproval = await apiRequest(`/notifications?email=${testEmail}`);
    const approvalNotif = notifsAfterApproval.data.find(n => n.title === "Booking Confirmed" || n.title === "Booking Approved");
    assert(!!approvalNotif, "Booking Confirmed In-App notification successfully pushed.");
    if (approvalNotif) {
      assert(approvalNotif.body.includes(createdBookingId), "Notification body references the correct Booking ID.");
    }

    // --------------------------------------------------
    // TEST 7: Clear Notifications (SRS Section 13)
    // --------------------------------------------------
    console.log("\nRunning Test 7: Clearing notifications...");

    const clearRes = await apiRequest('/notifications/clear', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail })
    });
    assert(clearRes.status === 200, "Clearing user notifications returned status 200.");

    const clearedNotifs = await apiRequest(`/notifications?email=${testEmail}`);
    assert(clearedNotifs.data.every(n => n.read === true), "All notifications marked read successfully.");

    // --------------------------------------------------
    // --------------------------------------------------
    // TEST 8: PIN Management & Session Invalidation & Admin Reset
    // --------------------------------------------------
    console.log("\nRunning Test 8: PIN Strength & PIN Change & Session Invalidation...");

    // Test PIN strength rules (must be exactly 6 digits numeric)
    const weakPassRes = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        currentPassword: testPassword,
        newPassword: "weak" // Non-numeric, invalid length
      })
    });
    assert(weakPassRes.status === 400, "Weak PIN change rejected with status 400.");

    // Successful PIN change
    const strongNewPassword = "654321"; // Valid 6-digit numeric PIN
    const changePassRes = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        currentPassword: testPassword,
        newPassword: strongNewPassword
      })
    });
    assert(changePassRes.status === 200, "Change PIN with valid 6-digit PIN returned status 200.");
    
    // sessionVersion check
    let newSessionVersion = 1;
    if (changePassRes.data && changePassRes.data.user) {
      newSessionVersion = changePassRes.data.user.sessionVersion;
      assert(newSessionVersion > 1, "sessionVersion successfully incremented after PIN change.");
    }

    // Verify old session version is now inactive
    const oldSessionRes = await apiRequest(`/auth/session-status?email=${testEmail}&sessionVersion=1`);
    assert(oldSessionRes.status === 200 && oldSessionRes.data.active === false, "Old session version (1) is reported inactive.");

    // Verify new session version is active
    const newSessionRes = await apiRequest(`/auth/session-status?email=${testEmail}&sessionVersion=${newSessionVersion}`);
    assert(newSessionRes.status === 200 && newSessionRes.data.active === true, "New session version is reported active.");

    // Test Forgot PIN Request Flow
    console.log("Testing Forgot PIN Request and Admin Reset flow...");
    const forgotPinReqRes = await apiRequest('/auth/forgot-pin/request', {
      method: 'POST',
      body: JSON.stringify({ profileId: testProfileId, mobile: testPhone })
    });
    assert(forgotPinReqRes.status === 201, "Forgot PIN request returned status 201.");

    // Fetch generated PIN Reset requests from Admin endpoint
    const pinResetsRes = await apiRequest('/admin/pin-resets');
    assert(pinResetsRes.status === 200, "Admin PIN reset requests endpoint returned status 200.");
    const testResetRequest = pinResetsRes.data.find(r => r.profileId === testProfileId);
    assert(!!testResetRequest, "Forgot PIN request successfully stored in database.");
    
    let generatedTempPin = "";
    if (testResetRequest) {
      const requestId = testResetRequest.id;
      assert(testResetRequest.status === "pending", "Initial request status is 'pending'.");

      // Admin updates status to 'in_review'
      const statusUpdateRes = await apiRequest(`/admin/pin-resets/${requestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'in_review' })
      });
      assert(statusUpdateRes.status === 200 && statusUpdateRes.data.status === 'in_review', "Admin status update to 'in_review' succeeded.");

      // Admin resets the PIN (generates temporary PIN)
      const pinResetExecRes = await apiRequest(`/admin/pin-resets/${requestId}/reset`, {
        method: 'POST'
      });
      assert(pinResetExecRes.status === 200, "Admin PIN reset execution endpoint returned status 200.");
      assert(!!pinResetExecRes.data.tempPin, "Admin PIN reset returned temporary PIN.");
      if (pinResetExecRes.data) {
        generatedTempPin = pinResetExecRes.data.tempPin;
        assert(generatedTempPin.length === 6 && /^\d{6}$/.test(generatedTempPin), "Generated temporary PIN is exactly 6 digits numeric.");
        assert(pinResetExecRes.data.request.status === "pin_reset", "PIN Reset Request status updated to 'pin_reset'.");
      }

      // Log in with temporary PIN - should succeed since approved
      const loginWithTempRes = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          loginFormType: 'phone',
          phone: testPhone,
          password: generatedTempPin
        })
      });
      assert(loginWithTempRes.status === 200, "Login successful with newly reset temporary PIN.");
    }

    // --------------------------------------------------
    // TEST 9: OTP Auto-Approval & Admin OTP PIN Reset
    // --------------------------------------------------
    console.log("\nRunning Test 9: OTP Auto-Approval and Admin OTP Reset flows...");

    // Scenario A: OTP Login Verification & Auto-Approval (For Astrologers)
    const otpLoginEmail = "otptestrunner@gmail.com";
    const otpLoginPhone = "9990001111";
    const otpLoginPassword = "111222"; // valid 6-digit PIN
    const otpLoginName = "OTP Login User";

    const signupOtpLoginUser = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: otpLoginName,
        email: otpLoginEmail,
        phone: otpLoginPhone,
        password: otpLoginPassword,
        state: "Maharashtra",
        city: "Pune",
        experience: "3 Years"
      })
    });
    assert(signupOtpLoginUser.status === 201, "Sign up for OTP login user returned 201.");

    // Regular login should fail (pending verification)
    const pendingLoginFail = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'phone',
        phone: otpLoginPhone,
        password: otpLoginPassword
      })
    });
    assert(pendingLoginFail.status === 403, "Login blocked for pending user.");

    // Request Login OTP
    const reqLoginOtpRes = await apiRequest('/auth/login-otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone: otpLoginPhone })
    });
    assert(reqLoginOtpRes.status === 200, "Request login OTP returned 200.");

    // Fetch OTP code from DB
    const dbOtps = await database.getCollection('otps');
    const loginOtpRecord = dbOtps.find(o => o.email.toLowerCase() === otpLoginEmail.toLowerCase() || o.email === otpLoginPhone);
    assert(!!loginOtpRecord, "Login OTP record found in database.");

    if (loginOtpRecord) {
      const code = loginOtpRecord.code;
      // Verify OTP and check if account is auto-approved and logged in
      const verifyLoginOtpRes = await apiRequest('/auth/login-otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email: otpLoginEmail, code })
      });
      assert(verifyLoginOtpRes.status === 200, "Verify login OTP returned 200.");
      assert(verifyLoginOtpRes.data && verifyLoginOtpRes.data.user, "Returned user object.");
      if (verifyLoginOtpRes.data && verifyLoginOtpRes.data.user) {
        assert(verifyLoginOtpRes.data.user.accountStatus === "approved", "User status is auto-approved upon OTP verification.");
      }

      // Login again normally using PIN - should now succeed since approved
      const normalLoginSucc = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          loginFormType: 'phone',
          phone: otpLoginPhone,
          password: otpLoginPassword
        })
      });
      assert(normalLoginSucc.status === 200, "Normal login now succeeds for OTP auto-approved user.");
    }

    // Scenario B: OTP PIN Reset Verification (For Admin Accounts)
    const otpResetEmail = "otpresetrunner@gmail.com";
    const otpResetPhone = "9990002222";
    const otpResetPassword = "222333";
    const otpResetName = "OTP Reset Admin";

    const signupOtpResetUser = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: otpResetName,
        email: otpResetEmail,
        phone: otpResetPhone,
        password: otpResetPassword,
        state: "Maharashtra",
        city: "Pune",
        experience: "4 Years"
      })
    });
    assert(signupOtpResetUser.status === 201, "Sign up for OTP reset user returned 201.");

    // Update user role to admin in DB to allow OTP Forgot Password flows
    const dbUsers = await database.getCollection('users');
    const uIndex = dbUsers.findIndex(u => u.email === otpResetEmail);
    if (uIndex !== -1) {
      dbUsers[uIndex].role = "admin";
      await database.saveCollection('users', dbUsers);
    }

    // Request Reset OTP
    const reqResetOtpRes = await apiRequest('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ email: otpResetEmail })
    });
    assert(reqResetOtpRes.status === 200, "Request forgot password OTP for Admin returned 200.");

    // Fetch OTP code from DB
    const freshDbOtps = await database.getCollection('otps');
    const resetOtpRecord = freshDbOtps.find(o => o.email.toLowerCase() === otpResetEmail.toLowerCase());
    assert(!!resetOtpRecord, "Reset OTP record found in database.");

    if (resetOtpRecord) {
      const code = resetOtpRecord.code;
      const newStrongPassword = "888777"; // Valid 6-digit PIN
      
      // Reset password using OTP
      const resetRes = await apiRequest('/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify({
          email: otpResetEmail,
          code,
          newPassword: newStrongPassword
        })
      });
      assert(resetRes.status === 200, "Reset PIN returned 200.");

      // Login using new Admin PIN - should succeed immediately
      const loginSuccAfterReset = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          loginFormType: 'email',
          email: otpResetEmail,
          password: newStrongPassword,
          role: 'admin'
        })
      });
      assert(loginSuccAfterReset.status === 200, "Login successful as Admin with newly reset PIN.");
    }

    // --------------------------------------------------
    // TEST 10: Sequential Booking ID Validation
    // --------------------------------------------------
    console.log("\nRunning Test 10: Sequential Booking ID Generation Check...");
    
    // Create sequential booking 1
    const seqBooking1 = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        astrologerName: testName,
        serviceId: "rudrabhishek",
        packageName: "Jal Abhishek",
        amount: 2500,
        astroFee: 200,
        clientName: "Seq Client 1",
        clientMobile: "9876543201",
        city: "Pune",
        date: "2026-07-20"
      })
    });
    
    let firstSeqId = null;
    if (seqBooking1.status === 201 && seqBooking1.data) {
      firstSeqId = seqBooking1.data.id;
      assert(firstSeqId.startsWith("DEV-BKG-"), `First booking ID ${firstSeqId} starts with DEV-BKG-`);
      const numPart = firstSeqId.split('-')[2];
      assert(numPart.length === 6, `Booking ID sequential part '${numPart}' has exactly 6 digits.`);
    }

    // Create sequential booking 2
    const seqBooking2 = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        astrologerName: testName,
        serviceId: "kaalsarp",
        packageName: "Trimbakeshwar Special Vidhi",
        amount: 9500,
        astroFee: 1000,
        clientName: "Seq Client 2",
        clientMobile: "9876543202",
        city: "Nashik",
        date: "2026-07-21"
      })
    });

    let secondSeqId = null;
    if (seqBooking2.status === 201 && seqBooking2.data && firstSeqId) {
      secondSeqId = seqBooking2.data.id;
      const num1 = parseInt(firstSeqId.split('-')[2], 10);
      const num2 = parseInt(secondSeqId.split('-')[2], 10);
      assert(num2 === num1 + 1, `Second sequential booking ID ${secondSeqId} incremented correctly from ${firstSeqId}.`);
    }

    // --------------------------------------------------
    // TEST 11: Database Cleanup
    // --------------------------------------------------
    console.log("\nCleaning up test records from database...");

    const allUsers = await database.getCollection('users');
    const filterEmailsClean = [testEmail, "otptestrunner@gmail.com", "otpresetrunner@gmail.com"];
    await database.saveCollection('users', allUsers.filter(u => !filterEmailsClean.includes(u.email)));

    const allBookings = await database.getCollection('bookings');
    const seqIds = [firstSeqId, secondSeqId, createdBookingId].filter(Boolean);
    await database.saveCollection('bookings', allBookings.filter(b => !seqIds.includes(b.id)));

    const allTickets = await database.getCollection('tickets');
    await database.saveCollection('tickets', allTickets.filter(t => t.id !== createdTicketId));

    const allChats = await database.getCollection('chats');
    await database.saveCollection('chats', allChats.filter(c => c.ticketId !== createdTicketId));

    const allNotifs = await database.getCollection('notifications');
    await database.saveCollection('notifications', allNotifs.filter(n => !filterEmailsClean.includes(n.userEmail)));

    // Cleanup PIN Reset requests
    const pinResets = await database.getCollection('pin_reset_requests') || [];
    await database.saveCollection('pin_reset_requests', pinResets.filter(r => r.profileId !== testProfileId));

    console.log("Cleanup finished.");

  } catch (err) {
    console.error("Critical error encountered during integration test runner:", err);
    fails++;
  }

  console.log("\n==================================================");
  console.log("             SRS API TEST SUMMARY                 ");
  console.log("==================================================");
  console.log(`  PASSED TESTS: ${passes}`);
  console.log(`  FAILED TESTS: ${fails}`);
  console.log("==================================================\n");

  if (fails > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
