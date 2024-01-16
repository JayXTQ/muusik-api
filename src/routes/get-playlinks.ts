import { Hono } from 'hono';
import axios, { AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { playlinks } from '../utils/fetchPlaylinks'

export const get_playlinks = (app: Hono) => {
    app.get("/get-playlinks", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { url } = c.req.query() as { url: string };

        if (!url) {
            return c.json({ success: false, message: "No URL provided" }, 400);
        }

        return c.json({ success: true, links: await playlinks(url) })
    });
};
