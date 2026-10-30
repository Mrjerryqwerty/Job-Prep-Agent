import type { KP } from "./rubric";

// Two assignments per day, written from Dassault context, the JD and the reference resume.
// Scored against `points` (see lib/rubric.ts); `outline` is shown after submission as the model answer.

export type A = {
  day: number;
  slot: 1 | 2;
  title: string;
  type: "written" | "sql" | "scenario";
  prompt: string;
  points: KP[];
  outline: string;
  resumeTie: string;
  minWords: number;
};

export const ASSIGNMENTS: A[] = [
  // ───────────── Day 1 ─────────────
  {
    day: 1, slot: 1, title: "Your 90-second pitch", type: "written", minWords: 90,
    prompt:
`Write the answer you would say aloud to "Tell me about yourself" for the Business Process Analyst role at Dassault Systèmes Pune. About 150 words.

It should cover:
1. Who you are: current role, years of experience, employer.
2. Your PeopleSoft modules and the tools you build with.
3. Two results with numbers, taken from your own resume.
4. Why a business-facing analyst role at Dassault, and why now.`,
    points: [
      { label: "your current role, years of experience and employer", any: ["accenture", "3 year", "three year", "analyst", "years"] },
      { label: "your PeopleSoft modules (AR, AP, GL, Deal Management, Cash Management)", any: ["accounts receivable", "accounts payable", "general ledger", "deal management", "cash management", "peoplesoft"] },
      { label: "the tools you build with (PeopleCode, Application Engine, Integration Broker, PS Query, BI Publisher)", any: ["peoplecode", "application engine", "integration broker", "component interface", "ps query", "bi publisher"] },
      { label: "results with numbers (45%, 40%, 30%, 20%)", any: ["45", "40", "30", "20", "percent", "%"] },
      { label: "why this role at Dassault", any: ["dassault", "business process", "bridge", "business user", "stakeholder", "3dexperience"] },
    ],
    outline:
`"I'm a PeopleSoft FSCM analyst with three years at Accenture, working for a California government client across AR, GL, AP, Deal Management and Cash Management. I build with PeopleCode, Application Engine, Component Interface and Integration Broker, and report with PS Query and BI Publisher. I developed Deal Management interfaces that cut processing time by 45 percent and a bulk loader that reduced manual entry by 40 percent. I also write the requirements and test the releases, and that is the part I enjoy most. That is why I want a Business Process Analyst role: I can bridge the business and IT for Dassault's global finance systems, using my technical depth to propose solutions that work."`,
    resumeTie: "Every number in your pitch must be on your resume; interviewers will probe each one.",
  },
  {
    day: 1, slot: 2, title: "Map the three processes", type: "scenario", minWords: 120,
    prompt:
`In your own words, describe the end-to-end flow of three processes, naming the PeopleSoft module and the key document or record at each step:
1. Procure to Pay
2. Order to Cash
3. Travel and Expense

Mark which steps you have worked on yourself, and which you only know in theory.`,
    points: [
      { label: "P2P steps: requisition, purchase order, receipt, voucher, match, payment", any: ["requisition", "purchase order", "receipt", "voucher", "match"] },
      { label: "P2P modules: Purchasing and Accounts Payable", any: ["purchasing", "accounts payable", "payables", "ap"] },
      { label: "OTC steps: order or deal, billing, invoice, receivable, cash application", any: ["billing", "invoice", "receivable", "cash application", "deal", "order"] },
      { label: "OTC modules: Order Management, Billing, Accounts Receivable", any: ["order management", "billing", "accounts receivable", "ar"] },
      { label: "T&E steps: expense report, approval, reimbursement or payment, accounting", any: ["expense report", "approv", "reimburse", "payment", "cash advance", "travel authorization"] },
      { label: "which parts you have personally worked on", any: ["i worked", "i have worked", "my experience", "hands on", "i built", "i know in theory", "in theory"] },
    ],
    outline:
`P2P: Requisition (Purchasing / eProcurement) -> approval -> purchase order -> receipt -> voucher in Payables -> 2/3-way match with tolerances -> pay cycle -> journal to GL.
OTC: Customer setup -> order or contract (Deal Management in your project) -> Billing creates the invoice -> receivable item in AR -> payment and cash application -> collections -> journal to GL.
T&E: Travel authorization (optional) -> expense report -> approval by policy -> audit -> reimbursement through Payables -> GL.
Then say honestly: "My hands-on work is AR, AP, GL, Deal Management and Cash Management; Purchasing, Billing and Expenses I know conceptually."`,
    resumeTie: "Your resume covers AR, AP, GL, Deal Management and Cash Management. Name exactly that, then admit the rest.",
  },

  // ───────────── Day 2 ─────────────
  {
    day: 2, slot: 1, title: "Gap analysis: auto-approve small invoices", type: "scenario", minWords: 130,
    prompt:
`A business owner says: "Invoices under 500 euros should be auto-approved without a receipt, to save my team time."

Write a gap analysis and recommendation as you would for the process owner:
1. What PeopleSoft does today for matching and approval.
2. The gap versus the request.
3. Two or three options (configure, customise, change the process).
4. Risks and controls.
5. Your recommendation and next steps.`,
    points: [
      { label: "the current behaviour (voucher approval and 2-way or 3-way match)", any: ["match", "approval", "voucher", "receipt", "workflow"] },
      { label: "a clear statement of the gap", any: ["gap", "difference", "delivered", "standard", "does not support", "not supported"] },
      { label: "options such as match control or tolerance configuration, a customisation, or a process change", any: ["configur", "tolerance", "match control", "customis", "customiz", "process change", "option"] },
      { label: "risks and controls (segregation of duties, audit, fraud, monitoring report)", any: ["segregation", "audit", "fraud", "control", "risk", "monitor", "report"] },
      { label: "a recommendation with sign-off from finance", any: ["recommend", "sign off", "finance", "controller", "approve", "next step"] },
    ],
    outline:
`1. Today: vouchers match against PO and receipt (3-way) or PO only (2-way) with tolerances; exceptions hold the voucher; approvals follow workflow.
2. Gap: no receipt requirement below a threshold, unless the item is set up as 2-way.
3. Options: (a) configure 2-way match for low-value or service items and set tolerances; (b) a small customisation to auto-approve under a threshold; (c) change the process with a periodic sample audit.
4. Risks: fraud, duplicate payments, segregation of duties; controls: threshold cap, monthly exceptions report, audit sample.
5. Recommend (a) plus a monitoring report, agreed with the finance controller, tested in UAT, then released with user guidance.`,
    resumeTie: "Connect this to your Accounts Payable work and your impact-analysis experience on enhancements.",
  },
  {
    day: 2, slot: 2, title: "SQL on vouchers, vendors and POs", type: "sql", minWords: 25,
    prompt:
`Illustrative schema (not the exact PeopleSoft layout):
VENDOR(vendor_id, vendor_name)
PO(po_id, vendor_id, po_amount)
VOUCHER(voucher_id, vendor_id, po_id, invoice_no, invoice_dt, gross_amt, pay_status)   -- pay_status: 'P' paid, 'U' unpaid

Write Oracle SQL for each task:
1. Total unpaid amount per vendor for vouchers older than 30 days, largest first (show the vendor name).
2. Vouchers with no purchase order.
3. Duplicate invoices: same vendor, invoice number and amount appearing more than once.`,
    points: [
      { label: "a join between VOUCHER and VENDOR", any: ["join"] },
      { label: "filtering unpaid vouchers older than 30 days with sysdate", any: ["sysdate", "pay_status", "'u'", "30"] },
      { label: "group by with sum, then order by descending", any: ["group by", "sum", "order by", "desc"] },
      { label: "finding vouchers without a PO (po_id is null or a left join with null)", any: ["is null", "left join", "not exists", "not in"] },
      { label: "duplicates using group by and having count greater than 1", any: ["having", "count", "row_number", "partition"] },
    ],
    outline:
`1.
SELECT v.vendor_name, SUM(x.gross_amt) AS owed
FROM voucher x JOIN vendor v ON v.vendor_id = x.vendor_id
WHERE x.pay_status = 'U' AND x.invoice_dt < SYSDATE - 30
GROUP BY v.vendor_name ORDER BY owed DESC;

2.
SELECT * FROM voucher WHERE po_id IS NULL;

3.
SELECT vendor_id, invoice_no, gross_amt, COUNT(*) AS n
FROM voucher GROUP BY vendor_id, invoice_no, gross_amt HAVING COUNT(*) > 1;`,
    resumeTie: "You use SQL and PS Query for reconciliation. Be ready to say how you validated the row counts of a query like this.",
  },

  // ───────────── Day 3 ─────────────
  {
    day: 3, slot: 1, title: "Write a functional requirement", type: "written", minWords: 110,
    prompt:
`Write a functional requirement for this enhancement: "AR users need a daily view of unapplied cash so it is cleared before month end."

Include:
1. A user story.
2. Acceptance criteria (at least four, testable).
3. The data or report fields.
4. Frequency, notification and who receives it.
5. Controls, security, exceptions and how you would test it.`,
    points: [
      { label: "a user story: as a ... I want ... so that ...", any: ["as a", "i want", "so that", "user story"] },
      { label: "testable acceptance criteria", any: ["acceptance", "given", "when", "then", "criteria"] },
      { label: "report fields (customer, amount, payment date, age, reference)", any: ["customer", "amount", "payment date", "age", "aging", "reference", "currency"] },
      { label: "frequency and notification (daily, email, owner)", any: ["daily", "email", "notif", "schedule", "every", "morning"] },
      { label: "controls, security and exceptions", any: ["security", "role", "access", "control", "exception", "audit"] },
      { label: "a test approach", any: ["test", "uat", "scenario", "test case", "validate"] },
    ],
    outline:
`Story: As an AR clerk, I want a daily list of unapplied payments older than 2 days so that I can apply them before month end.
Acceptance: (1) the list contains every payment with status unapplied older than 2 days; (2) fields: customer, payment ID, date, amount, currency, age; (3) it is emailed to the AR team at 7:00 each business day; (4) payments applied today no longer appear; (5) only the AR role can open it.
Controls and exceptions: read-only report, audit of changes, handle partial applications and multi-currency.
Test: unit test the query, UAT with AR users using real examples, validate counts against AR workbench.`,
    resumeTie: "You write functional and technical designs at Accenture. Use the same structure.",
  },
  {
    day: 3, slot: 2, title: "L2 incident: unapplied cash", type: "scenario", minWords: 120,
    prompt:
`Incident: "Payments received in the bank are visible in AR but remain unapplied. Month end is in 3 days. Finance is escalating."

Describe how you handle this as an L2 analyst:
1. Triage and first questions.
2. Root-cause hypotheses and how you check each.
3. Fix and verification.
4. How you communicate during the incident.
5. What you do afterwards to prevent a repeat.`,
    points: [
      { label: "triage: scope, impact, urgency and when it started", any: ["scope", "impact", "urgent", "when", "how many", "started", "priority", "severity"] },
      { label: "hypotheses: a failed batch process, missing reference or customer, or a setup change", any: ["batch", "process", "log", "reference", "customer", "setup", "configuration", "change"] },
      { label: "checking logs and data with SQL or the application", any: ["log", "sql", "query", "check", "data", "trace"] },
      { label: "fix and verification (rerun, test, confirm with users)", any: ["fix", "rerun", "re run", "verify", "confirm", "test", "reprocess"] },
      { label: "communication updates and ETA to finance", any: ["communicat", "update", "eta", "inform", "stakeholder", "finance"] },
      { label: "prevention: root cause fix, monitoring, documentation", any: ["prevent", "monitor", "document", "root cause", "alert", "lesson"] },
    ],
    outline:
`1. Triage: how many payments, since when, which business unit, month-end deadline; set priority and give finance an ETA.
2. Hypotheses: the cash application batch failed or errored; payments lack a matching reference or customer; a recent setup or code change; data format from the bank file. Check process logs, error tables and sample rows with SQL.
3. Fix: correct the cause, reprocess the failed payments, verify the counts and balances with finance.
4. Communicate: short updates at agreed intervals, plain language, what is known and next steps.
5. Prevent: permanent fix, monitoring report or alert, update the runbook, share the lesson.`,
    resumeTie: "Use your production support and QA/UAT examples from Accenture here.",
  },

  // ───────────── Day 4 ─────────────
  {
    day: 4, slot: 1, title: "Design supplier onboarding", type: "written", minWords: 120,
    prompt:
`Propose a supplier onboarding flow for a supplier-facing application (the JD calls it ESA; confirm its exact scope with your recruiter).

Cover:
1. The steps from invitation to an active supplier.
2. The data you collect.
3. Approvals and checks (finance, compliance, bank details).
4. Controls against fraud and duplicates.
5. How it connects to Payables.`,
    points: [
      { label: "the steps: invite, register, review, approve, activate", any: ["invit", "regist", "review", "approv", "activat"] },
      { label: "the data collected (company details, tax ID, address, contacts, bank details)", any: ["tax", "address", "bank", "contact", "legal", "company details"] },
      { label: "approvals by finance, procurement or compliance", any: ["finance", "procurement", "compliance", "approval", "workflow"] },
      { label: "controls: duplicate check, bank verification, segregation of duties", any: ["duplicate", "verif", "fraud", "segregation", "validation", "sanction"] },
      { label: "the link to Payables (vendor record, payment terms)", any: ["payables", "vendor", "payment terms", "supplier record", "ap", "integration"] },
    ],
    outline:
`Flow: buyer invites supplier -> supplier registers and submits company, tax, address, contact and bank data -> automatic checks (duplicate vendor, tax ID format, sanctions) -> procurement review -> finance approves bank details (separate person) -> supplier record created in Payables with payment terms -> supplier notified and can see invoices and payments.
Controls: duplicate matching, independent bank-detail approval, audit trail, periodic data refresh.
Integration: approved data creates or updates the vendor in AP; changes to bank details re-trigger approval.`,
    resumeTie: "You have worked on vendor and payables-side data; point to any interface or validation you built.",
  },
  {
    day: 4, slot: 2, title: "Change request: international per-diem", type: "scenario", minWords: 120,
    prompt:
`Finance wants a new per-diem rule for international business travel in the Expenses module, effective in six weeks.

Describe how you deliver it:
1. Analysis and questions to ask.
2. Configuration or changes.
3. Testing.
4. Training and communication.
5. Rollout and how you will know it worked.`,
    points: [
      { label: "analysis: rates by country, policy, who is affected, current setup", any: ["rate", "country", "policy", "affected", "current", "current setup", "question"] },
      { label: "configuration of the per-diem rules and approvals", any: ["configur", "setup", "rule", "approval", "expense type", "per diem"] },
      { label: "testing with scenarios and UAT", any: ["test", "scenario", "uat", "regression"] },
      { label: "training and communication to travellers", any: ["train", "communicat", "guide", "announce", "faq"] },
      { label: "rollout timing and success measures", any: ["rollout", "go live", "timeline", "measure", "success", "monitor", "feedback"] },
    ],
    outline:
`1. Analysis: policy owner, rates per country and currency, effective dates, who is affected, current setup and exceptions.
2. Change: configure per-diem rates and expense types, approval rules, effective-dated entries; no customisation if the delivered setup covers it.
3. Test: scenarios by country, partial days, currency conversion, approval paths; regression on existing reports; UAT with finance.
4. Train: one-page guide, short demo, announcement to travellers and approvers.
5. Rollout: effective date, support during the first cycle, track rejected reports and questions.`,
    resumeTie: "Expenses is a gap on your resume: be explicit that you would apply your AP and GL knowledge and learn the module.",
  },

  // ───────────── Day 5 ─────────────
  {
    day: 5, slot: 1, title: "SQL on effective-dated data", type: "sql", minWords: 25,
    prompt:
`Illustrative schema:
VENDOR_LOC(vendor_id, location_id, effdt, effseq, eff_status, city)   -- eff_status: 'A' active, 'I' inactive

Write Oracle SQL for each task:
1. The current row for each vendor and location (latest EFFDT not after today, highest EFFSEQ).
2. Vendors whose status changed from active to inactive in the last 90 days.
3. Key combinations that have duplicate rows for the same EFFDT and EFFSEQ.`,
    points: [
      { label: "a correlated subquery with max(effdt) <= sysdate", any: ["max", "effdt", "sysdate", "subquery", "select"] },
      { label: "handling effseq for same-day changes", any: ["effseq"] },
      { label: "filtering active rows (eff_status = 'A')", any: ["eff_status", "'a'", "active"] },
      { label: "a window function or self-join to see the previous status", any: ["lag", "row_number", "over", "partition", "self join", "join"] },
      { label: "group by and having count to find duplicates", any: ["group by", "having", "count"] },
    ],
    outline:
`1.
SELECT * FROM vendor_loc a
WHERE a.effdt = (SELECT MAX(b.effdt) FROM vendor_loc b
                 WHERE b.vendor_id = a.vendor_id AND b.location_id = a.location_id AND b.effdt <= SYSDATE)
  AND a.effseq = (SELECT MAX(c.effseq) FROM vendor_loc c
                 WHERE c.vendor_id = a.vendor_id AND c.location_id = a.location_id AND c.effdt = a.effdt);

2. Use LAG(eff_status) OVER (PARTITION BY vendor_id, location_id ORDER BY effdt, effseq) and keep rows where the previous is 'A', the current is 'I' and effdt >= SYSDATE - 90.

3.
SELECT vendor_id, location_id, effdt, effseq, COUNT(*) FROM vendor_loc
GROUP BY vendor_id, location_id, effdt, effseq HAVING COUNT(*) > 1;`,
    resumeTie: "Effective-dated records are central to PeopleSoft; expect this question in the technical round.",
  },
  {
    day: 5, slot: 2, title: "Explain a data model you have worked with", type: "written", minWords: 120,
    prompt:
`Describe the data model of Deal Management flowing into billing and accounts receivable, as you know it from your project.

Cover:
1. The main entities and how they relate (keys).
2. Where the source of truth lives for each.
3. What interfaces move between systems.
4. How you would validate that the data is correct end to end.`,
    points: [
      { label: "main entities (customer, deal, deal line, invoice, receivable item, journal)", any: ["customer", "deal", "line", "invoice", "receivable", "journal"] },
      { label: "keys and relationships (one to many, foreign keys)", any: ["key", "one to many", "foreign", "relationship", "parent", "child", "id"] },
      { label: "source of truth for each piece of data", any: ["source of truth", "master", "system of record", "source", "owner"] },
      { label: "the interfaces (inbound, outbound, Integration Broker, Application Engine)", any: ["interface", "inbound", "outbound", "integration broker", "application engine", "component interface"] },
      { label: "validation: counts, totals, reconciliation", any: ["count", "total", "reconcil", "validat", "compare", "sample"] },
    ],
    outline:
`Entities: Customer 1-to-many Deal; Deal 1-to-many Deal Line; Deal Line leads to a billing record and Invoice; Invoice creates an AR item; AR item and payment lead to GL journal lines.
Keys: customer ID, deal ID plus line number, invoice number, item ID, journal ID and line.
Source of truth: the customer master in one place, deals in the source system until loaded, AR as the book of record for receivables, GL for accounting.
Interfaces: inbound deal loads (Application Engine and Component Interface), outbound messages through Integration Broker.
Validation: record counts and amount totals at each hop, spot-check samples, reconcile AR to GL.`,
    resumeTie: "This is your real project. Use the exact interfaces and the 45% and 40% results.",
  },

  // ───────────── Day 6 ─────────────
  {
    day: 6, slot: 1, title: "Plan a release across time zones", type: "scenario", minWords: 130,
    prompt:
`You must plan a release with three enhancements and one urgent hotfix. The developers are in Pune, the business owners in Paris, and the UAT users in Waltham. A period close starts in 10 days.

Describe:
1. What goes in the release, and what does not.
2. The schedule and sequencing.
3. Testing and dependencies.
4. Risks and the rollback plan.
5. Go/no-go and communication.`,
    points: [
      { label: "release content decided by priority and risk (hotfix first)", any: ["hotfix", "priorit", "risk", "content", "scope", "defer"] },
      { label: "a schedule that respects the period close and freeze", any: ["period close", "freeze", "cut off", "schedule", "calendar", "before close"] },
      { label: "time-zone handling (overlap hours, handoffs)", any: ["time zone", "overlap", "handoff", "hand off", "pune", "paris", "waltham"] },
      { label: "testing and dependencies (unit, integration, regression, UAT)", any: ["unit", "integration", "regression", "uat", "dependenc", "test"] },
      { label: "a rollback plan and a go/no-go decision", any: ["rollback", "roll back", "go no go", "go/no", "go or no", "decision"] },
      { label: "communication to stakeholders", any: ["communicat", "notify", "update", "release note", "stakeholder"] },
    ],
    outline:
`Content: ship the hotfix first as its own small release; the three enhancements by priority and risk, and defer any that cannot finish UAT before the freeze.
Schedule: build and unit test in Pune, hand off at the end of the Pune day for UAT in Waltham, with a short overlap call with Paris for decisions; freeze well before close.
Testing: unit, integration, regression; list dependencies between the enhancements.
Risks and rollback: backup and a documented rollback per change.
Go/no-go: a short meeting with the business owners, against exit criteria. Communicate with release notes and a status update.`,
    resumeTie: "Use your environment migration experience: pre- and post-deployment validation and zero major issues.",
  },
  {
    day: 6, slot: 2, title: "A difficult stakeholder (STAR)", type: "written", minWords: 120,
    prompt:
`A process owner insists on a customisation that you believe is wrong. Write your answer in STAR format:
Situation, Task, Action, Result. Use a real example from your work if you can, or a realistic one.

Show how you challenge the request, offer options, document the decision, and keep the relationship.`,
    points: [
      { label: "the situation and your task", any: ["situation", "task", "context", "project", "was asked"] },
      { label: "actions: asking why and understanding the underlying need", any: ["why", "understand", "need", "asked", "listen"] },
      { label: "offering options and explaining risk or cost", any: ["option", "alternative", "risk", "cost", "upgrade", "maintenance", "standard"] },
      { label: "documenting and agreeing the decision (or escalating)", any: ["document", "agree", "decision", "escalat", "sign off", "recommend"] },
      { label: "a result, ideally measurable", any: ["result", "outcome", "%", "percent", "delivered", "saved", "reduced"] },
    ],
    outline:
`Situation: a user asked for a custom change on top of delivered functionality. Task: assess impact and recommend.
Action: I asked what problem they were solving, did an impact analysis, and presented options (use delivered configuration; small change; process change) with the cost, upgrade and testing implications. I demonstrated the delivered option on sample data and documented the recommendation.
Result: we agreed on the configuration approach, delivered on time with no customisation, and the user trusted the next recommendation.`,
    resumeTie: "Your resume says you interact with users, do impact analysis and propose best-fit solutions. This is that bullet as a story.",
  },

  // ───────────── Day 7 ─────────────
  {
    day: 7, slot: 1, title: "Technology watch brief", type: "written", minWords: 130,
    prompt:
`Write a one-page brief for the team on one technology trend that could affect ERP finance processes at Dassault (for example AI agents in finance, process automation, or cloud migration of PeopleSoft).

Include:
1. What the trend is, in two sentences.
2. A concrete use in P2P, OTC or T&E.
3. Benefits and risks.
4. A recommendation and a small first step.

You may refer to your Oracle AI certifications.`,
    points: [
      { label: "a clear description of the trend", any: ["ai", "agent", "automation", "cloud", "trend", "machine learning"] },
      { label: "a concrete use in finance (invoice processing, reconciliation, expense audit, cash application)", any: ["invoice", "reconcil", "expense", "cash application", "matching", "p2p", "otc"] },
      { label: "benefits (time saved, accuracy)", any: ["benefit", "faster", "accuracy", "time", "saving", "efficien"] },
      { label: "risks (data quality, controls, audit, security)", any: ["risk", "control", "audit", "security", "data quality", "privacy", "governance"] },
      { label: "a recommendation with a small pilot", any: ["recommend", "pilot", "proof of concept", "first step", "start with"] },
    ],
    outline:
`Trend: AI agents can read invoices, suggest account coding and flag anomalies, reducing manual finance work.
Use: invoice matching exceptions in P2P; unapplied cash suggestions in OTC; policy checks on expense reports.
Benefits: faster cycle times and fewer errors. Risks: wrong suggestions, weak audit trail, data privacy, over-reliance.
Recommendation: pilot on one low-risk exception queue with human approval, measure accuracy and time saved for one quarter, then decide whether to extend.`,
    resumeTie: "Your Oracle Fusion AI Agent Studio and OCI AI certifications are a natural bridge to the technology-intelligence part of the JD.",
  },
  {
    day: 7, slot: 2, title: "Your STAR story bank", type: "written", minWords: 180,
    prompt:
`Write four short STAR stories from your own experience, one for each theme. Two or three sentences each is enough.
1. Handling conflict or disagreement.
2. Meeting a deadline under pressure.
3. A mistake or defect and what you changed.
4. Learning something new quickly.

Use real facts from your resume where possible (migrations, interfaces, testing, certifications).`,
    points: [
      { label: "a conflict or disagreement story", any: ["disagree", "conflict", "different view", "pushed back", "challenge"] },
      { label: "a deadline or pressure story", any: ["deadline", "pressure", "tight", "release", "go live", "month end"] },
      { label: "a mistake or defect story with the fix and prevention", any: ["mistake", "defect", "missed", "fixed", "prevent", "root cause"] },
      { label: "a quick-learning story", any: ["learn", "new", "quickly", "certification", "course", "picked up"] },
      { label: "results and numbers", any: ["45", "40", "30", "20", "100", "percent", "%", "zero"] },
    ],
    outline:
`1. Conflict: disagreement on approach during impact analysis; asked why, offered options with risk, agreed a solution.
2. Deadline: a release with shifting scope; confirmed priorities, shipped the critical part first, told stakeholders early; validated before go-live.
3. Mistake: a defect found in testing; owned it, fixed and retested, found the root cause, added a test script; post-deployment defects fell by 20 percent.
4. Learning: picked up a new tool or module quickly, for example the Oracle AI certifications; applied it at work.`,
    resumeTie: "Pick stories that you can back with the numbers on your resume. Rehearse them aloud in the interview room.",
  },
];

export const assignmentFor = (day: number, slot: number) => ASSIGNMENTS.find((a) => a.day === day && a.slot === slot);
