const io = require('socket.io-client');

// Global counters for active clients and completed test cases
let activeClients = 0;
let completedTestCases = 0;
const totalTestCases = 17; // Updated total number of test cases
let testCaseQueue = []; // Queue to hold test case functions

/**
 * Client class to simulate a user.
 * 
 * If ENABLE_RELAXATION is true:
 * - Users will be relaxed on matching criteria based on time (e.g., after certain intervals, matching becomes less strict).
 * 
 * If ENABLE_RELAXATION is false:
 * - Users must match on both category and difficulty strictly, no relaxation.
 */
class Client {
  /**
   * @param {string} username - The username of the client.
   * @param {string|undefined} email - The email of the client.
   * @param {string|undefined} category - The category for matching (optional).
   * @param {string|undefined} difficulty - The difficulty level for matching (optional).
   * @param {number} testCase - The test case number for logging.
   * @param {boolean} [autoCancel=false] - Whether the client should cancel the match request midway.
   * @param {boolean} [autoDisconnect=false] - Whether the client should disconnect unexpectedly.
   */
  constructor(username, email, category, difficulty, testCase, autoCancel = false, autoDisconnect = false) {
    activeClients++; // Increment active client count

    this.username = username;
    this.email = email;
    this.category = category;
    this.difficulty = difficulty;
    this.socket = io('http://localhost:3003');
    this.isMatched = false;
    this.testCase = testCase;
    this.autoCancel = autoCancel;
    this.autoDisconnect = autoDisconnect;

    this.initialize();
  }

  /**
   * Initialize the client by setting up socket event listeners.
   * 
   * If ENABLE_RELAXATION is true:
   * - The server handles relaxation based on time intervals.
   * 
   * If ENABLE_RELAXATION is false:
   * - The matching remains strict throughout.
   */
  initialize() {
    this.socket.on('connect', () => {
      console.log(`[Test Case ${this.testCase}] ${this.username} connected with socket ID: ${this.socket.id}`);

      this.requestMatch();

      if (this.autoCancel) {
        const cancelDelay = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
          if (!this.isMatched) {
            console.log(`[Test Case ${this.testCase}] ${this.username} is canceling the match request.`);
            this.cancelMatch();
          }
        }, cancelDelay);
      }

      if (this.autoDisconnect) {
        const disconnectDelay = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
          if (!this.isMatched) {
            console.log(`[Test Case ${this.testCase}] ${this.username} is disconnecting unexpectedly.`);
            this.socket.disconnect();
          }
        }, disconnectDelay);
      }
    });

    this.socket.on('matchFound', (data) => {
      console.log(`[Test Case ${this.testCase}] ${this.username} received match:`, data);
      this.isMatched = true;

      if (data.matchId) {
        console.log(`[Test Case ${this.testCase}] ${this.username} MatchEvent ID: ${data.matchId}`);
      }

      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });

    this.socket.on('matchFailed', (data) => {
      console.log(`[Test Case ${this.testCase}] ${this.username} match failed:`, data.message);
      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });

    this.socket.on('cancelMatching', (data) => {
      console.log(`[Test Case ${this.testCase}] ${this.username} match canceled:`, data);

      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });

    this.socket.on('error', (error) => {
      console.error(`[Test Case ${this.testCase}] ${this.username} Socket error:`, error);

      this.socket.disconnect();
    });

    this.socket.on('disconnect', () => {
      console.log(`[Test Case ${this.testCase}] ${this.username} disconnected`);
      activeClients--;

      checkTestCompletion(this.testCase);
    });
  }

  /**
   * Prepare and send a single match request via socket.
   */
  requestMatch() {
    if (this.isMatched) return;

    console.log(`[Test Case ${this.testCase}] ${this.username} is requesting a match.`);

    const requestData = {
      username: this.username,
      email: this.email,
      category: this.category,
      difficulty: this.difficulty,
    };

    this.socket.emit('startMatching', requestData);
  }

  /**
   * Cancel the match request via socket.
   */
  cancelMatch() {
    this.socket.emit('cancelMatching');

    setTimeout(() => {
      this.socket.disconnect();
    }, 1000);
  }
}

