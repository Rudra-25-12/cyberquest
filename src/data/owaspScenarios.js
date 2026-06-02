/**
 * CyberQuest OWASP Top 10 Defenses Scenarios
 * Focuses on web application security concepts, code snippets, and implementation-level decisions.
 */
export const owaspScenarios = [
  {
    id: "owasp-1",
    topic: "Broken Authentication",
    title: "Session Expiration & MFA Hardening",
    difficulty: "easy",
    scenarioText: "You are designing the authentication architecture for a customer portals app. A security audit warns that users could remain signed in indefinitely if their session tokens don't expire, exposing them to session hijacking if a device is left unattended. How should sessions and tokens be configured?",
    choices: [
      { 
        id: "choice-a", 
        label: "Store session IDs in client-side cookies with max-age set to 30 days and rely on the client browser to clean them up.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Issue short-lived session cookies (15-minute max-age) marked with HttpOnly, Secure, and SameSite attributes, backed by server-side expiration checks.", 
        isCorrect: true 
      }
    ],
    explanation: "Relying on long-lived client-controlled sessions is a major risk. Session cookies should always use HttpOnly to prevent XSS-based reading, Secure to restrict transmission to HTTPS, and SameSite to prevent CSRF. Short lifetimes minimize the window of opportunity for attackers who obtain a token."
  },
  {
    id: "owasp-2",
    topic: "SQL Injection",
    title: "Preventing Database Query Injection",
    difficulty: "easy",
    scenarioText: "A developer is writing a backend Node.js route to query user records by name. The search box takes input from the user query parameters. Which database query construction pattern completely neutralizes SQL injection vulnerability?",
    choices: [
      { 
        id: "choice-a", 
        label: "db.query(`SELECT * FROM users WHERE name = '` + req.query.name + `'`)", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "db.query('SELECT * FROM users WHERE name = ?', [req.query.name])", 
        isCorrect: true 
      }
    ],
    explanation: "Dynamic SQL query building by concatenating user input directly into queries allows attackers to execute arbitrary SQL commands (e.g. inject OR '1'='1). Parameterized queries (prepared statements) ensure the database treats input strictly as data/literal values, not executable code."
  },
  {
    id: "owasp-3",
    topic: "Cross-Site Scripting (XSS)",
    title: "Safe Rendering of User Comments",
    difficulty: "medium",
    scenarioText: "You are building a discussion forum comments feed using React. You need to safely render user comments that may contain formatting elements without exposing other readers to stored XSS attacks. How should comment data be processed?",
    choices: [
      { 
        id: "choice-a", 
        label: "Inject content using dangerouslySetInnerHTML, but filter out `<script>` tags using regex matches before rendering.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Allow React to automatically escape text node content, or use a validated DOMPurify sanitization library on structured markup.", 
        isCorrect: true 
      }
    ],
    explanation: "Filtering specific tags with regex is easily bypassed using inline event handlers (e.g. `<img src=x onerror=...>`) or nesting tags. React's default behavior encodes all text values automatically. For rendering raw HTML, a proven HTML sanitization library like DOMPurify must be used to strip malicious elements."
  },
  {
    id: "owasp-4",
    topic: "Sensitive Data Exposure",
    title: "Production Cryptographic Storage",
    difficulty: "easy",
    scenarioText: "You are auditing the security of a legacy authentication database. Passwords are currently stored using MD5 hashes. You want to upgrade password storage to a modern standard resistant to high-performance GPU cracking attacks. Which option should you implement?",
    choices: [
      { 
        id: "choice-a", 
        label: "Convert MD5 hashes to SHA-256 and encrypt the database file using AES-256 symmetric encryption.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Hash passwords using Argon2id or bcrypt with an adaptive cost factor and a unique cryptographic salt per user.", 
        isCorrect: true 
      }
    ],
    explanation: "SHA-256 and MD5 are general-purpose hash functions designed to be fast, making them highly vulnerable to GPU-based offline brute-force attacks. Password hashing requires slow, memory-hard algorithms like Argon2id or bcrypt. Salting ensures duplicate passwords result in unique hash values, neutralizing rainbow tables."
  },
  {
    id: "owasp-5",
    topic: "Security Misconfiguration",
    title: "Server Hardening and Debug Options",
    difficulty: "medium",
    scenarioText: "During a vulnerability scan of a production API gateway, you find that the server responds with verbose stack traces when an error occurs and displays active development tooling endpoints. Which configuration change is necessary to secure this server?",
    choices: [
      { 
        id: "choice-a", 
        label: "Keep verbose tracebacks active to aid live logging, but restrict access to the IP address of developers using a firewall.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Disable debug options, suppress verbose stack traces on production servers, and remove default test files and administrative pages.", 
        isCorrect: true 
      }
    ],
    explanation: "Detailed error logs and stack traces leak database structures, file paths, and dependency library versions to attackers. Servers should be hardened by disabling debugging tools, changing default passwords, and setting general security response headers (like Content-Security-Policy)."
  },
  {
    id: "owasp-6",
    topic: "Access Control",
    title: "Validating Insecure Direct Object References",
    difficulty: "medium",
    scenarioText: "A web application allows logged-in customers to view their invoices. The route is set up as `/api/invoices/:invoiceId`. An attacker changes the invoice ID in their request and views another user's invoice. What is the correct way to fix this access control vulnerability?",
    choices: [
      { 
        id: "choice-a", 
        label: "Use long random cryptographic hashes (UUIDs) for invoice IDs so that attackers cannot easily guess or brute-force other records.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Query the backend database verifying the logged-in session owner possesses rights to the invoice: `SELECT * FROM invoices WHERE id = ? AND user_id = ?`.", 
        isCorrect: true 
      }
    ],
    explanation: "Relying on guessability (UUIDs) is security by obscurity (Broken Object Level Authorization or IDOR). An attacker can intercept URLs or find IDs. The server MUST validate authorization on every single data read and verify the active user session ownership of the requested resource."
  },
  {
    id: "owasp-7",
    topic: "Vulnerable Components",
    title: "Software Supply Chain Integrity",
    difficulty: "hard",
    scenarioText: "Your application's package manager dependency manifest lists over 200 open-source library dependencies. You want to protect the pipeline from running vulnerable third-party modules. Which process should be automated in your CI/CD pipeline?",
    choices: [
      { 
        id: "choice-a", 
        label: "Include a code linter rule that scans imports and alerts developers to use only standard libraries.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Integrate Software Composition Analysis (SCA) scanning (e.g. npm audit, Snyk) to automatically block builds containing known vulnerabilities.", 
        isCorrect: true 
      }
    ],
    explanation: "Linters check code styles, not vulnerability databases. Modern development relies on external packages that have deep dependency chains. Software Composition Analysis (SCA) scanners cross-reference dependency trees against vulnerability databases (like CVE lists) to keep components patched."
  },
  {
    id: "owasp-8",
    topic: "Insecure Design",
    title: "Designing Secure Password Recovery Flows",
    difficulty: "hard",
    scenarioText: "You are designing the system flow for user password recovery. A proposed flow sends a reset token to the user's email. How should the password reset token be designed and handled to minimize the risk of abuse?",
    choices: [
      { 
        id: "choice-a", 
        label: "Generate an email verification link that is valid for 30 days and stores the user's email inside a base64-encoded URL parameter.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Generate a cryptographically random, high-entropy token stored on the server with a short expiration time (e.g., 15 minutes) and single-use constraints.", 
        isCorrect: true 
      }
    ],
    explanation: "Weak or guessable tokens (like base64 emails) allow attackers to spoof reset actions. Links that do not expire or aren't marked single-use are vulnerable if emails are hijacked or intercepted. Threat-modeling the reset flow during design prevents vulnerabilities before code is written."
  },
  {
    id: "owasp-9",
    topic: "Logging & Monitoring",
    title: "Production Logging Security Policies",
    difficulty: "hard",
    scenarioText: "You need to log API transactions to detect suspicious brute-forcing. However, standard backend logging configurations might write sensitive customer information to cleartext disk files. Which logging practice is compliant with security standards?",
    choices: [
      { 
        id: "choice-a", 
        label: "Log complete request payloads and headers, including passwords and session tokens, to allow forensic teams to replicate queries.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Sanitize logs to mask passwords and credentials, while writing event details like timestamps, IP addresses, and failure categories.", 
        isCorrect: true 
      }
    ],
    explanation: "Writing sensitive credentials (passwords, tokens, credit cards) in plaintext log files is a major data exposure risk. Logs must be sanitized to strip credentials while retaining structural data like IP addresses, user identifiers, and timestamps to detect attacks."
  },
  {
    id: "owasp-10",
    topic: "SSRF",
    title: "Server-Side Request Forgery Prevention",
    difficulty: "hard",
    scenarioText: "A service allows users to import profiles from other social platforms by inputting their profile image URLs. The backend fetches the image. How can you prevent an attacker from supplying internal URLs (like metadata services `http://169.254.169.254`) and reading private cloud credentials?",
    choices: [
      { 
        id: "choice-a", 
        label: "Sanitize the user input URL by checking if it contains substrings like '127.0.0.1' or 'localhost'.", 
        isCorrect: false 
      },
      { 
        id: "choice-b", 
        label: "Verify the URL protocol is HTTPS, validate the host against a domain whitelist, and block all requests resolved to private IP ranges.", 
        isCorrect: true 
      }
    ],
    explanation: "String-based blacklists are easily bypassed by using DNS redirects, alternative IP representations (e.g. decimal, hex), or local aliases. Defending against SSRF requires resolving the domain name and checking the destination IP, blocking private (RFC 1918) addresses, loopbacks, and metadata servers."
  }
];
