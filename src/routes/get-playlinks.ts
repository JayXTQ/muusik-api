import { Hono } from 'hono';
import axios, { AxiosResponse } from 'axios';
import { load } from 'cheerio';

export const get_playlinks = (app: Hono) => {
    app.get("/get-playlinks", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { url } = c.req.query() as { url: string };

        if (!url) {
            return c.json({ success: false, message: "No URL provided" }, 400);
        }

        let links: string[] = [];

        try {
            const decodedUrl = decodeURIComponent(url);
            const response = await axios.get(decodedUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; MuusikFetch/1.0; +https://muusik.app/)"
                }
            });

            if (response.status !== 200) {
                return c.json({ success: false, message: "Error fetching song data" }, response.status);
            }

            const $ = load(response.data);
            $("a.play-this-track-playlink").toArray().forEach(link => {
                const href = link.attribs.href;
                if ((href.includes("spotify") || href.includes("youtube") || href.includes("apple")) && !links.includes(href)) {
                    links.push(href);
                }
            });

            return c.json({ links, success: true });
        } catch (error: any) {
            console.error("Error in /get-playlinks:", error);
            return c.json({ success: false, message: "Server error", details: error.message }, 500);
        }
    });
};
