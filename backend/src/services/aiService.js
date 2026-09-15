"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const KnowledgeArticle_js_1 = require("../models/KnowledgeArticle.js");
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
class AIService {
    /**
     * Classifies a ticket based on title and description.
     * If external AI API is configured, invokes LLM; otherwise uses intelligent deterministic semantic rules.
     */
    static async classifyTicket(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        // If external AI provider configured and has API key
        if (env_js_1.env.AI_PROVIDER !== 'mock' && env_js_1.env.AI_API_KEY) {
            try {
                // External LLM integration hook (OpenAI / Gemini)
                return await this.callExternalLLM(title, description);
            }
            catch (err) {
                logger_js_1.logger.warn('External AI call failed, falling back to rule-based engine:', err.message);
            }
        }
        // Rule-based classification engine
        return this.ruleBasedClassifier(text);
    }
    static ruleBasedClassifier(text) {
        // Security triggers
        if (text.includes('phish') ||
            text.includes('ransomware') ||
            text.includes('breach') ||
            text.includes('hacked') ||
            text.includes('malware') ||
            text.includes('virus')) {
            return {
                category: 'Security',
                priority: 'critical',
                confidence: 0.96,
                keyIssue: 'Potential Security Threat or Malicious Activity',
                suggestedSteps: [
                    'Immediately isolate the affected machine from the network (disconnect Ethernet/WiFi)',
                    'Change master account credentials from a known secure device',
                    'Run enterprise malware/endpoint scanner',
                    'Preserve logs and notify the Chief Information Security Officer (CISO)',
                ],
            };
        }
        // Server / Outage triggers
        if (text.includes('server down') ||
            text.includes('production down') ||
            text.includes('database crash') ||
            text.includes('outage')) {
            return {
                category: 'Network',
                priority: 'critical',
                confidence: 0.94,
                keyIssue: 'Critical Infrastructure Outage',
                suggestedSteps: [
                    'Check cloud provider and server health dashboards',
                    'Inspect server CPU, memory, and disk utilization metrics',
                    'Verify core database and load balancer connectivity',
                    'Trigger incident response page to on-call infrastructure engineers',
                ],
            };
        }
        // VPN triggers
        if (text.includes('vpn') || text.includes('remote access') || text.includes('tunnel')) {
            return {
                category: 'VPN',
                priority: 'high',
                confidence: 0.92,
                keyIssue: 'VPN Connection / Authentication Failure',
                suggestedSteps: [
                    'Verify user credentials and MFA authenticator status',
                    'Ensure VPN client software is updated to the latest corporate version',
                    'Check if local ISP or firewall is blocking VPN gateway ports',
                    'Restart VPN network adapter or reinstall client configuration profile',
                ],
            };
        }
        // Account & Access triggers
        if (text.includes('password') ||
            text.includes('login') ||
            text.includes('locked out') ||
            text.includes('mfa') ||
            text.includes('2fa') ||
            text.includes('sso') ||
            text.includes('permission') ||
            text.includes('access')) {
            return {
                category: 'Account & Access',
                priority: 'medium',
                confidence: 0.89,
                keyIssue: 'Identity & Access Management Request',
                suggestedSteps: [
                    'Verify user identity via official organizational directory',
                    'Check Active Directory / Okta status for locked accounts',
                    'Trigger secure self-service password reset link',
                    'Review group memberships for required role permissions',
                ],
            };
        }
        // Email triggers
        if (text.includes('email') ||
            text.includes('outlook') ||
            text.includes('mailbox') ||
            text.includes('spam') ||
            text.includes('inbox')) {
            return {
                category: 'Email',
                priority: 'medium',
                confidence: 0.88,
                keyIssue: 'Email Client or Mailbox Delivery Issue',
                suggestedSteps: [
                    'Check webmail access to rule out local client corruption',
                    'Inspect mailbox storage quota limit',
                    'Verify DNS MX records and mail gateway rules',
                    'Re-create Outlook profile or clear local OST cache',
                ],
            };
        }
        // Printer triggers
        if (text.includes('printer') ||
            text.includes('print') ||
            text.includes('paper jam') ||
            text.includes('toner') ||
            text.includes('scanner')) {
            return {
                category: 'Printer',
                priority: 'low',
                confidence: 0.91,
                keyIssue: 'Office Printer / Scanner Hardware Fault',
                suggestedSteps: [
                    'Check physical device display for error codes or paper jams',
                    'Verify printer IP and network connectivity',
                    'Clear stuck jobs in Windows Print Spooler service',
                    'Reinstall official printer driver from corporate software repository',
                ],
            };
        }
        // Hardware triggers
        if (text.includes('laptop') ||
            text.includes('desktop') ||
            text.includes('screen') ||
            text.includes('monitor') ||
            text.includes('battery') ||
            text.includes('keyboard') ||
            text.includes('mouse') ||
            text.includes('freeze') ||
            text.includes('overheating') ||
            text.includes('slow')) {
            return {
                category: 'Hardware',
                priority: 'medium',
                confidence: 0.86,
                keyIssue: 'Workstation Hardware or Performance Degradation',
                suggestedSteps: [
                    'Perform full hardware diagnostics (BIOS/OEM tool)',
                    'Check Task Manager for CPU/Memory throttling and background tasks',
                    'Inspect battery health cycle count and thermal vents',
                    'Schedule physical asset inspection or replacement if hardware component is failing',
                ],
            };
        }
        // Network triggers
        if (text.includes('wifi') ||
            text.includes('wi-fi') ||
            text.includes('internet') ||
            text.includes('ethernet') ||
            text.includes('dns') ||
            text.includes('ip') ||
            text.includes('slow internet')) {
            return {
                category: 'Network',
                priority: 'high',
                confidence: 0.87,
                keyIssue: 'Local Network or Connectivity Issue',
                suggestedSteps: [
                    'Verify physical cable connection or WiFi SSID signal strength',
                    'Run ipconfig /flushdns and ipconfig /renew',
                    'Check gateway ping and trace route for packet loss',
                    'Verify if other users on the same floor/access point are experiencing issues',
                ],
            };
        }
        // Software / Application triggers
        if (text.includes('crash') ||
            text.includes('install') ||
            text.includes('license') ||
            text.includes('bug') ||
            text.includes('excel') ||
            text.includes('software') ||
            text.includes('app')) {
            return {
                category: 'Software',
                priority: 'medium',
                confidence: 0.85,
                keyIssue: 'Application Error or Software Installation Request',
                suggestedSteps: [
                    'Verify software version and check for pending updates/patches',
                    'Review application crash logs in Event Viewer',
                    'Verify valid corporate license assignment',
                    'Reinstall or repair software package from company portal',
                ],
            };
        }
        // Default fallback
        return {
            category: 'Other',
            priority: 'medium',
            confidence: 0.75,
            keyIssue: 'General IT Support Request',
            suggestedSteps: [
                'Review requester details and issue description',
                'Request additional diagnostic information or screenshot from user',
                'Assign to appropriate IT support specialist queue',
            ],
        };
    }
    static async callExternalLLM(_title, _description) {
        // Stub for external API (can connect to OpenAI/Gemini using env.AI_API_KEY)
        throw new Error('External provider not configured, using fallback');
    }
    /**
     * Recommends Knowledge Base articles related to a ticket's subject.
     */
    static async suggestKBArticles(title, description, category) {
        try {
            const searchTerms = `${title} ${description}`
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter((w) => w.length > 3);
            const uniqueTerms = Array.from(new Set(searchTerms)).slice(0, 6);
            let query = { status: 'published' };
            if (category && category !== 'Other') {
                query.category = category;
            }
            if (uniqueTerms.length > 0) {
                query.$or = [
                    { title: { $regex: uniqueTerms.join('|'), $options: 'i' } },
                    { problem: { $regex: uniqueTerms.join('|'), $options: 'i' } },
                    { tags: { $in: uniqueTerms } },
                ];
            }
            const articles = await KnowledgeArticle_js_1.KnowledgeArticle.find(query)
                .sort({ helpfulVotes: -1, views: -1 })
                .limit(4);
            if (articles.length === 0) {
                // Return top articles in general if specific match didn't yield results
                return await KnowledgeArticle_js_1.KnowledgeArticle.find({ status: 'published' })
                    .sort({ helpfulVotes: -1 })
                    .limit(3);
            }
            return articles;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get KB suggestions:', error.message);
            return [];
        }
    }
}
exports.AIService = AIService;
