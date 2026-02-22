import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const APP_URL = (process.env.RANKYPULSE_APP_URL || "https://rankypulse.com").replace(/\/+$/, "");

const exts = new Set([".js", ".jsx", ".ts", ".tsx"]);
const IGNORE_DIRS = new Set(["node_modules", "dist", "build", ".next", ".vercel", "coverage"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      walk(path.join(dir, ent.name), out);
    } else {
      const ext = path.extname(ent.name);
      if (exts.has(ext)) out.push(path.join(dir, ent.name));
    }
  }
  return out;
}

function looksLikeAuditCTA(context) {
  const s = context.toLowerCase();
  return (
    s.includes("audit") ||
    s.includes("free scan") ||
    s.includes("start free") ||
    s.includes("start audit") ||
    s.includes("run audit") ||
    s.includes("website audit") ||
    s.includes("seo audit")
  );
}

function looksLikeAuthCTA(context) {
  const s = context.toLowerCase();
  return s.includes("sign in") || s.includes("login") || s.includes("log in") || s.includes("sign up") || s.includes("get started") || s.includes("create account");
}

function replaceWithContext(s) {
  let changed = false;

  const replaceHref = (str, match, idx, target) => {
    const before = Math.max(0, idx - 220);
    const after = Math.min(str.length, idx + 220);
    const ctx = str.slice(before, after);
    if (!looksLikeAuditCTA(ctx) && !looksLikeAuthCTA(ctx)) return match;
    changed = true;
    return target;
  };

  s = s.replace(/href=\{?["']#["']\}?/g, (m, _g, idx) => {
    const target = `href="${APP_URL}/audit"`;
    return replaceHref(s, m, idx, target);
  });

  s = s.replace(/to=\{?["']#["']\}?/g, (m, _g, idx) => {
    const before = Math.max(0, idx - 220);
    const after = Math.min(s.length, idx + 220);
    const ctx = s.slice(before, after);
    if (looksLikeAuthCTA(ctx)) {
      changed = true;
      return `to="/auth/signin"`;
    }
    if (looksLikeAuditCTA(ctx)) {
      changed = true;
      return `to="/audit"`;
    }
    return m;
  });

  const ABS_AUDIT = `${APP_URL}/audit`;
  const ABS_SIGNIN = `${APP_URL}/auth/signin`;
  const ABS_SIGNUP = `${APP_URL}/auth/signup`;
  const ABS_PRICING = `${APP_URL}/pricing`;
  const ABS_TERMS = `${APP_URL}/terms`;
  const ABS_PRIVACY = `${APP_URL}/privacy`;

  const linkPairs = [
    [/href=["']\/audit["']/g, `href="${ABS_AUDIT}"`],
    [/href=["']\/auth\/signin["']/g, `href="${ABS_SIGNIN}"`],
    [/href=["']\/auth\/signup["']/g, `href="${ABS_SIGNUP}"`],
    [/href=["']\/pricing["']/g, `href="${ABS_PRICING}"`],
    [/href=["']\/terms["']/g, `href="${ABS_TERMS}"`],
    [/href=["']\/privacy["']/g, `href="${ABS_PRIVACY}"`],
  ];

  for (const [re, rep] of linkPairs) {
    if (re.test(s)) {
      s = s.replace(re, rep);
      changed = true;
    }
  }

  return { s, changed };
}

const files = walk(SRC);
if (!files.length) {
  console.error("No src/ files found. Are you in the landing root?");
  process.exit(1);
}

let touched = 0;
for (const fp of files) {
  const orig = fs.readFileSync(fp, "utf8");
  const { s: next, changed } = replaceWithContext(orig);
  if (changed && next !== orig) {
    fs.writeFileSync(fp, next, "utf8");
    touched++;
    console.log("wired:", path.relative(ROOT, fp));
  }
}

console.log(`done. files updated: ${touched}`);
