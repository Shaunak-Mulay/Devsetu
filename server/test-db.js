import { database } from './database.js';

async function runTests() {
  console.log("\n==================================================");
  console.log("      DEVSETU DATABASE INTEGRATION TESTING        ");
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

  try {
    // --------------------------------------------------
    // TEST 1: Retrieve Users Collection
    // --------------------------------------------------
    console.log("Running Test 1: Fetching users list...");
    const users = await database.getCollection('users');
    assert(Array.isArray(users), "database.getCollection('users') returned an array.");
    assert(users.length > 0, "Users collection is not empty.");
    
    // Check if pre-seeded user exists
    const defaultAstro = users.find(u => u.email === "shaunakmulay19@gmail.com");
    assert(!!defaultAstro, "Default astrologer 'shaunakmulay19@gmail.com' exists in the database.");
    if (defaultAstro) {
      assert(defaultAstro.phone === "8698378379", "Default astrologer phone matches '8698378379'.");
      assert(defaultAstro.name === "Shaunak Mulay", "Default astrologer name matches 'Shaunak Mulay'.");
    }

    // --------------------------------------------------
    // TEST 2: User Creation & Verification (CRUD)
    // --------------------------------------------------
    console.log("\nRunning Test 2: Creating a test user...");
    const originalUsersCount = users.length;
    const testUser = {
      name: "Database Test Runner",
      email: "dbtestrunner@gmail.com",
      phone: "7778889990",
      password: "testpassword123"
    };

    // Save test user
    const addedUsers = [...users, testUser];
    const userSaveResult = await database.saveCollection('users', addedUsers);
    assert(userSaveResult === true, "User list saved successfully.");

    // Retrieve and verify
    const updatedUsers = await database.getCollection('users');
    assert(updatedUsers.length === originalUsersCount + 1, "Users collection size increased by 1.");
    
    const verifiedUser = updatedUsers.find(u => u.email === "dbtestrunner@gmail.com");
    assert(!!verifiedUser, "Test user 'dbtestrunner@gmail.com' was retrieved successfully.");
    if (verifiedUser) {
      assert(verifiedUser.name === "Database Test Runner", "Test user name matches.");
      assert(verifiedUser.phone === "7778889990", "Test user mobile matches.");
      assert(verifiedUser.password === "testpassword123", "Test user password matches.");
    }

    // Cleanup test user
    console.log("Cleaning up Test 2 user...");
    const cleanedUsers = updatedUsers.filter(u => u.email !== "dbtestrunner@gmail.com");
    await database.saveCollection('users', cleanedUsers);
    const postCleanupUsers = await database.getCollection('users');
    assert(postCleanupUsers.length === originalUsersCount, "Test user successfully deleted/cleaned up.");

    // --------------------------------------------------
    // TEST 3: Booking Creation & Verification
    // --------------------------------------------------
    console.log("\nRunning Test 3: Creating a test booking...");
    const bookings = await database.getCollection('bookings');
    const originalBookingsCount = bookings.length;
    
    const testBooking = {
      id: "BK-TEST99",
      astrologerName: "Shaunak Mulay",
      serviceId: "mahamrityunjaya",
      packageName: "Ekam Shanti (1 Pandit)",
      amount: 5100,
      astroFee: 500,
      clientName: "DB Test Client",
      clientMobile: "9998887776",
      city: "Wagholi, Pune, Maharashtra",
      date: "2026-07-01",
      status: "created",
      notes: "Database verification booking",
      createdAt: new Date().toISOString()
    };

    const addedBookings = [testBooking, ...bookings];
    const bookingSaveResult = await database.saveCollection('bookings', addedBookings);
    assert(bookingSaveResult === true, "Booking list saved successfully.");

    const updatedBookings = await database.getCollection('bookings');
    assert(updatedBookings.length === originalBookingsCount + 1, "Bookings collection size increased by 1.");
    
    const verifiedBooking = updatedBookings.find(b => b.id === "BK-TEST99");
    assert(!!verifiedBooking, "Test booking 'BK-TEST99' retrieved successfully.");
    if (verifiedBooking) {
      assert(verifiedBooking.clientName === "DB Test Client", "Client name matches.");
      assert(verifiedBooking.city === "Wagholi, Pune, Maharashtra", "Hierarchical location data saved successfully.");
      assert(verifiedBooking.amount === 5100, "Amount matches.");
    }

    // --------------------------------------------------
    // TEST 4: Booking Update Operations
    // --------------------------------------------------
    console.log("\nRunning Test 4: Updating test booking status and transaction references...");
    const testPaymentTxnId = "TXN_DB_TEST_99";
    const nextBookings = updatedBookings.map(b => {
      if (b.id === "BK-TEST99") {
        return {
          ...b,
          status: "submitted",
          txnId: testPaymentTxnId,
          screenshot: "data:image/png;base64,mock"
        };
      }
      return b;
    });

    await database.saveCollection('bookings', nextBookings);
    const updatedPaymentBookings = await database.getCollection('bookings');
    const verifiedPaymentBooking = updatedPaymentBookings.find(b => b.id === "BK-TEST99");
    
    assert(!!verifiedPaymentBooking, "Test booking retrieved after payment update.");
    if (verifiedPaymentBooking) {
      assert(verifiedPaymentBooking.status === "submitted", "Booking status successfully updated to 'submitted'.");
      assert(verifiedPaymentBooking.txnId === "TXN_DB_TEST_99", "Transaction reference matches.");
      assert(verifiedPaymentBooking.screenshot === "data:image/png;base64,mock", "Base64 payment screenshot saved successfully.");
    }

    // Cleanup test booking
    console.log("Cleaning up Test 3 & 4 booking...");
    const cleanedBookings = updatedPaymentBookings.filter(b => b.id !== "BK-TEST99");
    await database.saveCollection('bookings', cleanedBookings);
    const postCleanupBookings = await database.getCollection('bookings');
    assert(postCleanupBookings.length === originalBookingsCount, "Test booking successfully deleted/cleaned up.");

    // --------------------------------------------------
    // TEST 5: Support Chats & Tickets
    // --------------------------------------------------
    console.log("\nRunning Test 5: Fetching tickets and chat messages...");
    const tickets = await database.getCollection('tickets');
    assert(Array.isArray(tickets), "Tickets collection retrieved as array.");
    
    const chats = await database.getCollection('chats');
    assert(Array.isArray(chats), "Chats collection retrieved as array.");

    // --------------------------------------------------
    // TEST 6: Notifications Hub
    // --------------------------------------------------
    console.log("\nRunning Test 6: Fetching notifications...");
    const notifications = await database.getCollection('notifications');
    assert(Array.isArray(notifications), "Notifications retrieved as array.");
    assert(notifications.length > 0, "Notifications hub contains active entries.");

  } catch (err) {
    console.error("Critical database error encountered during tests:", err);
    fails++;
  }

  console.log("\n==================================================");
  console.log("              DATABASE TEST SUMMARY               ");
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
