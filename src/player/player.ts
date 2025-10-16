import { DashVideoPlayerInstance } from './instance/dash/dash-instance';
import { HlsVideoPlayerInstance } from './instance/hls/hls-instance';
import { NativeVideoPlayerInstance } from './instance/native/native-instance';
import Videoinstance from './instance/base';
import { PlaybackEvent } from '../api/playback-event';

export default class VideoPlayer {
    protected videoEl: HTMLVideoElement;

    private instance: Videoinstance | null = null;

    constructor(videoEl: HTMLVideoElement) {
        this.videoEl = videoEl;
        this.setCurrentPlaybackState(PlaybackEvent.IDLE);
    }

    protected currentPlaybackState: PlaybackEvent = PlaybackEvent.IDLE;

    protected setCurrentPlaybackState(event: PlaybackEvent) {
        this.currentPlaybackState = event;
        console.info('currentPlaybackState:', this.currentPlaybackState);
    }

    async load(src: string) {
        if (!src) {
            if (this.instance) {
                this.instance.destroy();
            }
            this.setCurrentPlaybackState(PlaybackEvent.IDLE);
            return;
        }

        const type = await this.detectSourceType(src);

        switch (type) {
            case 'native':
                this.instance = new NativeVideoPlayerInstance();
                break;
            case 'dash':
                this.instance = new DashVideoPlayerInstance();
                break;
            case 'hls':
                this.instance = new HlsVideoPlayerInstance();
                break;
        }

        if (this.instance) {
            this.instance.init();
            this.instance.attachMedia(this.videoEl);
            this.instance.load(src);
            this.instance.play();

            this.instance.emitter.on('playbackEvent', (event) => {
                this.setCurrentPlaybackState(event);
            });
        }
    }

    destroy() {
        if (this.instance) {
            this.instance.destroy();
            this.instance.emitter.off('playbackEvent');
        }

        this.setCurrentPlaybackState(PlaybackEvent.IDLE);
    }

    private async detectSourceType(url: string) {
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
        }
    }
}
