# MediAsas Readiness Report

## Decision: **OPTION B — NOT READY (yet)**
BNM has published detailed **pilot** terms. BNM also states those terms may change for the final national version, scheduled for **January 2027**, and that final features and pricing will be published then.

A simulator built today would hard-code values that are explicitly provisional. **Recommendation:** wait for the January 2027 publication, then build. The plan in §5 is ready to execute against the final document.

## 1. Official evidence read (core facts from official sources only)
| Source | Date / version | Status |
|---|---|---|
| **BNM MediAsas FAQs, Version 1: Pilot Programme** (`bnm.gov.my/documents/20124/22555060/MediAsas_Pilot_FAQs_Customers.pdf`) | **29 July 2026**, 22 pages | Read in full |
| BNM MHIT hub (`bnm.gov.my/mhit`) | Live page | Read: "The Base MHIT Plan, now known as MediAsas"; pilot end July–October 2026; "Final product features and pricing will be published during its nationwide launch in January 2027" |
| BNM Base MHIT white paper (`bnm.gov.my/mhit/baseplanwp`) | Undated | Read. Earlier design ("standard" / "standard-plus"), indicative premium tables, deductibles "being considered". Superseded on details by the pilot FAQ. |
| BNM Base MHIT short paper (PDF) | Metadata created 21 Jan 2026 | Not readable by the tool. Not relied on. |
| BNM base plan page (`bnm.gov.my/mhit/baseplan`) | Undated | Read. "Early 2027"; limits RM100k / RM150k (above 60) / RM300k; premiums shown only as an image. |

## 2. Verified details (pilot FAQ, 29 Jul 2026, unless noted)
| Topic | Pilot terms |
|---|---|
| Status | Pilot. "Benefits, terms and conditions in this pilot version may be revised… to align with the final approved MediAsas version." National launch "scheduled for… January 2027." |
| Plans | **MediAsas Teras** (standard) and **MediAsas Fleksi** (enhanced). Takaful equivalents have the same coverage. One MediAsas per person across all insurers. |
| Annual limit | Teras: RM100,000 (age 0–59), RM150,000 (60+). Fleksi: RM300,000. **No lifetime limit.** |
| Deductible and co-payment | **Teras in-network:** RM500 per disability (age 0–59), RM1,000 (60+). **Teras out-of-network:** plus 20% co-insurance, capped at RM3,000 per disability. **Fleksi:** RM10,000 per year in-network, RM15,000 out-of-network, no co-insurance. |
| Co-payment waived (Teras only) | Government healthcare facility, emergency treatment, outpatient cancer treatment |
| Cancer drugs | Up to 20% co-insurance on listed drugs, **waived until the Cancer Drug List is published** |
| Room and board | No daily RM cap. Shared room (4- or 2-bedded); a free upgrade if none is available (in-network). Out-of-network is reimbursed at the shared-room rate. Max 150 days per disability. |
| Coverage | Inpatient (R&B, ICU 90 days, supplies, surgery, anaesthetist, OT, ambulance, physician visits), day surgery, pre-hospitalisation (30 days), post-hospitalisation (90 days), physiotherapy (RM200 per session, 10 sessions), home nursing (RM3,000 per year), outpatient cancer treatment, outpatient illness (dengue, influenza A/B, bronchitis, pneumonia) up to RM3,000 per year (RM50 per visit deductible on Teras). Malaysia only. |
| Eligibility | Ages 0–70 (the pilot accepts 16–70), renewable to 85, renewal guaranteed except as stated. **Pilot:** Malaysian citizens with MyKad. **National launch:** permanent residents and foreigners residing in Malaysia. |
| Underwriting | **Fully underwritten.** Pre-existing conditions excluded. 7-year moratorium with exceptions (fraud, or pre-defined conditions that existed or appeared within 30 days). |
| Waiting periods | 30 days (except accidents); 120 days for specified illnesses |
| Exclusions | 35 listed, e.g. pre-existing conditions, mental or nervous disorders, pregnancy, dental, refractive eye, cosmetic, notifiable infectious diseases, hazardous sports, overseas treatment |
| Premiums | **Not guaranteed**; change with attained age; may be repriced with 30 days' notice; not based on an individual's claims. **No final premium figures published.** |
| Pilot channels | AIA, Allianz Life, Etiqa Family Takaful, Great Eastern Life, Prudential BSN Takaful, Syarikat Takaful Malaysia Keluarga. 10 in-network Klang Valley hospitals. |
| Switching | Not allowed during the pilot. Details "will be provided during the national launch". |
| Free-look | 15 days |

## 3. Missing or uncertain
1. **Final benefits, limits and deductibles.** The pilot values may be revised. The final version is due January 2027.
2. **Final premiums.** Not published. The white paper's indicative table and the hub's "RM60–RM550" range are preliminary and conflict.
3. **The national in-network hospital list.** The pilot has only 10 Klang Valley hospitals.
4. **Switching rules** (between insurers, from existing plans, between Teras and Fleksi): to be announced at launch.
5. **The Cancer Drug List** and the co-insurance amount.
6. **Eligibility for permanent residents and foreigners:** stated for the launch, but the detailed rules aren't published.
7. **The short paper and premium tables** are images or PDFs not machine-readable here. They need manual reading if used.

## 4. Why not build now
- The core simulator inputs (deductible structure, co-insurance cap, limits, waivers) are known, but **only as pilot values that BNM says may change**.
- Building now would risk teaching outdated numbers to the exact audience the product serves.
- The launch is about 1 month away.

## 5. Implementation plan, ready to run once the final MediAsas document is published
1. **Verify** the final BNM document: version, date, every figure. Record it in a dated `mediasas` data file with source and page for each value.
2. **Explainer page:** add a Learn → Protection explained → Medical section, "MediAsas: the standard base medical plan".
   - Teras vs Fleksi.
   - Network vs out-of-network.
   - Per-disability vs per-year deductibles.
   - What's excluded (top 10).
   - Who can apply.
   - No product promotion; insurers listed only as "offered by participating insurers".
3. **Simulator:** add a "MediAsas bill" mode to the existing medical bill tool, reusing its UI. Use a **new pure module** (not Engine 2, which stays frozen). Inputs:
   - plan (Teras or Fleksi);
   - age band;
   - in-network or out-of-network;
   - waiver situation (government facility, emergency, outpatient cancer);
   - bill amount;
   - same or different disability within a year.

   Outputs: deductible, co-insurance (with cap), insurer share, amount above the annual limit, with each step shown.
4. **Tests:** reproduce the FAQ's own worked examples (RM6,000 bill → RM500 vs RM1,700; Adam's and Mei Ling's scenarios) as golden tests, plus the limits, caps and waivers.
5. **Labels:** "Based on BNM's MediAsas terms dated <date>. Not a quote. Actual policy terms decide." Show no premiums until final official figures exist.
