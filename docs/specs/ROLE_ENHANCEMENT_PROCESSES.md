# Role Enhancement Processes — Per Department

**Date:** 2026-04-19
**Status:** Content spec (feeds Phase 2 UI: Manager → Roles & Responsibilities tab, Admin → Workflows tab)
**Scope:** Continuous-improvement / enhancement workflows executed by **Manager** and **Team Member (Employee)** roles across all 14 CPG departments.

## Pattern

Every enhancement process entry answers four questions:
- **Name** — what the process is called
- **Description** — one sentence on what happens
- **Trigger** — schedule / event / on-demand
- **KPI moved** — the metric this improves

This catalog feeds:
1. **Admin → Workflows tab** (ops + config view of the process)
2. **Manager → Roles & Responsibilities tab** (responsibilities per role)
3. **Manager → Team Performance tab** (adherence metrics)

---

## 1. Sales & Demand  📈

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Territory rebalancing** | Reassign accounts / regions based on performance + capacity | Quarterly + on attrition | Revenue per rep, coverage % |
| **Forecast accuracy review** | Inspect model error patterns, promote challenger if MAPE beats champion | Monthly | Forecast MAPE |
| **Pipeline hygiene audit** | Flag stale deals, enforce stage-transition discipline | Weekly | Pipeline coverage ratio |
| **Win/loss readout** | Structured post-mortem → update playbook | After each closed deal > $X | Win rate %, avg deal cycle |
| **Discount-desk policy tune** | Raise/lower auto-approve thresholds based on margin leakage | Monthly | Net margin %, discount rate |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **CRM hygiene sweep** | Deduplicate contacts, fill missing fields, update stages | Daily | Data quality % |
| **Lead-score calibration** | Flag false positives/negatives back to ML team | On lead feedback | Lead → SQL conversion |
| **Activity pattern review** | Compare own call/email counts to top-quartile peers | Weekly | Activities per rep |
| **Talk-track A/B** | Test new pitch line, record outcome | Per sales call | Conversion per pitch |

---

## 2. Supply Chain  🔗

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Supplier diversification** | Add/replace suppliers based on risk + cost + lead-time | Quarterly | Supplier concentration, OTIF |
| **Safety-stock tuning** | Adjust reorder points per volatility | Monthly | Stockout rate, working capital |
| **S&OP cycle review** | Reconcile demand vs supply plans with Sales + Ops | Monthly | Plan attainment % |
| **Lane optimization** | Switch modes / carriers / routes based on cost + transit | Quarterly | Cost per unit shipped |
| **Exception playbook update** | Encode newly-seen disruptions as automated responses | After each major incident | Incident MTTR |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Cycle count** | Physical inventory audit of a bin/zone | Daily rolling | Inventory accuracy % |
| **PO exception triage** | Work queue of delayed/short-shipped POs | Daily | PO on-time % |
| **Supplier score review** | Update KPI card with this week's receipts | Weekly | Supplier OTIF |
| **Demand anomaly feedback** | Mark false-positive anomalies back to model | On alert | Anomaly precision |

---

## 3. Logistics  🚚

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Network redesign** | Revisit DC footprint, cross-dock choices | Annual + on volume shift | Cost per case, transit days |
| **Carrier RFP** | Re-bid lanes, renegotiate | Annual | Freight cost/unit |
| **Last-mile pilot** | Test new provider / mode on a segment | Quarterly | Last-mile cost, CSAT |
| **Route-planner tuning** | Update optimization weights (speed vs cost) | Monthly | On-time delivery % |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Delivery exception close-out** | Resolve failed delivery, capture root cause | On exception | Exception resolution time |
| **Yard check-in audit** | Verify truck seal / paperwork, flag issues | Per arrival | Dock turnaround |
| **Fleet telemetry review** | Flag idle / harsh-braking / over-speed events | Daily | Fuel per mile, safety score |

---

## 4. Manufacturing  🏭

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **OEE improvement sprint** | Kaizen event on bottleneck line | Monthly | OEE % |
| **SKU-to-line re-routing** | Move products to best-fit line based on yield + throughput | Quarterly | Schedule attainment |
| **Defect root-cause board** | Track top 5 defects, assign CAPA owners | Weekly | Defect rate |
| **Energy & waste review** | Tune runtime + scrap to reduce cost per case | Monthly | Cost per case, scrap % |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Shift handoff checklist** | Pass open issues cleanly between crews | Per shift change | First-pass yield |
| **Andon / stop-and-fix** | Pull line, escalate, document | On defect cluster | MTBF, FPY |
| **Pre-run calibration** | Verify machine setpoints before SKU change | Per changeover | Changeover time |

