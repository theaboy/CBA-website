import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fulfillTicketOrder } from '../../lib/ticketOrders';

vi.mock('../../lib/prisma', () => {
  const tx = {
    event: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    orderTicket: {
      create: vi.fn(),
    },
  };

  return {
    prisma: {
      orderTicket: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(tx)),
      __tx: tx,
    },
  };
});

function input(override?: Partial<Parameters<typeof fulfillTicketOrder>[0]>) {
  return {
    eventId: 'event-uuid-1',
    quantity: 2,
    customerName: 'Ticket Buyer',
    customerEmail: 'buyer@example.com',
    amountTotalCents: 5000,
    paymentReference: 'pi_ticket_123',
    ...override,
  };
}

function makeEvent(override?: object) {
  return {
    id: 'event-uuid-1',
    totalTickets: 10,
    ticketsSold: 3,
    ...override,
  };
}

describe('fulfillTicketOrder', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns existing order for duplicate payment references', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.orderTicket.findFirst).mockResolvedValue({ id: 'existing-order' } as any);

    const result = await fulfillTicketOrder(input());

    expect(result).toMatchObject({ order: { id: 'existing-order' }, created: false });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('atomically increments sold tickets and creates one ticket row per quantity', async () => {
    const { prisma } = await import('../../lib/prisma');
    const tx = (prisma as any).__tx;
    vi.mocked(prisma.orderTicket.findFirst).mockResolvedValue(null);
    tx.event.findUnique.mockResolvedValue(makeEvent());
    tx.event.updateMany.mockResolvedValue({ count: 1 });
    tx.orderTicket.create.mockResolvedValue({ id: 'new-order' });

    const result = await fulfillTicketOrder(input());

    expect(result).toMatchObject({ order: { id: 'new-order' }, created: true });
    expect(tx.event.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'event-uuid-1',
        ticketsSold: { lte: 8 },
      },
      data: { ticketsSold: { increment: 2 } },
    });
    expect(tx.orderTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          quantity: 2,
          amountPaid: 50,
          stripePaymentId: 'pi_ticket_123',
          tickets: { create: [{}, {}] },
        }),
      })
    );
  });

  it('rejects invalid quantities before writing anything', async () => {
    await expect(fulfillTicketOrder(input({ quantity: 0 }))).rejects.toThrow('Invalid ticket quantity');
  });

  it('prevents oversells when the atomic capacity update does not match', async () => {
    const { prisma } = await import('../../lib/prisma');
    const tx = (prisma as any).__tx;
    vi.mocked(prisma.orderTicket.findFirst).mockResolvedValue(null);
    tx.event.findUnique.mockResolvedValue(makeEvent({ totalTickets: 4, ticketsSold: 3 }));
    tx.event.updateMany.mockResolvedValue({ count: 0 });

    await expect(fulfillTicketOrder(input({ quantity: 2 }))).rejects.toThrow('Oversell prevented');
    expect(tx.orderTicket.create).not.toHaveBeenCalled();
  });
});
