import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, isAbsolute } from "node:path";

const SECRET_KEY = /(?:apikey|accesskey|token|password|secret|cookie|session(?:id)?|auth(?:orization|entication)?|privatekey)$/;
const normalizeKey = key => String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
const isSecretKey = key => SECRET_KEY.test(normalizeKey(key));
const wholeLocalPath = value => typeof value === "string" && (
  /^\/(?!\/)[^\s]*$/.test(value) ||
  /^(?:\.\.?\/)[^\s]*$/.test(value) ||
  /^[A-Za-z]:\\[^\s]*$/.test(value) ||
  /^(?:[^\s\\/:*?"<>|]+\\)+[^\s\\/:*?"<>|]+$/.test(value)
);

function redactText(value) {
  return String(value)
    .replace(/\b(Authorization)\s*[:=]\s*["']?(?:Bearer|Basic)\s+[^\s,"'}]+/gi, "$1: <REDACTED>")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer <REDACTED>")
    .replace(/\b(x-api-key)\s*[:=]\s*(?:["'][^"']*["']|[^\s,;}]+)/gi, "$1: <REDACTED>")
    .replace(/\b(Set-Cookie|Cookie)\s*:\s*[^\r\n]*/gi, "$1: <REDACTED>")
    .replace(/(["']?)([A-Za-z][A-Za-z0-9_-]*)\1\s*([:=])\s*(?:["'][^"']*["']|[^\s,;}]+)/g, (match, quote, key, separator) => isSecretKey(key) ? `${quote}${key}${quote}${separator}<REDACTED>` : match)
    .replace(/\b([A-Za-z][A-Za-z0-9+.-]*:\/\/)[^\s/@:]+:[^\s/@]+@/g, "$1<REDACTED>@")
    .replace(/(^|[\s"'=(:,;\[{])((?:\/(?!\/)[^\s"',;}\]]+)|(?:\.\.?\/[^\s"',;}\]]+)|(?:[A-Za-z]:\\[^\s"',;}\]]+)|(?:(?:[^\s\\/:*?"<>|]+\\)+[^\s\\/:*?"<>|]+))/g, "$1<LOCAL_PATH>");
}
function redactJson(value) {
  if (Array.isArray(value)) return value.map(redactJson);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, isSecretKey(key) ? "<REDACTED>" : redactJson(item)]));
  return typeof value === "string" ? (wholeLocalPath(value) ? "<LOCAL_PATH>" : redactText(value)) : value;
}
export function redact(value) { const text=String(value); try { return JSON.stringify(redactJson(JSON.parse(text))); } catch { return redactText(text); } }

export function parseOmpVersion(output) {
  const match = String(output).match(/^\s*omp(?:\/|\s+v)(\d+\.\d+\.\d+)\s*$/);
  return match?.[1] ?? null;
}

export const executablePath = async (name, { invokingPath=process.env.PATH || "", exec, checkExecutable=path=>access(path, constants.X_OK) }={}) => {
  const { stdout } = await exec("/usr/bin/which", [name], { env: { PATH: invokingPath } });
  const path = String(stdout).trim().split(/\r?\n/)[0];
  if (!isAbsolute(path)) throw Error(name + " runtime must resolve to an absolute path");
  try { await checkExecutable(path); } catch { throw Error(name + " runtime is not executable: " + path); }
  return path;
};

export const closedPath = (executable, runtimeExecutable, systemDirs) => [...new Set([dirname(executable), ...(runtimeExecutable ? [dirname(runtimeExecutable)] : []), ...systemDirs])].join(":");

// Probe the launcher under the closed PATH first. Only a successful retry may declare bun part of OMP's executable closure.
export async function resolveOmpRuntimeClosure({ ompExecutable, invokingPath=process.env.PATH || "", systemDirs, probe, exec, checkExecutable }={}) {
  if (!isAbsolute(ompExecutable)) throw Error("absolute OMP executable is required");
  const basePath = closedPath(ompExecutable, undefined, systemDirs);
  try { return { runtimeExecutable: undefined, versionOutput: await probe(basePath) }; } catch (withoutRuntime) {
    let bun;
    try { bun = await executablePath("bun", { invokingPath, exec, checkExecutable }); }
    catch (error) { throw Error(`OMP launcher failed under closed PATH and bun prerequisite is unavailable: ${error.message}`, { cause: withoutRuntime }); }
    try { return { runtimeExecutable: bun, versionOutput: await probe(closedPath(ompExecutable, bun, systemDirs)) }; }
    catch (withRuntime) { throw new AggregateError([withoutRuntime, withRuntime], "OMP launcher failed with self-contained and validated bun runtime closure"); }
  }
}