/**
 * Check if all clients have disconnected for a particular test case.
 * If all clients for a test case have disconnected, run the next test case in the queue.
 */
function checkTestCompletion(testCase) {
  if (activeClients === 0) {
    completedTestCases++;
    console.log(`All clients for Test Case ${testCase} have disconnected.`);

    if (testCaseQueue.length > 0) {
      const nextTestCase = testCaseQueue.shift();
      nextTestCase();
    } else if (completedTestCases === totalTestCases) {
      console.log('All test cases have been completed. Exiting program.');
      process.exit(0);
    }
  }
}

/**
 * Add test cases to the queue and run them sequentially.
 */
function addTestCasesToQueue() {
  // Test Case 1: Immediate Matching with same category and difficulty
  testCaseQueue.push(() => {
    console.log('--- Test Case 1: Immediate Matching ---');
    const user1 = new Client('User1_TC1', 'user1_tc1@example.com', 'Arrays', 'Easy', 1);
    setTimeout(() => {
      const user2 = new Client('User2_TC1', 'user2_tc1@example.com', 'Arrays', 'Easy', 1);
    }, 1000); // User2 connects after 1 second
    // Both users should match
  });

  // Test Case 2: Matching on time-based relaxation (category only)
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 2: Matching on Time-Based Relaxation (Category Only) ---');
    const user3 = new Client('User3_TC2', 'user3_tc2@example.com', 'Graphs', 'Medium', 2);
    const user4 = new Client('User4_TC2', 'user4_tc2@example.com', 'Graphs', 'Hard', 2);
    // Users will match after relaxing difficulty.
  });

  // Test Case 3: Matching on time-based relaxation (difficulty only)
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 3: Matching on Time-Based Relaxation (Difficulty Only) ---');
    const user5 = new Client('User5_TC3', 'user5_tc3@example.com', 'Trees', 'Hard', 3);
    const user6 = new Client('User6_TC3', 'user6_tc3@example.com', 'Graphs', 'Hard', 3);
    // Users will match after relaxing category.
  });

  // Test Case 4: No Matching even after criteria relaxation
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 4: No Match Found ---');
    const user7 = new Client('User7_TC4', 'user7_tc4@example.com', 'Dynamic Programming', 'Easy', 4);
    const user8 = new Client('User8_TC4', 'user8_tc4@example.com', 'Graphs', 'Hard', 4);
    // No match will occur due to completely different criteria.
  });

  // Test Case 5: Race Condition - Multiple users attempting to match simultaneously
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 5: Race Condition ---');
    const users = [];
    for (let i = 1; i <= 5; i++) {
      users.push(new Client(`User_TC5_${i}`, `user_tc5_${i}@example.com`, 'Sorting', 'Medium', 5));
    }
    // Users should match based on same criteria.
  });

  // Test Case 6: Delayed Connection
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 6: Delayed Connection ---');
    const user9 = new Client('User9_TC6', 'user9_tc6@example.com', 'Greedy', 'Hard', 6);
    setTimeout(() => {
      const user10 = new Client('User10_TC6', 'user10_tc6@example.com', 'Greedy', 'Hard', 6);
    }, 5000); // User10 connects 5 seconds after User9
    // Both should match based on identical criteria.
  });

  // Test Case 7: User Cancels Match Request Midway
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 7: User Cancels Match Request Midway ---');
    const user11 = new Client('User11_TC7', 'user11_tc7@example.com', 'Backtracking', 'Medium', 7, true);
    const user12 = new Client('User12_TC7', 'user12_tc7@example.com', 'Backtracking', 'Medium', 7);
    // One user cancels, no match will occur.
  });

  // Test Case 8: User Disconnects Unexpectedly
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 8: User Disconnects Unexpectedly ---');
    const user13 = new Client('User13_TC8', 'user13_tc8@example.com', 'Dynamic Programming', 'Hard', 8, false, true);
    const user14 = new Client('User14_TC8', 'user14_tc8@example.com', 'Dynamic Programming', 'Hard', 8);
    // User13 disconnects, no match will happen.
  });

  // Test Case 9: Users with Empty Criteria
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 9: Users with Empty Criteria ---');
    const user15 = new Client('User15_TC9', 'user15_tc9@example.com', '', '', 9);
    const user16 = new Client('User16_TC9', 'user16_tc9@example.com', '', '', 9);
    // Both users will match since they have no criteria.
  });

  // Test Case 10: High Volume of Users
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 10: High Volume of Users ---');
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const category = i % 2 === 0 ? 'Strings' : 'Math';
      const difficulty = i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard';
      users.push(new Client(`User_TC10_${i}`, `user_tc10_${i}@example.com`, category, difficulty, 10));
    }
    // Many users will match as criteria relaxes.
  });

  // Test Case 11: One user in relaxed state, the other strict
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 11: One Relaxed, One Strict ---');
    const user17 = new Client('User17_TC11', 'user17_tc11@example.com', 'Graphs', 'Medium', 11);
    const user18 = new Client('User18_TC11', 'user18_tc11@example.com', 'Graphs', 'Hard', 11);
    // Users will match after relaxing difficulty.
  });

  // Test Case 12: Both users in relaxed state
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 12: Both Relaxed ---');
    const user19 = new Client('User19_TC12', 'user19_tc12@example.com', 'Graphs', 'Medium', 12);
    const user20 = new Client('User20_TC12', 'user20_tc12@example.com', 'Graphs', 'Medium', 12);
    // Both users are in relaxed state, should match.
  });

  // Test Case 13: One user with max attempts reached, other just starting
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 13: One Maxed Out, One Starting ---');
    const user21 = new Client('User21_TC13', 'user21_tc13@example.com', 'Trees', 'Hard', 13);
    const user22 = new Client('User22_TC13', 'user22_tc13@example.com', 'Graphs', 'Hard', 13);
    // Users will match based on relaxed criteria.
  });

  // Test Case 14: Users with different categories, matching on difficulty
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 14: Match on Difficulty Only ---');
    const user23 = new Client('User23_TC14', 'user23_tc14@example.com', 'Dynamic Programming', 'Medium', 14);
    const user24 = new Client('User24_TC14', 'user24_tc14@example.com', 'Graphs', 'Medium', 14);
    // Users will match after relaxing category.
  });

  // Test Case 15: Random relaxation (only one user gets relaxed earlier)
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 15: Random Relaxation ---');
    const user25 = new Client('User25_TC15', 'user25_tc15@example.com', 'Trees', 'Easy', 15);
    const user26 = new Client('User26_TC15', 'user26_tc15@example.com', 'Trees', 'Hard', 15);
    // Users will match after both relax criteria.
  });

  // Test Case 16: Testing maximum attempts with no match possible
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 16: Max Attempts, No Match ---');
    const user27 = new Client('User27_TC16', 'user27_tc16@example.com', 'Backtracking', 'Easy', 16);
    const user28 = new Client('User28_TC16', 'user28_tc16@example.com', 'Graphs', 'Hard', 16);
    // No match will be found, testing max attempts.
  });

  // Test Case 17: Multiple Abrupt Disconnects
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 17: Multiple Abrupt Disconnects ---');
    const user29 = new Client('User29_TC17', 'user29_tc17@example.com', 'Graphs', 'Medium', 17, false, true);
    const user30 = new Client('User30_TC17', 'user30_tc17@example.com', 'Graphs', 'Medium', 17, false, true);
    // Both users disconnect abruptly, ensuring cleanup handles multiple simultaneous disconnects.
  });
}

/**
 * Run the tests sequentially.
 */
function runTestsSequentially() {
  addTestCasesToQueue();
  if (testCaseQueue.length > 0) {
    const firstTestCase = testCaseQueue.shift();
    firstTestCase();
  }
}

runTestsSequentially();
