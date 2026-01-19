// saveAvailability.js (serverless endpoint)
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { availabilityData, memberId } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = "GDAbomination";
  const REPO_NAME = "availability-tracker";
  const FILE_PATH = "availability.json";
  const BRANCH = "main";

  try {
    // Get current SHA
    const getResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await getResp.json();
    const sha = data.sha;

    // Update file
    const putResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Update availability by ${memberId}`,
        content: Buffer.from(JSON.stringify(availabilityData, null, 2)).toString("base64"),
        sha,
        branch: BRANCH
      })
    });

    const result = await putResp.json();
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
