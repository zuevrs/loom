"use strict";

const { createHash } = require("node:crypto");

function fail(message) { throw new Error(`invalid STORY: ${message}`); }
function exactObject(value, keys, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) fail(name + " must be a plain object");
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== keys.length || keys.some((key) => !Object.hasOwn(value, key)) || ownKeys.some((key) => typeof key !== "string" || !keys.includes(key))) fail(name + " must have exactly: " + keys.join(", "));
}
function exactSchemaMismatches(value, keys, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) return [`${name} must be an exact plain object`];
  const ownKeys = Reflect.ownKeys(value);
  const mismatches = [];
  for (const key of keys) if (!Object.hasOwn(value, key)) mismatches.push(`${name} missing ${key}`);
  for (const key of ownKeys) {
    if (typeof key !== "string") mismatches.push(`${name} has symbol key`);
    else if (!keys.includes(key)) mismatches.push(`${name} has unknown key ${key}`);
  }
  return mismatches;
}
function nonemptyString(value) { return typeof value === "string" && value.length > 0; }
function stringArrayMismatches(value, name) {
  if (!Array.isArray(value)) return [`${name} must be an array of strings`];
  const mismatches = [];
  value.forEach((item, index) => { if (!nonemptyString(item)) mismatches.push(`${name}[${index}] must be a nonempty string`); });
  return mismatches;
}
function trimmedString(value) { return typeof value === "string" && value.trim().length > 0; }
function strictStringArrayMismatches(value, name, { nonempty = false, unique = false } = {}) {
  const mismatches = stringArrayMismatches(value, name);
  if (!Array.isArray(value)) return mismatches;
  value.forEach((item, index) => { if (typeof item === "string" && !item.trim()) mismatches.push(`${name}[${index}] must be nonblank`); });
  if (nonempty && value.length === 0) mismatches.push(`${name} must be nonempty`);
  if (unique && new Set(value).size !== value.length) mismatches.push(`${name} must be unique`);
  return mismatches;
}
function canonicalCopy(value) { return JSON.parse(JSON.stringify(value)); }
function hashValue(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function hashString(value) { return createHash("sha256").update(value).digest("hex"); }

module.exports = { canonicalCopy, exactObject, exactSchemaMismatches, fail, hashString, hashValue, nonemptyString, strictStringArrayMismatches, stringArrayMismatches, trimmedString };
