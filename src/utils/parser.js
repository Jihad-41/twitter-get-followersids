onst cheerio = require('cheerio');

/**
 * Build a follower record in the standard format.
 */
function buildRecord({ id, username, sourceUrl, timestamp }) {
  const followerId = String(id || '').trim();
  const handle = username ? String(username).trim() : null;

  return {
    follower_id: followerId || null,
    username: handle,
    profile_url: handle
      ? `https://twitter.com/${handle.replace(/^@/, '')}`
      : followerId
      ? `https://twitter.com/i/user/${followerId}`
      : null,
    timestamp: timestamp,
    source_url: sourceUrl
  };
}

/**
 * Parse followers from a JSON structure returned by Twitter-like APIs.
 *
 * This is intentionally flexible to handle multiple shapes:
 * - v1.1 followers/ids.json -> { ids: [...] }
 * - v1.1 followers/list.json -> { users: [ { id_str, screen_name, ... } ] }
 * - v2 endpoints -> { data: [ { id, username, ... } ] }
 */
function parseJsonStructure(json, sourceUrl, timestamp) {
  const records = [];

  if (!json || typeof json !== 'object') {
    return records;
  }