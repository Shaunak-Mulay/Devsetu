import { database } from './database.js';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
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
    const testPassword = "SrsPassword@123";
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
        loginFormType: 'email',
        email: testEmail,
        password: testPassword
      })
    });
    assert(pendingLoginRes.status === 403, "Login is blocked with 403 when account is pending verification.");
    assert(pendingLoginRes.data && pendingLoginRes.data.profileId === testProfileId, "Verification block payload contains correct Profile ID.");

    // Admin approves the new account
    console.log("Admin approving registered user account...");
    const approveUserRes = await apiRequest(`/users/${testEmail}/status`, {
      method: 'PUT',
      body: JSON.stringify({ accountStatus: 'approved' })
    });
    assert(approveUserRes.status === 200, "Admin approval endpoint returned 200.");
    assert(approveUserRes.data && approveUserRes.data.accountStatus === 'approved', "Account status successfully updated to approved.");

    // Email + Password login (now approved)
    const emailLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'email',
        email: testEmail,
        password: testPassword
      })
    });
    assert(emailLoginRes.status === 200, "Login via Email + Password returned status 200 after approval.");
    assert(emailLoginRes.data && emailLoginRes.data.user, "Email login returned user object.");

    // Phone + Password login
    const phoneLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'phone',
        phone: testPhone,
        password: testPassword
      })
    });
    assert(phoneLoginRes.status === 200, "Login via Mobile Number + Password returned status 200.");
    assert(phoneLoginRes.data && phoneLoginRes.data.user, "Mobile login returned user object.");

    // Incorrect password login
    const badLoginRes = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginFormType: 'email',
        email: testEmail,
        password: 'wrongpassword'
      })
    });
    assert(badLoginRes.status === 401, "Login with incorrect password rejected with status 401.");

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
    const approvalNotif = notifsAfterApproval.data.find(n => n.title === "Booking Approved");
    assert(!!approvalNotif, "Booking Approved In-App notification successfully pushed.");
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
    // TEST 8: Password Management & Session Invalidation
    // --------------------------------------------------
    console.log("\nRunning Test 8: Password Strength & Password Change & Session Invalidation...");

    // Test password strength rules
    const weakPassRes = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        currentPassword: testPassword,
        newPassword: "weak"
      })
    });
    assert(weakPassRes.status === 400, "Weak password change rejected with status 400.");

    // Successful password change
    const strongNewPassword = "NewStrong@2026";
    const changePassRes = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        currentPassword: testPassword,
        newPassword: strongNewPassword
      })
    });
    assert(changePassRes.status === 200, "Change password with strong new password returned status 200.");
    
    // sessionVersion check
    let newSessionVersion = 1;
    if (changePassRes.data && changePassRes.data.user) {
      newSessionVersion = changePassRes.data.user.sessionVersion;
      assert(newSessionVersion > 1, "sessionVersion successfully incremented after password change.");
    }

    // Verify old session version is now inactive
    const oldSessionRes = await apiRequest(`/auth/session-status?email=${testEmail}&sessionVersion=1`);
    assert(oldSessionRes.status === 200 && oldSessionRes.data.active === false, "Old session version (1) is reported inactive.");

    // Verify new session version is active
    const newSessionRes = await apiRequest(`/auth/session-status?email=${testEmail}&sessionVersion=${newSessionVersion}`);
    assert(newSessionRes.status === 200 && newSessionRes.data.active === true, "New session version is reported active.");

    // Test Forgot Password Flow
    console.log("Testing Forgot Password OTP flows...");
    const otpReqRes = await apiRequest('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail })
    });
    assert(otpReqRes.status === 200, "OTP request returned status 200.");

    // Fetch generated OTP from database
    const otps = await database.getCollection('otps');
    const testOtpRecord = otps.find(o => o.email.toLowerCase() === testEmail.toLowerCase());
    assert(!!testOtpRecord, "OTP record successfully generated in database.");
    
    let verifiedOtp = "";
    if (testOtpRecord) {
      const correctOtp = testOtpRecord.code;
      assert(correctOtp.length === 6, "Generated OTP is exactly 6 digits.");

      // Test failed verification attempt limit
      console.log("Testing OTP failure attempt limit (max 5)...");
      for (let i = 0; i < 4; i++) {
        const verifyBadRes = await apiRequest('/auth/forgot-password/verify', {
          method: 'POST',
          body: JSON.stringify({ email: testEmail, code: "000000" })
        });
        assert(verifyBadRes.status === 400 && verifyBadRes.data.error.includes("Invalid verification code"), `Attempt ${i + 1} with incorrect OTP rejected.`);
      }

      // 5th attempt should expire/remove the OTP
      const verifyFifthRes = await apiRequest('/auth/forgot-password/verify', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, code: "000000" })
      });
      assert(verifyFifthRes.status === 400 && verifyFifthRes.data.error.includes("too many failed attempts"), "5th consecutive failed attempt invalidates the OTP.");

      // Request a new OTP for reset verification
      await apiRequest('/auth/forgot-password/request', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail })
      });
      
      const freshOtps = await database.getCollection('otps');
      const freshOtpRecord = freshOtps.find(o => o.email.toLowerCase() === testEmail.toLowerCase());
      assert(!!freshOtpRecord, "New OTP record successfully generated after invalidation.");
      
      if (freshOtpRecord) {
        const freshOtp = freshOtpRecord.code;
        // Verify correct OTP
        const verifyGoodRes = await apiRequest('/auth/forgot-password/verify', {
          method: 'POST',
          body: JSON.stringify({ email: testEmail, code: freshOtp })
        });
        assert(verifyGoodRes.status === 200, "Verification with correct OTP returned status 200.");

        // Reset password using verified OTP
        const finalStrongPassword = "FinalStrong@2026";
        const resetRes = await apiRequest('/auth/forgot-password/reset', {
          method: 'POST',
          body: JSON.stringify({
            email: testEmail,
            code: freshOtp,
            newPassword: finalStrongPassword
          })
        });
        assert(resetRes.status === 200, "Reset password with OTP returned status 200.");

        // Log in with new reset password
        const finalLoginRes = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            loginFormType: 'email',
            email: testEmail,
            password: finalStrongPassword
          })
        });
        assert(finalLoginRes.status === 200, "Login successful with newly reset password.");
      }
    }

    // --------------------------------------------------
    // TEST 9: OTP Auto-Approval for Login & Password Reset
    // --------------------------------------------------
    console.log("\nRunning Test 9: OTP Auto-Approval flows...");

    // Scenario A: OTP Login Verification & Auto-Approval
    const otpLoginEmail = "otptestrunner@gmail.com";
    const otpLoginPhone = "9990001111";
    const otpLoginPassword = "LoginOtpPassword@123";
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
        loginFormType: 'email',
        email: otpLoginEmail,
        password: otpLoginPassword
      })
    });
    assert(pendingLoginFail.status === 403, "Login blocked for pending user.");

    // Request Login OTP
    const reqLoginOtpRes = await apiRequest('/auth/login-otp/request', {
      method: 'POST',
      body: JSON.stringify({ email: otpLoginEmail })
    });
    assert(reqLoginOtpRes.status === 200, "Request login OTP returned 200.");

    // Fetch OTP code from DB
    const dbOtps = await database.getCollection('otps');
    const loginOtpRecord = dbOtps.find(o => o.email.toLowerCase() === otpLoginEmail.toLowerCase());
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

      // Login again normally using password - should now succeed since approved
      const normalLoginSucc = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          loginFormType: 'email',
          email: otpLoginEmail,
          password: otpLoginPassword
        })
      });
      assert(normalLoginSucc.status === 200, "Normal login now succeeds for OTP auto-approved user.");
    }

    // Scenario B: OTP Password Reset Verification & Auto-Approval
    const otpResetEmail = "otpresetrunner@gmail.com";
    const otpResetPhone = "9990002222";
    const otpResetPassword = "ResetOtpPassword@123";
    const otpResetName = "OTP Reset User";

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

    // Request Reset OTP
    const reqResetOtpRes = await apiRequest('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ email: otpResetEmail })
    });
    assert(reqResetOtpRes.status === 200, "Request forgot password OTP returned 200.");

    // Fetch OTP code from DB
    const freshDbOtps = await database.getCollection('otps');
    const resetOtpRecord = freshDbOtps.find(o => o.email.toLowerCase() === otpResetEmail.toLowerCase());
    assert(!!resetOtpRecord, "Reset OTP record found in database.");

    if (resetOtpRecord) {
      const code = resetOtpRecord.code;
      const newStrongPassword = "NewStrongPassword@2026";
      
      // Reset password using OTP
      const resetRes = await apiRequest('/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify({
          email: otpResetEmail,
          code,
          newPassword: newStrongPassword
        })
      });
      assert(resetRes.status === 200, "Reset password returned 200.");

      // Login using new password - should succeed immediately as account is auto-approved
      const loginSuccAfterReset = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          loginFormType: 'email',
          email: otpResetEmail,
          password: newStrongPassword
        })
      });
      assert(loginSuccAfterReset.status === 200, "Login successful with newly reset password without admin approval.");
      if (loginSuccAfterReset.data && loginSuccAfterReset.data.user) {
        assert(loginSuccAfterReset.data.user.accountStatus === "approved", "User status is auto-approved upon password reset.");
      }
    }

    // --------------------------------------------------
    // TEST 10: Sequential Booking ID Validation
    // --------------------------------------------------
    console.log("\nRunning Test 10: Sequential Booking ID Generation Check...");
    const year = new Date().getFullYear();
    
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
      const expectedPrefix = `DEV-BKG-${year}-`;
      assert(firstSeqId.startsWith(expectedPrefix), `First booking ID ${firstSeqId} starts with ${expectedPrefix}`);
      const numPart = firstSeqId.split('-')[3];
      assert(numPart.length === 5, `Booking ID sequential part '${numPart}' has exactly 5 digits.`);
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
      const num1 = parseInt(firstSeqId.split('-')[3], 10);
      const num2 = parseInt(secondSeqId.split('-')[3], 10);
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