---

## 5. Maintenance  🔧

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **PM cycle optimization** | Adjust preventive maintenance intervals based on failure data | Quarterly | Unplanned downtime |
| **Spare-parts stocking** | Re-level critical spares per failure probability | Monthly | MTTR, parts availability |
| **Predictive-model retraining** | Retrain on fresh sensor data; evaluate recall/precision | Monthly | Early-warning precision |
| **Reliability review** | Pareto of top failures, assign fixes | Monthly | MTBF |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Work-order close-out** | Document actual vs planned hours + parts | Per WO | PM compliance % |
| **Vibration / thermal round** | Manual sensor sweep on non-wired assets | Weekly | Early-detection count |
| **Safety lockout audit** | Verify LOTO compliance | Per repair | Safety incidents |

---

## 6. Retail  🛒

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Planogram refresh** | Update shelf layouts per category performance | Seasonal | Sales per linear ft |
| **Price architecture review** | Re-tier good/better/best pricing | Quarterly | Margin %, units/visit |
| **Channel-mix rebalance** | Shift trade spend across retailers based on uplift | Quarterly | Trade ROI |
| **Store-clustering refresh** | Regroup stores by format + demand pattern | Semi-annual | Allocation accuracy |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Shelf compliance audit** | Photo-based check of planogram adherence | Weekly | Compliance % |
| **Out-of-stock resolution** | Triage empty-shelf alert, flag root cause | On CV alert | On-shelf availability |
| **Promotion execution check** | Verify displays / end-caps live in-store | Campaign launch | Exec-compliance % |

---

## 7. Customer Analytics  👥

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Segment definition review** | Validate segment boundaries vs new behavior | Quarterly | Segment migration stability |
| **Churn-model retraining** | Refresh features + retrain; compare recall | Monthly | Churn prediction precision |
| **Loyalty program tune** | Adjust tier thresholds / benefits based on LTV lift | Semi-annual | LTV, redemption % |
| **NPS action loop** | Route detractor feedback to owners; track closure | Weekly | NPS |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Churn-risk outreach** | Contact top-N at-risk customers with save offer | Daily | Save rate |
| **Segment-quality tagging** | Mark mis-segmented customers back to model | On anomaly | Segment precision |
| **Feedback tagging** | Annotate survey / review comments for downstream NLP | Continuous | Tag agreement % |

---

## 8. Finance  💰

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Trade-spend waterfall review** | Decompose variance, reassign budget | Monthly | Trade ROI |
| **Margin bridge build** | Decompose margin change by driver | Quarterly | Gross margin % |
| **Scenario plan refresh** | Rerun price × volume × cost scenarios | Quarterly | Scenario P&L band |
| **Forecast consolidation** | Reconcile dept forecasts → corporate | Monthly | Forecast accuracy % |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Accrual clean-up** | Reconcile + close open accruals | Monthly close | Close cycle days |
| **AP / AR exception queue** | Work disputed invoices + aging | Daily | DSO, DPO |
| **Variance tagging** | Assign cause codes to budget variance | Month-end | Variance explained % |

---

## 9. Procurement

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Strategic sourcing event** | RFX for a category, re-award | Annual | Cost savings % |
| **Contract renewal pipeline** | Track expiring contracts 90 days out | Quarterly | On-time renewals |
| **Supplier risk review** | Score financial / geo / ESG risk | Quarterly | Supplier risk index |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **3-way match triage** | Resolve PO / GR / invoice mismatches | Daily | Match rate % |
| **Vendor onboarding checklist** | KYC + banking + diligence | Per new vendor | Onboarding days |
| **Spend classification** | Tag off-contract spend back to catalog | Weekly | On-contract spend % |

---

## 10. Quality  ✅

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **CAPA governance** | Review corrective/preventive actions + closure | Weekly | CAPA on-time % |
| **Supplier quality review** | Rank suppliers by NCR, drive improvement | Monthly | PPM defects |
| **Recall readiness drill** | Simulate recall, time the response | Quarterly | Recall response time |
| **Customer complaint trend** | Pareto, drive root causes into design | Monthly | Complaints per 1k units |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Inspection checklist close-out** | Record pass/fail with evidence | Per batch | NCR rate |
| **Non-conformance report** | File NCR with root-cause hypothesis | On defect | First-pass yield |
| **Calibration compliance** | Verify instruments due for calibration | Daily roster | OOC rate |

