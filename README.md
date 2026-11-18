# mochila

*mochila* is Spanish for **backpack**. It is a kit of free tools that runs AI entirely on your own laptop: an engine to run models, a terminal agent that reads your files and follows your instructions, and skills written as plain markdown. No accounts, no subscriptions, works offline.

One evening to set up. Runs on modest hardware; older machines use smaller models. macOS, Windows and Linux.

## The pieces

| Piece | What it is | What you use it for |
|---|---|---|
| **Ollama** | runs the model on your machine | the engine under everything else |
| **Node.js + Pi** | the terminal agent | reads files, edits them, runs commands, follows skills |
| **Skills** | folders of markdown instructions | teach the agent how you want a job done |
| **Msty** (optional) | desktop chat app | conversations and document folders, no terminal |
| **frugal** (optional) | 9Router configurator | a verified fallback chain of free cloud models |

## Where mochila fits: the ladder

When the subscription is the barrier, there are four places AI can live, and every rung speaks an
OpenAI-shaped API — your tools don't change as you climb:

1. **Local, on your laptop** — Ollama + Pi. No keys, no internet. This repo.
2. **Cloud, direct** — one provider, one model, your key.
3. **Cloud, proxied** — [frugal](https://github.com/michael-borck/frugal) + 9Router: a verified fallback chain of free models.
4. **Shared, on campus** — [Puente](https://locopuente.org), a self-hosted server running the full local stack for many students.

Start where you are. Climb as far as you need.

## Setup

**1. Install Ollama.** Download from [ollama.com](https://ollama.com), install, start it (llama icon in the menu bar or system tray), then pull a model:

```sh
ollama pull qwen3:8b      # about 5 GB
ollama pull qwen3:4b      # about 2.5 GB, for smaller machines
```

Check it: `ollama list` shows the model, and this prints a sentence:

```sh
ollama run qwen3:8b "Say one sentence about this machine."
```

**2. Install Node.js LTS** from [nodejs.org](https://nodejs.org). On macOS and Linux, [nvm](https://github.com/nvm-sh/nvm) is the no-admin-rights route. Open a **new** terminal and check `npm --version` prints a number.

**3. Connect the agent.** Recent Ollama versions install Pi, write its configuration, and launch it in one command:

```sh
ollama launch pi
```

Pick a model from the menu (or `ollama launch pi --model qwen3:8b` to skip it). After this, plain `pi` starts the agent already connected to your local models.

**4. Add skills.** Copy the starter skills from this repo to where agents look for them:

```sh
mkdir -p ~/.agents/skills
cp -r skills/meeting-notes skills/plain-english ~/.agents/skills/
```

Inside Pi, run `/reload` and check the startup header lists them.

**5. Optional extras.** [Msty](https://msty.ai) finds your local Ollama models automatically — chat plus document folders (knowledge stacks). Its trade, named honestly: closed core, free rather than open; in return it is also the client for a campus server. [frugal](https://github.com/michael-borck/frugal) adds the free-cloud rung. Want a fully open GUI instead? [Portable AI Studio](https://github.com/techjarves/Portable-Local-Studio) (MIT) bundles chat, image generation and voice into one offline window — but has no document RAG and stays laptop-only.

## Skills

A **skill** is a folder containing a `SKILL.md` file: instructions that teach the agent how to do a particular job properly.

```text
~/.agents/skills/
└── meeting-notes/
    ├── SKILL.md          required
    └── references/       optional detail, loaded only when needed
```

`SKILL.md` starts with frontmatter:

```markdown
---
name: meeting-notes
description: Turns rough meeting notes into structured minutes. Use when the user pastes raw notes or asks for minutes, actions or decisions.
---

# Meeting notes

...instructions here...
```

The **description is the important line**: at startup the agent loads only each skill's name and description, then reads the full file when a task seems to match. Be specific, and mention the words someone would actually use when they need it.

Where skills live:

- `~/.agents/skills/` — a shared convention several agents follow; a skill here is not locked to Pi
- `~/.pi/agent/skills/` — Pi-specific skills
- `.agents/skills/` in a project — skills for that project only

The two starter skills in [`skills/`](skills/) are working examples to copy and edit. To force a skill to run, invoke it by name inside Pi: `/skill:meeting-notes`.

## A shared server, if your laptop is small

Local models need RAM. If your machine struggles (slow replies, roaring fan, drained battery), point the agent at a shared Ollama server instead — a campus, workplace, or lab machine. One command from this repo:

```sh
node scripts/setup-models.mjs
```

With no arguments it wires up local Ollama only. To add a shared server, give it the URL and key:

```sh
export MOCHILA_SHARED_URL="https://your-server.example/v1"
export MOCHILA_SHARED_KEY="paste-your-key"
node scripts/setup-models.mjs
```

The script **never overwrites**: it adds what is missing and leaves everything else exactly as it was, so it is safe to run again at any time.

Worth being honest about the trade: on your laptop, your words go nowhere. On a shared server, your words sit on someone else's machine, under their rules. That can be exactly the right deal — an institution running its own server is rung four of the ladder — but it is trust, not privacy. Ask what the log policy is.

## If something goes wrong

| Symptom | Fix |
|---|---|
| `command not found: ollama` (macOS/Windows) | start the Ollama app once, then open a **new** terminal |
| `connection refused` in Pi or Msty | Ollama is not running; start the app and try again |
| `model not found` in Pi | the model id must match `ollama list` exactly, colon and all |
| Pi never answers | check `npm --version` works; reinstall Node and reopen the terminal |
| Msty shows no models | Msty rescans on launch; restart it |
| replies are slow, fan roaring | your machine is small for the model; use `qwen3:4b` instead |

## The family

- [frugal](https://github.com/michael-borck/frugal) — one command to a working free-cloud setup (rung 3)
- [LocoPuente](https://locopuente.org) — the campus bridge; a self-hosted server for many users (rung 4)
- [LocoLabo](https://locolabo.org) — the research programme behind the family

## License

MIT. See [LICENSE](LICENSE). Not affiliated with Ollama, Pi, Msty or 9Router.
