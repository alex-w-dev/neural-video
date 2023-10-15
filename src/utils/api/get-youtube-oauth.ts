export async function getYoutubeOauth(): Promise<any> {
  const resultAccessToken = await window.fetch(
    new Request("/api/youtube/oauth/access-token", {
      method: "GET",
    })
  );
  return await resultAccessToken.text();
}
