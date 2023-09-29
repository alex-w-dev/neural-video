import type { NextApiRequest, NextApiResponse } from 'next'
import {Credentials} from "google-auth-library/build/src/auth/credentials";
import { setCookie} from "cookies-next";
import {getAuthClient, getAuthUrl, YOUTUBE_AUTH_COOKIE_KEY} from "@/server/utils/youtube";

type ResponseData = {
  message: string
}


/* Global variable that stores user credential in this code example.
 * ACTION ITEM for developers:
 *   Store user's refresh token in your data store if
 *   incorporating this code into your real app.
 *   For more information on handling refresh tokens,
 *   see https://github.com/googleapis/google-api-nodejs-client#handling-refresh-tokens
 */
let userCredential: Credentials | undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.query.error) { // An error response e.g. error=access_denied
    console.log('Error:' + req.query.error);

    return res.send({
      message: req.query.error as string
    });


  } else if (req.query.code) { // Get access and refresh tokens (if access_type is offline)
    let { tokens } = await getAuthClient().getToken(req.query.code as string);

    setCookie(YOUTUBE_AUTH_COOKIE_KEY, JSON.stringify(tokens), { req, res, maxAge: 60 * 60 * 24 });

    return res.send({
      message: 'OK'
    })
  }

  res.redirect(getAuthUrl());
}