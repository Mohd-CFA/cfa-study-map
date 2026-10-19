import json
M = 'FSA-LM01'
MODULE = dict(module_id=M, subject='FSA', lm_no=1, schweser_reading=27, title='Introduction to Financial Statement Analysis',
              curriculum_year=2027, schweser_file='FSA-LM01-Schweser.pdf', curriculum_file='FSA-LM01-Curriculum.pdf',
              curr_pdf_offset=-2, schweser_pages=15, curriculum_pages=34, version='1.1', last_updated='2026-10-19')

# los, text, rec, sch_cov, cur_cov, why, why_not, sch_from, sch_to, sch_anchor, cur_from, cur_to, cur_anchor
LOS = [
 ('27.a', 'Describe the steps in the financial statement analysis framework', 'S+X', 90, 100,
  'Schweser lists the six steps clearly. Question banks test step classification heavily (17 questions), and the answer often depends on Curriculum Exhibit 1 (sources and outputs of each phase) — read the 4 Extras, especially the forecasts conflict.',
  'Curriculum pp.5–9 repeats the same steps with long narrative; Exhibit 1 is the only part you need and it is summarised in the Extras.',
  1, 1, 'The financial statement analysis framework sets out', 5, 9, 'Exhibit 1: Financial Statement Analysis Framework'),
 ('27.b', 'Describe the roles of financial statement analysis', 'S', 95, 100,
  'Same definition and decision examples. The most tested trap — reporting provides information, analysis uses it to make decisions — is fully covered in Schweser.',
  'Curriculum adds news examples (Sea Ltd, T-Mobile) — context only.',
  1, 2, 'Financial reporting refers to the way companies', 9, 13, 'The role of financial statement analysis is to use financial reports'),
 ('27.c', 'Describe the importance of regulatory filings, financial statement notes and supplementary information, management’s commentary, and audit reports', 'C', 75, 90,
  'Largest LOS (about half of all questions). Curriculum is more complete on segments, audit assurance, filings and management commentary, and Schweser conflicts with it on 4 points. After reading, check the 4 Schweser-only Extras — question banks test them.',
  'Schweser first would duplicate ~75% and still leave gaps; use it as a 10-minute review afterwards.',
  2, 8, 'Standard-setting bodies are professional organizations', 13, 26, 'Regulatory authorities require publicly traded issuers'),
 ('27.d', 'Describe implications for financial analysis of alternative financial reporting systems and the importance of monitoring developments in financial reporting standards', 'S+X', 80, 100,
  'Schweser has the identical IFRS vs US GAAP table; add four Curriculum points (no reconciliation, convergence status, user perspective).',
  'Curriculum adds the 2007 CFA position paper and comment-letter process — rarely tested.',
  8, 9, 'While the IASB and FASB work together', 27, 29, 'The adoption of IFRS as the required financial reporting standard'),
 ('27.e', 'Describe information sources that analysts use in financial statement analysis besides annual and interim financial reports', 'S', 95, 100,
  'Same four-way classification and examples in half the length.',
  'Curriculum adds consultancy names and the management-bias remark.',
  9, 10, 'As well as regulated information provided by issuers', 30, 31, 'In addition to regulated information from issuers'),
]

