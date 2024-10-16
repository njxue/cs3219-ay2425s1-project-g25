Hey, this is Nephelite again. To test the local implementation of this service without frontend, follow the steps below:

1. Run `npm install` at this level (root of matching-service).
2. Configure the .env file. Edit the `DB_REQUIRE_AUTH` field in .env to be false for local.
3. In your local MongoDB, add the Database `peerprepMatchingServiceDB` with `matchingevents` collection. The successful match events will be recorded here. This recording will only be done if the `ENABLE_LOGGING` .env variable is set to true. Regardless of if it's true though, you will still need the mongoDB connection.
4. Open 2 terminals: One to run the service, the other to run the test script.
5. First terminal: Run `npm run dev`. Then wait for the 3 white console.log statements to pop up.
6. Second terminal: Run `node testClient` and watch the tests go.

To add test cases, add them at the bottom of the testClient.js file.

The testClient.js file also allows you to define delay as you wish, so you can use that to test your race condition prevention delay measures, though I also tried to ensure the implementation of matching here avoids race conditions as much as possible.