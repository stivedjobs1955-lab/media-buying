const fs = require('node:fs');
const path = require('node:path');
const { google } = require('googleapis');

const TOKEN_PATH = path.join(__dirname, 'data', 'google-token.json');
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:53682/oauth2callback');

  if (!fs.existsSync(TOKEN_PATH)) return null;
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  client.setCredentials(token);
  return client;
}

function isConfigured() {
  return getOAuthClient() !== null;
}

// startISO/endISO must be full ISO datetimes, e.g. 2026-08-25T10:00:00+05:00
async function createMeetEvent({ summary, description, startISO, endISO, timeZone }) {
  const auth = getOAuthClient();
  if (!auth) return null;

  const calendar = google.calendar({ version: 'v3', auth });

  const requestId = `unique-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    conferenceDataVersion: 1,
    requestBody: {
      summary,
      description,
      start: { dateTime: startISO, timeZone: timeZone || 'Asia/Tashkent' },
      end: { dateTime: endISO, timeZone: timeZone || 'Asia/Tashkent' },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const event = res.data;
  const meetLink = event.hangoutLink
    || (event.conferenceData && event.conferenceData.entryPoints
        && (event.conferenceData.entryPoints.find((e) => e.entryPointType === 'video') || {}).uri)
    || null;

  return { meetLink, eventId: event.id, htmlLink: event.htmlLink };
}

module.exports = { isConfigured, createMeetEvent, getOAuthClient, TOKEN_PATH };