# los, direction(CUR = Curriculum adds / SCH = Schweser adds), title, priority, text, page(printed for CUR, Schweser pdf page for SCH), anchor, exam_link
EXTRAS = [
 ('27.a','CUR','Exhibit 1: what each phase produces','Must','Purpose → statement of objective, questions, report content, timetable. Collect → usable financial data, questionnaires. Process → adjusted statements, common-size statements, ratios and graphs. Analyze/interpret → analytical results, forecasts, valuations. Develop & communicate → report answering Phase-1 questions and a recommendation. Follow-up → actual vs expected, revised forecasts, updated reports.',6,'Exhibit 1','Curriculum Q1–2; UWorld Q1,Q4,Q5; AP Q4568,Q4570,Q4572'),
 ('27.a','CUR','Ratios: output of one step, input to the next','Must','Ratios are OUTPUTS of "Process data" and INPUTS to "Analyze/interpret". Asked "ratios are an input into which step?" → Analyze/interpret.',6,'Exhibit 1','Curriculum Q1'),
 ('27.a','CUR','Forecasts: building vs using (see conflict CF-07)','Must','The Curriculum lists "making forecasts" and "performing valuations" as processing activities in the text, but Exhibit 1 shows forecasts and valuations as outputs of Analyze/interpret. Rule for questions: PREPARING/BUILDING a forecast model from collected data → Process data; forecasts and valuations used to reach a conclusion → Analyze/interpret.',7,'Process Data','CF-07'),
 ('27.a','CUR','Define the question before computing ratios','Useful','Do not start calculating ratios before knowing which decision the analysis supports; define audience, deliverable, deadline and resources (resource constraints belong to Phase 1). Data collection often follows a top-down approach: economy → industry → company.',7,'Articulate the Purpose','AP Q4570'),
 ('27.a','CUR','Report contents and Standard V(B)','Useful','An equity report typically includes: summary and conclusion, industry and competitive analysis, financial model/scenarios, valuation, investment risks. Standard V(B): separate facts from opinions, disclose limitations and risks. An opinion on the fairness of statements is the auditor’s job, not part of the analyst report.',8,'Develop and Communicate','AP Q354'),
 ('27.b','CUR','Central focus of financial analysis','Must','Can the company (1) earn a return on capital at least equal to its cost of capital, (2) grow profitably, (3) generate enough cash to meet obligations and pursue opportunities? The role of analysis is to FORM EXPECTATIONS about future performance and position for economic decisions; providing information is the role of financial reporting.',4,'Introduction','Curriculum Q3–4; UWorld Q16'),
 ('27.b','CUR','Managers vs external analysts','Useful','Managers also analyse the company but do not rely only on financial statements because they have non-public information.',9,'Scope of Financial Statement Analysis',''),
 ('27.b','CUR','Sea Ltd and T-Mobile examples','Example','Earnings news is judged against analysts’ expectations (equity view); rating actions focus on leverage and free cash flow (credit view).',10,'Exhibit 2',''),
 ('27.c','CUR','Definition of an operating segment','Must','A component that (1) may earn revenue and incur expenses (a start-up segment qualifies), (2) has results regularly reviewed by the chief operating decision maker (CODM), and (3) has discrete financial information.',19,'Business and Geographic Segment','CF-03'),
 ('27.c','CUR','Reportable segment thresholds','Must','Report a segment if it is ≥10% of the COMBINED operating segments’ revenue, assets or |profit| (profit test vs the greater of total profits or total losses). If reportable segments’ external revenue is <75% of TOTAL revenue, add segments until 75%. Others go to "all other segments".',19,'quantitative criteria','CF-03; AP Q4579'),
 ('27.c','CUR','Required segment disclosures','Must','Revenue (external vs inter-segment); profit or loss; assets and liabilities only if reviewed by the CODM; interest revenue/expense; PP&E and intangibles acquired; D&A; other non-cash expenses; income tax; equity-method share. Plus factors used to identify segments and a reconciliation to consolidated totals. Segment COGS / full statements are NOT required.',19,'For each reportable segment','CF-04; Schweser quiz Q6'),
 ('27.c','CUR','Major customer disclosure','Must','A customer ≥10% of total revenue must be disclosed (not its identity) — concentration risk.',21,'reliance on any single customer',''),
 ('27.c','CUR','Notes: flexibility reduces comparability','Must','Notes give basis of preparation and accounting policies, methods and estimates. Choices (e.g., depreciation method, useful life) reflect each firm’s economics but reduce comparability, so analysts adjust. Notes also cover acquisitions/disposals, contractual and off-balance-sheet obligations, financial-instrument risks, legal proceedings, related parties, subsequent events.',18,'Financial Notes and Supplementary','Curriculum Q8–9; CF-08'),
 ('27.c','CUR','Reasonable, not absolute, assurance','Must','Audits use sampling and statements contain estimates → only REASONABLE assurance of fair presentation ("true and fair view"): a high probability of no MATERIAL error, fraud or illegal acts. Never a guarantee; preventing fraud is not the objective.',23,'Audits are designed and conducted','Curriculum Q14; UWorld Q9'),
 ('27.c','CUR','Four audit opinions','Must','Unqualified (clean) — preferred. Qualified — scope limitation OR exception to standards ("except for..."). Adverse — materially not fairly presented. Disclaimer — unable to issue an opinion.',23,'An unqualified audit opinion','Curriculum Q12–13; UWorld Q11; AP Q5044; CF-02'),
 ('27.c','CUR','Key vs Critical Audit Matters','Must','KAM (international, ISA 701): matters the auditor considers most important. CAM (US, PCAOB AS 3101): especially challenging, subjective or complex auditor judgment. NOT necessarily the most important factors for analysts.',23,'Key Audit Matters',''),
 ('27.c','CUR','Interim reports are unaudited','Must','10-Q (quarterly, US) and 6-K (semiannual, many non-US) contain unaudited statements and an interim MD&A.',16,'Forms 10-Q and 6-K','Curriculum Q15; AP Q1798'),
 ('27.c','CUR','Annual report vs Form 10-K','Must','10-K / 20-F / 40-F are required annual SEC filings (8-K is a current report, not annual). The polished annual report to shareholders is NOT an SEC requirement.',15,'Forms 10-K, 20-F, and 40-F','AP Q4578'),
 ('27.c','CUR','Registration statement contents','Must','Disclosures about the securities, relation to other securities, annual-filing information, recent audited statements, RISK FACTORS. No projections, no underwriter opinions.',15,'Securities Offerings Registration','Knowledge check p.16'),
 ('27.c','CUR','Management commentary: five elements','Must','IFRS Practice Statement (guidance, not a standard): nature of business; objectives and strategies; resources, risks and relationships; results; critical performance measures. US MD&A must cover trends and uncertainties affecting liquidity, capital resources and results; inflation; off-balance-sheet and contractual obligations; critical accounting policies. Mostly unaudited.',22,'Management Commentary','Curriculum Q11; AP Q344, Q1811, Q5054; CF-08, CF-09'),
 ('27.c','CUR','US securities laws and SOX','Useful','1933 Act: registration of new issues. 1934 Act: created the SEC, periodic reporting. SOX 2002: created the PCAOB; restricts non-audit services; executives certify statements; management reports on internal control and the auditor attests.',14,'Securities Act of 1933','AP Q4577'),
 ('27.c','CUR','Other SEC forms','Useful','8-K/6-K current reports; Forms 3/4/5 insider ownership; Form 144 notice of proposed sale of restricted/affiliate securities; 11-K employee plans; DEF-14A proxy. Forms are rarely tested.',17,'Form 8-K','CF-01'),
 ('27.c','CUR','IOSCO is not a regulator','Useful','IOSCO members regulate >95% of markets but IOSCO itself does not regulate or enforce; it is a platform for common standards. Three objectives: protect investors; fair, efficient, transparent markets; REDUCE (not eliminate) systemic risk.',13,'International Organization of Securities','Curriculum Q7; AP Q4575–4576'),
 ('27.c','CUR','EU endorsement process','Skip','EU listed companies use IFRS since 2005; ESC advises, ESMA coordinates supervision.',17,'Capital Markets Regulation in Europe','CF-06'),
 ('27.c','CUR','Sea Ltd segment, MD&A and audit report','Example','E-commerce >50% of revenue but loss-making; clean opinion with two CAMs.',20,'Exhibit 4',''),
 ('27.c','SCH','Three parts of the standard auditor’s opinion','Must','(1) Statements are management’s responsibility; the auditor performed an independent review. (2) Generally accepted auditing standards were followed → reasonable assurance of no material errors. (3) Statements follow accepted accounting principles and the principles and estimates are reasonable. Extra explanation if methods were not applied consistently.',7,'The standard auditor’s opinion contains three parts','Schweser QBank Q9, Q12; AP Q1792'),
 ('27.c','SCH','Explanatory paragraph for material uncertainty','Must','Added when a material loss is probable but cannot be estimated — going-concern doubt, asset valuation, litigation. A statement that GAAP was followed is part of the standard report, not an explanatory paragraph.',8,'explanatory paragraph','Schweser QBank Q17'),
 ('27.c','SCH','Footnotes are audited; MD&A is not','Must','Notes are an integral part of the financial statements and are covered by the audit opinion; management commentary is largely unaudited; interim reports and press releases are unaudited.',4,'They are audited along with','Schweser QBank Q2, Q20; UWorld Q15; AP Q1803'),
 ('27.c','SCH','IFRS recommends, regulators require','Useful','IFRS guidance RECOMMENDS the content of management commentary; it is not required by accounting standards. Securities regulators (e.g., SEC) may require it.',6,'IFRS guidance recommends','Schweser QBank Q3'),
 ('27.c','SCH','Internal control responsibility','Useful','Internal controls are management’s responsibility (not the board’s). For US public firms the auditor gives an opinion on internal control (separately or as a fourth element of the report). Weak controls allow low-quality or fraudulent reporting.',8,'Internal controls are the processes','Schweser QBank Q22; UWorld Q14'),
 ('27.c','SCH','Using segment data','Useful','Segment margins, asset turnover and ROA, and segment growth rates help forecast sales and profits.',5,'Both US GAAP and IFRS require','' ),
 ('27.d','CUR','No reconciliation between IFRS and US GAAP','Must','Reconciliation disclosures are not required → analysts often lack the data to adjust and must interpret cross-standard comparisons with caution.',27,'Because reconciliation disclosures','AP Q4582'),
 ('27.d','CUR','Status of convergence','Must','Convergence of frameworks paused in the late 2000s, but major new standards (revenue, leases, credit losses) are mostly converged.',27,'In general, the IASB and FASB','AP Q4582'),
 ('27.d','CUR','Monitor as a user, not a preparer','Must','An accountant monitors standards as a preparer; an analyst as a user — how changes affect reports and valuation.',28,'Monitoring Developments','UWorld Q10; AP Q4583'),
 ('27.d','CUR','New products and window dressing','Useful','New transactions may lack guidance or be designed for window dressing. Be suspicious when management cannot explain the business purpose.',28,'New Products or Types of Transactions','Schweser QBank Q19'),
 ('27.d','CUR','Exposure drafts; recognition vs disclosure','Useful','Analysts can read exposure drafts and submit comment letters. Items recognized in statements get more rigor than items only disclosed in notes.',29,'Evolving Standards','UWorld Q10'),
 ('27.d','CUR','2007 CFA Institute position paper','Skip','Fair value, neutrality, direct-method cash flow statement.',29,'In 2007, CFA Institute issued',''),
 ('27.e','CUR','Bias in issuer communications','Useful','Earnings calls are not legally required; management is biased → ask probing questions. Issuer communications are unaudited and not objective (press releases).',30,'Earnings calls','Schweser QBank Q11'),
 ('27.e','CUR','Internal vs external sources','Useful','External = not produced by the company (peer analysis, industry and government data, trade publications). Proxy statements, earnings calls and MD&A are company (internal) sources.',31,'Information on the economy, industry, and peer companies','Curriculum Q16; UWorld Q17; AP Q352'),
 ('27.e','CUR','Industry data providers','Example','Rystad (energy), IQVIA and Evaluate (biopharma), Gartner and IDC (technology).',31,'Proprietary third-party sources',''),
]

