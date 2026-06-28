/* eslint-disable @typescript-eslint/no-explicit-any */
// ─────────────────────────────────────────────────────────────
// LastMinute — RabbitMQ / Event Queue Integration
// Integrates RabbitMQ with clean fallback to in-process memory queue.
// ─────────────────────────────────────────────────────────────

import amqp from "amqplib";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

const QUEUE_NAME = "task_prioritization";

export class QueueClient {
  // Use any to prevent compile conflicts between promise and callback typings in amqplib
  private connection: any = null;
  private channel: any = null;
  private isConnecting = false;

  constructor() {
    if (config.rabbitmqUrl) {
      this.connect().catch((err) => {
        logger.error("Initial RabbitMQ connection failed, using in-process queue", {
          error: err.message,
        });
      });
    } else {
      logger.info("RabbitMQ URL not configured. Using in-process memory queue.");
    }
  }

  private async connect(): Promise<void> {
    if (!config.rabbitmqUrl || this.connection || this.isConnecting) return;
    this.isConnecting = true;

    try {
      logger.info("Connecting to RabbitMQ...", { url: config.rabbitmqUrl });
      this.connection = await amqp.connect(config.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(QUEUE_NAME, { durable: true });
      logger.info("RabbitMQ connected and channel asserted.");

      this.connection.on("error", (err: any) => {
        logger.error("RabbitMQ connection error", { error: err.message });
        this.disconnect();
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");
        this.disconnect();
      });
    } catch (err) {
      const error = err as Error;
      logger.error("Failed to connect to RabbitMQ", { error: error.message });
      this.disconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private disconnect(): void {
    this.connection = null;
    this.channel = null;
  }

  /**
   * Publishes a message to the queue.
   * If RabbitMQ is connected, writes to the queue. Otherwise, falls back to the local fallback.
   */
  async publish(
    message: Record<string, unknown>,
    localFallback: () => Promise<void>
  ): Promise<void> {
    if (config.rabbitmqUrl && !this.channel && !this.isConnecting) {
      await this.connect();
    }

    if (this.channel) {
      try {
        const buffered = Buffer.from(JSON.stringify(message));
        this.channel.sendToQueue(QUEUE_NAME, buffered, { persistent: true });
        logger.info("Published prioritization job to RabbitMQ queue", { jobId: message["jobId"] });
        return;
      } catch (err) {
        logger.warn("Failed to publish to RabbitMQ queue, falling back to local runner", {
          error: (err as Error).message,
        });
      }
    }

    // Fallback: run locally asynchronously
    localFallback().catch((err) => {
      logger.error("Local prioritization run failed", { error: err.message });
    });
  }

  /**
   * Registers a consumer for messages on this queue.
   */
  async consume(onMessage: (message: Record<string, unknown>) => Promise<void>): Promise<void> {
    if (config.rabbitmqUrl && !this.channel && !this.isConnecting) {
      await this.connect();
    }

    if (this.channel) {
      await this.channel.consume(
        QUEUE_NAME,
        async (msg: any) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString()) as Record<string, unknown>;
            logger.info("Consumed prioritization job from RabbitMQ queue", {
              jobId: content["jobId"],
            });
            await onMessage(content);
            this.channel?.ack(msg);
          } catch (err) {
            logger.error("Error processing queue message", {
              error: (err as Error).message,
            });
            // Requeue the message for retry
            this.channel?.nack(msg, false, true);
          }
        },
        { noAck: false }
      );
      logger.info("Registered RabbitMQ queue consumer");
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (err) {
      logger.error("Error closing RabbitMQ connection", { error: (err as Error).message });
    }
  }
}

export const queueClient = new QueueClient();
