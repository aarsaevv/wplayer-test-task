import VideoPlayerInstance from './instance/base';
import { PlaybackState, type VideoPlayerPlaybackMetadata } from '../api/playback-state';
import detectSourceType from '../helpers/detect-source-type';
import { throttle } from '../helpers/async';
import createVideoPlayerInstance from './instance/create-instance';

export default class VideoPlayer {
    protected videoEl: HTMLVideoElement;

    private instance: VideoPlayerInstance | null = null;

    constructor(videoEl: HTMLVideoElement) {
        this.videoEl = videoEl;
        this.setCurrentPlaybackState(PlaybackState.IDLE);
    }

    /**
     * TODO: Хорошо бы выводить буфер в процессе буферизации в будущем
     */
    protected logBufferInfo = throttle(() => {
        console.info('currentBufferInfo:', this.instance?.buffer);
    }, 1000);

    protected currentPlaybackState: PlaybackState = PlaybackState.IDLE;

    protected setCurrentPlaybackState(state: PlaybackState) {
        if (this.currentPlaybackState === PlaybackState.TIMEUPDATE) {
            this.logBufferInfo();

            return;
        }

        if (this.currentPlaybackState === state) {
            return;
        }

        this.currentPlaybackState = state;
    }

    async load(src: string) {
        if (!src) {
            if (this.instance) {
                this.instance.destroy();
            }

            this.setCurrentPlaybackState(PlaybackState.IDLE);
            return;
        }

        const sourceType = await detectSourceType(src);
        this.instance = createVideoPlayerInstance(sourceType);

        if (this.instance) {
            this.instance.init();
            this.instance.attachMedia(this.videoEl);
            this.instance.load(src);
            this.instance.play();

            this.instance.emitter.on('playbackState', (metadata: VideoPlayerPlaybackMetadata) => {
                console.info('playbackState:', metadata);

                const { state } = metadata;
                this.setCurrentPlaybackState(state);
            });

            this.instance.emitter.on('error', () => {});
        }
    }

    destroy() {
        if (this.instance) {
            this.instance.destroy();

            this.instance.emitter.off('playbackState');
            this.instance.emitter.off('error');

            this.instance = null;
        }

        this.setCurrentPlaybackState(PlaybackState.IDLE);
    }
}
