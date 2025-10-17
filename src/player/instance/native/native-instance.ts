import type { BufferInfo } from '../../../api/buffer-info';
import { PlaybackEvent } from '../../../api/playback-event';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
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
}

type NativeEventHandlersMap = Pick<VideoPlayerEventHandlers, NativeInstanceHandler>;

class NativeVideoPlayerInstanceTech {
    public bufferInfo: BufferInfo = { length: 0 };

    public updateBuffer(buffered: TimeRanges, currentTime: number) {
        let range = 0;

        while (!(buffered.start(range) <= currentTime && currentTime <= buffered.end(range))) {
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

    private tech: NativeVideoPlayerInstanceTech = new NativeVideoPlayerInstanceTech();

    public get buffer(): BufferInfo {
        return this.tech.bufferInfo;
    }

    constructor() {
        super();
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
                this.emit(PlaybackEvent.LOADING);
            },
            onCanplay: () => {
                this.emit(PlaybackEvent.READY);
            },
            onPlaying: () => {
                this.emit(PlaybackEvent.PLAYING);
            },
            onPause: () => {
                this.emit(PlaybackEvent.PAUSED);
            },
            onSeeking: () => {
                this.emit(PlaybackEvent.SEEKING);
            },
            onWaiting: () => {
                this.emit(PlaybackEvent.BUFFERING);
            },
            onEnded: () => {
                this.emit(PlaybackEvent.ENDED);
            },
            onTimeupdate: () => {
                if (!this.videoEl) {
                    throw new UnexpectedElementStateError('videoEl');
                }

                this.tech.updateBuffer(this.videoEl.buffered, this.videoEl.currentTime);
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

        this.eventHandlers = null;
    }
}