# conflict_id, los, topic, schweser, sch_page, curriculum, cur_page, use_for_exam, risk, evidence
CONFLICTS = [
 ('CF-01','27.c','Form 144','Notice to the SEC when issuing securities to qualified buyers without registration.',4,'Notice of proposed SALE of restricted or affiliate securities.',17,'Curriculum','Low',''),
 ('CF-02','27.c','Qualified opinion','Exceptions to accounting principles only; scope limitation → disclaimer.',8,'Scope limitation OR exception to standards.',23,'Curriculum','High','UWorld Q11: incomplete records → qualified'),
 ('CF-03','27.c','Segment 10% test','>10% of the company’s revenues, assets or income.',5,'≥10% of COMBINED operating segments’ revenue, assets or |profit|; CODM review; discrete information.',19,'Curriculum','Medium','AP Q4579 uses Curriculum wording'),
 ('CF-04','27.c','Segment assets and liabilities','Always disclosed.',6,'Only if regularly reviewed by the CODM.',19,'Curriculum','Medium',''),
 ('CF-05','27.c','Nature of standard setters','"Professional organizations of accountants and auditors" (p.2) vs "private sector organizations" (p.12).',2,'Private-sector bodies without enforcement authority.',13,'Private sector, no enforcement power','Low',''),
 ('CF-06','27.c','EU advisory body','"European Securities Commission".',3,'"European Securities Committee (ESC)".',17,'Curriculum','Low',''),
 ('CF-07','27.a','Where do forecasts belong?','Process = adjustments, ratios, statistics, exhibits (no forecasts).',1,'Text: processing may include forecasts and valuations (p.7–8). Exhibit 1: forecasts and valuations are OUTPUTS of Analyze/interpret (p.6).',6,'Building/preparing a forecast model → Process data. Forecasts/valuations as results that support a conclusion → Analyze/interpret.','High','UWorld Q4 and AP Q5042 → Process; AP Q4572 → Analyze'),
 ('CF-08','27.c','Contractual commitments and off-balance-sheet obligations','MD&A must discuss them (p.7).',7,'MD&A must provide information on them (p.22) AND notes disclose contractual obligations incl. off-balance-sheet debt (p.18).',22,'"Discussed/described" → MD&A. "Detailed/quantitative schedules" → notes.','Medium','AP Q344 → MD&A; AP Q5049 → notes'),
 ('CF-09','27.c','Critical accounting policies','MD&A discusses policies requiring significant judgment (p.7); notes give methods and estimates (p.4).',7,'Same split (p.18, p.22).',22,'Policy, method or estimate itself → notes. Discussion of the judgment and its impact → MD&A.','Medium','AP Q347, Q343 → notes; AP Q5054 → MD&A'),
]

