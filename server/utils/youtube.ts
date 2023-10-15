import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library/build/src/auth/oauth2client";
import { google } from "googleapis";
import { getCookie } from "cookies-next";
import {
  Schema$Comment,
  youtube_v3,
} from "googleapis/build/src/apis/youtube/v3";
import Schema$CommentSnippet = youtube_v3.Schema$CommentSnippet;
import { GaxiosResponse } from "gaxios";
import { ReplyCoomentParams } from "@/src/interfaces/reply-cooment-params";
import { GaxiosPromise } from "googleapis-common";

export const YOUTUBE_AUTH_COOKIE_KEY = "youtubeTokens";

export function getAuthClient(
  req?: NextApiRequest,
  res?: NextApiResponse<any>
): OAuth2Client {
  /**
   * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
   * from the client_secret.json file. To get these credentials for your application, visit
   * https://console.cloud.google.com/apis/credentials.
   */
  const oauth2Client: OAuth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_OAUTH_CLIENT_ID,
    process.env.YOUTUBE_OAUTH_CLIENT_SECRET,
    "http://localhost:3000/api/youtube/oauth"
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
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtubepartner",
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
  res?: NextApiResponse<any>
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

export function replyComment(
  youtube: youtube_v3.Youtube,
  params: ReplyCoomentParams
): GaxiosPromise<Schema$Comment> {
  return youtube.comments.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        textOriginal: params.text,
        parentId: params.commentId,
      },
    },
  });
}

export function isMyCommentSnippet(snippet: Schema$CommentSnippet): boolean {
  if (!snippet.authorChannelId) {
    return true;
  }

  return snippet.authorChannelId.value === process.env.YOUTUBE_CHANNEL_ID;
}

/*
*
* {
  "kind": "youtube#videoCategoryListResponse",
  "etag": "fIIv2-q7-AkaOeJf0LPrlnu-0As",
  "items": [
    {
      "kind": "youtube#videoCategory",
      "etag": "grPOPYEUUZN3ltuDUGEWlrTR90U",
      "id": "1",
      "snippet": {
        "title": "Film & Animation",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "Q0xgUf8BFM8rW3W0R9wNq809xyA",
      "id": "2",
      "snippet": {
        "title": "Autos & Vehicles",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "qnpwjh5QlWM5hrnZCvHisquztC4",
      "id": "10",
      "snippet": {
        "title": "Music",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "HyFIixS5BZaoBdkQdLzPdoXWipg",
      "id": "15",
      "snippet": {
        "title": "Pets & Animals",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "PNU8SwXhjsF90fmkilVohofOi4I",
      "id": "17",
      "snippet": {
        "title": "Sports",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "5kFljz9YJ4lEgSfVwHWi5kTAwAs",
      "id": "18",
      "snippet": {
        "title": "Short Movies",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "ANnLQyzEA_9m3bMyJXMhKTCOiyg",
      "id": "19",
      "snippet": {
        "title": "Travel & Events",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "0Hh6gbZ9zWjnV3sfdZjKB5LQr6E",
      "id": "20",
      "snippet": {
        "title": "Gaming",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "q8Cp4pUfCD8Fuh8VJ_yl5cBCVNw",
      "id": "21",
      "snippet": {
        "title": "Videoblogging",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "cHDaaqPDZsJT1FPr1-MwtyIhR28",
      "id": "22",
      "snippet": {
        "title": "People & Blogs",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "3Uz364xBbKY50a2s0XQlv-gXJds",
      "id": "23",
      "snippet": {
        "title": "Comedy",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "0srcLUqQzO7-NGLF7QnhdVzJQmY",
      "id": "24",
      "snippet": {
        "title": "Entertainment",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "bQlQMjmYX7DyFkX4w3kT0osJyIc",
      "id": "25",
      "snippet": {
        "title": "News & Politics",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "Y06N41HP_WlZmeREZvkGF0HW5pg",
      "id": "26",
      "snippet": {
        "title": "Howto & Style",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "yBaNkLx4sX9NcDmFgAmxQcV4Y30",
      "id": "27",
      "snippet": {
        "title": "Education",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "Mxy3A-SkmnR7MhJDZRS4DuAIbQA",
      "id": "28",
      "snippet": {
        "title": "Science & Technology",
        "assignable": true,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "4pIHL_AdN2kO7btAGAP1TvPucNk",
      "id": "30",
      "snippet": {
        "title": "Movies",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "Iqol1myDwh2AuOnxjtn2AfYwJTU",
      "id": "31",
      "snippet": {
        "title": "Anime/Animation",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "tzhBKCBcYWZLPai5INY4id91ss8",
      "id": "32",
      "snippet": {
        "title": "Action/Adventure",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "ii8nBGYpKyl6FyzP3cmBCevdrbs",
      "id": "33",
      "snippet": {
        "title": "Classics",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "Y0u9UAQCCGp60G11Arac5Mp46z4",
      "id": "34",
      "snippet": {
        "title": "Comedy",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "_YDnyT205AMuX8etu8loOiQjbD4",
      "id": "35",
      "snippet": {
        "title": "Documentary",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "eAl2b-uqIGRDgnlMa0EsGZjXmWg",
      "id": "36",
      "snippet": {
        "title": "Drama",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "HDAW2HFOt3SqeDI00X-eL7OELfY",
      "id": "37",
      "snippet": {
        "title": "Family",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "QHiWh3niw5hjDrim85M8IGF45eE",
      "id": "38",
      "snippet": {
        "title": "Foreign",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "ztKcSS7GpH9uEyZk9nQCdNujvGg",
      "id": "39",
      "snippet": {
        "title": "Horror",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "Ids1sm8QFeSo_cDlpcUNrnEBYWA",
      "id": "40",
      "snippet": {
        "title": "Sci-Fi/Fantasy",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "qhfgS7MzzZHIy_UZ1dlawl1GbnY",
      "id": "41",
      "snippet": {
        "title": "Thriller",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "TxVSfGoUyT7CJ7h7ebjg4vhIt6g",
      "id": "42",
      "snippet": {
        "title": "Shorts",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "o9w6eNqzjHPnNbKDujnQd8pklXM",
      "id": "43",
      "snippet": {
        "title": "Shows",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    },
    {
      "kind": "youtube#videoCategory",
      "etag": "mLdyKd0VgXKDI6GevTLBAcvRlIU",
      "id": "44",
      "snippet": {
        "title": "Trailers",
        "assignable": false,
        "channelId": "UCBR8-60-B28hp2BmDPdntcQ"
      }
    }
  ]
}

* */
export const youtubeVideCategoryIds = {
  Entertainment: "24",
  Education: "27",
  ScienceTechnology: "28",
  Shorts: "42",
};
