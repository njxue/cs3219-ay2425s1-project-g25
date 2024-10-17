// testClientSocket.js
const io = require('socket.io-client');

// Global counter for active clients
let activeClients = 0;

/**
 * Client class to simulate a user.
 */
class Client {
  /**
   * @param {string} username - The username of the client.
   * @param {string|undefined} email - The email of the client.
   * @param {string|undefined} category - The category for matching (optional).
   * @param {string|undefined} difficulty - The difficulty level for matching (optional).
   */
  constructor(username, email, category, difficulty) {
    activeClients++; // Increment active client count

    this.username = username;
    this.email = email;
    this.category = category;
    this.difficulty = difficulty;
    this.socket = io('http://localhost:3003'); // Replace with your server URL
    this.isMatched = false;
    this.retryInterval = 1000; // 1 second
    this.maxRetries = 5;
    this.attempt = 0;

    this.initialize();
  }

  /**
   * Initialize the client by setting up socket event listeners.
   */
  initialize() {
    this.socket.on('connect', () => {
      console.log(`${this.username} connected with socket ID: ${this.socket.id}`);

      this.requestMatch();
    });

    this.socket.on('matchFound', (data) => {
      console.log(`${this.username} received match:`, data);
      this.isMatched = true;

      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }

      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });

    this.socket.on('cancelMatching', (data) => {
      console.log(`${this.username} match canceled:`, data);

      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });

    this.socket.on('error', (error) => {
      console.error(`${this.username} Socket error:`, error);

      this.socket.disconnect();
    });

    this.socket.on('disconnect', () => {
      console.log(`${this.username} disconnected`);
      activeClients--;

      if (activeClients === 0) {
        console.log('All clients have disconnected. Exiting program.');
        process.exit(0);
      }
    });
  }

  /**
   * Prepare and send a match request via socket.
   */
  requestMatch() {
    if (this.isMatched) return; // Do not proceed if already matched
    if (this.attempt >= this.maxRetries) {
      console.log(`${this.username} reached maximum match attempts. Stopping.`);
      this.cancelMatch(); // This will handle disconnecting after delay
      return;
    }

    this.attempt += 1;
    console.log(`${this.username} attempting match (Attempt ${this.attempt})`);

    const requestData = {
      username: this.username,
      email: this.email,
    };

    if (typeof this.category === 'string') {
      requestData.category = this.category.trim();
    }

    if (typeof this.difficulty === 'string') {
      requestData.difficulty = this.difficulty.trim();
    }

    this.socket.emit('startMatching', requestData);

    this.retryTimeout = setTimeout(() => {
      if (!this.isMatched) {
        console.log(`${this.username} is still searching for a match. Retrying...`);
        this.requestMatch();
      }
    }, this.retryInterval);
  }

  /**
   * Cancel the match request via socket.
   */
  cancelMatch() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.socket.emit('cancelMatching');

    setTimeout(() => {
      this.socket.disconnect();
    }, 1000);
  }
}

/**
 * Function to simulate multiple clients based on your test plan.
 */
function runTests() {
  // 1. Normal Matching: User1 and User2
  const user1 = new Client('User1', 'user1@example.com', 'Bit Manipulation', 'Hard');

  setTimeout(() => {
    const user2 = new Client('User2', 'user2@example.com', 'Bit Manipulation', 'Hard');
  }, 1000); // User2 connects after 1 second

  // 2. Simultaneous Queueing: User3 and User4
  setTimeout(() => {
    const user3 = new Client('User3', 'user3@example.com', 'Arrays', 'Easy');
    const user4 = new Client('User4', 'user4@example.com', 'Arrays', 'Easy');
  }, 2000); // Both connect after 2 seconds

  // 3. Cross-Difficulty and Category Matching: User5 and User6
  setTimeout(() => {
    const user5 = new Client('User5', 'user5@example.com', 'Bit Manipulation', 'Easy');
    const user6 = new Client('User6', 'user6@example.com', 'Graphs', 'Hard');
  }, 4000); // Users5 and User6 connect at 4 seconds

  // 4. Additional Cross-Matching: User7 and User8
  setTimeout(() => {
    const user7 = new Client('User7', 'user7@example.com', '', 'Medium');
    const user8 = new Client('User8', 'user8@example.com', 'Graphs', '');
  }, 5000); // Users7 and User8 connect at 5 seconds

  /*
  Expected Results:
  - User1 and User2 should match
  - User3 and User4 should match
  - User6 and User8 might match if your matching logic allows partial criteria
  - User5 and User7 may need to retry until they match or reach max retries
  Note: It is technically possible for user 7 and 8 to match, but that would basically require
  the planets to align for the race conditions to clash that hard. That said, if they do match 
  7 and 8, it's a sign that the event-based system is working. So it's a good thing.
  */
}

runTests();