K = json.load(open('/home/claude/web/keys.json'))
def los_of(src, n):
    return {}
Q = []
# Curriculum EOC
cur_los = {1:'27.a',2:'27.a',3:'27.b',4:'27.b',5:'27.c',6:'27.c',7:'27.c',8:'27.c',9:'27.c',10:'27.c',11:'27.c',12:'27.c',13:'27.c',14:'27.c',15:'27.c',16:'27.e'}
for n,a,_ in K['CURRICULUM']: Q.append(('Curriculum',n,cur_los[n],a,'In LM1','',''))
Q.append(('Curriculum KC',1,'27.c','B','In LM1','','Knowledge check p.16 — not in the practice file'))
# Schweser QBank (answers read from explanations)
sch_ans = {1:'A',2:'B',3:'C',4:'A',5:'C',6:'A',7:'C',8:'C',9:'B',10:'A',11:'A',12:'B',13:'C',14:'C',15:'C',16:'A',17:'B',18:'A',19:'A',20:'C',21:'A',22:'C'}
sch_flags = {16:('Off-curriculum detail','EDGAR is not in the 2027 Curriculum or Schweser notes'),21:('Off-curriculum detail','EDGAR is not in the 2027 Curriculum or Schweser notes'),
             17:('In LM1','Schweser-only content — see Extra "Explanatory paragraph"'),12:('In LM1','Schweser-only content — three parts of the auditor’s opinion'),3:('In LM1','Schweser-only wording: IFRS recommends')}
