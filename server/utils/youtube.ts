import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library/build/src/auth/oauth2client";
import { google } from "googleapis";
import { getCookie } from "cookies-next";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import Schema$CommentSnippet = youtube_v3.Schema$CommentSnippet;

export const YOUTUBE_AUTH_COOKIE_KEY = "youtubeTokens";

export function getAuthClient(
  req?: NextApiRequest,
  res?: NextApiResponse<any>,
): OAuth2Client {
  /**
   * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
   * from the client_secret.json file. To get these credentials for your application, visit
   * https://console.cloud.google.com/apis/credentials.
   */
  const oauth2Client: OAuth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_OAUTH_CLIENT_ID,
    process.env.YOUTUBE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/api/youtube/oauth",
  );

  if (req && res) {
    const tokensString = getCookie(YOUTUBE_AUTH_COOKIE_KEY, { req, res });

    if (tokensString) {
      oauth2Client.setCredentials(JSON.parse(tokensString));
    }
  }

  return oauth2Client;
}

export function getAuthUrl(): string {
  const oauth2Client = getAuthClient();

  // Access scopes for read-only Drive activity.
  const scopes = [
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube",
  ];

  // Generate a url that asks permissions for the Drive activity scope
  return oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    /** Pass in the scopes array defined above.
     * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
  });
}

export function getYoutubeForUser(
  req?: NextApiRequest,
  res?: NextApiResponse<any>,
): youtube_v3.Youtube {
  return google.youtube({
    version: "v3",
    auth: getAuthClient(req, res),
  });
}

export function getYoutubeCommentThreads(youtube: youtube_v3.Youtube) {
  return youtube.commentThreads.list({
    allThreadsRelatedToChannelId: process.env.YOUTUBE_CHANNEL_ID,
    maxResults: 100,
    part: ["snippet", "replies"],
    textFormat: "plainText",
    order: "time",
    moderationStatus: "published",
  });
}

export function isMyCommentSnippet(snippet: Schema$CommentSnippet): boolean {
  if (!snippet.authorChannelId) {
    return true;
  }

  return snippet.authorChannelId.value === process.env.YOUTUBE_CHANNEL_ID;
}
