import { handleMatchNotification } from "../controllers/collaborationController";
import { Kafka } from "kafkajs";

const HOST = process.env.KAFKA_HOST || "localhost";
const PORT = process.env.KAFKA_PORT || "9092";

const kafka = new Kafka({
    clientId: "collaboration-service",
    brokers: [`${HOST}:${PORT}`],
});

export const MATCH_TOPIC = "match_topic";
export const COLLAB_TOPIC = "collaboration_topic";

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "collab-service-group" });

/**
 * Initializes Kafka with a retry mechanism.
 */
async function initKafka(maxRetries = 5, retryDelay = 2000) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await producer.connect();
            await consumer.connect();
            console.log("Connected to Kafka");
            return;
        } catch (error) {
            retries++;
            console.error(
                `Failed to connect to Kafka (attempt ${retries} of ${maxRetries}):`,
                error
            );
            if (retries >= maxRetries) {
                console.error("Max retries reached. Exiting.");
                throw error;
            }
            await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * retries)
            );
        }
    }
}

/**
 * Listens for messages from matching-service for successful matches.
 */
export async function setUpKafkaSubscribers() {
    await initKafka();

    await consumer.subscribe({ topic: MATCH_TOPIC, fromBeginning: true });
    await consumer.run({
        eachMessage: handleMatchNotification,
    });
}