---

## 11. Governance  🛡️

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Policy review cycle** | Refresh policies based on regulatory change | Quarterly | Policies up-to-date % |
| **Risk register re-score** | Update likelihood × impact on each risk | Monthly | Open risk exposure |
| **Model-governance board** | Approve model deploy / retire | Bi-weekly | Approved model coverage |
| **Audit finding close-out** | Track remediation to completion | Weekly | Findings > SLA |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Access-review attestation** | Quarterly review of user permissions | Quarterly | Access review completion % |
| **Data-quality SLA monitoring** | Flag feeds breaching freshness SLA | Hourly | Feed SLA % |
| **Incident report filing** | Document security / compliance event | On incident | Incident-report completeness |

---

## 12. Contact Center  ☎️

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Voice-AI prompt tuning** | Review call samples, adjust system prompt + rerank | Weekly | Deflection %, CSAT |
| **Workforce schedule refresh** | Re-forecast call volume, rebuild shifts | Weekly | Service level (80/20) |
| **Calibration session** | Align QA scoring across reviewers | Monthly | QA inter-rater agreement |
| **Skill-routing redesign** | Re-map queues to agent skills | Quarterly | First-contact resolution |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Post-call note quality** | Write disposition + reason in agreed taxonomy | Per call | Note quality score |
| **Escalation playbook compliance** | Follow defined escalation tree | On escalation | Escalation adherence % |
| **KB correction feedback** | Flag outdated KB articles while on calls | On encounter | KB freshness |
| **CSAT follow-through** | Close loop on negative surveys | Daily | Save rate |

---

## 13. Marketing  📣

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Attribution model review** | Re-weight channels based on incrementality tests | Quarterly | Model-to-reality error |
| **Creative review board** | Approve AI-generated creative for brand fit | Weekly | Brand compliance % |
| **Audience-segment refresh** | Retrain segment model, migrate audiences | Monthly | Segment lift |
| **Budget reallocation** | Shift spend across channels per real-time ROI | Bi-weekly | Blended CAC |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **AI-assisted content QA** | Review generative ads / emails / landing copy before publish | Per asset | Reject rate, time-to-publish |
| **A/B test read-out** | Record winner, update playbook | Per test | Test cycle days |
| **Campaign QA checklist** | UTM / consent / frequency cap checks | Pre-launch | Campaign-defect rate |
| **SEO content refresh** | Update stale articles per Search Console drop | Monthly | Organic sessions |

---

## 14. Telehealth  🩺

### Manager enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Triage-AI calibration** | Review AI vs clinician agreement; tune thresholds | Weekly | Triage accuracy |
| **Panel-balancing** | Rebalance clinician caseloads | Monthly | Wait time |
| **Care-pathway review** | Update protocols per outcome data | Quarterly | Outcome compliance |
| **Privacy / HIPAA audit** | Verify session logs + access controls | Monthly | Audit finding rate |

### Team Member enhancement processes
| Process | Description | Trigger | KPI |
|---|---|---|---|
| **Encounter note quality** | Complete structured note in EHR | Per encounter | Note completeness |
| **AI-suggestion acceptance** | Accept / reject AI recommendations with rationale | Per suggestion | Suggestion acceptance % |
| **Patient follow-up** | Close loop on abnormal results or missed appts | Daily | Follow-up rate |

---

## How this maps to Phase 1 scaffolding

| This catalog feeds | In the UI | Phase |
|---|---|---|
| Manager columns above | Manager → **Roles & Responsibilities** tab (rolesByDept[dept].manager.responsibilities) | 2 |
| Team Member columns above | Manager → **Roles & Responsibilities** tab (rolesByDept[dept]['team-member'].responsibilities) | 2 |
| Each process as a workflow row | Admin → **Workflows** tab (process × trigger × owner × status) | 2 |
| KPI columns | Manager → **KPI Dashboard** tab (with drill-down from KPI → process → owner) | 2 |

---

## Not addressed here (deferred)

- **Compliance** role enhancement processes — the reviewer roadmap treats this as its own role; will be a sibling doc.
- **Reporting & Monitoring** role — covered inside dept sections where ops monitors live (e.g., Contact Center Ops Monitor, Sales Ops Monitor, Marketing Analytics Ops).
- **RBAC** — user paused this stream (see memory `project_phase2_pivot.md`).

Total: **66 Manager processes** + **41 Team Member processes** across 14 departments.
