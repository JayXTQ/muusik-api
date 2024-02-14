import axios from 'axios';

export default async function (query: string): Promise<{ name: string, artist: string, url: string }[]> {
    try {
        const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${process.env.LASTFM_API_KEY}&format=json`);
        if (response.data.results && response.data.results.trackmatches && response.data.results.trackmatches.track) {
            const tracks = response.data.results.trackmatches.track;
            return tracks.map((track: any) => ({ name: track.name, artist: track.artist, url: track.url }));
        } else {
            // Handle case where trackmatches is not present or the structure is different
            console.log('Unexpected response structure:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching songs from LASTFM:', error);
        return [];
    }
}
