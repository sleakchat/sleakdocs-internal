#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const dir = __dirname;

// Auto-discover all OpenAPI spec files in the directory
const specFiles = fs.readdirSync(dir)
  .filter((f) => f.endsWith(".json") && f !== "merge.js")
  .map((f) => {
    try {
      const spec = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (!spec.openapi) return null;
      return {
        name: path.basename(f, ".json"),
        title: spec.info?.title ?? path.basename(f, ".json"),
        file: f,
        url: spec.servers?.[0]?.url ?? null,
        spec,
      };
    } catch {
      return null;
    }
  })
  .filter(Boolean);

console.log(`Found ${specFiles.length} spec files: ${specFiles.map((s) => s.file).join(", ")}`);

// ── 1. Merge all specs into one openapi.json ──────────────────────────────────

const merged = {
  openapi: "3.1.0",
  info: {
    title: "Sleak Services API",
    version: "1.0",
    description:
      "Combined OpenAPI document for all Sleak internal services. Each path is prefixed with its service name.",
  },
  servers: [{ url: "https://api.v1.sleak.chat" }],
  tags: [],
  paths: {},
  components: { schemas: {} },
};

for (const entry of specFiles) {
  const { spec } = entry;

  merged.tags.push({
    name: entry.title,
    description: spec.info?.description ?? "",
  });

  for (const [rawPath, methods] of Object.entries(spec.paths ?? {})) {
    const prefixedPath = `/${entry.name}${rawPath}`;
    const remapped = JSON.parse(
      JSON.stringify(methods).replace(
        /#\/components\/schemas\//g,
        `#/components/schemas/${entry.name}_`
      )
    );

    const prefixedMethods = {};
    for (const [method, op] of Object.entries(remapped)) {
      prefixedMethods[method] = {
        ...op,
        tags: [entry.title],
        operationId: `${entry.name}_${op.operationId ?? method + rawPath}`,
        description: op.description
          ? `${op.description}\n\nActual path on the **${entry.title}** service: \`${rawPath}\`.`
          : `Actual path on the **${entry.title}** service: \`${rawPath}\`.`,
        ...(entry.url ? { servers: [{ url: entry.url }] } : {}),
      };
    }

    merged.paths[prefixedPath] = prefixedMethods;
  }

  for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
    merged.components.schemas[`${entry.name}_${name}`] = JSON.parse(
      JSON.stringify(schema).replace(
        /#\/components\/schemas\//g,
        `#/components/schemas/${entry.name}_`
      )
    );
  }
}

fs.writeFileSync(path.join(ROOT, "openapi.json"), JSON.stringify(merged, null, 2));
console.log(`✓ Merged ${specFiles.length} specs → openapi.json (${Object.keys(merged.paths).length} paths, ${Object.keys(merged.components.schemas).length} schemas)`);

// ── 2. Update docs.json navigation ───────────────────────────────────────────

const docsPath = path.join(ROOT, "docs.json");
const docs = JSON.parse(fs.readFileSync(docsPath, "utf8"));

const serviceGroups = specFiles.map((entry) => {
  const pages = Object.entries(merged.paths)
    .filter(([p]) => p.startsWith(`/${entry.name}/`) || p === `/${entry.name}`)
    .flatMap(([p, methods]) =>
      Object.keys(methods).map((method) => `${method.toUpperCase()} ${p}`)
    );

  return { group: entry.title, expanded: true, openapi: "openapi.json", pages };
}).filter((g) => g.pages.length > 0);

const internalGroup = docs.navigation.pages.find((g) => g.group === "Internal");
docs.navigation.pages = [
  internalGroup,
  { group: "API Reference", pages: ["api-reference/introduction"] },
  ...serviceGroups,
];

fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2));
console.log(`✓ docs.json updated (${serviceGroups.length} expanded service groups)`);
