"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    format(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
    }
    info(message, meta) {
        console.log(`\x1b[36m${this.format('info', message, meta)}\x1b[0m`);
    }
    warn(message, meta) {
        console.warn(`\x1b[33m${this.format('warn', message, meta)}\x1b[0m`);
    }
    error(message, meta) {
        console.error(`\x1b[31m${this.format('error', message, meta)}\x1b[0m`);
    }
    debug(message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`\x1b[35m${this.format('debug', message, meta)}\x1b[0m`);
        }
    }
}
exports.logger = new Logger();
