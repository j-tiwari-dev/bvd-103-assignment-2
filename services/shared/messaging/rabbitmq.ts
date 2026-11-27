import amqp, {
  type ChannelModel,
  type ConfirmChannel,
  type ConsumeMessage,
} from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const EXCHANGE = 'mcmasterful.events';

export interface DomainEvent<T = unknown> {
  eventId: string;
  type: string;
  timestamp: string;
  data: T;
}

export class RabbitMQClient {
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;

  async connect(): Promise<void> {
    this.connection = await amqp.connect(RABBITMQ_URL);
    this.channel = await this.connection.createConfirmChannel();

    await this.channel.assertExchange(EXCHANGE, 'topic', {
      durable: true,
    });
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ is not connected');
    }

    const payload = Buffer.from(JSON.stringify(event));

    this.channel.publish(EXCHANGE, event.type, payload, {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
    });

    await this.channel.waitForConfirms();
  }

  async subscribe(
    queue: string,
    eventTypes: string[],
    handler: (event: DomainEvent) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ is not connected');
    }

    await this.channel.assertQueue(queue, {
      durable: true,
    });

    for (const eventType of eventTypes) {
      await this.channel.bindQueue(queue, EXCHANGE, eventType);
    }

    await this.channel.prefetch(1);

    await this.channel.consume(
      queue,
      async (message: ConsumeMessage | null) => {
        if (!message || !this.channel) {
          return;
        }

        try {
          const event = JSON.parse(message.content.toString()) as DomainEvent;

          await handler(event);

          this.channel.ack(message);
        } catch (error) {
          console.error('Failed to process RabbitMQ event:', error);

          this.channel.nack(message, false, false);
        }
      },
      { noAck: false }
    );
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();

    this.channel = null;
    this.connection = null;
  }
}
