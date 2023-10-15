import { UploadVideoParams } from "@/src/interfaces/upload-video-params";
import { getYoutubeOauth } from "@/src/utils/api/get-youtube-oauth";

export async function uploadVideo(params: UploadVideoParams): Promise<any> {
  console.log(await getYoutubeOauth(), "resultAccessToken.text()");

  const result = await window.fetch(
    new Request("/api/youtube/upload-video", {
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
