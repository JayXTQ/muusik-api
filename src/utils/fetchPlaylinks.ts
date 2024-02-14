import axios from "axios";
import { load } from "cheerio";

export default async function (url: string) {
    let links: string[] = [];

    try {
        const decodedUrl = decodeURIComponent(url).replace("?", "%3F");
        const response = await axios.get(decodedUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; MuusikFetch/1.0; +https://muusik.app/)"
            }
        });

        if (response.status !== 200) {
            return []
        }

        const $ = load(response.data);
        $("a.play-this-track-playlink").toArray().forEach(link => {
            const href = link.attribs.href;
            if ((href.includes("spotify") || href.includes("youtube")) && !links.includes(href)) {
                links.push(href);
            }
        });

        return links;
    } catch (_) {
        return []
    }
}