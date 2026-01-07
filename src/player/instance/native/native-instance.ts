import type { BufferInfo } from '../../../api/buffer-info';
import { PlaybackState } from '../../../api/playback-state';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
import type { NativeErrorMetadata } from '../../../api/error-metadata';
import VideoPlayerInstance, { type VideoPlayerEventHandlers } from '../base';

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

type NativeEventHandlersMap = Pick<VideoPlayerEventHandlers, NativeInstanceHandler>;

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
    declare protected eventHandlers: NativeEventHandlersMap | null;

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

        this.eventHandlers = {
            onLoadstart: () => {
                this.emit('playbackState', { state: PlaybackState.LOADING });
            },
            onCanplay: () => {
                this.emit('playbackState', { state: PlaybackState.READY });
            },
            onPlaying: () => {
                this.emit('playbackState', { state: PlaybackState.PLAYING });
            },
            onPause: () => {
                this.emit('playbackState', { state: PlaybackState.PAUSED });
            },
            onSeeking: () => {
                this.emit('playbackState', { state: PlaybackState.SEEKING });
            },
            onWaiting: () => {
                this.emit('playbackState', { state: PlaybackState.BUFFERING });
            },
            onEnded: () => {
                this.emit('playbackState', { state: PlaybackState.ENDED });
            },
            onTimeupdate: () => {
                if (!this.videoEl) {
                    throw new UnexpectedElementStateError('videoEl');
                }

                this.tech.updateBuffer(this.videoEl.buffered, this.videoEl.currentTime);

                this.emit('playbackState', { state: PlaybackState.TIMEUPDATE });
            },
            onError: () => {
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
        };

        this.videoEl.addEventListener(NativeInstanceEvent.LOADSTART, this.eventHandlers.onLoadstart);
        this.videoEl.addEventListener(NativeInstanceEvent.CANPLAY, this.eventHandlers.onCanplay);
        this.videoEl.addEventListener(NativeInstanceEvent.PLAYING, this.eventHandlers.onPlaying);
        this.videoEl.addEventListener(NativeInstanceEvent.PAUSE, this.eventHandlers.onPause);
        this.videoEl.addEventListener(NativeInstanceEvent.SEEKING, this.eventHandlers.onSeeking);
        this.videoEl.addEventListener(NativeInstanceEvent.WAITING, this.eventHandlers.onWaiting);
        this.videoEl.addEventListener(NativeInstanceEvent.ENDED, this.eventHandlers.onEnded);
        this.videoEl.addEventListener(NativeInstanceEvent.TIMEUPDATE, this.eventHandlers.onTimeupdate);
        this.videoEl.addEventListener(NativeInstanceEvent.ERROR, this.eventHandlers.onError);
    }

    protected unregisterListeners() {
        if (!this.videoEl || !this.eventHandlers) {
            return;
        }

        this.videoEl.removeEventListener(NativeInstanceEvent.LOADSTART, this.eventHandlers.onLoadstart);
        this.videoEl.removeEventListener(NativeInstanceEvent.CANPLAY, this.eventHandlers.onCanplay);
        this.videoEl.removeEventListener(NativeInstanceEvent.PLAYING, this.eventHandlers.onPlaying);
        this.videoEl.removeEventListener(NativeInstanceEvent.PAUSE, this.eventHandlers.onPause);
        this.videoEl.removeEventListener(NativeInstanceEvent.SEEKING, this.eventHandlers.onSeeking);
        this.videoEl.removeEventListener(NativeInstanceEvent.WAITING, this.eventHandlers.onWaiting);
        this.videoEl.removeEventListener(NativeInstanceEvent.ENDED, this.eventHandlers.onEnded);
        this.videoEl.removeEventListener(NativeInstanceEvent.TIMEUPDATE, this.eventHandlers.onTimeupdate);
        this.videoEl.removeEventListener(NativeInstanceEvent.ERROR, this.eventHandlers.onError);

        this.eventHandlers = null;
    }
}
