// Source material that gets merged with the candidate's resume to drive every question.

export const JD = `Role: Business Process Analyst, Dassault Systèmes Information Systems (Digital Enterprise Systems), Pune.
Scope: PeopleSoft ERP modules for OTC (Order to Cash), PTP (Procure to Pay) and ESA (Enterprise Supplier Application), plus Travel & Expense.
Acts as the bridge between business process owners and IT; collaborates with teams at HQ (Velizy, France) and North America (Waltham).

Responsibilities:
- Liaison: work with business process owners, understand AND challenge their needs, propose efficient IT solutions.
- Requirements: gap analysis, functional requirements, technical specs (alone or with developers), recommendations/proposals.
- Support: Level-2 incidents, ongoing enhancements (modules and integrations), on-demand configuration, advise business customers.
- Project management: project plans from specs, sequence development steps, schedule/monitor delivery, lead arbitrations, run integration tests, manage dependencies, oversee deployment to go-live.
- Testing & training: test plans, training docs and user guides, train-the-trainer (3DEXPERIENCE University).
- Release management: define content of each drop/release.
- Technological intelligence: monitor trends, benchmarks/competition reports, anticipate needs, stay aligned with the IT roadmap and release cadence.

Requirements: 3-5 years in a similar domain, preferably hands-on PeopleSoft ERP configuration and setup (not just end-user). BE/BTech.
Domain: P2P, R2R (Record to Report), OTC, Travel & Expense, ESA.
Core skills: business process analysis, requirement gathering, solution design, continuous improvement, strong PS Query and SQL, analytical/problem solving, communication and collaboration.
Additional: Agile project management, business requirements techniques, software specification analysis, business acumen, customer relationship building, aligning software with system architectures, business process and data models, software architecture definition.`;

export const DASSAULT = `About Dassault Systèmes (general knowledge, verify anything specific before quoting it in an interview):
- French software company, "The 3DEXPERIENCE Company", headquartered in Vélizy-Villacoublay near Paris; spun out of Dassault Aviation in 1981.
- Known for CATIA (design), SOLIDWORKS (CAD), SIMULIA (simulation), DELMIA (manufacturing/operations), ENOVIA (collaboration/PLM), BIOVIA (science/materials), plus the 3DEXPERIENCE platform and "virtual twin" experiences. Serves industries such as transportation, aerospace, life sciences, industrial equipment and consumer goods.
- Pune is a large engineering and corporate-functions centre in India.
- This role sits in the internal IT group (Digital Enterprise Systems) that runs the company's own finance/ERP systems, so the product knowledge asked is usually light (what the company does, what 3DEXPERIENCE is), while the depth is in PeopleSoft finance processes.
- The JD says teams are global (France, North America), so expect questions on cross-timezone collaboration, written English and documentation quality.

Interview pattern reported by past candidates (anonymous Glassdoor reviews, anecdotal, not official):
- Technical round on domain and SQL/data fundamentals, puzzles or logic questions sometimes, then managerial round, sometimes HR.
- Questions on "what do you know about the company and its products", and deep-dives into things listed on the resume.

The candidate's stated process for THIS role: Round 1 normal technical; Round 2 half-hour round with leads; Round 3 round with the manager.
Open assumption: "ESA" is probably a supplier-facing/supplier-onboarding application in PeopleSoft's supplier ecosystem. The candidate should confirm the exact meaning with the recruiter.`;

export type Slot = { title: string; type: "written" | "sql" | "scenario"; seed: string };
export type Day = { n: number; theme: string; notes: string[]; slots: [Slot, Slot] };

