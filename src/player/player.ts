import { DashVideoPlayerInstance } from './instance/dash/dash-instance';
import { HlsVideoPlayerInstance } from './instance/hls/hls-instance';
import { NativeVideoPlayerInstance } from './instance/native/native-instance';
import Videoinstance from './instance/base';
import { PlaybackEvent } from '../api/playback-event';
import detectSourceType from '../helpers/detect-source-type';
import { throttle } from '../api/async';

export default class VideoPlayer {
    protected videoEl: HTMLVideoElement;

    private instance: Videoinstance | null = null;

    constructor(videoEl: HTMLVideoElement) {
        this.videoEl = videoEl;
        this.setCurrentPlaybackState(PlaybackEvent.IDLE);
    }

    /**
     * TODO: Хорошо бы выводить буфер в процессе буферизации в будущем
     */
    protected logBufferInfo = throttle(() => {
        console.info('currentBufferInfo:', this.instance?.buffer);
    }, 1000);

    protected currentPlaybackState: PlaybackEvent = PlaybackEvent.IDLE;

    protected setCurrentPlaybackState(event: PlaybackEvent) {
        if (this.currentPlaybackState === PlaybackEvent.TIMEUPDATE) {
            this.logBufferInfo();

            return;
        }

        if (this.currentPlaybackState === event) {
            return;
        }

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

        const type = await detectSourceType(src);

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
}
