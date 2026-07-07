# EEG Cap Mechanical Drift — Long-Term Data Stability Note

*Research note for the Silver Springs School EEG program. Source material adapted from a
public LinkedIn post by Kevin S. (Biosensing Electrodes & EEG Caps expert). Summarized here
for the study's data-quality reference.*

## Why EEG Data Becomes Unstable in Long-Term Studies

EEG systems often perform well in short tests but degrade in longitudinal (multi-session)
studies. The instability frequently traces back not to the electronics or the subjects, but
to **cap-level mechanical drift**.

## Primary Mechanical Failure Modes

- **Elastic relaxation over time** — the cap fabric and straps lose tension across repeated use.
- **Electrode micro-movement** — small shifts in electrode position between and within sessions.
- **Inconsistent pressure distribution** — uneven contact force across the scalp.
- **Repeated subject-fitting variation** — differences each time the cap is placed on a subject.

These effects accumulate silently and distort datasets. Teams often misattribute the resulting
degradation to electrical noise or to the subjects themselves, when the root cause is
**structural cap behavior**.

## Key Principle

At the system level, **mechanical stability determines long-term data quality more than
electronic precision does**. For multi-session EEG studies, cap design should be treated as a
scientific variable in its own right — recorded, controlled, and reported like any other
experimental factor.

## Practical Implications for Multi-Session Studies

- Track cap age, elastic tension, and number of fittings as metadata alongside recordings.
- Standardize the fitting procedure and, where possible, the operator, to reduce fitting variance.
- Monitor per-electrode impedance and contact pressure across sessions to catch drift early.
- Treat cap replacement/re-tensioning as a documented event in the study log.
