import type { NextApiRequest, NextApiResponse } from "next";
import {
  getYoutubeForUser,
  getYoutubeCommentThreads,
  isMyCommentSnippet,
  replyComment,
} from "@/server/utils/youtube";
import { runCompletion } from "@/server/utils/openai";
import { ChatCompletionMessageParam } from "openai/src/resources/chat/completions";

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
            content: `Вы выступаете в роли создателя видео, который вежливо и подробно отвечает на комментарии к своим видео.
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
        text: `${
          comment.snippet.topLevelComment.snippet.authorDisplayName
            ? `@${comment.snippet.topLevelComment.snippet.authorDisplayName} , н`
            : "Н"
        }ейросеть ответила: ${gptAnswer}`,
      });
    } else if (comment.replies?.comments?.length) {
      comment.replies.comments.reverse(); // reverse because we have date order fyl first is last

      const lastReply =
        comment.replies.comments[comment.replies.comments.length - 1];
      // console.log("lastReply", lastReply);
      if (lastReply.snippet && !isMyCommentSnippet(lastReply.snippet)) {
        console.log(
          `Need to answer the replay "${lastReply.snippet.textOriginal}" of ${lastReply.snippet.authorDisplayName} from the "${comment.snippet.topLevelComment.snippet.textOriginal}" comment `
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
            ...comment.replies.comments
              .filter((c) => !!c.snippet)
              .map((comment) => ({
                role: (isMyCommentSnippet(comment.snippet!)
                  ? "assistant"
                  : "user") as ChatCompletionMessageParam["role"],
                content: comment.snippet!.textOriginal! || "",
              })),
          ],
        });
        console.log(gptAnswer, "gptAnswer");
        await replyComment(youtube, {
          commentId: comment.snippet.topLevelComment.id as string,
          text: `${
            lastReply.snippet.authorDisplayName
              ? `@${lastReply.snippet.authorDisplayName} , н`
              : "Н"
          }ейросеть ответила: ${gptAnswer}`,
        });
      }
    }
  }

  return res.send("OK");
}
