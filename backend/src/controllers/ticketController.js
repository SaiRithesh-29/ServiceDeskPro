"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const ticketService_js_1 = require("../services/ticketService.js");
const Ticket_js_1 = require("../models/Ticket.js");
const TicketComment_js_1 = require("../models/TicketComment.js");
const TicketWorkLog_js_1 = require("../models/TicketWorkLog.js");
const TicketAttachment_js_1 = require("../models/TicketAttachment.js");
const slaEngine_js_1 = require("../services/slaEngine.js");
const AppError_js_1 = require("../utils/AppError.js");
const mongoose_1 = __importDefault(require("mongoose"));
class TicketController {
    static async getTickets(req, res, next) {
        try {
            const { status, priority, category, department, technician, requester, slaStatus, search, startDate, endDate, page = '1', limit = '15', sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
            const filter = {};
            // Role scoping: Employees only see their submitted tickets
            if (req.user?.role === 'employee') {
                filter.requester = req.user._id;
            }
            if (status) {
                if (Array.isArray(status))
                    filter.status = { $in: status };
                else if (status.toString().includes(','))
                    filter.status = { $in: status.split(',') };
                else
                    filter.status = status;
            }
            if (priority)
                filter.priority = priority;
            if (category)
                filter.category = category;
            if (department)
                filter.department = department;
            if (technician)
                filter.assignedTechnician = technician;
            if (requester && req.user?.role !== 'employee')
                filter.requester = requester;
            if (slaStatus)
                filter.slaStatus = slaStatus;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate)
                    filter.createdAt.$gte = new Date(startDate);
                if (endDate)
                    filter.createdAt.$lte = new Date(endDate);
            }
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                filter.$or = [
                    { ticketId: searchRegex },
                    { title: searchRegex },
                    { description: searchRegex },
                ];
            }
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 15;
            const skip = (pageNum - 1) * limitNum;
            const sortDirection = sortOrder === 'asc' ? 1 : -1;
            const [tickets, total] = await Promise.all([
                Ticket_js_1.Ticket.find(filter)
                    .populate('requester department assignedTechnician assignedTeam asset')
                    .sort({ [sortBy]: sortDirection })
                    .skip(skip)
                    .limit(limitNum),
                Ticket_js_1.Ticket.countDocuments(filter),
            ]);
            res.status(200).json({
                success: true,
                data: tickets,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createTicket(req, res, next) {
        try {
            const ticket = await ticketService_js_1.TicketService.createTicket(req.body, req.user, { req });
            res.status(201).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getTicketById(req, res, next) {
        try {
            const { id } = req.params;
            const isObjectId = mongoose_1.default.isValidObjectId(id);
            const ticket = await Ticket_js_1.Ticket.findOne({
                $or: [{ _id: isObjectId ? id : null }, { ticketId: id }],
            }).populate('requester department assignedTechnician assignedTeam asset slaPolicy');
            if (!ticket) {
                throw new AppError_js_1.AppError('Ticket not found', 404);
            }
            // Check access permission for employee
            if (req.user?.role === 'employee' &&
                ticket.requester &&
                ticket.requester._id.toString() !== req.user._id.toString()) {
                throw new AppError_js_1.AppError('You do not have permission to view this ticket', 403);
            }
            // Dynamic SLA evaluation for real-time countdown
            const slaEvaluation = slaEngine_js_1.SLAEngine.evaluateTicketSLA(ticket);
            // Comments filter (Employees NEVER see internal notes)
            const commentsQuery = { ticket: ticket._id };
            if (req.user?.role === 'employee') {
                commentsQuery.isInternal = false;
            }
            const [comments, workLogs, attachments] = await Promise.all([
                TicketComment_js_1.TicketComment.find(commentsQuery)
                    .populate('author', 'name email avatarUrl role')
                    .sort({ createdAt: 1 }),
                TicketWorkLog_js_1.TicketWorkLog.find({ ticket: ticket._id })
                    .populate('technician', 'name email avatarUrl role')
                    .sort({ loggedAt: -1 }),
                TicketAttachment_js_1.TicketAttachment.find({ ticket: ticket._id })
                    .populate('uploadedBy', 'name email')
                    .sort({ createdAt: -1 }),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    ...ticket.toJSON(),
                    slaEvaluation,
                    comments,
                    workLogs,
                    attachments,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTicket(req, res, next) {
        try {
            const { id } = req.params;
            const isObjectId = mongoose_1.default.isValidObjectId(id);
            const ticket = await Ticket_js_1.Ticket.findOne({
                $or: [{ _id: isObjectId ? id : null }, { ticketId: id }],
            });
            if (!ticket)
                throw new AppError_js_1.AppError('Ticket not found', 404);
            // Employees cannot edit fields other than basic descriptions on open tickets
            if (req.user?.role === 'employee' && ticket.requester.toString() !== req.user._id.toString()) {
                throw new AppError_js_1.AppError('Unauthorized to modify this ticket', 403);
            }
            Object.assign(ticket, req.body);
            await ticket.save();
            res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, resolutionNotes } = req.body;
            const ticket = await ticketService_js_1.TicketService.updateStatus(id, status, req.user, resolutionNotes, { req });
            res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async assignTicket(req, res, next) {
        try {
            const { id } = req.params;
            const { technicianId, teamId } = req.body;
            const ticket = await ticketService_js_1.TicketService.assignTicket(id, technicianId, teamId, req.user, { req });
            res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async escalateTicket(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const ticket = await Ticket_js_1.Ticket.findOne({
                $or: [{ _id: mongoose_1.default.isValidObjectId(id) ? id : null }, { ticketId: id }],
            });
            if (!ticket)
                throw new AppError_js_1.AppError('Ticket not found', 404);
            ticket.status = 'escalated';
            ticket.escalationReason = reason || 'Escalated by user request';
            ticket.priority = 'critical'; // Auto-bump to critical
            await ticket.save();
            res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async resolveTicket(req, res, next) {
        try {
            const { id } = req.params;
            const { resolutionNotes } = req.body;
            const ticket = await ticketService_js_1.TicketService.updateStatus(id, 'resolved', req.user, resolutionNotes, { req });
            res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async reopenTicket(req, res, next) {
        try {
            const { id } = req.params;
            const ticket = await ticketService_js_1.TicketService.updateStatus(id, 'reopened', req.user, undefined, { req });
            res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addComment(req, res, next) {
        try {
            const { id } = req.params;
            const { content, isInternal, attachments } = req.body;
            const comment = await ticketService_js_1.TicketService.addComment(id, content, Boolean(isInternal), req.user, attachments || [], { req });
            res.status(201).json({
                success: true,
                data: comment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addWorkLog(req, res, next) {
        try {
            const { id } = req.params;
            const { timeSpentMinutes, description } = req.body;
            const workLog = await ticketService_js_1.TicketService.logWork(id, Number(timeSpentMinutes), description, req.user);
            res.status(201).json({
                success: true,
                data: workLog,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteTicket(req, res, next) {
        try {
            const { id } = req.params;
            const ticket = await Ticket_js_1.Ticket.findOneAndDelete({
                $or: [{ _id: mongoose_1.default.isValidObjectId(id) ? id : null }, { ticketId: id }],
            });
            if (!ticket)
                throw new AppError_js_1.AppError('Ticket not found', 404);
            await Promise.all([
                TicketComment_js_1.TicketComment.deleteMany({ ticket: ticket._id }),
                TicketWorkLog_js_1.TicketWorkLog.deleteMany({ ticket: ticket._id }),
                TicketAttachment_js_1.TicketAttachment.deleteMany({ ticket: ticket._id }),
            ]);
            res.status(200).json({
                success: true,
                message: `Ticket ${ticket.ticketId} deleted successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TicketController = TicketController;
