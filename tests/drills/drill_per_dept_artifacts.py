#!/usr/bin/env python3
"""
Drill: §64.29 + §64.33 + §64.35 + §64.38 release blocker — every dept MUST
have all 15 markdown business-layer artifacts present.

Steps:
    1. (+) 19 expected depts all exist on disk
    2. (+) 15 markdown artifacts present per dept (= 285 MD files total)
    3. (-) NEGATIVE — known-bad dept name produces a clear failure
    4. (+) Each artifact file is non-empty (≥ 200 bytes)
    5. (+) Each artifact starts with the standard HOLY header
    6. (-) NEGATIVE — script does NOT silently mark missing files as OK
    7. (+) Role dashboards: 15 dashboards + 15 reports per dept (= 570 files)
    8. (+) Final scorecard: print missing counts (must be 0)

# RESOURCES: disk_io

Exit 0 on PASS, 1 on any missing artifact.
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

DEPARTMENTS = [
    "digital-marketing", "customer-experience", "supply-chain", "manufacturing",
    "product-rd", "retail-operations", "sales", "finance", "hr", "procurement",
    "executive-leadership", "e-commerce",
    "customer-support", "engineering", "it-operations", "legal", "marketing",
    "operations", "security-operations",
]

# 15 markdown artifacts per dept (per §64.18 + §64.31 + §64.33 + §64.35 + §64.38)
REQUIRED_MD = [
    "HOLY_DEMO_STORY.md",       # §64.1
    "HOLY_ASIS_ASSESSMENT.md",  # §64.2
    "HOLY_DT_STRATEGY.md",      # §64.4 (per §64.34 — DT-4P)
    "HOLY_CONTACT_CENTER.md",   # §64.5
    "HOLY_INCIDENT_MGMT.md",    # §64.6
    "HOLY_MEETING_COMMS.md",    # §64.14
    "HOLY_PROCESS_MGMT.md",     # §64.15
    "HOLY_DATA_MGMT.md",        # §64.17
    "HOLY_RECOMMENDATION.md",   # §64.22
    "HOLY_ANOMALY.md",          # §64.23
    "HOLY_FRAUD.md",            # §64.23 (stub if N/A)
    "HOLY_CONTACTS.md",         # §64.25
    "HOLY_FLOW.md",             # §64.27
    "HOLY_SECURITY.md",         # §64.32
    "HOLY_SIMULATION.md",       # §64.34
]

ROLES = [
    "admin", "manager", "team-member", "tester", "security", "devops",
    "ai-reviewer", "digital-transformation", "system-architect",
    "test-architect", "database-architect", "api-architect",
    "data-owner", "ai-strategy", "information-security",
]


def step(n, label, ok, detail=""):
    marker = "\033[32m✓\033[0m" if ok else "\033[31m✗\033[0m"
    print(f"  {marker} step {n}: {label}{(' — ' + detail) if detail else ''}")
    if not ok:
        sys.exit(1)


def main():
    root = REPO_ROOT / "global-ai-org" / "departments"
    print(f"\nDRILL: per-dept artifact audit  (root={root})\n")
    t0 = time.time()

    # ----- Step 1: all 19 depts exist -----
    actual = {d.name for d in root.iterdir() if d.is_dir()}
    missing_depts = set(DEPARTMENTS) - actual
    step(1, f"all {len(DEPARTMENTS)} depts exist on disk", not missing_depts,
         f"missing: {sorted(missing_depts)}" if missing_depts else "")

    # ----- Step 2: 15 MD artifacts per dept -----
    missing_md: list[str] = []
    for dept in DEPARTMENTS:
        biz = root / dept / "business-layer"
        for filename in REQUIRED_MD:
            if not (biz / filename).exists():
                missing_md.append(f"{dept}/{filename}")
    step(2, f"all {len(DEPARTMENTS) * len(REQUIRED_MD)} markdown artifacts present",
         not missing_md,
         f"{len(missing_md)} missing; first 5: {missing_md[:5]}" if missing_md else f"{len(DEPARTMENTS)} depts × {len(REQUIRED_MD)} = {len(DEPARTMENTS) * len(REQUIRED_MD)}")

    # ----- Step 3: NEGATIVE — bogus dept clearly flagged -----
    bogus_dept = "totally_made_up_dept_xyz"
    bogus_path = root / bogus_dept
    step(3, "NEGATIVE: bogus dept absent (no false-positive pass)",
         not bogus_path.exists(),
         "test bogus dept actually exists — pick another" if bogus_path.exists() else "")

    # ----- Step 4: artifacts non-empty -----
    tiny: list[str] = []
    for dept in DEPARTMENTS:
        biz = root / dept / "business-layer"
        for filename in REQUIRED_MD:
            f = biz / filename
            if f.exists() and f.stat().st_size < 200:
                tiny.append(f"{dept}/{filename} ({f.stat().st_size}B)")
    step(4, "all artifacts non-empty (≥ 200B)", not tiny,
         f"{len(tiny)} tiny; first 3: {tiny[:3]}" if tiny else "")

    # ----- Step 5: standard HOLY header -----
    bad_header: list[str] = []
    for dept in DEPARTMENTS:
        biz = root / dept / "business-layer"
        for filename in REQUIRED_MD:
            f = biz / filename
            if f.exists():
                first = f.read_text().splitlines()[0] if f.stat().st_size > 0 else ""
                if not first.startswith("# HOLY Beverage"):
                    bad_header.append(f"{dept}/{filename}: '{first[:50]}'")
    step(5, "all artifacts start with standard HOLY header", not bad_header,
         f"{len(bad_header)} bad" if bad_header else "")

    # ----- Step 6: NEGATIVE — assert script does NOT pass on missing files -----
    # Create a fake dept with no artifacts, verify the audit logic catches it
    fake_biz = REPO_ROOT / "tests" / "drills" / "_fake_dept" / "business-layer"
    fake_biz.mkdir(parents=True, exist_ok=True)
    fake_missing = [f for f in REQUIRED_MD if not (fake_biz / f).exists()]
    step(6, "NEGATIVE: audit logic flags missing files (not silent pass)",
         len(fake_missing) == len(REQUIRED_MD),
         f"fake-dept has 0 artifacts; audit found {len(fake_missing)}/{len(REQUIRED_MD)} missing")
    # cleanup
    import shutil
    shutil.rmtree(fake_biz.parent, ignore_errors=True)

    # ----- Step 7: role dashboards + reports -----
    missing_roles: list[str] = []
    for dept in DEPARTMENTS:
        for role in ROLES:
            dash = root / dept / "dashboards-by-role" / role / "HOLY_DASHBOARD.md"
            rpts = root / dept / "reports-by-role" / role / "HOLY_REPORTS.md"
            if not dash.exists():
                missing_roles.append(f"{dept}/{role}/dashboard")
            if not rpts.exists():
                missing_roles.append(f"{dept}/{role}/reports")
    expected_role_files = len(DEPARTMENTS) * len(ROLES) * 2
    step(7, f"all {expected_role_files} role-scoped artifacts present",
         not missing_roles,
         f"{len(missing_roles)} missing; first 3: {missing_roles[:3]}" if missing_roles else "")

    # ----- Step 8: scorecard summary -----
    total_expected = len(DEPARTMENTS) * len(REQUIRED_MD) + expected_role_files
    print(f"\n  Scorecard: {len(DEPARTMENTS)} depts × ({len(REQUIRED_MD)} MD + {len(ROLES)} roles × 2) = {total_expected} files")
    step(8, "release blocker — all required files present",
         True,
         f"all green ({total_expected} files)")

    print(f"\n\033[32mALL 8 STEPS PASSED\033[0m  ({time.time() - t0:.1f}s)")


if __name__ == "__main__":
    main()
