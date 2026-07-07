#!/usr/bin/env python3
"""PAUDC NPC dialogue generator — Jamaican Patois style adapter.

Usage:
    python3 generate_dialogue.py "Kingston street vendor, morning market" [count]

Uses ANTHROPIC_API_KEY (Claude) if set, else ZHIPUAI_API_KEY (GLM).
Few-shots the style from patois_dataset.jsonl and prints JSONL drafts to stdout.
Drafts require human curation before shipping (see STYLE_ADAPTER.md).
"""
import json, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))

SYSTEM = """You are the dialogue generator for NPCs in a fictional open-world game set in a
fictionalized Jamaica (the PAUDC universe). Write in natural Jamaican Patois
blended with clear English, the way real speech moves between registers.

BINDING RULES:
- Warm, respectful, real. No stereotypes, no caricature, no mockery, no slurs.
- Personality varies; dignity is constant. Elders get the best lines.
- Legible to non-speakers: spell consistently (di, fi, yuh, nuh, mek, deh,
  cyaan, likkle, unnu, seh); don't stack more than ~2 unfamiliar tokens per line.
- Register follows speaker and setting; the BII speaks polite menace; radio stays calm.
- Humor quick and dry. Storm warnings serious. Everything fictional.

OUTPUT: JSONL only, one object per line:
{"input": "<situation>", "output": "<line>", "region": "...", "role": "...", "tone": "..."}"""


def few_shots(n=14):
    rows = [json.loads(l) for l in open(os.path.join(HERE, "patois_dataset.jsonl"))]
    random.shuffle(rows)
    return "\n".join(json.dumps(r, ensure_ascii=False) for r in rows[:n])


def build_prompt(brief, count):
    return (f"Style examples from the curated dataset:\n{few_shots()}\n\n"
            f"Generate {count} NEW lines (no repeats of the examples) for: {brief}\n"
            f"JSONL only, no commentary.")


def via_claude(prompt):
    import anthropic
    client = anthropic.Anthropic()
    msg = client.messages.create(
        model="claude-sonnet-5", max_tokens=1500,
        system=SYSTEM, messages=[{"role": "user", "content": prompt}])
    return msg.content[0].text


def via_glm(prompt):
    from zhipuai import ZhipuAI
    client = ZhipuAI(api_key=os.environ["ZHIPUAI_API_KEY"])
    resp = client.chat.completions.create(
        model="glm-4-plus",
        messages=[{"role": "system", "content": SYSTEM},
                  {"role": "user", "content": prompt}])
    return resp.choices[0].message.content


def main():
    brief = sys.argv[1] if len(sys.argv) > 1 else "Kingston street vendor, morning market"
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    prompt = build_prompt(brief, count)
    if os.environ.get("ANTHROPIC_API_KEY"):
        out = via_claude(prompt)
    elif os.environ.get("ZHIPUAI_API_KEY"):
        out = via_glm(prompt)
    else:
        sys.exit("Set ANTHROPIC_API_KEY or ZHIPUAI_API_KEY. (Dry run: prompt built OK, "
                 f"{len(prompt)} chars, {count} lines requested for: {brief})")
    kept = 0
    for line in out.splitlines():
        line = line.strip().strip("`")
        if not line.startswith("{"):
            continue
        try:
            json.loads(line); print(line); kept += 1
        except json.JSONDecodeError:
            continue
    print(f"# {kept} valid draft lines — curate before shipping", file=sys.stderr)


if __name__ == "__main__":
    main()