for n,a,l in K['SCHWESER']:
    sc,note = sch_flags.get(n,('In LM1',''))
    Q.append(('Schweser QBank',n,l,sch_ans[n],sc,'',note))
for n,l,a in [(1,'27.b','B'),(2,'27.c','B'),(3,'27.c','C'),(4,'27.c','B'),(5,'27.a','B'),(6,'27.c','B'),(7,'27.e','A')]:
    Q.append(('Schweser Quiz',n,l,a,'In LM1','','Module Quiz 27.1 inside the Schweser notes'))
uw_los = {1:'27.a',2:'27.c',3:'27.c',4:'27.a',5:'27.a',6:'27.b',7:'27.b',8:'27.c',9:'27.c',10:'27.d',11:'27.c',12:'27.b',13:'27.b',14:'27.c',15:'27.c',16:'27.b',17:'27.e'}
uw_flag = {6:('Later module','Income statement elements — covered in Analyzing Income Statements'),7:('Later module','Balance sheet role — covered in Analyzing Balance Sheets'),
           12:('Later module','Cash flow statement use — covered in Cash Flow modules'),13:('Later module','Statement of changes in equity — later module'),
           4:('In LM1','CF-07: building a forecast → Process data'),11:('In LM1','CF-02: incomplete records (scope limitation) → qualified')}
