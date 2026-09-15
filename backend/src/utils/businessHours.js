"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSLAStatus = exports.calculateSLADeadline = exports.isWithinBusinessHours = exports.DEFAULT_BUSINESS_CONFIG = void 0;
exports.DEFAULT_BUSINESS_CONFIG = {
    startHour: 9,
    endHour: 18,
    workingDays: [1, 2, 3, 4, 5],
};
/**
 * Checks if a given date falls within working hours and working days.
 */
const isWithinBusinessHours = (date, config = exports.DEFAULT_BUSINESS_CONFIG) => {
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    if (!config.workingDays.includes(day))
        return false;
    const hours = date.getHours();
    return hours >= config.startHour && hours < config.endHour;
};
exports.isWithinBusinessHours = isWithinBusinessHours;
/**
 * Calculates deadline Date given a start date and target working minutes.
 * If mode is '24_7', it adds pure milliseconds.
 * If mode is 'business_hours', it traverses minute by minute / day chunks during working hours only.
 */
const calculateSLADeadline = (startDate, targetMinutes, mode = 'business_hours', config = exports.DEFAULT_BUSINESS_CONFIG) => {
    if (mode === '24_7') {
        return new Date(startDate.getTime() + targetMinutes * 60 * 1000);
    }
    let remainingMinutes = targetMinutes;
    let current = new Date(startDate.getTime());
    while (remainingMinutes > 0) {
        const day = current.getDay();
        // If weekend or non-working day, advance to next day startHour:00
        if (!config.workingDays.includes(day)) {
            current.setDate(current.getDate() + 1);
            current.setHours(config.startHour, 0, 0, 0);
            continue;
        }
        const currentHour = current.getHours();
        const currentMinute = current.getMinutes();
        // If before business hours, jump to startHour:00 today
        if (currentHour < config.startHour) {
            current.setHours(config.startHour, 0, 0, 0);
            continue;
        }
        // If after business hours, jump to startHour:00 next day
        if (currentHour >= config.endHour) {
            current.setDate(current.getDate() + 1);
            current.setHours(config.startHour, 0, 0, 0);
            continue;
        }
        // Minutes left in current business day
        const minutesLeftInDay = (config.endHour - currentHour) * 60 - currentMinute;
        if (remainingMinutes <= minutesLeftInDay) {
            current = new Date(current.getTime() + remainingMinutes * 60 * 1000);
            remainingMinutes = 0;
        }
        else {
            remainingMinutes -= minutesLeftInDay;
            current.setDate(current.getDate() + 1);
            current.setHours(config.startHour, 0, 0, 0);
        }
    }
    return current;
};
exports.calculateSLADeadline = calculateSLADeadline;
/**
 * Computes the SLA status and consumption percentage.
 */
const evaluateSLAStatus = (startDate, deadline, now = new Date(), isResolved = false) => {
    const totalDurationMs = deadline.getTime() - startDate.getTime();
    const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
    const remainingMs = deadline.getTime() - now.getTime();
    const totalMinutes = Math.round(totalDurationMs / (60 * 1000));
    const elapsedMinutes = Math.round(elapsedMs / (60 * 1000));
    const remainingMinutes = Math.round(remainingMs / (60 * 1000));
    const consumedPercentage = totalDurationMs > 0
        ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)))
        : 100;
    if (now > deadline && !isResolved) {
        return {
            status: 'breached',
            consumedPercentage: 100,
            remainingMinutes: Math.min(0, remainingMinutes),
            elapsedMinutes,
        };
    }
    if (consumedPercentage >= 80 && !isResolved) {
        return {
            status: 'at_risk',
            consumedPercentage,
            remainingMinutes: Math.max(0, remainingMinutes),
            elapsedMinutes,
        };
    }
    return {
        status: 'on_track',
        consumedPercentage,
        remainingMinutes: Math.max(0, remainingMinutes),
        elapsedMinutes,
    };
};
exports.evaluateSLAStatus = evaluateSLAStatus;
