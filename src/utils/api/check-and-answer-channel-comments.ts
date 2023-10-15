import { UploadVideoParams } from "@/src/interfaces/upload-video-params";
import { getYoutubeOauth } from "@/src/utils/api/get-youtube-oauth";

export async function checkAndAnswerChannelComments(): Promise<any> {
  console.log(await getYoutubeOauth(), "resultAccessToken.text()");

  const result = await window.fetch(
    new Request("/api/youtube/check-and-anser-commnets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    })
  );
  const data = await result.text();
  console.log(data, "data");

  return data;
}
