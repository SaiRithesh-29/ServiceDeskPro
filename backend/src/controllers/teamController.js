"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const Team_js_1 = require("../models/Team.js");
const Department_js_1 = require("../models/Department.js");
const AppError_js_1 = require("../utils/AppError.js");
class TeamController {
    static async getTeams(_req, res, next) {
        try {
            const teams = await Team_js_1.Team.find({ isActive: true }).populate('lead members department');
            res.status(200).json({
                success: true,
                data: teams,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createTeam(req, res, next) {
        try {
            const team = await Team_js_1.Team.create(req.body);
            res.status(201).json({
                success: true,
                data: team,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTeam(req, res, next) {
        try {
            const { id } = req.params;
            const team = await Team_js_1.Team.findByIdAndUpdate(id, req.body, { new: true });
            if (!team)
                throw new AppError_js_1.AppError('Team not found', 404);
            res.status(200).json({
                success: true,
                data: team,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDepartments(_req, res, next) {
        try {
            const departments = await Department_js_1.Department.find({ isActive: true }).populate('manager');
            res.status(200).json({
                success: true,
                data: departments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createDepartment(req, res, next) {
        try {
            const department = await Department_js_1.Department.create(req.body);
            res.status(201).json({
                success: true,
                data: department,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TeamController = TeamController;
