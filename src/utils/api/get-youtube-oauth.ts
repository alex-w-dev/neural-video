export async function getYoutubeOauth(): Promise<any> {
  const resultAccessToken = await window.fetch(
    new Request("/api/youtube/oauth/refresh", {
      method: "GET",
    })
  );
  return await resultAccessToken.text();
}
