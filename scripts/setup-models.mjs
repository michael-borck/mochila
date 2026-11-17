#!/usr/bin/env node
// mochila: configure the Pi agent's models.json.
// Adds a local Ollama provider, and optionally a shared server when given a
// URL and key. Safe to run again: existing providers are preserved, only what
// is missing is added. Requires Node.js 18+. Run:  node scripts/setup-models.mjs
//
// Shared server (optional):
//   export MOCHILA_SHARED_URL="https://your-server.example/v1"
//   export MOCHILA_SHARED_KEY="..."
//   node scripts/setup-models.mjs
// Or pass --shared-url / --shared-key flags. A server on your network or
// campus usually publishes both; ask its operator.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1].trim() : undefined;
}

const dir = path.join(homedir(), ".pi", "agent");
const file = path.join(dir, "models.json");
mkdirSync(dir, { recursive: true });

let data = { providers: {} };
if (existsSync(file)) {
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    const backup = `${file}.broken`;
    copyFileSync(file, backup);
    console.log(`Heads-up: the existing file was not valid JSON. Saved as ${backup}, starting fresh.`);
    data = { providers: {} };
  }
}
data.providers ??= {};

// Ask Ollama what is actually installed, so the model list matches reality.
function installedModels() {
  try {
    const out = execFileSync("ollama", ["list"], { encoding: "utf8" });
    const ids = out
      .split("\n")
      .slice(1)
      .map((line) => line.split(/\s{2,}/)[0].trim())
      .filter(Boolean);
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

const models = installedModels();
const localModels = models.length > 0 ? models : [{ id: "qwen3:8b" }, { id: "qwen3:4b" }];

// Local Ollama: add only when absent, so an existing block is preserved.
data.providers.ollama ??= {
  baseUrl: "http://localhost:11434/v1",
  api: "openai-completions",
  apiKey: "ollama",
  models: localModels,
};

// Shared server: only added when both a URL and a key are provided.
const sharedUrl = argValue("--shared-url") ?? process.env.MOCHILA_SHARED_URL;
const sharedKey = argValue("--shared-key") ?? process.env.MOCHILA_SHARED_KEY;
if (sharedUrl && sharedKey) {
  data.providers["ollama-shared"] ??= {
    baseUrl: sharedUrl,
    api: "openai-completions",
    apiKey: sharedKey,
    compat: { supportsDeveloperRole: false, supportsReasoningEffort: false },
    models: [],
  };
  const shared = data.providers["ollama-shared"];
  shared.baseUrl = sharedUrl;
  shared.apiKey = sharedKey;
  console.log("Shared server: fill in its model ids in the ollama-shared block");
  console.log("(they must match the server's `ollama list`), or run:");
  console.log(`  pi --provider ollama-shared --model <id>`);
} else if (sharedUrl || sharedKey) {
  console.log("Shared server skipped: give both MOCHILA_SHARED_URL and MOCHILA_SHARED_KEY");
  console.log("(or --shared-url / --shared-key) to add one.");
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");

console.log(`Written: ${file}`);
const providerIds = Object.keys(data.providers.ollama.models ?? {}).length > 0 ? data.providers.ollama.models.map((m) => m.id) : [];
console.log(`Local models:   pi --provider ollama --model ${providerIds[0] ?? "qwen3:8b"}`);
if (data.providers["ollama-shared"]) {
  console.log(`Shared server:  pi --provider ollama-shared --model <id>`);
}
