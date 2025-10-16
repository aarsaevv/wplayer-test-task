import { DashVideoPlayerInstance } from './instance/dash/dash-instance';
import { HlsVideoPlayerInstance } from './instance/hls/hls-instance';
import { NativeVideoPlayerInstance } from './instance/native/native-instance';
import Videoinstance from './instance/base';
import mitt from './event/emitter';
import type { PlaybackEvents } from '../api/playback-event';

export default class VideoPlayer {
    protected videoEl: HTMLVideoElement;
    protected emitter = mitt<PlaybackEvents>();

    private instance: Videoinstance | null = null;

    constructor(videoEl: HTMLVideoElement) {
        this.videoEl = videoEl;
    }

    load(src: string) {
        switch (true) {
            case src.includes('mp4'):
                this.instance = new NativeVideoPlayerInstance();
                break;
            case src.includes('mpd'):
                this.instance = new DashVideoPlayerInstance();
                break;
            case src.includes('m3u8'):
                this.instance = new HlsVideoPlayerInstance();
                break;
        }

        if (this.instance) {
            this.instance.init();
            this.instance.attachMedia(this.videoEl);
            this.instance.load(src);
            this.instance.play();

            this.instance.emitter.on('playbackEvent', (data) => {
                console.warn('videoPlaybackEvent:', data);
            });
        }
    }

    destroy() {
        if (this.instance) {
            this.instance.destroy();

            this.instance.emitter.off('playbackEvent');
        }
    }
}
