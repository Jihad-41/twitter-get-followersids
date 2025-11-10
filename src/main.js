onst path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');
const Ajv = require('ajv');

const { fetchSource } = require('./utils/request');
const { parseFollowers } = require('./utils/parser');
const { saveDataset } = require('./storage/datasetHandler');

dotenv.config();

/**
* Load JSON file from disk.
*/
async function loadJson(filePath) {
try {
const raw = await fs.readFile(filePath, 'utf8');
return JSON.parse(raw);
} catch (err) {
console.error(`[ERROR] Failed to load JSON from ${filePath}:`, err.message);
throw err;
}
}

/**
* Validate input data against JSON schema.
*/
function validateInputs(schema, data) {
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
console.error('[ERROR] Input configuration failed schema validation:');
for (const err of validate.errors || []) {
console.error(`  - ${err.instancePath || '(root)'} ${err.message}`);
}
throw new Error('Input configuration does not match schema.json');
}

return data;
}

/**
* Main runner.
*/
async function run() {
const inputPath =
process.argv[2] ||
path.join(__dirname, '..', 'data', 'inputs.sample.json');
const outputPath =
process.argv[3] ||
path.join(__dirname, '..', 'data', 'output.sample.json');

console.log('[INFO] Twitter Get FollowersIds Scraper starting...');
console.log(`[INFO] Using input config: ${inputPath}`);
console.log(`[INFO] Output dataset path: ${outputPath}`);

try {
const schemaPath = path.join(__dirname, 'config', 'schema.json');
const schema = await loadJson(schemaPath);

const inputs = await loadJson(inputPath);
validateInputs(schema, inputs);

const allRecords = [];
for (const [index, item] of inputs.entries()) {
const sourceUrl = item.source_url;
const type = item.type || 'api';

console.log(
`[INFO] Processing source ${index + 1}/${inputs.length}: ${sourceUrl} (type=${type})`
);

try {
const { data } = await fetchSource(sourceUrl, { type });
const records = parseFollowers(data, sourceUrl);
console.log(
`[INFO] Extracted ${records.length} follower records from ${sourceUrl}`
);
allRecords.push(...records);
} catch (err) {
console.error(
`[WARN] Failed to process ${sourceUrl}: ${err.message}`
);
}
}

console.log(
`[INFO] Total records collected from all sources: ${allRecords.length}`
);

await saveDataset(outputPath, allRecords, { append: false });
console.log('[INFO] Dataset saved successfully. Scraper finished.');
} catch (err) {
console.error('[FATAL] Scraper terminated with error:', err.message);
process.exitCode = 1;
}
}

if (require.main === module) {
run();
}