#!/usr/bin/env node
/**
 * Validate baked JSON-LD against the fields Google documents for
 * FAQ, Organization, LocalBusiness, WebSite, and Service.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = process.env.JSONLD_DIR || (statExists(".next/server/app") ? ".next/server/app" : "out");

function statExists(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}
const errors = [];
const notes = [];

function fail(msg) {
  errors.push(msg);
}
function note(msg) {
  notes.push(msg);
}

function typesOf(node) {
  if (!node || node["@type"] == null) return [];
  return Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
}

function findByType(graph, type) {
  return graph.filter((node) => typesOf(node).includes(type));
}

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "_next" || name === "404.html" || name === "_not-found.html") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkHtml(full, acc);
    else if (name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    blocks.push(JSON.parse(m[1]));
  }
  return blocks;
}

function requireFields(node, fields, label) {
  for (const field of fields) {
    if (node[field] == null || node[field] === "") {
      fail(`${label} missing ${field}`);
    }
  }
}

function validateHome(graph, html) {
  const website = findByType(graph, "WebSite")[0];
  const org = findByType(graph, "Organization")[0];
  const biz = findByType(graph, "LocalBusiness")[0] || findByType(graph, "ProfessionalService")[0];
  const faq = findByType(graph, "FAQPage")[0];

  if (!website) fail("home missing WebSite");
  else {
    requireFields(website, ["url", "name"], "WebSite");
    if (website.url !== "https://minnyagents.com") fail(`WebSite.url is ${website.url}`);
  }

  if (!org) fail("home missing Organization");
  else {
    requireFields(org, ["name", "url", "address", "founder"], "Organization");
    if (org.name !== "Minny Agents") fail("Organization.name");
    if (org.telephone) fail("Organization must not invent a telephone");
    if (org.email !== "connor@minnyagents.com") fail("Organization.email must be connor@minnyagents.com");
    if (org.address?.addressLocality !== "Minneapolis") fail("Organization.address.addressLocality");
  }

  if (!biz) fail("home missing LocalBusiness/ProfessionalService");
  else {
    requireFields(biz, ["name", "address", "areaServed"], "LocalBusiness");
    if (biz.telephone || biz.email || biz.aggregateRating) {
      fail("LocalBusiness must not invent telephone, email, or ratings");
    }
    const served = JSON.stringify(biz.areaServed);
    for (const place of ["Minneapolis", "Saint Paul", "United States"]) {
      if (!served.includes(place)) fail(`areaServed missing ${place}`);
    }
    if (!typesOf(biz).includes("ProfessionalService") || !typesOf(biz).includes("LocalBusiness")) {
      fail("service node should be ProfessionalService + LocalBusiness");
    }
  }

  if (!faq) fail("home missing FAQPage");
  else {
    const entities = faq.mainEntity || [];
    if (entities.length < 5) fail(`FAQPage has ${entities.length} questions`);
    for (const q of entities) {
      if (q["@type"] !== "Question") fail("FAQ entity is not Question");
      if (!q.name || !q.acceptedAnswer?.text) fail(`FAQ missing name/text: ${q.name}`);
      if (!html.includes(q.name)) fail(`FAQ question not visible: ${q.name}`);
      if (!html.includes(q.acceptedAnswer.text.slice(0, 40))) {
        fail(`FAQ answer not visible: ${q.name}`);
      }
    }
    note(`FAQPage: ${entities.length} questions match visible copy`);
  }

  if (JSON.stringify(graph).includes("northern-bytes.vercel.app")) {
    fail("JSON-LD still names the old Vercel alias");
  }
}

function validateIndustry(graph, file) {
  if (!findByType(graph, "WebPage")[0]) fail(`${file} missing WebPage`);
  if (!findByType(graph, "Service")[0]) fail(`${file} missing Service`);
  if (!findByType(graph, "BreadcrumbList")[0]) fail(`${file} missing BreadcrumbList`);
}

const files = walkHtml(OUT);
if (files.length === 0) {
  fail("no out/**/index.html — run npm run build first");
}

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const blocks = extractJsonLd(html);
  if (blocks.length !== 1) fail(`${file} expected 1 JSON-LD block, got ${blocks.length}`);
  const doc = blocks[0] || {};
  if (doc["@context"] !== "https://schema.org") fail(`${file} @context`);
  const graph = doc["@graph"] || [];
  if (file.endsWith(`${OUT}/index.html`) || file.endsWith("out/index.html")) {
    validateHome(graph, html);
  } else {
    validateIndustry(graph, file);
  }
}

if (errors.length) {
  console.error("JSON-LD validation failed:\n");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("JSON-LD validation passed");
for (const n of notes) console.log(`- ${n}`);
console.log(`- checked ${files.length} HTML files`);
console.log("- FAQ answers match visible text");
console.log("- LocalBusiness has Minneapolis / Saint Paul / United States, no phone or email");
console.log("- Eligible rich-result types present: FAQPage, LocalBusiness, Organization");
process.exit(0);