for n,a,_ in K['UWORLD']:
    sc,note = uw_flag.get(n,('In LM1',''))
    Q.append(('UWorld',n,uw_los[n],a,sc,'',note))
ap_los = {245:'27.c',343:'27.c',344:'27.c',347:'27.c',352:'27.e',353:'27.b',354:'27.a',1790:'27.c',1792:'27.c',1798:'27.c',1803:'27.c',1811:'27.c',1814:'27.c',
          4568:'27.a',4570:'27.a',4572:'27.a',4575:'27.c',4576:'27.c',4577:'27.c',4578:'27.c',4579:'27.c',4580:'27.d',4581:'27.d',4582:'27.d',4583:'27.d',
          4586:'27.e',4587:'27.e',4588:'27.e',4589:'27.e',5042:'27.a',5043:'27.b',5044:'27.c',5045:'27.d',5046:'27.e',5047:'27.a',5048:'27.b',5049:'27.c',
          5050:'27.d',5051:'27.e',5052:'27.a',5053:'27.b',5054:'27.c',5055:'27.d',5056:'27.e'}
ap_flag = {
 354:('In LM1','Quality','AnalystPrep tags it 1c; it belongs to 27.a (report contents)'),
 5042:('In LM1','Answer key','Key says A (Process data) but the explanation also says "B is correct". Mentor: A is right (CF-07).'),
 4572:('In LM1','','CF-07: forecasts and valuations as results → Analyze/interpret'),
 5045:('Later module','','Investment property fair value vs cost — covered in long-lived assets'),
 5050:('Later module','','Retrospective restatement for a new standard — later module'),
 5043:('In LM1','Taxonomy','Role categories (credit / management & strategy / other) are AnalystPrep’s own, not Curriculum wording'),
 5048:('In LM1','Taxonomy','Role categories are AnalystPrep’s own, not Curriculum wording'),
 5053:('In LM1','Taxonomy','Role categories are AnalystPrep’s own, not Curriculum wording'),
 344:('In LM1','','CF-08: "described" → MD&A'),5049:('In LM1','','CF-08: detailed schedules → notes'),5054:('In LM1','','CF-09: discussion of judgment → MD&A'),
}
for n,a,_ in K['ANALYSTPREP']:
    sc,fl,note = ap_flag.get(n,('In LM1','',''))
    Q.append(('AnalystPrep',n,ap_los[n],a,sc,fl,note))
for i,q in enumerate(Q):
    src,n,l,a,sc,fl,note = q
    flag = fl or ('' if not note else '')
    Q[i] = (src,n,l,a,sc,flag,note)

SOURCES = [
 ('SRC-SCH','Schweser 2027 notes','Primary','Keep',''),
 ('SRC-CUR','CFA Curriculum 2027','Primary','Keep',''),
 ('SRC-IFT','IFT LM01 Notes','Validation','Duplicate so far','Confirm by LM5'),
 ('SRC-EXT1','Learning-Module-1 (external)','Validation','Drop candidate (strong)','Near-verbatim copy of Schweser'),
 ('SRC-EXT2','Introduction.pdf','Validation','Drop candidate (strong)','Not LM1 content; DDB year 4/5 error'),
 ('SRC-EXT3','FSA-Introduction.pdf','Validation','Re-test later','Belongs to Inventory / long-lived assets'),
 ('SRC-QSCH','Schweser QBank','Question bank','Keep','22 Qs; 2 off-curriculum (EDGAR); tests 3 Schweser-only points'),
 ('SRC-QUW','UWorld','Question bank','Keep','17 Qs; best explanations; 4 belong to later modules'),
 ('SRC-QAP','AnalystPrep','Question bank','Keep — watch quality','44 Qs (most volume, most application-style); 1 inconsistent key, 3 non-Curriculum taxonomy, 2 later-module'),
 ('SRC-QCUR','Curriculum practice problems','Question bank','Keep — highest priority','16 Qs + 1 knowledge check; closest to exam wording'),
]
