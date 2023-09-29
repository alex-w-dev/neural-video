import type { NextApiRequest, NextApiResponse } from "next";
import { runCompletion } from "@/server/utils/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.status(200).json({
    message:
      (await runCompletion({
        messages: [
          {
            role: "user",
            content: req.query.message || "10 случайных числел от 1 до 100",
          },
        ],
      })) + "",
  });
}