export const CURRICULUM: Day[] = [
  {
    n: 1,
    theme: "Dassault, the role, and the ERP landscape",
    notes: [
      "Dassault Systèmes: 3DEXPERIENCE platform, brand portfolio (CATIA, SOLIDWORKS, SIMULIA, DELMIA, ENOVIA, BIOVIA) and industries served.",
      "The Business Process Analyst is a translator: business need in, functional spec and configuration out, then test, train, release.",
      "PeopleSoft Financials in one picture: Purchasing, Payables, Billing, Accounts Receivable, General Ledger, Expenses, eProcurement, Supplier portal.",
      "Be able to say in 60 seconds: who you are, what PeopleSoft work you have done, why this role.",
    ],
    slots: [
      { title: "Your 90-second pitch", type: "written", seed: "Write the spoken pitch for 'tell me about yourself' tailored to this role, built from the candidate's real resume." },
      { title: "Map the three processes", type: "scenario", seed: "Draw (describe in text) the end-to-end flow of P2P, OTC and Travel & Expense, naming the PeopleSoft module and the key document at each step." },
    ],
  },
  {
    n: 2,
    theme: "Procure to Pay (PTP) deep dive",
    notes: [
      "Flow: requisition, sourcing/approval, purchase order, receipt, voucher, matching (2-way / 3-way), payment, GL posting.",
      "Matching tolerances, exceptions and holds are where most L2 incidents come from.",
      "Config areas: business units, SetIDs, vendor setup, payment terms, approval workflows, chartfields, distribution.",
      "Typical gap analysis: standard PeopleSoft behaviour vs. what the business wants, then options (configure, customise, process change).",
    ],
    slots: [
      { title: "Gap analysis on a PTP request", type: "scenario", seed: "A business owner wants invoices auto-approved under a threshold without a receipt. Do a gap analysis and recommendation." },
      { title: "PS Query / SQL on vouchers and POs", type: "sql", seed: "SQL exercise on simplified voucher, vendor and PO tables: unmatched vouchers, ageing, duplicates." },
    ],
  },
  {
    n: 3,
    theme: "Order to Cash (OTC)",
    notes: [
      "Flow: customer setup, sales order/contract, billing, invoice, receivable item, collection/cash application, reconciliation, GL.",
      "Key objects: customer, bill-to, billing interface/consolidation, items, payments, deductions, aging.",
      "Integration points matter: upstream order systems and downstream GL, tax, bank.",
      "L2 incidents: stuck billing interface, unapplied cash, duplicate invoices, wrong tax or currency.",
    ],
    slots: [
      { title: "Write a functional requirement", type: "written", seed: "Write a functional requirement (user story + acceptance criteria) for a new OTC enhancement relevant to a global software company." },
      { title: "L2 incident: unapplied cash", type: "scenario", seed: "Payments received but remain unapplied in AR. Walk through triage, root cause hypotheses, fix and communication." },
    ],
  },
  {
    n: 4,
    theme: "ESA, Travel & Expense, and Record to Report",
    notes: [
      "ESA (supplier-facing application, confirm exact scope with recruiter): supplier onboarding, self-service, data quality, link to Payables.",
      "Travel & Expense: expense report lifecycle, policy rules, approvals, cash advances, reimbursements, integration to Payables and GL.",
      "R2R: journal entries, ledgers, period close, reconciliation, reporting. Know how sub-ledgers feed the GL.",
      "Controls and audit: segregation of duties, approvals, audit trail. Finance users care about these.",
    ],
    slots: [
      { title: "Design a supplier onboarding flow", type: "written", seed: "Propose the process, data fields, approvals and controls for onboarding a new supplier through a supplier-facing application." },
      { title: "Expense policy change", type: "scenario", seed: "Finance wants a new per-diem rule for international travel. Describe analysis, configuration, testing, training and rollout." },
    ],
  },
  {
    n: 5,
    theme: "SQL, PS Query and data models",
    notes: [
      "SQL fluency: joins, aggregation, subqueries, window functions, effective-dated rows (PeopleSoft's EFFDT / EFFSEQ pattern).",
      "PS Query: records, criteria, prompts, joins, expressions, scheduling and sharing queries.",
      "Think in business-process and data models: entities, keys, relationships, where the source of truth lives.",
      "Always sanity-check results: row counts, duplicates from joins, null handling.",
    ],
    slots: [
      { title: "SQL: effective-dated data", type: "sql", seed: "SQL with effective-dated vendor/customer rows: latest active row, history changes, and a reconciliation query." },
      { title: "Explain a data model", type: "written", seed: "Model the data for the process most relevant to the candidate's resume and explain how you would validate it." },
    ],
  },
  {
    n: 6,
    theme: "Agile, projects, testing, release and training",
    notes: [
      "Agile for ERP: backlog, user stories, sprints, UAT, release trains; how you balance fixed finance calendars (period close) with iterations.",
      "Test strategy: unit, integration, regression, UAT; test data; defect triage; go/no-go criteria.",
      "Release management: drop content, dependencies, rollback plan, communication.",
      "Training: user guides, train-the-trainer, using 3DEXPERIENCE University.",
    ],
    slots: [
      { title: "Plan a release", type: "scenario", seed: "Plan a release containing three enhancements and a hotfix across time zones. Define content, tests, dependencies, risks and go-live." },
      { title: "Handle a difficult stakeholder", type: "written", seed: "A process owner insists on a customisation you think is wrong. Write how you would challenge and resolve it (STAR style)." },
    ],
  },
  {
    n: 7,
    theme: "Full mock, behavioural, and tech intelligence",
    notes: [
      "Behavioural: STAR stories ready for conflict, ambiguity, deadline pressure, mistakes, influencing without authority.",
      "Technology watch: Oracle's PeopleSoft roadmap and cloud migration trends, low-code, automation of finance processes, AI in finance.",
      "Questions to ask them: team structure, release cadence, roadmap, how success is measured in 6 months.",
      "Logistics: Pune office, notice period, expectations. Be ready for the manager round.",
    ],
    slots: [
      { title: "Technology watch brief", type: "written", seed: "Write a one-page brief on one trend that could affect ERP finance processes at Dassault, with a recommendation." },
      { title: "Your STAR story bank", type: "written", seed: "Write four STAR stories from the candidate's real experience matched to the JD's competencies." },
    ],
  },
];

export const ROUNDS = {
  1: {
    name: "Round 1: Technical",
    questions: 8,
    persona: "a senior PeopleSoft functional/technical consultant on the Dassault panel",
    focus:
      "PeopleSoft P2P/OTC/T&E configuration and process knowledge, PS Query and SQL (ask SQL to be reasoned aloud), data models, L2 incident troubleshooting, gap analysis. Include one or two probes into specific resume claims. Include one logic/puzzle style question.",
  },
  2: {
    name: "Round 2: Leads (30 min)",
    questions: 6,
    persona: "a team lead from Digital Enterprise Systems, collaborating across France and North America",
    focus:
      "Requirement gathering and challenging stakeholders, writing specs, project planning, testing and release, working with developers and global teams, Agile, how the candidate handled real projects on the resume. Include 'what do you know about Dassault and 3DEXPERIENCE'.",
  },
  3: {
    name: "Round 3: Manager",
    questions: 6,
    persona: "the hiring manager",
    focus:
      "Motivation for this role and Dassault, ownership, handling conflict and ambiguity, growth, strengths and gaps versus the JD (probe honestly), communication, team fit, career plans, expectations about Pune office and notice period.",
  },
} as const;
export type RoundNo = keyof typeof ROUNDS;
