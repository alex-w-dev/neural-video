import { UploadVideoParams } from "@/src/interfaces/upload-video-params";
import { getYoutubeOauth } from "@/src/utils/api/get-youtube-oauth";
import { CommentVideoParams } from "@/src/interfaces/comment-video-params";

export async function commentVideo(params: CommentVideoParams): Promise<any> {
  console.log(await getYoutubeOauth(), "resultAccessToken.text()");

  const result = await window.fetch(
    new Request("/api/youtube/comment-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(params),
    })
  );
  const data = await result.json();

  console.log(data, "data");

  return data;
}
