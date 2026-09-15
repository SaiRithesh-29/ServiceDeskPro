import { describe, it, expect } from 'vitest';
import { TicketService } from './ticketService.js';

describe('TicketService status transitions', () => {
    it('allows normal progress through the ticket workflow', () => {
        expect(TicketService.isValidTransition('open', 'assigned')).toBe(true);
        expect(TicketService.isValidTransition('assigned', 'in_progress')).toBe(true);
        expect(TicketService.isValidTransition('in_progress', 'resolved')).toBe(true);
        expect(TicketService.isValidTransition('resolved', 'closed')).toBe(true);
    });
    it('allows resolved tickets to be reopened', () => {
        expect(TicketService.isValidTransition('resolved', 'reopened')).toBe(true);
    });
    it('rejects invalid shortcuts', () => {
        expect(TicketService.isValidTransition('open', 'resolved')).toBe(false);
        expect(TicketService.isValidTransition('closed', 'in_progress')).toBe(false);
    });
});
