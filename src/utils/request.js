onst axios = require('axios');

/**
* Perform an HTTP GET request to a Twitter endpoint or public page.
*
* @param {string} sourceUrl - The URL to fetch.
* @param {Object} options
* @param {('api'|'html')} [options.type='api'] - Hint about the type of resource.
* @returns {Promise<{ data: any, sourceUrl: string }>}
*/
async function fetchSource(sourceUrl, options = {}) {
const { type = 'api' } = options;
const headers = {
'User-Agent':
'Mozilla/5.0 (compatible; TwitterFollowersScraper/1.0; +https://bitbash.dev)'
};

// Attach bearer token when calling API endpoints
if (type === 'api' && process.env.TWITTER_BEARER_TOKEN) {
headers.Authorization = `Bearer ${process.env.TWITTER_BEARER_TOKEN}`;
}

try {
const response = await axios.get(sourceUrl, {
headers,
timeout: 15000,
// Let axios decide how to parse; works for JSON and HTML.
validateStatus: (status) => status >= 200 && status < 400
});

console.log(
`[INFO] GET ${sourceUrl} -> ${response.status} (${response.headers['content-type'] || 'unknown content-type'})`
);

return {
data: response.data,
sourceUrl
};
} catch (err) {
if (err.response) {
console.error(
`[ERROR] Request failed (${err.response.status}) for ${sourceUrl}:`,
err.response.data && typeof err.response.data === 'string'
? err.response.data.slice(0, 200)
: err.response.data
);
} else if (err.request) {
console.error(
`[ERROR] No response received from ${sourceUrl}:`,
err.message
);
} else {
console.error(
`[ERROR] Request setup failed for ${sourceUrl}:`,
err.message
);
}

throw err;
}
}

module.exports = {
fetchSource
};