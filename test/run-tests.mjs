// Offline check for template.tpl: runs the template's code and every scenario under ___TESTS___ with
// stand-ins for the Tag Manager sandbox (require, data, mock, runCode, assertThat, assertApi), and fails
// if the code injects any address the ___WEB_PERMISSIONS___ block does not allow.
// Tag Manager's own "Run Tests" button in the template editor is the authority; this is the same
// scenarios, runnable without an account:   node test/run-tests.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(here, "..", "template.tpl"), "utf8").replace(/\r\n/g, "\n");

function section(name) {
  const re = new RegExp(`___${name}___\\n([\\s\\S]*?)(?=\\n___[A-Z_]+___\\n|$)`);
  const m = re.exec(tpl);
  if (!m) throw new Error(`section ${name} missing`);
  return m[1].trim();
}

const info = JSON.parse(section("INFO"));
const params = JSON.parse(section("TEMPLATE_PARAMETERS"));
const perms = JSON.parse(section("WEB_PERMISSIONS"));
const code = section("SANDBOXED_JS_FOR_WEB_TEMPLATE");

// Allowed inject_script patterns (Tag Manager match: * is a wildcard).
const allowed = [];
for (const p of perms) {
  if (p.instance.key.publicId !== "inject_script") throw new Error(`unexpected permission ${p.instance.key.publicId}`);
  for (const prm of p.instance.param) if (prm.key === "urls") for (const li of prm.value.listItem) allowed.push(li.string);
}
const permitted = (url) => allowed.some((pat) => new RegExp("^" + pat.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$").test(url));

// Scenarios: "- name: X\n  code: |-\n    ...".
const testsText = section("TESTS");
const scenarios = [];
for (const block of testsText.split(/\n- name: /).slice(1)) {
  const name = block.split("\n")[0].trim();
  const body = block.split(/\n  code: \|-\n/)[1].split(/\nsetup:/)[0];
  const codeLines = body.split("\n").filter((l) => l.startsWith("    ") || l.trim() === "").map((l) => l.slice(4));
  scenarios.push({ name, code: codeLines.join("\n") });
}

let failed = 0;
for (const sc of scenarios) {
  const mocks = {};
  const calls = {};
  const call = (n) => { calls[n] = (calls[n] || 0) + 1; };
  const realApis = {
    injectScript: (url, onSuccess, onFailure, token) => { call("injectScript"); onSuccess(); },
    encodeUriComponent: (s) => encodeURIComponent(String(s)),
  };
  const requireFn = (n) => {
    if (!(n in realApis)) throw new Error(`template requires an API the stand-in does not have: ${n}`);
    return (...args) => {
      if (n === "injectScript" && !permitted(String(args[0]))) throw new Error(`permission: injectScript(${args[0]}) is not allowed by ${JSON.stringify(allowed)}`);
      return (mocks[n] || realApis[n])(...args);
    };
  };
  const runCode = (data) => {
    const d = Object.assign({}, data, { gtmOnSuccess: () => call("gtmOnSuccess"), gtmOnFailure: () => call("gtmOnFailure") });
    new Function("require", "data", code)(requireFn, d);
  };
  const assertThat = (actual) => ({
    isEqualTo: (exp) => { if (JSON.stringify(actual) !== JSON.stringify(exp)) throw new Error(`expected ${JSON.stringify(exp)}, got ${JSON.stringify(actual)}`); },
  });
  const assertApi = (n) => ({
    wasCalled: () => { if (!calls[n]) throw new Error(`${n} was not called`); },
    wasNotCalled: () => { if (calls[n]) throw new Error(`${n} was called`); },
  });
  const mock = (n, fn) => { mocks[n] = fn; };
  try {
    new Function("mock", "runCode", "assertThat", "assertApi", sc.code)(mock, runCode, assertThat, assertApi);
    console.log(`PASS  ${sc.name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${sc.name}: ${e.message}`);
  }
}

// Shape checks the gallery asks for.
const shape = [];
if (!Array.isArray(info.categories) || !info.categories.length || info.categories.length > 3) shape.push("categories: 1 to 3 required");
if (!/^GetFoxChat/.test(info.displayName)) shape.push("display name should start with the company name");
if (params.length !== 1 || params[0].name !== "siteId") shape.push("exactly one field, siteId");
if (allowed.length !== 1 || allowed[0] !== "https://getfoxchat.com/widget.js*") shape.push("inject_script must allow only the GetFoxChat widget");
for (const s of shape) { failed++; console.log(`FAIL  shape: ${s}`); }
if (!shape.length) console.log("PASS  shape: categories, display name, one field, one permission");

console.log(`${scenarios.length} scenario(s), ${failed ? failed + " failed" : "all passed"}`);
process.exit(failed ? 1 : 0);
