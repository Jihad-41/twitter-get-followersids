onst fs = require('fs').promises;
const path = require('path');

/**
* Ensure that the directory for a given file path exists.
*/
async function ensureDirectory(filePath) {
const dir = path.dirname(filePath);
await fs.mkdir(dir, { recursive: true });
}

/**
* Save dataset to disk as JSON.
*
* @param {string} filePath - Path where dataset should be stored.
* @param {Array<object>} records - Array of follower records.
* @param {Object} options
* @param {boolean} [options.append=false] - Whether to append to an existing file.
*/
async function saveDataset(filePath, records, options = {}) {
const { append = false } = options;

if (!Array.isArray(records)) {
throw new Error('records must be an array');
}

await ensureDirectory(filePath);

let finalRecords = records;

if (append) {
try {
const existingRaw = await fs.readFile(filePath, 'utf8');
const existing = JSON.parse(existingRaw);
if (Array.isArray(existing)) {
finalRecords = existing.concat(records);
}
} catch (err) {
if (err.code !== 'ENOENT') {
console.warn(
`[WARN] Failed to read existing dataset for append at ${filePath}:`,
err.message
);
}
}
}

const json = JSON.stringify(finalRecords, null, 2);

try {
await fs.writeFile(filePath, json, 'utf8');
console.log(
`[INFO] Saved ${finalRecords.length} records to dataset: ${filePath}`
);
} catch (err) {
console.error(
`[ERROR] Failed to write dataset to ${filePath}:`,
err.message
);
throw err;
}
}

module.exports = {
saveDataset
};