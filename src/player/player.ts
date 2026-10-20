import VideoPlayerInstance from './instance/base';
import { PlaybackState, type VideoPlayerPlaybackMetadata } from '../api/playback-state';
import type { VideoPlayerErrorMetadata } from '../api/error-metadata';
import type { BufferInfo } from '../api/buffer-info';
import type { EmitterEvent } from '../api/event';
import mitt from '../helpers/emitter';
import detectSourceType from '../helpers/detect-source-type';
import { throttle } from '../helpers/async';
import createVideoPlayerInstance from './instance/create-instance';

export type VideoPlayerEvents = EmitterEvent & {
    bufferInfo: BufferInfo;
};

export default class VideoPlayer {
    protected videoEl: HTMLVideoElement;

    private instance: VideoPlayerInstance | null = null;

    public emitter = mitt<VideoPlayerEvents>();

    constructor(videoEl: HTMLVideoElement) {
        this.videoEl = videoEl;
        this.setCurrentPlaybackState(PlaybackState.IDLE);
    }

    // TIMEUPDATE используется как heartbeat для периодического опроса буфера
    protected reportBufferInfo = throttle(() => {
        const buffer = this.instance?.buffer;
        if (!buffer) {
            return;
        }

        console.info('currentBufferInfo:', buffer);
        this.emitter.emit('bufferInfo', buffer);
    }, 1000);

    protected currentPlaybackState: PlaybackState = PlaybackState.IDLE;

    protected setCurrentPlaybackState(state: PlaybackState) {
        // TIMEUPDATE — событие, а не устойчивое состояние: не храним его,
        // иначе машина состояний залипает и реальные переходы перестают отрабатывать.
        if (state === PlaybackState.TIMEUPDATE) {
            this.reportBufferInfo();
            return;
        }

        if (this.currentPlaybackState === state) {
            return;
        }

        this.currentPlaybackState = state;
        this.emitter.emit('playbackState', { state });
    }

    async load(src: string) {
        this.destroy();

        if (!src) {
            return;
        }

        const sourceType = await detectSourceType(src);

        if (sourceType === 'unknown') {
            this.reportError({
                type: 'UNSUPPORTED_SOURCE',
                details: `Unsupported source type: ${src}`,
                fatal: true,
            });
            return;
        }

        let instance: VideoPlayerInstance;
        try {
            instance = createVideoPlayerInstance(sourceType);
            // init() бросает UnexpectedLoadError, если библиотека не загрузилась в window
            instance.init();
            instance.attachMedia(this.videoEl);
            instance.load(src);
        } catch (error) {
            this.reportError({
                type: 'PLAYER_INIT_ERROR',
                details: error instanceof Error ? error.message : String(error),
                fatal: true,
            });
            return;
        }

        this.instance = instance;

        instance.emitter.on('playbackState', (metadata: VideoPlayerPlaybackMetadata) => {
            this.setCurrentPlaybackState(metadata.state);
        });

        instance.emitter.on('error', (metadata: VideoPlayerErrorMetadata) => {
            this.reportError(metadata);
        });

        instance.play().catch((error) => {
            console.error('[wplayer] play() failed:', error);
        });
    }

    destroy() {
        if (this.instance) {
            this.instance.emitter.off('playbackState');
            this.instance.emitter.off('error');

            this.instance.destroy();
            this.instance = null;
        }

        this.emitter.emit('bufferInfo', { length: 0 });
        this.setCurrentPlaybackState(PlaybackState.IDLE);
    }

    private reportError(metadata: VideoPlayerErrorMetadata) {
        console.error('[wplayer] error:', metadata);
        this.emitter.emit('error', metadata);
    }
}
