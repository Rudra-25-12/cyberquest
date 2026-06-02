/**
 * CyberQuest Mock Security Fundamentals Scenarios
 * Covers password safety, MFA, WiFi, USB, browser permissions, updates, downloads, social engineering, and recovery scams.
 */
export const fundamentalsScenarios = [
  // EASY SCENARIOS (1-4)
  {
    id: "fund-1",
    topic: "Password Security",
    title: "Setting Up a Secure Password",
    difficulty: "easy",
    scenarioText: "You are setting up your new corporate workstation account. The setup wizard asks you to choose a new password. You want to make sure it is strong, easy to remember, and resistant to brute-force attacks.",
    choices: [
      { id: "choice-a", label: "Choose: Password2026!", isCorrect: false },
      { id: "choice-b", label: "Choose: horse-correct-battery-staple", isCorrect: true }
    ],
    explanation: "Dictionary words combined with predictable years/punctuation are easily guessed or cracked by automated brute-force tools. A passphrase of multiple random words creates higher entropy (randomness) while being much easier to remember and significantly harder to hack."
  },
  {
    id: "fund-2",
    topic: "USB Device Safety",
    title: "Forgotten USB Drive",
    difficulty: "easy",
    scenarioText: "As you walk through the ground-floor elevator lobby, you notice a brand-new 64GB USB flash drive lying on a bench. It has a label saying 'Confidential HR Salaries & Bonuses'. You want to find out who owns it.",
    choices: [
      { id: "choice-a", label: "Plug USB into Laptop to check files", isCorrect: false },
      { id: "choice-b", label: "Hand USB to Office Security Desk", isCorrect: true }
    ],
    explanation: "Plugging unknown USB drives into your system is a major security risk. Attackers deliberately drop infected USB drives (known as USB baiting) containing malware or keystroke injectors (BadUSB) to gain access to internal corporate networks."
  },
  {
    id: "fund-3",
    topic: "Software Updates",
    title: "Critical Patch Notification",
    difficulty: "easy",
    scenarioText: "A pop-up from your operating system alert manager appears: 'Critical security vulnerability patch ready to install (KB804291) - Address remote code execution vulnerability.' You are currently busy working on an important project report.",
    choices: [
      { id: "choice-a", label: "Install Update Now", isCorrect: true },
      { id: "choice-b", label: "Postpone for 30 Days", isCorrect: false }
    ],
    explanation: "Operating system updates patch active security flaws that hackers are actively scanning for or exploiting in the wild. Postponing critical patches leaves your machine vulnerable to network exploits. Always install security updates as soon as possible."
  },
  {
    id: "fund-4",
    topic: "Public WiFi",
    title: "Unsecured WiFi Banking",
    difficulty: "easy",
    scenarioText: "You are sitting at an airport coffee shop and need to quickly log in to check your bank account balance. In your device settings, you notice an open WiFi network named 'FREE_AIRPORT_WIFI' with no password lock.",
    choices: [
      { id: "choice-a", label: "Connect and Access Bank directly", isCorrect: false },
      { id: "choice-b", label: "Use VPN or Mobile Hotspot", isCorrect: true }
    ],
    explanation: "Unsecured public WiFi networks transmit data unencrypted. Attackers on the same network can intercept your login credentials or session tokens using Man-in-the-Middle (MitM) tools. Always use a secure VPN or your mobile phone's encrypted cellular hotspot."
  },

  // MEDIUM SCENARIOS (5-8)
  {
    id: "fund-5",
    topic: "Password Reuse",
    title: "Shared Credentials",
    difficulty: "medium",
    scenarioText: "You reuse the same strong, secure password for both your corporate network email account and a small personal recipe-sharing blog. You receive an alert stating that the recipe blog has suffered a database breach, exposing all user passwords in plaintext.",
    choices: [
      { id: "choice-a", label: "Change Work Account Password immediately", isCorrect: true },
      { id: "choice-b", label: "Keep Password Active since it is strong", isCorrect: false }
    ],
    explanation: "Reusing passwords across different platforms is a massive risk. In a credential stuffing attack, hackers take leaked email/password lists from breached hobby sites and automate logins on major platforms like banking and corporate email. Never reuse passwords."
  },
  {
    id: "fund-6",
    topic: "MFA Approval",
    title: "Unsolicited Verification Code",
    difficulty: "medium",
    scenarioText: "While preparing dinner at home, your mobile phone buzzes with a Microsoft Authenticator prompt asking you to: 'Approve Sign-In to CyberQuest Account from Berlin, DE'. You have not tried to log into your account today.",
    choices: [
      { id: "choice-a", label: "Approve Sign-In to dismiss alert", isCorrect: false },
      { id: "choice-b", label: "Deny Authorization Request", isCorrect: true }
    ],
    explanation: "This is an 'MFA fatigue' or push bombing attack. An attacker has successfully stolen or guessed your password and is trying to get you to approve the authentication check. Approving unsolicited requests will compromise your account immediately. Deny the request and change your password."
  },
  {
    id: "fund-7",
    topic: "Browser Permissions",
    title: "Persistent Website Alerts",
    difficulty: "medium",
    scenarioText: "You visit an online news blog to read an article. A browser prompt pops up: 'recipe-world.net wants to show notification alerts and track your current physical location.' The article text is blocked until you interact with the popup.",
    choices: [
      { id: "choice-a", label: "Allow Access to view article", isCorrect: false },
      { id: "choice-b", label: "Deny Notification Access and block popups", isCorrect: true }
    ],
    explanation: "Malicious or low-reputation websites request notifications to spam your desktop with ads, phishing links, and fake antivirus warning popups. Location tracking is also a privacy risk. Only allow notifications for services that strictly require them."
  },
  {
    id: "fund-8",
    topic: "Download Safety",
    title: "File Converter Utility",
    difficulty: "medium",
    scenarioText: "You need to merge two PDF files. You search Google and click a sponsored search result. The site offers a free downloader. When clicked, your browser downloads a file named 'pdf_merger_utility.exe'.",
    choices: [
      { id: "choice-a", label: "Run Downloaded File", isCorrect: false },
      { id: "choice-b", label: "Delete File and Exit", isCorrect: true }
    ],
    explanation: "Downloading executable binaries (`.exe`, `.scr`, `.bat`) from unverified third-party domains is a major malware entry point. Sponsored ads are often bought by threat actors to distribute malware. Use official apps or verify signatures."
  },

  // HARD SCENARIOS (9-10)
  {
    id: "fund-9",
    topic: "Social Engineering",
    title: "Voice Call Verification",
    difficulty: "hard",
    scenarioText: "You receive an urgent call on your corporate desk phone. The caller claims to be 'Sarah from Corporate IT Security'. She says your laptop has been sending malicious telemetry and requests that you download a support client ('AnyDesk') to let her run diagnostics.",
    choices: [
      { id: "choice-a", label: "Install Support Client", isCorrect: false },
      { id: "choice-b", label: "Refuse and Call IT Desk to verify", isCorrect: true }
    ],
    explanation: "This is a social engineering attack called 'vishing' (voice phishing). Authentic IT helpdesks will never cold-call you demanding remote desktop access. Refuse, hang up, and contact the official IT service desk number from your company directory to verify."
  },
  {
    id: "fund-10",
    topic: "Account Recovery",
    title: "Verification Code Swap",
    difficulty: "hard",
    scenarioText: "You receive a text message containing a 6-digit Google password reset code. Seconds later, a coworker slacks you: 'Hey! I'm trying to log in but Google accidentally sent my recovery code to your mobile phone number. Could you please send me that 6-digit code?'",
    choices: [
      { id: "choice-a", label: "Forward Code to Coworker", isCorrect: false },
      { id: "choice-b", label: "Refuse and Report Incident", isCorrect: true }
    ],
    explanation: "The attacker has initiated a password reset on your account and is trying to bypass your 2FA. They may have compromised your coworker's Slack account to trick you. Never forward authorization or recovery codes to anyone."
  }
];
