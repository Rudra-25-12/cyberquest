/**
 * CyberQuest Mock Phishing Scenarios
 * Used as a local fallback database and for initial development when Gemini API is unavailable or offline.
 */
export const mockScenarios = [
  // EASY SCENARIOS
  {
    id: "easy-1",
    difficulty: "easy",
    senderName: "Netflix Security Team",
    senderEmail: "security@netflix-verification-support.com",
    subject: "Suspicious sign-in attempt blocked - Action required!",
    date: "June 1, 2026",
    body: `Dear Customer,

We noticed a login attempt to your Netflix account from an unrecognized device in Saint Petersburg, Russia.

For your security, we have temporarily suspended your subscription. To restore access to your account and continue streaming, please verify your payment details by clicking the link below:

https://netflix-account-restore.net/login

If you do not complete this verification within 24 hours, your account will be permanently closed.

Sincerely,
Netflix Security Team`,
    isPhishing: true,
    hints: [
      "Check the sender's email domain closely. Does it match the official netflix.com?",
      "Look for threatening language or urgent deadlines ('suspended', 'permanently closed within 24 hours').",
      "Hover over the verification link. Does the domain netflix-account-restore.net seem official?"
    ],
    explanation: "This is a classic phishing email. The sender's email domain ('netflix-verification-support.com') and the verification link ('netflix-account-restore.net') are lookalike domains designed to mimic Netflix. Legitimate security alerts will not threaten permanent account deletion within a strict 24-hour timeframe or direct you to an unofficial domain for verification.",
    phishingIndicators: [
      { type: "sender", value: "netflix-verification-support.com", label: "Mismatched Domain" },
      { type: "link", value: "netflix-account-restore.net", label: "Suspicious Link Destination" },
      { type: "urgency", value: "within 24 hours / permanently closed", label: "False Sense of Urgency" }
    ]
  },
  {
    id: "easy-2",
    difficulty: "easy",
    senderName: "Microsoft Outlook Support",
    senderEmail: "outlook-admin-update@microsoft.com",
    subject: "Verify your email storage limit immediately",
    date: "May 28, 2026",
    body: `Attention Outlook User,

Your email inbox has exceeded its storage quota of 15 GB. You will no longer be able to send or receive new emails until you expand your storage capacity.

Please click the secure link below to upgrade your storage limit for free:

https://outlook-storage-upgrade.weebly.com/login.html

Thank you for your cooperation,
Microsoft Web Services`,
    isPhishing: true,
    hints: [
      "Look at where the upgrade link is hosted. Does Microsoft use free website builders like Weebly?",
      "Observe how you are addressed. Legitimate companies usually address you by your name, not 'Outlook User'.",
      "Look at the sender name vs the actual email address."
    ],
    explanation: "This is a phishing attempt. The link is hosted on a free website builder platform ('weebly.com') which is a major red flag for any professional service, let alone Microsoft. Additionally, Microsoft will never use generic greetings like 'Outlook User' or direct users to third-party hosting sites to manage account storage.",
    phishingIndicators: [
      { type: "link", value: "outlook-storage-upgrade.weebly.com", label: "Free Hosting Service Link" },
      { type: "salutation", value: "Outlook User", label: "Generic Salutation" },
      { type: "urgency", value: "immediately / no longer send or receive", label: "Fear Tactic" }
    ]
  },
  {
    id: "easy-3",
    difficulty: "easy",
    senderName: "GitHub Security",
    senderEmail: "noreply@github.com",
    subject: "[GitHub] Security Alert: New SSH key added",
    date: "June 2, 2026",
    body: `Hey @ruddie,

The following SSH key was recently added to your account:

Fingerprint: SHA256:dGhlcXVpY2ticm93bmZveGp1bXBzb3ZlcnRoZWxhenlkb2c
User Agent: git/2.39.2 (Windows NT 10.0; Win64; x64)
IP Address: 198.51.100.42 (San Francisco, CA, USA)

If you added this key, you don't need to do anything.

If you do not recognize this activity, please go to your SSH settings to remove it:
https://github.com/settings/keys

Thanks,
The GitHub Team`,
    isPhishing: false,
    hints: [
      "Compare the sender email address to official GitHub communications.",
      "Check the destination link. Does github.com/settings/keys point to the official GitHub website?",
      "Does this email use high-pressure tactics or threaten to delete your account if you don't act?"
    ],
    explanation: "This is a legitimate security notification. The sender domain ('github.com') is correct, the link points directly to the genuine GitHub settings page ('github.com/settings/keys'), and there are no high-pressure tactics or demands for sensitive credentials. It is simply informing you of an event and directing you to the standard, secure dashboard to manage your settings.",
    phishingIndicators: []
  },

  // MEDIUM SCENARIOS
  {
    id: "medium-1",
    difficulty: "medium",
    senderName: "PayPal Merchant Billing",
    senderEmail: "billing-update-service@paypaI-security.com",
    subject: "Receipt for your payment to eBay Inc. ($249.99)",
    date: "June 1, 2026",
    body: `Hello Customer,

You sent a payment of $249.99 USD to eBay Inc. (ebay-sales@ebay.com) using PayPal.

We will charge your credit card on file within the next 2 hours. If you did not authorize this purchase, please contact our dispute resolution center immediately by clicking below to cancel the payment:

https://paypal.com-dispute-cancellation-portal.info/webscr

Transaction ID: 8X938491LK4901
Payment Date: June 1, 2026

Thank you,
PayPal Merchant Services`,
    isPhishing: true,
    hints: [
      "Look extremely closely at the spelling of the sender's email domain. Is it an uppercase 'I' (capital eye) mimicking a lowercase 'l' (el)?",
      "Look at the domain structure of the dispute link. What is the root domain?",
      "Why would they give you such a short window (2 hours) to cancel?"
    ],
    explanation: "This is a clever phishing email employing 'typosquatting' and root-domain manipulation. The sender email uses 'paypaI-security.com' with a capital 'I' (input as 'paypaI') instead of a lowercase 'l' (paypal). Furthermore, the link 'paypal.com-dispute-cancellation-portal.info' has 'com-dispute-cancellation-portal.info' as its actual root domain, NOT 'paypal.com'. The 2-hour window is a psychological pressure tactic to force quick, unthinking action.",
    phishingIndicators: [
      { type: "typosquatting", value: "paypaI-security.com", label: "Homoglyph Attack (Capital 'I' for 'l')" },
      { type: "link", value: "paypal.com-dispute-cancellation-portal.info", label: "Subdomain Spoofing (Actual root is .info)" },
      { type: "urgency", value: "within the next 2 hours / dispute immediately", label: "Urgency Pressure" }
    ]
  },
  {
    id: "medium-2",
    difficulty: "medium",
    senderName: "HR Department",
    senderEmail: "hr-benefits@cyberquest-internal.com",
    subject: "URGENT: Update your direct deposit details for June Payroll",
    date: "May 30, 2026",
    body: `Dear CyberQuest Team Member,

As part of our mid-year financial audit and transition to our new HR management portal, all employees are required to verify and update their direct deposit banking details.

To ensure your June payroll is processed without delays, please complete the update via our internal portal before Friday:

https://hr-portal-cyberquest.secure-employee-login.com/payroll

Failure to update your information by this deadline may result in your salary check being withheld until the next billing cycle.

Best regards,
Linda Vance
Director of Human Resources`,
    isPhishing: true,
    hints: [
      "Is 'cyberquest-internal.com' the official domain of your company, or a lookalike?",
      "Check the login link domain: 'secure-employee-login.com'. Is that your organization's domain?",
      "Does HR typically threaten to withhold salaries for standard portal updates?"
    ],
    explanation: "This is a spear-phishing attack targeted at employees. The attacker created a lookalike domain for the company's internal HR team ('cyberquest-internal.com') and hosted a credential harvesting form on 'secure-employee-login.com'. HR departments typically communicate payroll updates well in advance and handle transitions through official, pre-established internal channels, rather than threatening salary withholding.",
    phishingIndicators: [
      { type: "sender", value: "cyberquest-internal.com", label: "Spear Phishing Lookalike Domain" },
      { type: "link", value: "secure-employee-login.com", label: "External Credential Harvester" },
      { type: "coercion", value: "salary check being withheld", label: "Professional Coercion" }
    ]
  },
  {
    id: "medium-3",
    difficulty: "medium",
    senderName: "Google Workspace Team",
    senderEmail: "no-reply@accounts.google.com",
    subject: "Security alert for your linked Google Account",
    date: "June 2, 2026",
    body: `Security Alert

Your Google Account was just signed in to from a new device:

Device: Apple iPad Pro
Location: Munich, Germany
Time: June 2, 2026, 10:14 AM UTC

If this was you, you don't need to do anything. If this wasn't you, please secure your account by reviewing your active devices here:
https://myaccount.google.com/device-activity

The Google Accounts Team`,
    isPhishing: false,
    hints: [
      "Verify the sender email domain. Is 'accounts.google.com' the authentic domain for Google Accounts?",
      "Look at the link domain. Does it lead to 'myaccount.google.com'?",
      "Does the email ask you to reply with your password or input your credentials on an external site?"
    ],
    explanation: "This is a legitimate Google Security Alert. The sender domain ('accounts.google.com') is authentic and cryptographically verified. The destination URL ('myaccount.google.com/device-activity') is a genuine, secure sub-domain of Google. The email does not use alarmist, threat-based language or direct you to any third-party credential portal.",
    phishingIndicators: []
  },

  // HARD SCENARIOS
  {
    id: "hard-1",
    difficulty: "hard",
    senderName: "DHL Express Delivery",
    senderEmail: "dhl.support@dhl-delivery-notification.com",
    subject: "Delivery on hold: Import duty payment outstanding (Code: #940291)",
    date: "June 1, 2026",
    body: `Dear Customer,

Your parcel with tracking number DHL-8490-DE has arrived at our sorting facility in Chicago. However, we cannot complete the delivery due to an unpaid customs duty of $3.50 USD.

A shipping label update and payment can be done through our secure payment gateway:

https://dhl-pay-fees.com/tracking/940291

Once the payment is verified, your package will be dispatched immediately and delivered within 1-2 business days.

Regards,
DHL Express Support`,
    isPhishing: true,
    hints: [
      "Phishing attacks sometimes use very small amounts of money (like $3.50) to make the request seem trivial and avoid suspicion.",
      "Check the sender domain: dhl-delivery-notification.com. Does DHL host its delivery updates on this external domain?",
      "Does the email address you by name or reference a specific package item?"
    ],
    explanation: "This is a highly effective phishing scheme called 'smishing/phishing delivery fraud'. It uses a very low fee ($3.50) to lower the victim's guard. The sender domain ('dhl-delivery-notification.com') and the payment link ('dhl-pay-fees.com') are fake domains registered to mimic DHL's official site ('dhl.com'). DHL does not require payment through third-party custom domains.",
    phishingIndicators: [
      { type: "sender", value: "dhl-delivery-notification.com", label: "Spoofed Logistics Domain" },
      { type: "link", value: "dhl-pay-fees.com", label: "Fake Payment Gateway" },
      { type: "tactic", value: "Small fee ($3.50)", label: "Low-Friction Financial Trap" }
    ]
  },
  {
    id: "hard-2",
    difficulty: "hard",
    senderName: "DocuSign Signature Service",
    senderEmail: "docusign@docs-signature-routing.com",
    subject: "Please DocuSign: NDA_Agreement_Draft_NextGenHacks.pdf",
    date: "May 29, 2026",
    body: `You received a document to sign

Linda Vance (linda.vance@nextgenhacks.org) has sent you a document to review and sign.

Please review and sign the document by clicking the button below:

[ REVIEW AND SIGN DOCUMENT ]
https://docusign.com-document-viewer-online.org/signing/env=0491-9201-9481

This link will expire in 48 hours.

Thank you,
DocuSign Inc.`,
    isPhishing: true,
    hints: [
      "Examine the sender email domain: 'docs-signature-routing.com'. Is it the official 'docusign.com' domain?",
      "Look at the link destination domain: 'docusign.com-document-viewer-online.org'. What is the actual top-level domain extension and root domain here?",
      "Who sent the document? Do you know Linda Vance from NextGenHacks?"
    ],
    explanation: "This is a targeted phishing attack using DocuSign branding. The email appears highly authentic, but the sender domain is 'docs-signature-routing.com' instead of 'docusign.com'. The signing link uses subdomain spoofing, where the domain name is 'com-document-viewer-online.org', NOT 'docusign.com'. Clicking this link would lead to a fake DocuSign login page designed to steal your credentials.",
    phishingIndicators: [
      { type: "sender", value: "docs-signature-routing.com", label: "Mismatched Sender Domain" },
      { type: "link", value: "docusign.com-document-viewer-online.org", label: "Spoofed DocuSign Domain (.org root)" },
      { type: "content", value: "NDA_Agreement_Draft_NextGenHacks", label: "Context-Specific Baiting" }
    ]
  },
  {
    id: "hard-3",
    difficulty: "hard",
    senderName: "Heroku Security",
    senderEmail: "security-alerts@heroku.com",
    subject: "[Security Notification] API Token Rotation Required",
    date: "June 2, 2026",
    body: `Hello Heroku Developer,

As part of our ongoing commitment to platform security and in response to recently disclosed credential exposures, we are mandating the rotation of all active API tokens created before April 2026.

Your account currently has one or more tokens that meet this criteria. Please rotate your tokens by navigating to your dashboard under account settings:

https://dashboard.heroku.com/account

For security instructions and CLI commands to rotate your tokens, you can review our security bulletin at:
https://devcenter.heroku.com/articles/security-bulletin-api-keys

If you have any questions, please contact support.heroku.com.

Sincerely,
Heroku Security Team`,
    isPhishing: false,
    hints: [
      "Compare the domains of the links: dashboard.heroku.com and devcenter.heroku.com. Are they authentic Heroku services?",
      "Does the email demand you click a non-heroku link or input your password directly in response to the email?",
      "Are there spelling mistakes, typos, or high-pressure threats?"
    ],
    explanation: "This is a legitimate Heroku security announcement. The links point directly to standard subdomains of the official website ('dashboard.heroku.com' and 'devcenter.heroku.com'). The instructions ask you to navigate to your dashboard to make changes rather than sending your credentials or clicking a suspicious third-party URL. The sender address is verified as 'heroku.com'.",
    phishingIndicators: []
  },
  {
    id: "medium-4",
    difficulty: "medium",
    senderName: "Zoom Meeting Services",
    senderEmail: "no-reply@zoom-verification-meetings.com",
    subject: "Mandatory Workspace Security Compliance Sync - Register Now",
    date: "June 2, 2026",
    body: `Hi there,

You are invited to a mandatory Zoom sync regarding our updated workspace security policies.

Topic: Workspace Security Compliance Sync
Time: June 5, 2026, 02:00 PM EST

Please register for the meeting and link your account to confirm your attendance:
https://zoom-verification-meetings.com/join/meeting-84920491

If you do not register before the start time, you will not receive compliance credit, which may impact your workspace system access.

Thank you,
IT Operations Team`,
    isPhishing: true,
    hints: [
      "Check the sender email domain closely. Does Zoom host meeting invitations on 'zoom-verification-meetings.com'?",
      "Look for high-pressure language threatening that your workspace access will be impacted.",
      "Verify the registration link domain. Safe Zoom meetings use zoom.us or zoom.com."
    ],
    explanation: "This is a phishing attempt. The sender domain ('zoom-verification-meetings.com') and the registration link are spoofed lookalike domains registered by attackers to harvest credentials. Legitimate Zoom meeting invites are sent from the organization's verified domain or Zoom's official 'zoom.us' service, and do not threaten immediate account suspension for missing a sync.",
    phishingIndicators: [
      { type: "sender", value: "zoom-verification-meetings.com", label: "Spoofed Domain" },
      { type: "link", value: "zoom-verification-meetings.com/join", label: "Fake Zoom Registration Link" },
      { type: "urgency", value: "may impact workspace system access", label: "System Restriction Threat" }
    ]
  }
];

