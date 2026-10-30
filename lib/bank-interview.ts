import type { KP } from "./rubric";

// Interview questions written from three sources: Dassault context, the JD, and the reference resume
// (a PeopleSoft FSCM analyst with 3 years of experience). Model answers use only facts from that resume.

export type Q = {
  id: string;
  round: 1 | 2 | 3;
  tag: string; // topic, used for the admin report and study pointers
  day: number; // course day that covers this topic
  core?: boolean; // always asked
  q: string; // spoken aloud
  points: KP[];
  model: string; // sample strong answer
  minWords?: number;
};

export const BANK: Q[] = [
  // ───────────── Round 1: Technical ─────────────
  {
    id: "r1-experience", round: 1, tag: "PeopleSoft FSCM", day: 1, core: true,
    q: "Walk me through your PeopleSoft FSCM experience. Which modules have you worked on, and what did you actually build or configure?",
    points: [
      { label: "the modules you worked on (AR, AP, GL, Deal Management, Cash Management)", any: ["accounts receivable", "accounts payable", "general ledger", "deal management", "cash management", "ar", "gl"] },
      { label: "the PeopleTools you used (PeopleCode, Application Engine, Component Interface, Integration Broker)", any: ["peoplecode", "application engine", "component interface", "integration broker", "application designer", "data mover"] },
      { label: "who the client was and the type of work (government client, enhancement and maintenance)", any: ["government", "california", "enhancement", "maintenance", "client"] },
      { label: "at least one measured result (45% faster processing, 40% less manual entry, 30% faster reporting)", any: ["45", "40", "30", "percent", "%"] },
      { label: "requirements, specifications and testing, not only coding", any: ["requirement", "specification", "functional design", "technical design", "unit test", "uat", "test script"] },
    ],
    model: "For about three years at Accenture I have worked on Oracle PeopleSoft FSCM for a California government client, across Accounts Receivable, General Ledger, Accounts Payable, Deal Management and Cash Management, on both enhancement and maintenance work. I build with PeopleCode, Application Engine, Component Interface and Integration Broker. For example I developed more than three Deal Management interfaces that cut processing time by 45 percent, and a bulk deal loader that reduced manual entry by 40 percent. I also gather requirements, write functional and technical designs, and run unit, QA and UAT testing.",
  },
  {
    id: "r1-p2p", round: 1, tag: "Procure to Pay", day: 2, core: true,
    q: "Take me through Procure to Pay in PeopleSoft, from requisition to payment, and tell me where matching happens.",
    points: [
      { label: "the front end: requisition, approval and purchase order", any: ["requisition", "purchase order", "po", "approv", "sourcing"] },
      { label: "receiving of goods or services", any: ["receiv", "receipt", "goods"] },
      { label: "the supplier invoice entered as a voucher", any: ["voucher", "invoice"] },
      { label: "matching of invoice, PO and receipt (2-way or 3-way) with tolerances", any: ["match", "tolerance", "3 way", "three way", "2 way", "two way"] },
      { label: "payment (pay cycle or express payment) and accounting to the general ledger", any: ["pay cycle", "payment", "express", "pay run", "general ledger", "journal", "accounting"] },
      { label: "exceptions and holds (match exceptions, budget errors)", any: ["exception", "hold", "block", "budget", "error"] },
    ],
    model: "It starts with a requisition, which is approved and sourced into a purchase order. Goods or services are received, and the supplier invoice is entered as a voucher in Payables. Matching compares the voucher against the PO and the receipt, two-way or three-way, within configured tolerances; mismatches create match exceptions and holds that someone must resolve. Approved vouchers go into a pay cycle or express payment, and accounting entries flow to the general ledger. My hands-on work is on the Payables and GL side; I know the Purchasing front end conceptually and would be upfront about that.",
  },
  {
    id: "r1-otc", round: 1, tag: "Order to Cash", day: 3,
    q: "Now walk me through Order to Cash in PeopleSoft, and tell me which part of it you have actually worked on.",
    points: [
      { label: "customer setup (customer, bill-to)", any: ["customer", "bill to", "setup", "master data"] },
      { label: "the order, contract or deal that starts the process", any: ["order", "contract", "deal", "sales"] },
      { label: "billing and the invoice", any: ["billing", "invoice", "bill"] },
      { label: "the receivable item in AR and its aging", any: ["receivable", "ar", "open item", "aging", "ageing", "item"] },
      { label: "payment and cash application (matching cash to invoices)", any: ["payment", "cash application", "apply", "remittance", "cash"] },
      { label: "accounting to the general ledger and reconciliation", any: ["general ledger", "journal", "gl", "reconcil", "accounting"] },
    ],
    model: "A customer is set up with bill-to details. An order, contract or, in my project, a deal is created, billing produces the invoice, and the invoice becomes a receivable item in Accounts Receivable that ages until paid. Payments arrive and cash is applied to the open items, and any unapplied cash or deductions are followed up. Everything is accounted to the general ledger and reconciled. I have worked on the AR and Deal Management part, including interfaces that bring deals in and out, but not on Order Management or Billing configuration directly.",
  },
  {
    id: "r1-stuck-voucher", round: 1, tag: "Procure to Pay", day: 2,
    q: "A voucher is stuck in a match exception and the business says the purchase order is fine. How do you troubleshoot it?",
    points: [
      { label: "checking the match status and exception details on the voucher", any: ["match status", "exception", "match", "status"] },
      { label: "comparing the PO line, receipt and invoice for quantity and price", any: ["quantity", "price", "po line", "receipt", "compare", "amount"] },
      { label: "checking tolerance and match rule configuration", any: ["tolerance", "match rule", "control", "configuration", "setup"] },
      { label: "looking for a missing or late receipt", any: ["receipt", "received", "receiving", "not received"] },
      { label: "fixing the root cause with the right approval rather than overriding blindly", any: ["root cause", "approval", "approve", "override", "permission"] },
      { label: "communicating back to the business and preventing a repeat", any: ["communicat", "inform", "update", "prevent", "document", "recurr"] },
    ],
    model: "I would start with the voucher's match status and exception detail, then compare the PO line, the receipt and the invoice on quantity and price. Often the receipt is missing or late, or the price is outside tolerance, so I would check the tolerance and match rule setup too. I would not just override the hold; I would find the root cause, get the right approval for any exception, fix it, and tell the business what happened and how we avoid it next time, for example by correcting a setup or documenting the process.",
  },
  {
    id: "r1-interfaces", round: 1, tag: "Interfaces", day: 5, core: true,
    q: "Tell me about the Deal Management interfaces you built. How did data flow in and out, and how did you handle errors?",
    points: [
      { label: "inbound and outbound direction and what data moved", any: ["inbound", "outbound", "file", "data", "deal"] },
      { label: "the tools used (Application Engine, Component Interface, Integration Broker)", any: ["application engine", "component interface", "integration broker", "message", "service operation"] },
      { label: "validation, error handling, logging and reprocessing", any: ["validat", "error", "log", "reprocess", "rerun", "exception", "reject"] },
      { label: "reconciliation or testing to prove the data was correct", any: ["reconcil", "test", "verify", "count", "compare", "accuracy"] },
      { label: "the result (45% less processing time, better accuracy)", any: ["45", "percent", "%", "faster", "accuracy", "processing time"] },
    ],
    model: "I developed more than three inbound and outbound interfaces for Deal Management. Inbound files were validated and loaded using Application Engine and Component Interface so the standard page rules still applied, and outbound data was published through Integration Broker. Bad records were rejected with clear error messages and logged so they could be corrected and reprocessed without rerunning everything. We reconciled counts and amounts against the source in testing. The result was better transaction accuracy and a 45 percent reduction in processing time.",
  },
  {
    id: "r1-sql-aging", round: 1, tag: "SQL & data", day: 5,
    q: "Describe the SQL you would write to list vendors with unpaid vouchers older than thirty days, with the total owed for each vendor, largest first.",
    points: [
      { label: "joining vouchers to vendors", any: ["join", "vendor id", "vendor table"] },
      { label: "filtering unpaid vouchers older than 30 days (a date condition)", any: ["sysdate", "current date", "30", "thirty", "unpaid", "not paid", "older", "invoice date", "where"] },
      { label: "grouping by vendor", any: ["group by", "grouped", "per vendor", "each vendor"] },
      { label: "summing the amount", any: ["sum", "total", "aggregate"] },
      { label: "ordering largest first", any: ["order by", "descending", "desc", "largest", "highest"] },
      { label: "practical details (business unit, currency, nulls)", any: ["business unit", "currency", "null", "having", "distinct"] },
    ],
    model: "I would join the voucher table to the vendor table on vendor id, filter to vouchers that are not fully paid and whose invoice date is more than thirty days before today, using sysdate minus 30 in Oracle. Then I group by vendor, sum the gross amount, and order by that total descending. I would also think about business unit and currency, so I do not add amounts in different currencies, and sanity check the row count against a PS Query result.",
  },
  {
    id: "r1-effdt", round: 1, tag: "SQL & data", day: 5,
    q: "How do effective-dated records work in PeopleSoft, and how do you pick the current row in SQL?",
    points: [
      { label: "the EFFDT effective date and what it represents (history of changes)", any: ["effdt", "effective date", "effective dated", "history"] },
      { label: "effective status (active or inactive) and EFFSEQ for same-day changes", any: ["effective status", "eff status", "effseq", "active", "inactive", "sequence"] },
      { label: "selecting the latest row not after today with a max(effdt) subquery", any: ["max", "subquery", "sub query", "latest", "current", "sysdate", "less than or equal"] },
      { label: "joining on the same key columns in that subquery", any: ["same key", "key", "correlated", "join"] },
      { label: "future-dated rows and how PS Query handles effective dates", any: ["future", "ps query", "criteria", "as of date"] },
    ],
    model: "Many PeopleSoft setup and master records are effective-dated: each change is a new row with an EFFDT, so you keep history instead of overwriting. There is an effective status, active or inactive, and EFFSEQ to order several changes on the same day. To get the current row in SQL, I select the row where EFFDT equals the max EFFDT that is less than or equal to today for the same key, usually with a correlated subquery. Future-dated rows are ignored until their date arrives, and PS Query offers effective date criteria that generate the same logic.",
  },
  {
    id: "r1-reporting-tools", round: 1, tag: "Reporting", day: 5,
    q: "When do you use PS Query, BI Publisher, or plain SQL, and how have you used them?",
    points: [
      { label: "PS Query for ad hoc, user-level reporting with security", any: ["ps query", "ad hoc", "query security", "user"] },
      { label: "BI Publisher for formatted, template-based output", any: ["bi publisher", "template", "format", "layout", "xml"] },
      { label: "SQL or Application Engine for complex or bulk work", any: ["sql", "application engine", "bulk", "complex", "batch"] },
      { label: "scheduling or sharing reports with business users", any: ["schedul", "run control", "share", "business user", "email", "distribut"] },
      { label: "the result (30% faster reporting turnaround)", any: ["30", "percent", "%", "turnaround", "faster"] },
    ],
    model: "I use PS Query for ad hoc and operational reports that business users can run themselves, within query security. I use BI Publisher when the output needs a formatted layout from a template, such as a statement or a compliance report. For complex logic or bulk processing I use SQL or Application Engine. I have built PS Queries and BI Publisher reports that were scheduled and shared with finance users, and they cut reporting turnaround time by about 30 percent.",
  },
  {
    id: "r1-migration", round: 1, tag: "Testing & release", day: 6,
    q: "How do you migrate changes between environments and prove nothing broke?",
    points: [
      { label: "moving the change as a project (compare and copy) and data with Data Mover where needed", any: ["project", "compare", "copy", "data mover", "migrat", "move"] },
      { label: "pre-deployment checks (what is in the package, config compare)", any: ["pre", "before", "checklist", "baseline", "compare", "package"] },
      { label: "post-deployment validation (counts, balances, config compare)", any: ["post", "after", "validat", "count", "balance", "verify", "reconcil"] },
      { label: "regression or smoke tests and sign-off", any: ["regression", "smoke", "test", "sign off", "signoff", "approval", "uat"] },
      { label: "a rollback plan", any: ["rollback", "roll back", "backup", "revert", "fallback"] },
      { label: "the result (100% data consistency, zero major issues)", any: ["100", "zero", "no major", "consisten", "percent"] },
    ],
    model: "I move changes as a project, using compare and copy for objects and Data Mover for data where needed. Before the migration I confirm exactly what is in the package and take a baseline. After it I validate row counts, balances and key configuration against the source, run regression and smoke tests, and get sign-off, with a rollback plan ready. On my migrations this gave 100 percent data consistency and zero major issues after go-live.",
  },
  {
    id: "r1-multiledger", round: 1, tag: "Record to Report", day: 4,
    q: "Explain multi-ledger accounting and inter-ledger transfers in PeopleSoft General Ledger, and why a finance team needs them.",
    points: [
      { label: "multiple ledgers for different accounting bases or reporting needs (for example local and group)", any: ["multiple ledger", "multi ledger", "ledger group", "accounting basis", "gaap", "statutory", "reporting", "different"] },
      { label: "journals posting to more than one ledger", any: ["journal", "post", "both ledger", "each ledger"] },
      { label: "moving or adjusting amounts between ledgers (inter-ledger transfers)", any: ["transfer", "inter ledger", "between ledger", "adjust", "move"] },
      { label: "reconciliation between ledgers", any: ["reconcil", "match", "difference", "balance"] },
      { label: "compliance, audit readiness and reporting requirements", any: ["compliance", "audit", "regulat", "report"] },
    ],
    model: "A company may need more than one view of the same transactions, for example a local statutory basis and a group reporting basis, so GL keeps multiple ledgers. Journals can post to several ledgers, and inter-ledger transfer solutions move or adjust amounts between them. Because the ledgers must stay explainable, reconciling the differences is essential. I implemented multi-ledger accounting extensions and custom and delivered inter-ledger transfers, which improved reconciliation accuracy and audit readiness for a government client.",
  },
  {
    id: "r1-duplicates", round: 1, tag: "SQL & data", day: 5,
    q: "How would you find duplicate supplier payments across a table with two million rows?",
    points: [
      { label: "defining what a duplicate is (same vendor, invoice number, amount, date)", any: ["same vendor", "invoice number", "same amount", "define", "duplicate"] },
      { label: "group by those columns with having count greater than one, or a row_number window function", any: ["group by", "having", "count", "row number", "row_number", "partition", "window"] },
      { label: "performance: set-based query, indexes, no row-by-row processing", any: ["index", "performance", "set based", "batch", "volume", "row by row"] },
      { label: "reviewing results with finance before any action, not deleting automatically", any: ["review", "finance", "verify", "approve", "not delete", "manual", "investigate"] },
      { label: "prevention: duplicate invoice checks and controls", any: ["prevent", "control", "check", "validation", "configuration", "alert"] },
    ],
    model: "First I agree with finance what counts as a duplicate, typically the same vendor, invoice number and amount. Then I group on those columns and keep the groups with a count above one, or use row_number over a partition to number the repeats. On two million rows I keep it set-based and check the indexes rather than looping. I give the list to finance to review before anyone reverses a payment, and then suggest a preventive control such as a duplicate invoice check at entry.",
  },

  // ───────────── Round 2: Leads (30 min) ─────────────
  {
    id: "r2-company", round: 2, tag: "Company", day: 1, core: true,
    q: "What do you know about Dassault Systèmes and 3DEXPERIENCE, and why would you like to join this team in particular?",
    points: [
      { label: "what Dassault Systèmes is (French software company, 3DEXPERIENCE platform, virtual twins)", any: ["french", "france", "3dexperience", "virtual twin", "platform", "software"] },
      { label: "some of its brands (CATIA, SOLIDWORKS, SIMULIA, DELMIA, ENOVIA, BIOVIA)", any: ["catia", "solidworks", "simulia", "delmia", "enovia", "biovia"] },
      { label: "industries it serves (aerospace, transportation, life sciences, manufacturing)", any: ["aerospace", "transport", "life science", "manufactur", "industr", "automotive"] },
      { label: "what this team does (internal finance and ERP systems for a global company)", any: ["internal", "finance", "erp", "digital enterprise", "information system", "enterprise systems"] },
      { label: "a personal reason that links your PeopleSoft background to the role", any: ["peoplesoft", "background", "experience", "bridge", "business process", "grow", "opportunity"] },
    ],
    model: "Dassault Systèmes is a French software company, best known for the 3DEXPERIENCE platform and virtual twin experiences, with brands such as CATIA, SOLIDWORKS, SIMULIA, DELMIA and ENOVIA, serving industries like aerospace, transportation and life sciences. This team runs the internal finance and ERP systems that a global company depends on. I want to move from building PeopleSoft solutions to shaping the process behind them, and this role lets me use my FSCM background while working closely with business owners across France, the US and Pune.",
  },
  {
    id: "r2-challenge", round: 2, tag: "Stakeholders", day: 6, core: true,
    q: "A process owner asks for a customisation that you believe is the wrong solution. How do you challenge them?",
    points: [
      { label: "asking why, to understand the underlying business need", any: ["why", "understand", "underlying", "need", "root", "problem"] },
      { label: "offering options (configure, customise, or change the process)", any: ["option", "alternative", "configure", "configuration", "standard", "process change", "delivered"] },
      { label: "explaining the cost and risk (upgrade, maintenance, testing effort)", any: ["cost", "risk", "upgrade", "maintenance", "effort", "impact"] },
      { label: "using evidence or data, not just opinion", any: ["data", "evidence", "example", "number", "demo", "prototype"] },
      { label: "documenting the recommendation and agreeing a decision (escalating if needed)", any: ["document", "recommend", "decision", "agree", "escalat", "sign off"] },
    ],
    model: "I start by asking why they need it, because the request is usually a solution to a problem I can solve differently. I lay out options: delivered configuration, a small change, or a process change, and the cost and risk of customising, such as upgrade and maintenance effort and testing. I back it with data or a quick demo, write the recommendation down, and agree the decision with them, escalating to the sponsor if we still disagree. My impact analysis work at Accenture follows the same pattern.",
  },
  {
    id: "r2-requirements", round: 2, tag: "Requirements", day: 3,
    q: "Walk me through how you turn a vague business request into a functional specification.",
    points: [
      { label: "talking to stakeholders to understand the current process (as-is)", any: ["stakeholder", "interview", "workshop", "as is", "current process", "meeting", "business user"] },
      { label: "defining the target process (to-be) and doing a gap analysis", any: ["to be", "gap", "target", "future", "fit gap", "delivered"] },
      { label: "writing requirements as user stories or numbered requirements with acceptance criteria", any: ["user story", "acceptance", "criteria", "requirement", "use case"] },
      { label: "functional and technical specs written with developers", any: ["functional spec", "functional design", "technical spec", "technical design", "developer"] },
      { label: "review, sign-off and traceability to test cases", any: ["review", "sign off", "approve", "trace", "test case", "uat"] },
    ],
    model: "I start with conversations and workshops to understand the current process, then define the target process and do a gap analysis against what PeopleSoft delivers. I write the requirements as numbered items or user stories with acceptance criteria, then produce the functional design and work with developers on the technical design. Everything is reviewed and signed off by the business, and each requirement traces to a test case for UAT. I have produced functional design, technical design and test documentation for all my deliverables.",
  },
  {
    id: "r2-agile", round: 2, tag: "Agile & delivery", day: 6,
    q: "Our team works in an Agile way, but finance has fixed calendars like period close. How would you plan around that?",
    points: [
      { label: "a prioritised backlog and short iterations", any: ["backlog", "sprint", "iteration", "prioriti", "agile", "scrum"] },
      { label: "a release calendar that avoids period close and freeze windows", any: ["period close", "month end", "freeze", "calendar", "blackout", "close"] },
      { label: "risk-based prioritisation and dependencies", any: ["risk", "dependenc", "priorit", "critical"] },
      { label: "UAT with finance users planned in advance", any: ["uat", "finance user", "business user", "testing", "availability"] },
      { label: "clear communication and a retrospective to improve", any: ["communicat", "retrospective", "stakeholder", "update", "improve"] },
    ],
    model: "I would keep a prioritised backlog and short iterations, but plan releases around a finance calendar so nothing risky lands near period close or a freeze. I order work by risk and dependencies, book finance users for UAT early because their time is limited at month end, and keep stakeholders informed. A retrospective after each release helps us improve. My experience is mostly SDLC-style enhancement and maintenance releases, so I would be honest that I am growing my formal Agile experience, and eager to do so.",
  },
  {
    id: "r2-release", round: 2, tag: "Agile & delivery", day: 6,
    q: "How do you decide what goes into a release, and what do you do to make it safe?",
    points: [
      { label: "prioritising by business value and risk", any: ["priorit", "value", "risk", "critical", "urgent"] },
      { label: "checking dependencies and team capacity", any: ["dependenc", "capacity", "resource", "sequence", "order"] },
      { label: "testing: unit, integration and regression", any: ["unit", "integration", "regression", "test", "qa"] },
      { label: "a freeze or cut-off date and a rollback plan", any: ["freeze", "cut off", "cutoff", "rollback", "roll back", "deadline"] },
      { label: "release notes and communication to users", any: ["release note", "communicat", "notify", "inform", "documentation", "training"] },
    ],
    model: "I rank candidate changes by business value and risk, check dependencies and capacity, and set a cut-off so the content stops changing. Everything is covered by unit, integration and regression testing, there is a rollback plan, and the users get clear release notes. In my own migrations, careful pre- and post-deployment validation gave zero major post-go-live issues.",
  },
  {
    id: "r2-global", round: 2, tag: "Collaboration", day: 6,
    q: "You will work with colleagues in France and the United States. How do you collaborate across time zones?",
    points: [
      { label: "clear written communication and documentation", any: ["written", "document", "email", "clear", "notes", "wiki"] },
      { label: "using the overlap hours well and planning meetings", any: ["overlap", "time zone", "timezone", "meeting", "schedule", "hours"] },
      { label: "asynchronous updates and a decisions log", any: ["async", "update", "log", "tracker", "jira", "status"] },
      { label: "escalating early and confirming understanding", any: ["escalat", "confirm", "clarif", "early", "follow up"] },
      { label: "relevant experience (a US government client from Pune)", any: ["california", "us client", "client", "accenture", "onsite", "offshore"] },
    ],
    model: "I rely on clear written communication: meeting notes, decisions and next steps in writing after every call, so the other side can pick up while I am offline. I use the overlap hours for decisions and keep status visible in a tracker. I clarify early and escalate early rather than wait. At Accenture I have worked for a California government client from Pune, so working across a large time difference is already part of my routine.",
  },
  {
    id: "r2-training", round: 2, tag: "Training", day: 6,
    q: "You have delivered a new feature. How do you train the users and make sure it sticks?",
    points: [
      { label: "a user guide or quick reference", any: ["user guide", "guide", "manual", "quick reference", "documentation", "step by step"] },
      { label: "train-the-trainer or key users as champions", any: ["train the trainer", "champion", "key user", "super user", "trainer"] },
      { label: "recorded demos or e-learning (for example 3DEXPERIENCE University)", any: ["demo", "recorded", "video", "e learning", "3dexperience university", "university"] },
      { label: "support after go-live and a place to ask questions", any: ["support", "after go live", "hypercare", "faq", "helpdesk", "question"] },
      { label: "collecting feedback and improving", any: ["feedback", "improve", "survey", "adoption", "measure"] },
    ],
    model: "I write a short step-by-step user guide and run a demo, and I train a few key users well so they can train their teams, a train-the-trainer approach. Recorded sessions or e-learning, such as 3DEXPERIENCE University, let people revisit it. After go-live I stay available during a hypercare period, collect questions into an FAQ, and gather feedback. I have trained users in testing cycles and am keen to do more of this formally.",
  },
  {
    id: "r2-incident", round: 2, tag: "Incident handling", day: 3,
    q: "Tell me about a hard production issue you diagnosed and fixed in PeopleSoft.",
    points: [
      { label: "the situation and its business impact", any: ["situation", "impact", "business", "production", "issue", "users"] },
      { label: "how you reproduced or investigated it (logs, SQL, trace)", any: ["log", "sql", "trace", "reproduce", "investigat", "debug", "data"] },
      { label: "the root cause", any: ["root cause", "cause", "because", "found that"] },
      { label: "the fix, tested before release", any: ["fix", "resolve", "test", "deploy", "patch", "solution"] },
      { label: "communication and preventing a repeat", any: ["communicat", "update", "prevent", "document", "monitor", "lesson"] },
    ],
    model: "Use a real example in this shape: the issue and who it affected in production; how I reproduced it and used logs and SQL to inspect the data; the root cause I found; the fix I tested in lower environments before releasing; and how I kept the users informed and prevented a repeat, for instance with a validation or documentation. My QA, UAT and production support work at Accenture gives me several real cases to pick from. Prepare one with numbers.",
    minWords: 60,
  },

  // ───────────── Round 3: Manager ─────────────
  {
    id: "r3-why-role", round: 3, tag: "Motivation", day: 7, core: true,
    q: "Your background is largely PeopleSoft development. Why do you want a Business Process Analyst role instead?",
    points: [
      { label: "wanting to work closer to the business and the process", any: ["business", "process", "closer", "stakeholder", "user"] },
      { label: "how your technical depth makes you a better analyst", any: ["technical", "depth", "peoplecode", "developer", "understand", "feasib"] },
      { label: "evidence you already do analyst work (requirements, impact analysis, specs, testing)", any: ["requirement", "impact analysis", "specification", "functional", "test"] },
      { label: "why Dassault and this team", any: ["dassault", "team", "global", "3dexperience", "company"] },
      { label: "your growth plan in the role", any: ["grow", "learn", "develop", "future", "career", "lead"] },
    ],
    model: "I enjoy the part of my work where I gather requirements, do impact analysis and shape the solution with business users, and I want that to be my main focus. My technical depth in PeopleCode, Application Engine and interfaces means I can judge what is feasible and write specifications developers can build from. I already write functional and technical designs and run UAT. Dassault's global finance systems team is a place where I can grow into owning the process end to end.",
  },
  {
    id: "r3-gaps", round: 3, tag: "Gap closing", day: 4, core: true,
    q: "Your resume shows no Travel and Expense, no ESA, and no Purchasing. How will you close those gaps?",
    points: [
      { label: "acknowledging the gaps honestly", any: ["honest", "true", "do not have", "have not", "no direct", "gap", "limited"] },
      { label: "transferable skills (the same AP, AR and GL flows, tools and accounting)", any: ["transferable", "similar", "same", "payables", "accounting", "general ledger", "flows"] },
      { label: "a concrete learning plan (documentation, a sandbox, shadowing)", any: ["plan", "documentation", "sandbox", "shadow", "course", "practice", "learn"] },
      { label: "a timeline", any: ["week", "month", "days", "first", "by the end", "timeline", "quickly"] },
      { label: "evidence you learn fast (certifications, awards)", any: ["certif", "award", "fast", "quickly", "learned", "oracle"] },
    ],
    model: "That is a fair point and I would not hide it: my hands-on work is in AR, AP, GL, Deal Management and Cash Management. Expenses and Purchasing sit on the same accounting foundation: vouchers, approvals, journals and tolerances, so the concepts transfer. My plan is to study the delivered documentation, work through the flows in a sandbox, and shadow a colleague for the first few weeks. I have learned new areas quickly, as my Oracle AI certifications and Accenture awards show.",
  },
  {
    id: "r3-strength", round: 3, tag: "Behavioural", day: 7,
    q: "What is your biggest strength for this role, and what is a real weakness you are working on?",
    points: [
      { label: "a specific strength tied to the role", any: ["strength", "good at", "strong", "analytical", "detail", "documentation", "testing"] },
      { label: "an example that proves it", any: ["for example", "for instance", "when i", "in my project", "i built", "i led"] },
      { label: "a genuine weakness, not a disguised strength", any: ["weakness", "working on", "improve", "used to", "struggle", "learning"] },
      { label: "what you are doing about the weakness", any: ["working on", "improve", "plan", "practice", "learn", "course", "feedback"] },
    ],
    model: "My strength is careful, evidence-based delivery: I write the requirements and test scripts, and I validate before and after every release, which is why my migrations had zero major issues and my testing reduced post-deployment defects by 20 percent. A weakness I am working on is formal Agile and project planning, because most of my work has followed enhancement and maintenance cycles. I am addressing it by taking more ownership of planning and learning the team's cadence.",
  },
  {
    id: "r3-conflict", round: 3, tag: "Behavioural", day: 7,
    q: "Tell me about a time you disagreed with a colleague or a business user. What happened?",
    points: [
      { label: "the situation and what the disagreement was about", any: ["situation", "disagree", "different view", "conflict", "project"] },
      { label: "listening and understanding the other view", any: ["listen", "understand", "perspective", "asked", "their view"] },
      { label: "using facts or options to resolve it", any: ["data", "fact", "option", "evidence", "compromise", "demo"] },
      { label: "the outcome", any: ["result", "outcome", "agreed", "delivered", "resolved"] },
      { label: "what you learned", any: ["learn", "lesson", "next time", "since then"] },
    ],
    model: "Use the STAR shape with a real story: the situation and the disagreement, for example about scope or an approach; how I listened and clarified their underlying concern; how I used data or a short list of options to reach a decision together; the result, ideally with a number; and what I took from it. Prepare one example from an enhancement where you pushed back during impact analysis.",
    minWords: 60,
  },
  {
    id: "r3-ownership", round: 3, tag: "Behavioural", day: 7,
    q: "Tell me about a mistake or a defect that reached testing or production. How did you handle it?",
    points: [
      { label: "owning it without blaming others", any: ["my mistake", "i missed", "i should", "i own", "responsib", "my responsibility"] },
      { label: "assessing the impact quickly and informing people", any: ["impact", "inform", "told", "communicat", "escalat"] },
      { label: "fixing it and verifying the fix", any: ["fix", "resolve", "verify", "retest", "test"] },
      { label: "finding the root cause", any: ["root cause", "cause", "why it happened"] },
      { label: "a change that prevents it happening again", any: ["prevent", "checklist", "test script", "validation", "process", "since then", "20"] },
    ],
    model: "Pick a real, modest example. Say plainly what went wrong and that it was mine to fix; describe how quickly I assessed the impact and told the people affected; how I fixed and retested it; the root cause; and the change I made so it does not recur, such as adding a test case or a validation. That mindset is why I added more rigorous test scripts and reduced post-deployment defects by 20 percent.",
    minWords: 60,
  },
  {
    id: "r3-pressure", round: 3, tag: "Behavioural", day: 7,
    q: "How do you handle a tight deadline when the priorities keep changing?",
    points: [
      { label: "clarifying priorities with the stakeholders", any: ["clarif", "priorit", "stakeholder", "ask", "confirm"] },
      { label: "breaking work into pieces and focusing on what matters most", any: ["break", "split", "phase", "critical", "most important", "scope"] },
      { label: "communicating risks and trade-offs early", any: ["risk", "trade off", "communicat", "early", "transparent", "update"] },
      { label: "protecting quality and testing", any: ["quality", "test", "validate", "not skip", "regression"] },
      { label: "an example", any: ["for example", "for instance", "when i", "project", "release"] },
    ],
    model: "I first confirm with the stakeholders what really has to ship and what can move, then split the work so the critical parts land first. I tell people early about risks and trade-offs rather than surprise them at the deadline, and I do not skip validation, because a defect costs more than a day. In my releases this approach kept the go-lives stable even when scope shifted.",
  },
  {
    id: "r3-growth", round: 3, tag: "Motivation", day: 7,
    q: "Where do you see yourself in three years, and how will you use your Oracle AI certifications?",
    points: [
      { label: "growing into a senior or lead analyst, owning a process area", any: ["senior", "lead", "own", "process area", "solution", "architect", "grow"] },
      { label: "continuous improvement of finance processes", any: ["improve", "continuous", "automation", "efficien", "optimi"] },
      { label: "AI and automation in finance (AI agents, forecasting, data quality)", any: ["ai", "agent", "automation", "machine learning", "generative", "forecast"] },
      { label: "technology watch: keeping the team informed of trends and the roadmap", any: ["trend", "roadmap", "benchmark", "watch", "new technolog", "innovation"] },
      { label: "staying close to the business and delivering value", any: ["business", "value", "user", "outcome", "customer"] },
    ],
    model: "In three years I want to be a lead analyst who owns a process area end to end and shapes its roadmap. My Oracle AI and AI Agent Studio certifications help me bring technology intelligence to the team: following what AI agents and automation can do for finance processes such as reconciliation and data quality, and proposing practical improvements, always tied to business value.",
  },
  {
    id: "r3-logistics", round: 3, tag: "Logistics", day: 7,
    q: "Some practical questions: your notice period, working from our Pune office, and what would you like to ask us?",
    points: [
      { label: "a clear notice period and availability", any: ["notice", "available", "join", "month", "week", "serve"] },
      { label: "comfort with the Pune office and the work arrangement", any: ["pune", "office", "hybrid", "onsite", "location", "commute"] },
      { label: "a reasonable stance on compensation or openness to discuss", any: ["expect", "compensation", "salary", "market", "discuss", "range", "flexible"] },
      { label: "good questions for them (team, release cadence, roadmap, success in six months)", any: ["team", "cadence", "roadmap", "success", "six months", "expect from", "growth", "training"] },
    ],
    model: "State your actual notice period and the earliest date you can join. I am based in Pune, so working from the Dassault office is comfortable. On compensation I would say I am open to a market-aligned discussion. And I would ask: how the team is structured, how often releases happen, what the IT roadmap looks like, and how success is measured in the first six months.",
  },
];

export const questionsFor = (round: number) => BANK.filter((q) => q.round === round);
export const questionById = (id: string) => BANK.find((q) => q.id === id);
