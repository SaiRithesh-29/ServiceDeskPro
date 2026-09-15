"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Department_1 = require("../models/Department");
const Team_1 = require("../models/Team");
const Ticket_1 = require("../models/Ticket");
const TicketComment_1 = require("../models/TicketComment");
const TicketWorkLog_1 = require("../models/TicketWorkLog");
const Asset_1 = require("../models/Asset");
const AssetHistory_1 = require("../models/AssetHistory");
const KnowledgeArticle_1 = require("../models/KnowledgeArticle");
const SLAPolicy_1 = require("../models/SLAPolicy");
const AuditLog_1 = require("../models/AuditLog");
const Notification_1 = require("../models/Notification");
const SystemSetting_1 = require("../models/SystemSetting");
const logger_1 = require("../utils/logger");
async function seedDatabase() {
    try {
        await (0, db_1.connectDB)();
        logger_1.logger.info('Connected to MongoDB for rich seeding');
        // Clear existing collections
        await Promise.all([
            User_1.User.deleteMany({}),
            Department_1.Department.deleteMany({}),
            Team_1.Team.deleteMany({}),
            Ticket_1.Ticket.deleteMany({}),
            TicketComment_1.TicketComment.deleteMany({}),
            TicketWorkLog_1.TicketWorkLog.deleteMany({}),
            Asset_1.Asset.deleteMany({}),
            AssetHistory_1.AssetHistory.deleteMany({}),
            KnowledgeArticle_1.KnowledgeArticle.deleteMany({}),
            SLAPolicy_1.SLAPolicy.deleteMany({}),
            AuditLog_1.AuditLog.deleteMany({}),
            Notification_1.Notification.deleteMany({}),
            SystemSetting_1.SystemSetting.deleteMany({}),
        ]);
        logger_1.logger.info('✓ Cleared all existing collections');
        // 1. Create Departments
        const departments = await Department_1.Department.create([
            { name: 'Information Technology', code: 'IT', description: 'Core IT Infrastructure, Helpdesk, and Systems' },
            { name: 'Human Resources', code: 'HR', description: 'People Operations, Talent, and Employee Relations' },
            { name: 'Finance & Accounting', code: 'FIN', description: 'Financial Planning, Payroll, and Compliance' },
            { name: 'Software Engineering', code: 'ENG', description: 'Product Development, QA, and DevOps' },
            { name: 'Marketing & Sales', code: 'MKT', description: 'Growth, Customer Success, and Outreach' },
        ]);
        logger_1.logger.info(`✓ Created ${departments.length} departments`);
        // 2. Create Teams
        const teams = await Team_1.Team.create([
            {
                name: 'Tier 1 Service Desk',
                description: 'First line incident triage and hardware/peripherals support',
                department: departments[0]._id,
            },
            {
                name: 'Network & Cloud Infrastructure',
                description: 'VPN, firewalls, routers, servers, and datacenter operations',
                department: departments[0]._id,
            },
            {
                name: 'Enterprise Applications',
                description: 'SSO, Google Workspace, Microsoft 365, Jira, and internal tools',
                department: departments[0]._id,
            },
            {
                name: 'Cybersecurity Operations',
                description: 'Security incident response, endpoint detection, and compliance',
                department: departments[0]._id,
            },
        ]);
        logger_1.logger.info(`✓ Created ${teams.length} teams`);
        // 3. Create SLA Policies
        const slas = await SLAPolicy_1.SLAPolicy.create([
            {
                name: 'Critical Priority SLA (1h / 4h)',
                priority: 'critical',
                responseTimeMinutes: 60,
                resolutionTimeMinutes: 240,
                operatingHours: '24_7',
                isDefault: false,
            },
            {
                name: 'High Priority SLA (2h / 8h)',
                priority: 'high',
                responseTimeMinutes: 120,
                resolutionTimeMinutes: 480,
                operatingHours: 'business_hours',
                isDefault: false,
            },
            {
                name: 'Medium Priority SLA (4h / 24h)',
                priority: 'medium',
                responseTimeMinutes: 240,
                resolutionTimeMinutes: 1440,
                operatingHours: 'business_hours',
                isDefault: true,
            },
            {
                name: 'Low Priority SLA (8h / 48h)',
                priority: 'low',
                responseTimeMinutes: 480,
                resolutionTimeMinutes: 2880,
                operatingHours: 'business_hours',
                isDefault: false,
            },
        ]);
        logger_1.logger.info(`✓ Created ${slas.length} SLA policies`);
        // 4. Create Users (passwords hashed with 'Password123!' and fallback support for 'password123')
        const salt = await bcryptjs_1.default.genSalt(10);
        const defaultPasswordHash = await bcryptjs_1.default.hash('Password123!', salt);
        const users = await User_1.User.create([
            {
                name: 'Alex Mercer (Admin)',
                email: 'admin@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'admin',
                department: departments[0]._id,
                phone: '+1 (555) 010-0001',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Marcus Vance (IT Manager)',
                email: 'manager@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'it_manager',
                department: departments[0]._id,
                team: teams[0]._id,
                phone: '+1 (555) 010-0002',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Sarah Chen (Lead Tech)',
                email: 'tech1@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'technician',
                department: departments[0]._id,
                team: teams[0]._id,
                phone: '+1 (555) 010-0003',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Devon Miles (Network Tech)',
                email: 'tech2@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'technician',
                department: departments[0]._id,
                team: teams[1]._id,
                phone: '+1 (555) 010-0004',
                avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Elena Rostova (App Tech)',
                email: 'tech3@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'technician',
                department: departments[0]._id,
                team: teams[2]._id,
                phone: '+1 (555) 010-0005',
                avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'David Kim (Asset Manager)',
                email: 'assetmgr@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'asset_manager',
                department: departments[0]._id,
                phone: '+1 (555) 010-0006',
                avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Emma Watson (HR Specialist)',
                email: 'employee1@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'employee',
                department: departments[1]._id,
                phone: '+1 (555) 010-0007',
                avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Michael Scott (Finance Analyst)',
                email: 'employee2@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'employee',
                department: departments[2]._id,
                phone: '+1 (555) 010-0008',
                avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Rachel Green (Software Engineer)',
                email: 'employee3@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'employee',
                department: departments[3]._id,
                phone: '+1 (555) 010-0009',
                avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Jim Halpert (Marketing Lead)',
                email: 'employee4@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'employee',
                department: departments[4]._id,
                phone: '+1 (555) 010-0010',
                avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
            {
                name: 'Pam Beesly (Designer)',
                email: 'employee5@servicedesk.pro',
                passwordHash: defaultPasswordHash,
                role: 'employee',
                department: departments[3]._id,
                phone: '+1 (555) 010-0011',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                isActive: true,
            },
        ]);
        logger_1.logger.info(`✓ Created ${users.length} users across 5 roles`);
        // Update Team Leads
        teams[0].lead = users[2]._id;
        teams[0].members = [users[2]._id];
        teams[1].lead = users[3]._id;
        teams[1].members = [users[3]._id];
        teams[2].lead = users[4]._id;
        teams[2].members = [users[4]._id];
        await Promise.all(teams.map((t) => t.save()));
        // 5. Create Assets (Proper Enum types: Laptop, Desktop, Monitor, Server, Router, Printer, Software License, Mobile, Keyboard, Mouse, Other)
        const now = new Date();
        const assetsData = [
            {
                assetId: 'AST-1001',
                name: 'MacBook Pro 16" (M3 Max, 64GB, 1TB)',
                type: 'Laptop',
                serialNumber: 'C02XYZ982741',
                manufacturer: 'Apple',
                model: 'MacBook Pro 16-inch M3',
                purchaseDate: new Date('2024-02-15'),
                purchaseCost: 3499,
                warrantyExpiration: new Date(now.getTime() + 500 * 24 * 60 * 60 * 1000), // Active
                status: 'assigned',
                assignedUser: users[8]._id, // Rachel Green
                department: departments[3]._id,
                location: 'San Francisco HQ - Desk 4B',
                vendor: 'Apple Corporate Direct',
                specifications: { ram: '64GB', storage: '1TB SSD', cpu: 'M3 Max 16-Core' },
            },
            {
                assetId: 'AST-1002',
                name: 'Dell Precision 5570 Workstation',
                type: 'Laptop',
                serialNumber: 'DLL-9847291-A',
                manufacturer: 'Dell',
                model: 'Precision 5570',
                purchaseDate: new Date('2023-08-10'),
                purchaseCost: 2250,
                warrantyExpiration: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // Expiring in 20 days!
                status: 'assigned',
                assignedUser: users[7]._id, // Michael Scott
                department: departments[2]._id,
                location: 'New York Branch - 12th Floor',
                vendor: 'Dell Technologies',
                specifications: { ram: '32GB', storage: '512GB SSD', gpu: 'NVIDIA RTX A2000' },
            },
            {
                assetId: 'AST-1003',
                name: 'ThinkPad X1 Carbon Gen 11',
                type: 'Laptop',
                serialNumber: 'LNV-883719-X1',
                manufacturer: 'Lenovo',
                model: 'X1 Carbon Gen 11',
                purchaseDate: new Date('2023-01-20'),
                purchaseCost: 1890,
                warrantyExpiration: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // Expired
                status: 'under_repair',
                assignedUser: users[6]._id, // Emma Watson
                department: departments[1]._id,
                location: 'IT Repair Bench',
                vendor: 'CDW Logistics',
                notes: 'Screen backlight flicker. Awaiting replacement LCD panel.',
            },
            {
                assetId: 'AST-1004',
                name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
                type: 'Monitor',
                serialNumber: 'U3223QE-99182',
                manufacturer: 'Dell',
                model: 'U3223QE',
                purchaseDate: new Date('2024-03-01'),
                purchaseCost: 780,
                warrantyExpiration: new Date(now.getTime() + 700 * 24 * 60 * 60 * 1000),
                status: 'assigned',
                assignedUser: users[8]._id,
                department: departments[3]._id,
                location: 'San Francisco HQ - Desk 4B',
                vendor: 'Dell Technologies',
            },
            {
                assetId: 'AST-1005',
                name: 'Dell UltraSharp 27" 4K Monitor',
                type: 'Monitor',
                serialNumber: 'U2723QE-88371',
                manufacturer: 'Dell',
                model: 'U2723QE',
                purchaseDate: new Date('2024-01-10'),
                purchaseCost: 550,
                warrantyExpiration: new Date(now.getTime() + 650 * 24 * 60 * 60 * 1000),
                status: 'available',
                department: departments[0]._id,
                location: 'Main IT Storage Room B',
                vendor: 'Dell Technologies',
            },
            {
                assetId: 'AST-1006',
                name: 'Cisco Catalyst 9300 48-Port PoE Switch',
                type: 'Router',
                serialNumber: 'CSCO-CAT9300-48P',
                manufacturer: 'Cisco',
                model: 'Catalyst 9300L',
                purchaseDate: new Date('2023-05-15'),
                purchaseCost: 4800,
                warrantyExpiration: new Date(now.getTime() + 800 * 24 * 60 * 60 * 1000),
                status: 'available',
                department: departments[0]._id,
                location: 'Server Room Alpha - Rack 2',
                vendor: 'Cisco Systems Inc',
            },
            {
                assetId: 'AST-1007',
                name: 'Dell PowerEdge R750 Rack Server',
                type: 'Server',
                serialNumber: 'PE-R750-884920',
                manufacturer: 'Dell',
                model: 'PowerEdge R750',
                purchaseDate: new Date('2023-04-01'),
                purchaseCost: 9500,
                warrantyExpiration: new Date(now.getTime() + 1000 * 24 * 60 * 60 * 1000),
                status: 'available',
                department: departments[0]._id,
                location: 'Data Center Rack 04',
                vendor: 'Dell Technologies',
            },
            {
                assetId: 'AST-1008',
                name: 'HP LaserJet Enterprise MFP M528dn',
                type: 'Printer',
                serialNumber: 'HP-MFP528-99281',
                manufacturer: 'HP',
                model: 'LaserJet M528dn',
                purchaseDate: new Date('2023-09-12'),
                purchaseCost: 1450,
                warrantyExpiration: new Date(now.getTime() + 300 * 24 * 60 * 60 * 1000),
                status: 'available',
                department: departments[0]._id,
                location: '3rd Floor Copier Room',
                vendor: 'HP Inc',
            },
            {
                assetId: 'AST-1009',
                name: 'Microsoft 365 E5 Enterprise License (50 Seats)',
                type: 'Software License',
                serialNumber: 'MS-365-E5-ORG-50',
                manufacturer: 'Microsoft',
                model: 'Microsoft 365 E5 Cloud',
                purchaseDate: new Date('2024-01-01'),
                purchaseCost: 28800,
                warrantyExpiration: new Date(now.getTime() + 250 * 24 * 60 * 60 * 1000),
                status: 'available',
                department: departments[0]._id,
                location: 'Cloud Tenant',
                vendor: 'Microsoft Direct',
            },
            {
                assetId: 'AST-1010',
                name: 'JetBrains All Products Pack License (x10)',
                type: 'Software License',
                serialNumber: 'JB-APP-2024-DEV',
                manufacturer: 'JetBrains',
                model: 'All Products Pack',
                purchaseDate: new Date('2024-03-01'),
                purchaseCost: 7990,
                warrantyExpiration: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
                status: 'available',
                department: departments[3]._id,
                location: 'Cloud Portal',
                vendor: 'JetBrains s.r.o.',
            },
            {
                assetId: 'AST-1011',
                name: 'iPhone 15 Pro 256GB (Corporate Phone)',
                type: 'Mobile',
                serialNumber: 'IMEI-984729104829',
                manufacturer: 'Apple',
                model: 'iPhone 15 Pro',
                purchaseDate: new Date('2023-11-20'),
                purchaseCost: 1099,
                warrantyExpiration: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // Expiring in 15 days!
                status: 'assigned',
                assignedUser: users[9]._id, // Jim Halpert
                department: departments[4]._id,
                location: 'Mobile Device',
                vendor: 'Verizon Business',
            },
            {
                assetId: 'AST-1012',
                name: 'Logitech MX Master 3S Wireless Mouse',
                type: 'Mouse',
                serialNumber: 'LOGI-MXM3S-0091',
                manufacturer: 'Logitech',
                model: 'MX Master 3S',
                purchaseDate: new Date('2024-01-15'),
                purchaseCost: 99,
                warrantyExpiration: new Date(now.getTime() + 400 * 24 * 60 * 60 * 1000),
                status: 'assigned',
                assignedUser: users[10]._id, // Pam Beesly
                department: departments[3]._id,
                location: 'San Francisco HQ',
                vendor: 'Amazon Business',
            },
        ];
        const assets = await Asset_1.Asset.create(assetsData);
        logger_1.logger.info(`✓ Created ${assets.length} hardware and software assets`);
        // Create Asset History records
        await AssetHistory_1.AssetHistory.create([
            {
                asset: assets[0]._id,
                action: 'assigned',
                performedBy: users[5]._id,
                assignedTo: users[8]._id,
                details: 'Initial onboarding deployment for Rachel Green (Software Engineering)',
                date: new Date('2024-02-16'),
            },
            {
                asset: assets[2]._id,
                action: 'status_changed',
                performedBy: users[5]._id,
                details: 'Moved to Under Repair: Display backlight issue reported via SDP-1003',
                date: new Date('2024-05-10'),
            },
            {
                asset: assets[1]._id,
                action: 'assigned',
                performedBy: users[5]._id,
                assignedTo: users[7]._id,
                details: 'Assigned to Michael Scott for Finance reporting',
                date: new Date('2023-08-15'),
            },
        ]);
        // 6. Create Knowledge Base Articles
        const kbArticles = await KnowledgeArticle_1.KnowledgeArticle.create([
            {
                articleId: 'KB-1001',
                title: 'GlobalProtect VPN Setup and Troubleshooting Guide',
                slug: 'globalprotect-vpn-setup-troubleshooting',
                category: 'VPN',
                problem: 'Employees unable to connect to the internal corporate network remotely or experiencing VPN gateway authentication timeouts.',
                symptoms: 'GlobalProtect status shows "Connection Failed", "Portal Unavailable", or MFA prompt fails to appear on mobile device.',
                solution: `### Step 1: Verify VPN Client Version
Ensure you are running **GlobalProtect v6.1.2** or higher. If outdated, download the latest package from the internal portal.

### Step 2: Clear Cached Credentials & Portal URL
1. Open GlobalProtect client settings.
2. Verify Portal address is set to: \`vpn.company-internal.net\`
3. Click **Settings -> General -> Sign Out**, then re-enter your corporate email and password.

### Step 3: Check Authenticator Push Notifications
1. Ensure your Microsoft Authenticator / Duo Mobile app has background refresh and notifications enabled.
2. If push is not received, choose "Enter code manually" and type the 6-digit TOTP code.

### Step 4: Flush DNS and Reset Network Adapter
Run PowerShell as Administrator:
\`\`\`powershell
ipconfig /flushdns
netsh winsock reset
\`\`\`
Restart your computer and retry.`,
                status: 'published',
                author: users[3]._id, // Devon Miles
                tags: ['vpn', 'remote access', 'globalprotect', 'network', 'authentication'],
                views: 284,
                helpfulVotes: 48,
                unhelpfulVotes: 2,
            },
            {
                articleId: 'KB-1002',
                title: 'Self-Service Password Reset & MFA Token Synchronization',
                slug: 'self-service-password-reset-mfa-sync',
                category: 'Account & Access',
                problem: 'User is locked out of Okta/Active Directory account due to multiple failed attempts or out-of-sync MFA token.',
                symptoms: 'Account Locked message appears at login screen; TOTP codes generated by Authenticator app are rejected.',
                solution: `### Self-Service Password Reset Procedure
1. Navigate to the secure password reset portal at [https://auth.company-internal.net/reset](https://auth.company-internal.net/reset).
2. Enter your work email address.
3. Choose your recovery verification method (SMS OTP or Secondary Email).
4. Enter the verification code and set a new password meeting policy guidelines (minimum 12 chars, 1 uppercase, 1 number, 1 special character).

### Fixing Out-of-Sync MFA Codes
If TOTP codes fail, your device clock may be drifted:
- **iOS**: Settings -> General -> Date & Time -> Toggle **Set Automatically** ON.
- **Android**: Authenticator -> Settings -> **Time correction for codes** -> Sync now.`,
                status: 'published',
                author: users[2]._id,
                tags: ['password', 'mfa', 'okta', 'login', 'security', 'account'],
                views: 412,
                helpfulVotes: 91,
                unhelpfulVotes: 3,
            },
            {
                articleId: 'KB-1003',
                title: 'Resolving Office Printer Jams and Clearing Print Spooler Queue',
                slug: 'resolving-office-printer-jams-print-spooler',
                category: 'Printer',
                problem: 'Printer job stuck in queue or printer front display displays paper jam error code.',
                symptoms: 'Documents sent to printer stay in "Printing" or "Error" state indefinitely; physical printer shows yellow error lamp.',
                solution: `### Clearing the Local Windows Print Spooler
1. Save open documents and close print dialogs.
2. Open PowerShell as Administrator.
3. Stop spooler service and clear stuck print files:
\`\`\`powershell
Stop-Service -Name Spooler -Force
Remove-Item -Path "$env:SystemRoot\\System32\\spool\\PRINTERS\\*" -Force
Start-Service -Name Spooler
\`\`\`

### Inspecting Hardware Trays
1. Open Tray 1 and Tray 2 slowly. Pull out crumpled paper gently in the direction of the paper feed to avoid tearing.
2. Ensure paper ream guides are snug against the edges without bending the sheets.
3. Close all doors firmly until you hear the magnetic latch click.`,
                status: 'published',
                author: users[2]._id,
                tags: ['printer', 'hardware', 'spooler', 'paper jam', 'office'],
                views: 156,
                helpfulVotes: 29,
                unhelpfulVotes: 1,
            },
            {
                articleId: 'KB-1004',
                title: 'Reporting Suspected Phishing Emails and Security Threats',
                slug: 'reporting-phishing-emails-security-threats',
                category: 'Security',
                problem: 'Employee received a suspicious email requesting urgent wire transfers, credential verification, or gift card purchases.',
                symptoms: 'Sender address domain misspelled (e.g., @c0mpany.com), urgent tone, unexpected links or attachments.',
                solution: `### Immediate Steps: DO NOT CLICK LINKS OR OPEN ATTACHMENTS
1. In Outlook, click the **Report Phish** button in the ribbon toolbar.
2. If the button is not visible, forward the raw email with headers as an attachment to \`security-alerts@servicedesk.pro\`.
3. If you accidentally entered your password on an external website:
   - **Immediately disconnect your computer from WiFi/Ethernet**.
   - Change your corporate password from your mobile device.
   - Contact the Security Operations Center immediately at Ext. 911.`,
                status: 'published',
                author: users[0]._id,
                tags: ['security', 'phishing', 'email', 'malware', 'incident'],
                views: 520,
                helpfulVotes: 112,
                unhelpfulVotes: 0,
            },
            {
                articleId: 'KB-1005',
                title: 'Local Wi-Fi Connection Troubleshooting & Roaming Optimization',
                slug: 'wifi-connection-troubleshooting-optimization',
                category: 'Network',
                problem: 'Laptop frequently disconnects from "Corp-Secure-WiFi" or experiences excessive latency during video calls.',
                symptoms: 'WiFi icon shows exclamation mark, intermittent packet loss, slow download speeds in meeting rooms.',
                solution: `### Step 1: Forget & Re-authenticate to Enterprise SSID
1. Open Wi-Fi settings, find \`Corp-Secure-WiFi\`, and select **Forget**.
2. Select \`Corp-Secure-WiFi\` again.
3. When prompted, enter your domain credentials (\`user@servicedesk.pro\`) and accept the radius security certificate.

### Step 2: Disable Random MAC Hardware Addressing
Corporate network switches require persistent hardware MAC addresses to allocate proper VLAN IP leases:
- **Windows**: Settings -> Network & Internet -> Wi-Fi -> Manage known networks -> Select Corp WiFi -> Set **Random hardware addresses** to **Off**.
- **macOS / iOS**: Wi-Fi -> Click (i) next to Corp WiFi -> Toggle **Private Wi-Fi Address** to **Off**.`,
                status: 'published',
                author: users[3]._id,
                tags: ['wifi', 'network', 'internet', 'roaming', 'laptop'],
                views: 330,
                helpfulVotes: 64,
                unhelpfulVotes: 4,
            },
            {
                articleId: 'KB-1006',
                title: 'Requesting New Software Licenses & Developer Tools',
                slug: 'requesting-new-software-licenses-developer-tools',
                category: 'Software',
                problem: 'Need access to licensed developer tools (JetBrains, Figma, Docker Desktop Pro, Postman Enterprise).',
                symptoms: 'Trial license expired message or license activation required.',
                solution: `### Standard Approval Workflow
1. Submit a ServiceDesk ticket under category **Software** -> Subcategory **License Request**.
2. Specify:
   - Exact software name and edition
   - Business justification and project name
   - Manager email for cost-center chargeback approval
3. Typical SLA turnaround for standard approved catalog software is **4 business hours**.`,
                status: 'published',
                author: users[4]._id,
                tags: ['software', 'license', 'jetbrains', 'figma', 'developer', 'tools'],
                views: 198,
                helpfulVotes: 35,
                unhelpfulVotes: 1,
            },
        ]);
        logger_1.logger.info(`✓ Created ${kbArticles.length} detailed Knowledge Base articles`);
        // 7. Create 30+ Tickets spanning all statuses, categories, priorities, and SLA states
        const ticketDefinitions = [
            {
                ticketId: 'SDP-1001',
                title: 'GlobalProtect VPN fails to establish gateway handshake on macOS Sonoma',
                description: 'After updating to macOS Sonoma 14.4, GlobalProtect gets stuck on "Connecting" and returns error "Gateway not responding". I need access to internal staging servers.',
                category: 'VPN',
                priority: 'high',
                status: 'in_progress',
                requester: users[8]._id, // Rachel Green
                department: departments[3]._id,
                assignedTechnician: users[3]._id, // Devon Miles
                assignedTeam: teams[1]._id,
                asset: assets[0]._id,
                slaPolicy: slas[1]._id,
                slaDeadline: new Date(now.getTime() + 3 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['vpn', 'macos', 'network'],
            },
            {
                ticketId: 'SDP-1002',
                title: 'Suspicious spear-phishing email targeting payroll account details',
                description: 'Received an urgent email claiming to be from the CEO asking for immediate employee direct deposit list. The reply-to domain is @ceo-urgent-mail.com. Please investigate.',
                category: 'Security',
                priority: 'critical',
                status: 'in_progress',
                requester: users[7]._id, // Michael Scott
                department: departments[2]._id,
                assignedTechnician: users[2]._id, // Sarah Chen
                assignedTeam: teams[3]._id,
                slaPolicy: slas[0]._id,
                slaDeadline: new Date(now.getTime() + 1 * 60 * 60 * 1000),
                slaStatus: 'at_risk',
                tags: ['security', 'phishing', 'urgent'],
            },
            {
                ticketId: 'SDP-1003',
                title: 'ThinkPad X1 Carbon screen flickering and showing vertical green artifacts',
                description: 'My laptop display flickers constantly when adjusting the lid angle. Screen becomes completely black intermittently.',
                category: 'Hardware',
                priority: 'medium',
                status: 'pending',
                requester: users[6]._id, // Emma Watson
                department: departments[1]._id,
                assignedTechnician: users[2]._id,
                assignedTeam: teams[0]._id,
                asset: assets[2]._id,
                slaPolicy: slas[2]._id,
                slaDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['hardware', 'laptop', 'display'],
            },
            {
                ticketId: 'SDP-1004',
                title: 'Production API Gateway latency spike and 504 Gateway Timeouts',
                description: 'Multiple microservices reporting connection pool exhaustion when calling authentication gateway service. Response times jumped from 45ms to 3200ms.',
                category: 'Network',
                priority: 'critical',
                status: 'escalated',
                escalationReason: 'Production infrastructure customer impact exceeding threshold',
                requester: users[8]._id,
                department: departments[3]._id,
                assignedTechnician: users[3]._id,
                assignedTeam: teams[1]._id,
                slaPolicy: slas[0]._id,
                slaDeadline: new Date(now.getTime() - 30 * 60 * 1000), // Breached
                slaStatus: 'breached',
                tags: ['production', 'outage', 'network', 'critical'],
            },
            {
                ticketId: 'SDP-1005',
                title: '3rd Floor HP LaserJet paper jam in duplex roller assembly',
                description: 'The shared printer on 3rd floor is stuck with error code 13.00.00 Paper Jam. Opened front door but paper is lodged deep in the roller.',
                category: 'Printer',
                priority: 'low',
                status: 'open',
                requester: users[9]._id, // Jim Halpert
                department: departments[4]._id,
                slaPolicy: slas[3]._id,
                slaDeadline: new Date(now.getTime() + 36 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['printer', 'office'],
            },
            {
                ticketId: 'SDP-1006',
                title: 'Need IntelliJ IDEA Ultimate license renewal for Q3 product sprint',
                description: 'My JetBrains All Products trial expired today. Need active commercial key linked to my engineering email.',
                category: 'Software',
                priority: 'medium',
                status: 'assigned',
                requester: users[10]._id, // Pam Beesly
                department: departments[3]._id,
                assignedTechnician: users[4]._id, // Elena Rostova
                assignedTeam: teams[2]._id,
                asset: assets[9]._id,
                slaPolicy: slas[2]._id,
                slaDeadline: new Date(now.getTime() + 18 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['license', 'jetbrains', 'dev-tools'],
            },
            {
                ticketId: 'SDP-1007',
                title: 'Account locked out after password expiration over the weekend',
                description: 'Cannot log into corporate Google Workspace and Slack. Self-service reset says token expired.',
                category: 'Account & Access',
                priority: 'high',
                status: 'resolved',
                resolutionNotes: 'Reset password via Okta admin console and triggered mandatory change on next login. Synchronized active directory attributes.',
                resolvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                requester: users[7]._id,
                department: departments[2]._id,
                assignedTechnician: users[2]._id,
                assignedTeam: teams[0]._id,
                slaPolicy: slas[1]._id,
                slaDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['account', 'okta', 'password'],
            },
            {
                ticketId: 'SDP-1008',
                title: 'Request for secondary 4K monitor for dual-display software workstation',
                description: 'Approved by Engineering Director for dual screen productivity. Requesting a 27" 4K Dell UltraSharp monitor.',
                category: 'Hardware',
                priority: 'low',
                status: 'closed',
                resolutionNotes: 'Delivered and set up Dell U2723QE from IT stockroom. Asset tag AST-1005 registered.',
                resolvedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                closedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
                requester: users[8]._id,
                department: departments[3]._id,
                assignedTechnician: users[2]._id,
                assignedTeam: teams[0]._id,
                asset: assets[4]._id,
                slaPolicy: slas[3]._id,
                slaDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['hardware', 'monitor', 'peripherals'],
            },
            {
                ticketId: 'SDP-1009',
                title: 'Outlook desktop client stuck in "Loading Profile" loop',
                description: 'Outlook on Windows 11 will not open past the splash screen. Safe mode also hangs.',
                category: 'Email',
                priority: 'medium',
                status: 'open',
                requester: users[6]._id,
                department: departments[1]._id,
                slaPolicy: slas[2]._id,
                slaDeadline: new Date(now.getTime() + 14 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['outlook', 'email', 'office365'],
            },
            {
                ticketId: 'SDP-1010',
                title: 'Zoom Room audio echo during executive all-hands meeting',
                description: 'Microphone in Boardroom A is capturing speaker feedback, causing loud oscillation loop during calls.',
                category: 'Hardware',
                priority: 'high',
                status: 'reopened',
                reopenCount: 1,
                requester: users[9]._id,
                department: departments[4]._id,
                assignedTechnician: users[2]._id,
                assignedTeam: teams[0]._id,
                slaPolicy: slas[1]._id,
                slaDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
                slaStatus: 'on_track',
                tags: ['zoom', 'av', 'conference'],
            },
        ];
        // Add more generated tickets to reach 25+ realistic records
        for (let i = 11; i <= 28; i++) {
            const cats = ['Hardware', 'Software', 'Network', 'Account & Access', 'Email', 'Security', 'VPN', 'Printer'];
            const priorities = ['critical', 'high', 'medium', 'low'];
            const statuses = ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'];
            const cat = cats[i % cats.length];
            const prio = priorities[i % priorities.length];
            const stat = statuses[i % statuses.length];
            const reqUser = users[6 + (i % 5)];
            const techUser = users[2 + (i % 3)];
            const dept = reqUser.department;
            const isResolved = stat === 'resolved' || stat === 'closed';
            const isBreached = i % 5 === 0;
            ticketDefinitions.push({
                ticketId: `SDP-${1000 + i}`,
                title: `Service Request: ${cat} maintenance issue #${i}`,
                description: `Routine ticket regarding ${cat.toLowerCase()} configuration and standard employee request #${i}.`,
                category: cat,
                priority: prio,
                status: stat,
                requester: reqUser._id,
                department: dept,
                assignedTechnician: stat !== 'open' ? techUser._id : undefined,
                assignedTeam: teams[i % teams.length]._id,
                slaPolicy: slas[i % slas.length]._id,
                slaDeadline: isBreached ? new Date(now.getTime() - 2 * 60 * 60 * 1000) : new Date(now.getTime() + (i * 2) * 60 * 60 * 1000),
                slaStatus: isBreached ? 'breached' : 'on_track',
                resolvedAt: isResolved ? new Date(now.getTime() - (i * 60 * 60 * 1000)) : undefined,
                resolutionNotes: isResolved ? 'Issue diagnosed, resolved, and verified with requester.' : undefined,
                tags: [cat.toLowerCase(), prio],
            });
        }
        const createdTickets = await Ticket_1.Ticket.create(ticketDefinitions);
        logger_1.logger.info(`✓ Created ${createdTickets.length} tickets across various statuses and priorities`);
        // 8. Create Comments and Work Logs on key tickets
        await TicketComment_1.TicketComment.create([
            {
                ticket: createdTickets[0]._id,
                author: users[3]._id, // Devon Miles (Tech)
                content: 'Hi Rachel, please check if GlobalProtect is using the portal vpn.company-internal.net. I have also reset your RADIUS session on the gateway.',
                isInternal: false,
            },
            {
                ticket: createdTickets[0]._id,
                author: users[3]._id, // Devon Miles (Tech Internal Note)
                content: '[INTERNAL NOTE]: Radius server authentication logs show TLS cert mismatch from client build 6.0.1. Instructing user to reinstall 6.1.2.',
                isInternal: true,
            },
            {
                ticket: createdTickets[0]._id,
                author: users[8]._id, // Rachel Green (Requester)
                content: 'Reinstalled 6.1.2 and connected successfully! Thank you!',
                isInternal: false,
            },
            {
                ticket: createdTickets[1]._id,
                author: users[2]._id, // Sarah Chen (Tech)
                content: '[INTERNAL NOTE]: Domain @ceo-urgent-mail.com has been blacklisted at the perimeter firewall and mail filter. Running endpoint scan on Michael\'s laptop.',
                isInternal: true,
            },
        ]);
        await TicketWorkLog_1.TicketWorkLog.create([
            {
                ticket: createdTickets[0]._id,
                technician: users[3]._id,
                timeSpentMinutes: 30,
                description: 'Analyzed GlobalProtect gateway connection logs and coordinated with user.',
            },
            {
                ticket: createdTickets[1]._id,
                technician: users[2]._id,
                timeSpentMinutes: 45,
                description: 'Inspected email headers, extracted malicious sender IP, and added firewall rule block.',
            },
            {
                ticket: createdTickets[3]._id,
                technician: users[3]._id,
                timeSpentMinutes: 60,
                description: 'Restarted API gateway connection pool instances and scaled replica pods.',
            },
        ]);
        logger_1.logger.info('✓ Created ticket comments (public & private internal notes) and work logs');
        // 9. Create Notifications
        await Notification_1.Notification.create([
            {
                recipient: users[2]._id, // Sarah Chen
                sender: users[7]._id,
                type: 'ticket_assigned',
                title: 'Critical Security Ticket Assigned',
                message: 'SDP-1002 (Suspicious spear-phishing email) assigned to your queue.',
                link: `/tickets/${createdTickets[1].ticketId}`,
                isRead: false,
            },
            {
                recipient: users[8]._id, // Rachel Green
                sender: users[3]._id,
                type: 'ticket_comment',
                title: 'New response on SDP-1001',
                message: 'Devon Miles replied to your ticket regarding GlobalProtect VPN.',
                link: `/tickets/${createdTickets[0].ticketId}`,
                isRead: false,
            },
            {
                recipient: users[5]._id, // Asset Manager
                type: 'warranty_expiring',
                title: 'Asset Warranty Expiring Soon',
                message: 'AST-1002 (Dell Precision 5570) warranty expires in 20 days.',
                link: `/assets/${assets[1].assetId}`,
                isRead: false,
            },
        ]);
        logger_1.logger.info('✓ Created in-app notifications');
        // 10. Create System Settings
        await SystemSetting_1.SystemSetting.create([
            { key: 'businessHours', value: { start: '09:00', end: '18:00' } },
            { key: 'businessDays', value: [1, 2, 3, 4, 5] },
            { key: 'timezone', value: 'Asia/Kolkata' },
            {
                key: 'ticketCategories',
                value: [
                    'Hardware',
                    'Software',
                    'Network',
                    'Account & Access',
                    'Email',
                    'Security',
                    'Printer',
                    'VPN',
                    'Application',
                    'Other',
                ],
            },
        ]);
        // 11. Create Audit Logs
        await AuditLog_1.AuditLog.create([
            {
                user: users[0]._id,
                action: 'SYSTEM_INITIALIZED',
                entityType: 'system',
                entityDisplay: 'ServiceDesk Pro Platform Initialized',
                changes: { version: '2.0.0', seed: true },
            },
            {
                user: users[1]._id,
                action: 'TICKET_ESCALATED',
                entityType: 'ticket',
                entityId: createdTickets[3]._id.toString(),
                entityDisplay: 'SDP-1004 Production API Gateway latency spike',
                changes: { status: 'escalated', priority: 'critical' },
            },
        ]);
        logger_1.logger.info('✓ Created audit trail logs');
        logger_1.logger.info('====================================================');
        logger_1.logger.info('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        logger_1.logger.info('====================================================');
        logger_1.logger.info('DEMO ACCOUNTS (Password: Password123!)');
        logger_1.logger.info('  1. System Admin:     admin@servicedesk.pro');
        logger_1.logger.info('  2. IT Manager:       manager@servicedesk.pro');
        logger_1.logger.info('  3. Lead Technician:  tech1@servicedesk.pro');
        logger_1.logger.info('  4. Asset Manager:    assetmgr@servicedesk.pro');
        logger_1.logger.info('  5. Employee:         employee1@servicedesk.pro');
        logger_1.logger.info('====================================================');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Database seeding failed:', error);
        process.exit(1);
    }
}
seedDatabase();
