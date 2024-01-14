import axios from 'axios';

export async function searchSongs(query: string | null) {
    try {
        const response = await axios.get(`http://ws.audioscrobbler.com/2.0/`, {
            params: {
                method: 'track.search',
                track: query,
                api_key: process.env.LASTFM_API_KEY,
                format: 'json'
            }
        });

        const tracks = response.data.results.trackmatches.track;
        return tracks.map((track: { name: any; }) => ({
            name: track.name,
            value: track.name
        })).slice(0, 25);
    } catch (error) {
        console.error('Error searching songs:', error);
        return [];
    }
}
