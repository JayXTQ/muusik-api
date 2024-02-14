import { Hono } from 'hono';
import axios, { AxiosResponse } from 'axios';

export default function (app: Hono) {
    app.get("/song-info", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { url } = c.req.query() as { url: string };

        if (!url) {
            return c.json({ success: false, message: "No URL provided" }, 400);
        }
        let albumCover: string = "";
        let songName: string = "";

        function spacesToPlus(str: string) {
            return str.replace(/ /g, "+");
        }

        try {
            await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM_API_KEY}&artist=${spacesToPlus(decodeURIComponent(url).replace("https://www.last.fm/music/", "").split("/")[0])}&track=${spacesToPlus(decodeURIComponent(url).replace("https://www.last.fm/music/", "").split("/")[2])}&format=json`).then((r) => {
                if (r.status !== 200) {
                    c.status(400);
                    return { success: false, message: r.data.message };
                }
                songName = `${r.data.track.name} - ${r.data.track.artist.name}`;
                if(r.data.track.album && r.data.track.album.image && r.data.track.album.image[3] && r.data.track.album.image[3]["#text"]) {
                    albumCover = r.data.track.album.image[3]["#text"]
                } else {
                    albumCover = "";
                }
            })

            return c.json({ albumCover, songName, success: true });
        } catch (error: any) {
            console.error("Error in /song-info:", error);
            return c.json({ success: false, message: "Server error", details: error.message }, 500);
        }
    });
};
