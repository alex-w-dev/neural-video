import type { NextApiRequest, NextApiResponse } from "next";
import {
  getYoutubeForUser,
  getYoutubeCommentThreads,
  isMyCommentSnippet,
  replyComment,
} from "@/server/utils/youtube";
import { runCompletion } from "@/server/utils/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const youtube = getYoutubeForUser(req, res);

  const threadsData = await getYoutubeCommentThreads(youtube);
  const comments = threadsData?.data?.items || [];

  if (!comments) {
    res.send("No Comments!");
  }

  for (const comment of comments) {
    if (!comment.snippet?.topLevelComment?.snippet) {
      continue;
    }

    if (
      comment.snippet.totalReplyCount === 0 &&
      !isMyCommentSnippet(comment.snippet.topLevelComment.snippet)
    ) {
      // TODO answer comment
      console.log(
        `Need to answer the comment "${comment.snippet.topLevelComment.snippet.textOriginal}" of ${comment.snippet.topLevelComment.snippet.authorDisplayName}`
      );
      const gptAnswer = await runCompletion({
        messages: [
          {
            role: "user",
            content: `Вы выступаете в роли создателя видео, который вежливо и ёмко отвечает на комментарии к своим видео.
Вот первый комментарий: "${
              comment.snippet.topLevelComment.snippet.textOriginal as string
            }"
В ответе необходимо вернуть только фактический ответ на комментарий`,
          },
        ],
      });
      console.log(gptAnswer, "gptAnswer");
      await replyComment(youtube, {
        commentId: comment.snippet.topLevelComment.id as string,
        text: `${comment.snippet.topLevelComment.snippet.authorDisplayName}, вот ответ нейросети: ${gptAnswer}`,
      });

      break;
    } else if (comment.replies?.comments?.length) {
      // console.log("1", 1);
      const lastReply =
        comment.replies.comments[comment.replies.comments.length - 1];
      // console.log("lastReply", lastReply);
      if (lastReply.snippet && !isMyCommentSnippet(lastReply.snippet)) {
        // TODO answer comment
        console.log(
          `Need to answer the replay "${lastReply.snippet.textOriginal}" of ${lastReply.snippet.authorDisplayName} from the "${comment.snippet.topLevelComment.snippet.textOriginal}" comment `
        );
      }
    }
  }

  return res.send("OK");
}
