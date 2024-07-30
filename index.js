const express = require("express");
const axios = require("axios");
require("dotenv").config();

const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public")); // 讓 Express 服務靜態文件

const NOTION_API_KEY = process.env.NOTION_API_KEY; // 從環境變數中獲取 Notion API 密鑰
const DATABASE_ID = process.env.DATABASE_ID;

// 獲取所有文章
app.get("/notion-articles", async (req, res) => {
    const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
    try {
        const response = await axios.post(
            url,
            {},
            {
                headers: {
                    Authorization: `Bearer ${NOTION_API_KEY}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json",
                },
            },
        );

        const articles = response.data.results.map((page) => ({
            id: page.id,
            title:
                page.properties?.Title?.title?.[0]?.text?.content || "No Title",
            description:
                page.properties?.Author?.rich_text?.[0]?.text?.content ||
                "No Description",
            url: page.url,
            date: page.properties?.Tags?.date?.start || "",
        }));

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 獲取單個頁面內容
app.get("/notion-article/:id", async (req, res) => {
    const pageId = req.params.id;
    try {
        const response = await axios.get(
            `https://api.notion.com/v1/blocks/${pageId}/children`,
            {
                headers: {
                    Authorization: `Bearer ${NOTION_API_KEY}`,
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28",
                },
            },
        );

        const pageContent = response.data.results;
        res.json(pageContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
