# Dialogue & Voice System — Module Specification

> **FICTIONAL VIDEO GAME CONTENT.** The dialogue/voice module for the PAUDC/Jamaica
> island world. Builds directly on the **Character Bible's** dialogue voice guide and
> the **NPC culture doc §3** (natural Patois, respectful rendering, no caricature —
> those rules govern everything here). The brief's US regions resolve to our canon
> island districts (Alexandria = tech school, Silver Springs = Polytech, and the new
> **Wheaton Night School** above the Bassline club on The Strip); their multilingual
> texture arrives as the island's own — Patois-English blend as the spine, with
> Spanish and French Creole pockets in the port and market crowds, rendered
> naturally.

## 1. Regional dialogue profiles

| Region | Register | Flavor |
|---|---|---|
| Kingston core | quick, layered, code-switching mid-sentence | market wit, studio slang, business English downtown |
| Rural parishes | slower, story-shaped, proverb-rich | elders get the best lines (canon rule) |
| Resort coast | hospitality English with Patois warmth underneath | switches when the player earns Local |
| PAUDC base | drill-clip discipline + off-duty melt | Auntie Blades sets the standard |
| Student districts (Silver Springs / Alexandria / Wheaton) | fast slang, tech shorthand, night-class tiredness | the Wheaton crowd talks over bass bleed from the club below |

## 2. NPC conversation system

Conversation states per the behavior trees (culture doc §4): idle chatter, social
(dominoes, veranda, bar), work talk, vendor/customer (bargaining is a dialogue
*minigame*), tourist interactions, gossip networks (news of the player's deeds
travels between districts at ferry speed — literally carried by transit NPCs), and
emergency reactions. Personality modifiers (friendly / reserved / humorous /
serious / suspicious / helpful) select pools, not accents — **personality varies,
dignity is constant.**

## 3. Ambient chatter

Location beds (market, waterfront, taxi stand, club queue, church steps), time
beds on the v0.22 clock (morning commute → lunch rush → evening cool-out →
late-night bass), weather beds (rain complaints, heat truce, storm-warning
seriousness — the joke stops at SC-2, canon), and event beds (festival, fight
night, regatta).

## 4. Player dialogue choices

Five stances — **friendly / neutral / assertive / humorous / de-escalating** —
with reputation-gated variants (Trusted / Unknown / Suspicious / Respected /
Feared). De-escalation is mechanically the *strongest* option in BII and faction
standoffs (combat doc §8: talking a fight down pays more Standing than winning
it). Intimidation exists but feeds the Troublemaker tag and its prices.

## 5. Emotional tone & delivery

Seven NPC states (calm, excited, nervous, angry, scared, happy, tired) driving
delivery parameters: volume, pace, breath, stress markers, whisper mode for
stealth beats. Voice direction stays the canon rule — warmth default, humor dry
and quick, fear played honestly and briefly (never lingered on).

## 6. Dynamic reaction lines

Reaction hooks already live in systems: player appearance/ride ("dat Marlin
clean, boss"), reputation tags, weather, time, BII presence ("easy, di
Interceptor deh 'bout"), combat aftermath, wildlife moments (the whole street
watches the Rolling Calf story get retold wrong), and economy states (empty
shelves after a storm get talked about).

## 7. Mission dialogue framework

Briefings (voice per giver: Auntie Blades lectures, Kingfisher transmits,
vendors ramble), instruction lines that repeat *differently* on the third
listen (anti-fatigue rule), emotional beats, betrayal reveals (Maroon Thunder
canon), negotiations with branch points, rescue calls, and victory/failure
stingers. Branching keys: player choice, reputation tag, moral flags, and
hidden paths for Local-tier players (whole optional scenes in deeper Patois,
subtitled — earned intimacy as a reward).

## 8. Emergency dialogue

Storm-ladder warnings (the radio voice is calm; the neighbors are not),
evacuation lines, BII commands (courtesy-first even at volume — canon voice),
panic/help calls, and the Static Hour's whisper-line register (psych doc) as
the system's horror mode.

## 9. Authenticity rules (binding)

The package's standing rules restated for this module: natural rendering,
no mockery, no slurs, no harmful stereotypes; Patois legible to non-speakers;
real cultural rhythms with invented specifics; every named voice is fictional.

## 10. Production path

Pre-generated lines (the SDK lane: Claude/GLM drafting into these frameworks,
human-curated) shipped as static content; TTS only for prototype scratch,
recorded voice actors for the engine rung — island voices cast authentically.

**The pipeline is built** (`pipeline/dialogue/`): a 48-line curated, canon-tagged
Patois dataset (`patois_dataset.jsonl`), the drop-in style-adapter system prompt
(`STYLE_ADAPTER.md`), a runnable batch generator (`generate_dialogue.py`, Claude
or GLM via the installed SDKs), and a Kaggle LoRA notebook
(`pipeline/kaggle_lora_patois.ipynb`) for when the curated set passes ~2-5k lines.
Human curation gates every line before it ships — the dataset only grows with
approved lines, never raw model output.

> All fictional. The voice of the island is the point — written with affection,
> checked against the culture doc's rules every pass.
