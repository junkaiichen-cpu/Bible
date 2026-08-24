# Pixel Fighter combat target

This project uses public gameplay characteristics of U鼬神's Pixel Naruto / Unity-era fan game as a **quality target**, not as a source of copied assets or code.

## Current observed target characteristics

- 1v1 real-time side-view combat with keyboard-friendly controls.
- Normal attacks are a real combo language, not a single damage button; attack counts, timing, launch and follow-up windows matter.
- Two character skills have meaningful cooldowns and often create follow-up opportunities.
- Skill hits contribute to the ultimate resource; the ultimate is a tactical resource decision rather than a random super move.
- Substitution is a defensive escape with a short invulnerability window and meaningful cooldown/resource pressure.
- Scroll / support systems create a second layer of neutral-game decisions.
- Character-specific states can change normal attacks, skills and available follow-ups.
- Older characters receive ongoing feel fixes: attack stiffness, movement distance, grab position, timing windows, and skill follow-up behavior are treated as first-class maintenance work.
- The visual bar is set by readable pixel silhouettes, strong hit effects, clear anticipation/recovery, camera/impact feedback and polished role-specific animation, rather than by raw particle count.

## Bible Fighter acceptance bar

### Combat core

1. 5-hit or character-specific basic attack strings with deliberate enders.
2. Skill 1 / Skill 2 must each have distinct startup, active, recovery and cancel rules.
3. Hit-stun, launch, knockback and combo protection must be deterministic enough to practice.
4. Substitution must be an intentional defensive resource, not a free panic button.
5. Ultimate resource must visibly communicate four clear units / stages.
6. Time limit and HP-based timeout result must exist before ranked PvP work.

### Character design

Every biblical fighter should have at least one mechanic that teaches a real biblical identity: weapon, vocation, historical event, or documented characteristic. Fictional combat exaggeration must stay clearly separate from claims about the biblical text.

### Presentation

The next quality gate is not "more characters". It is:

**animation readability → hit feedback → timing → camera → effects → environment → content volume.**

Until a single character feels good in a 30-second duel, additional roster expansion should remain secondary.

## Version direction

- Build 10: playable system prototype.
- Build 10.1: PC input compatibility + repeat-safe controls + desktop test baseline.
- Build 11: frame/timing combat pass, proper hitbox/hurtbox definitions, combo protection and substitution cooldown.
- Build 12: sprite-state renderer and first polished fighter (David) with real animation frames.
- Build 13: arena/camera/effects pass and one complete biblical matchup.
- Build 14: AI training opponent + practice tools.
- Later: broader roster, story unlocks, online only after local combat is solid.
