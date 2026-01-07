import type { BufferInfo } from '../../../api/buffer-info';
import { PlaybackState } from '../../../api/playback-state';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
import type { NativeErrorMetadata } from '../../../api/error-metadata';
import VideoPlayerInstance from '../base';

export enum NativeInstanceEvent {
    LOADSTART = 'loadstart',
    CANPLAY = 'canplay',
    PLAYING = 'playing',
    PAUSE = 'pause',
    SEEKING = 'seeking',
    WAITING = 'waiting',
    ENDED = 'ended',
    TIMEUPDATE = 'timeupdate',
    ERROR = 'error',
}

export enum NativeInstanceHandler {
    ON_LOADSTART = 'onLoadstart',
    ON_CANPLAY = 'onCanplay',
    ON_PLAYING = 'onPlaying',
    ON_PAUSE = 'onPause',
    ON_SEEKING = 'onSeeking',
    ON_WAITING = 'onWaiting',
    ON_ENDED = 'onEnded',
    ON_TIMEUPDATE = 'onTimeupdate',
    ON_ERROR = 'onError',
}

/**
 * @private Do not use outside of this file/module
 */
class _NativeVideoPlayerInstanceTech {
    bufferInfo: BufferInfo = { length: 0 };

    updateBuffer(buffered: TimeRanges, currentTime: number) {
        let range = 0;

        while (buffered.start(range) > currentTime || currentTime > buffered.end(range)) {
            range += 1;
        }

        const bufferStart = buffered.start(range);
        const bufferEnd = buffered.end(range);

        const length = bufferEnd - bufferStart;

        this.bufferInfo = { length };
    }
}

export class NativeVideoPlayerInstance extends VideoPlayerInstance {
    declare protected abortController: AbortController | null;

    private tech = new _NativeVideoPlayerInstanceTech();

    public get buffer(): BufferInfo {
        return this.tech.bufferInfo;
    }

    public init() {
        return Promise.resolve(undefined);
    }

    public attachMedia(element: HTMLVideoElement) {
        super.attachMedia(element);

        this.registerListeners();
    }

    public destroy() {
        this.unregisterListeners();

        if (this.videoEl) {
            this.videoEl.src = '';
            this.videoEl.load();
        }

        this.detachMedia();
    }

    public load(src: string) {
        if (!this.videoEl) {
            throw new UnexpectedElementStateError('videoEl');
        }

        this.videoEl.src = src;
    }

    public play(): Promise<void> {
        if (!this.videoEl) {
            throw new UnexpectedElementStateError('videoEl');
        }

        return this.videoEl.play();
    }

    public pause() {
        if (!this.videoEl) {
            throw new UnexpectedElementStateError('videoEl');
        }

        return this.videoEl.pause();
    }

    public seekTo(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    protected registerListeners() {
        if (!this.videoEl) {
            throw new UnexpectedElementStateError('videoEl');
        }

        this.abortController = new AbortController();
        const { signal } = this.abortController;

        this.videoEl.addEventListener(
            NativeInstanceEvent.LOADSTART,
            () => this.emit('playbackState', { state: PlaybackState.LOADING }),
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.CANPLAY,
            () => this.emit('playbackState', { state: PlaybackState.READY }),
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.PLAYING,
            () => this.emit('playbackState', { state: PlaybackState.PLAYING }),
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.PAUSE,
            () => this.emit('playbackState', { state: PlaybackState.PAUSED }),
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.SEEKING,
            () => this.emit('playbackState', { state: PlaybackState.SEEKING }),
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.WAITING,
            () => this.emit('playbackState', { state: PlaybackState.BUFFERING }),
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.ENDED,
            () => this.emit('playbackState', { state: PlaybackState.ENDED }),
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.TIMEUPDATE,
            () => {
                if (!this.videoEl) {
                    throw new UnexpectedElementStateError('videoEl');
                }

                this.tech.updateBuffer(this.videoEl.buffered, this.videoEl.currentTime);

                this.emit('playbackState', { state: PlaybackState.TIMEUPDATE });
            },
            { signal }
        );
        this.videoEl.addEventListener(
            NativeInstanceEvent.ERROR,
            () => {
                if (!this.videoEl?.error) {
                    return;
                }

                const errorTypes: Record<number, string> = {
                    1: 'MEDIA_ERR_ABORTED',
                    2: 'MEDIA_ERR_NETWORK',
                    3: 'MEDIA_ERR_DECODE',
                    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
                };

                const errorData: NativeErrorMetadata = {
                    type: errorTypes[this.videoEl.error.code] || 'MEDIA_ERR_UNKNOWN',
                    details: this.videoEl.error.message,
                    fatal: true,
                    code: this.videoEl.error.code,
                };
                this.emit('error', errorData);
            },
            { signal }
        );
    }

    protected unregisterListeners() {
        if (!this.videoEl) {
            return;
        }

        this.abortController?.abort();
    }
}
