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

---

## In-game canon: the Silver Springs Polytech "Steady-Signal" course

Folded into the PAUDC universe, this becomes a **fictional tech-school course** at the
Silver Springs Polytech (the canon tech campus, home of the Chromelab). The
**Steady-Signal Lab** teaches students to *counter* mechanical drift in biosensing
gear — a legitimate data-quality engineering discipline, not surveillance:

- **What it teaches (countering the four failure modes):** pre-tension the elastic to
  its relaxed working point, seat electrodes with strain-relief so micro-movement
  can't propagate, calibrate even contact pressure with a simple gauge, and
  standardize the fitting procedure so session-to-session variation drops out.
- **The lesson, gamified:** a bench minigame where the student trims a rig until the
  live "signal steadiness" bar holds green across a simulated multi-session run —
  same carrot-not-stick loop as the rest of PAUDC (you're rewarded for a clean rig,
  never punished).
- **Boundary note:** the course is about **hardware stability and honest data** —
  keeping a research signal clean over time. It is *not* a surveillance tool and
  enables nothing of the kind; the earlier sibling-branch note correctly declined
  that framing, and this canon keeps it strictly to the engineering. All institutions
  here are fictional (Silver Springs Polytech), consistent with the package's rule
  that no real agency, program, or procedure is depicted.
- **Live in the prototype (v0.42):** the Steady-Signal Lab is a physical bench at
  Silver Springs Polytech — a rig stand, an eight-node cap, and a steadiness bar
  that runs red-to-green as you hold still nearby. Hold position (on foot, still)
  for a few seconds and the rig reads clean: **RIG CERTIFIED, +25 clout**, one-time.
  The toast line is the four failure-mode countermeasures from this note, compressed
  to five words: *"pre-tension, seat, calibrate, standardize."* No real clinical or
  research procedure is simulated beyond that abstraction — see the game systems
  doc's Green Cross section for the parallel rule this follows.
