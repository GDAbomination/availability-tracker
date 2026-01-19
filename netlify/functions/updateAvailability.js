import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { jsonData, githubPath, branch } = JSON.parse(event.body);

  // GitHub repo info
  const owner = "GDAbomination";
  const repo = "availability-tracker";
  const path = githubPath || "availability.json";
  const targetBranch = branch || "main";

  // Your GitHub token (store in Netlify env var GITHUB_TOKEN)
  const token = process.env.GITHUB_TOKEN;

  // Get current SHA of the file
  const getRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${targetBranch}`,
    {
      headers: { Authorization: `token ${token}` },
    }
  );
  const data = await getRes.json();
  const sha = data.sha; // required to update existing file

  // Update file
  const updateRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update availability via web",
        content: Buffer.from(JSON.stringify(jsonData, null, 2)).toString(
          "base64"
        ),
        sha,
        branch: targetBranch,
      }),
    }
  );

  const result = await updateRes.json();
  return { statusCode: 200, body: JSON.stringify(result) };
}
