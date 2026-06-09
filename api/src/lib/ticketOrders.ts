import { prisma } from './prisma';

export type FulfillTicketOrderInput = {
  eventId: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  amountTotalCents: number;
  paymentReference: string;
};

export async function fulfillTicketOrder(input: FulfillTicketOrderInput) {
  const qty = input.quantity;
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    throw new Error(`Invalid ticket quantity: ${input.quantity}`);
  }

  const existing = await prisma.orderTicket.findFirst({
    where: { stripePaymentId: input.paymentReference },
    include: { event: true, tickets: true },
  });
  if (existing) return { order: existing, created: false };

  const order = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: input.eventId } });
    if (!event) throw new Error(`Event ${input.eventId} not found during fulfillment`);

    const updateResult = await tx.event.updateMany({
      where: {
        id: input.eventId,
        ticketsSold: { lte: event.totalTickets - qty },
      },
      data: { ticketsSold: { increment: qty } },
    });

    if (updateResult.count !== 1) {
      throw new Error(`Oversell prevented for event ${input.eventId}`);
    }

    return tx.orderTicket.create({
      data: {
        eventId: input.eventId,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        quantity: qty,
        amountPaid: input.amountTotalCents / 100,
        stripePaymentId: input.paymentReference,
        tickets: {
          create: Array.from({ length: qty }, () => ({})),
        },
      },
      include: {
        event: true,
        tickets: true,
      },
    });
  });

  return { order, created: true };
}
