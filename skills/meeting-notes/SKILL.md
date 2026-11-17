---
name: meeting-notes
description: "Turns rough meeting notes into structured minutes with decisions, actions and owners. Use whenever the user pastes raw, messy or shorthand notes from a meeting - even without any instruction - or asks for minutes, action items, follow-ups, or 'what did we decide'. Trigger phrasings: 'turn these into minutes', 'notes from today's meeting', 'what were the action items', 'clean up my meeting notes'."
---

# Meeting notes

## What you do

Take rough notes and return minutes a reader can act on without having been in the room.

## Rules

- Base every line only on the notes provided. If something is missing, write
  `not recorded` rather than inventing it.
- Separate **decisions** (things agreed) from **actions** (things someone must
  do). A decision has no owner; an action always does.
- Never soften or editorialise: if the notes say a deadline was missed, the
  minutes say that.

## Output format

Return markdown with exactly these sections, skipping any that have no content:

### Summary
Two or three sentences: what the meeting was for and what it settled.

### Decisions
A bullet list. Each: what was decided, in one line.

### Actions
A markdown table:

| Action | Owner | Due |
|---|---|---|

Use `unassigned` or `no due date` where the notes do not say.

### Open questions
A bullet list of anything raised but not resolved.
