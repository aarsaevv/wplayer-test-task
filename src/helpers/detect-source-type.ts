type SourceType = Promise<'native' | 'dash' | 'hls' | 'unknown'>;

export default async function detectSourceType(url: string): SourceType {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('Content-Type') ?? '';

        if (contentType.startsWith('video/') || url.endsWith('.mp4')) {
            return 'native';
        }

        if (contentType.includes('application/dash+xml') || url.endsWith('.mpd')) {
            return 'dash';
        }

        if (contentType.includes('application/x-mpegURL') || url.endsWith('.m3u8')) {
            return 'hls';
        }

        return 'unknown';
    } catch (_) {
        if (url.endsWith('.mp4')) {
            return 'native';
        }

        if (url.endsWith('.mpd')) {
            return 'dash';
        }

        if (url.endsWith('.m3u8')) {
            return 'hls';
        }

        return 'unknown';
    }
}
