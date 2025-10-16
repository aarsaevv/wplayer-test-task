import { PlaybackEvent } from '../../../api/playback-event';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
import VideoPlayerInstance from '../base';

export class NativeVideoPlayerInstance extends VideoPlayerInstance {
    constructor() {
        super();
    }

    public init() {
        return Promise.resolve(undefined);
    }

    public attachMedia(element: HTMLVideoElement): void {
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
            onPlay: () => {
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
        };

        this.videoEl.addEventListener('loadstart', this.eventHandlers.onLoadstart);
        this.videoEl.addEventListener('canplay', this.eventHandlers.onCanplay);
        this.videoEl.addEventListener('play', this.eventHandlers.onPlay);
        this.videoEl.addEventListener('pause', this.eventHandlers.onPause);
        this.videoEl.addEventListener('seeking', this.eventHandlers.onSeeking);
        this.videoEl.addEventListener('waiting', this.eventHandlers.onWaiting);
        this.videoEl.addEventListener('ended', this.eventHandlers.onEnded);
    }

    protected unregisterListeners() {
        if (!this.videoEl) {
            return;
        }

        this.videoEl.removeEventListener('loadstart', this.eventHandlers.onLoadstart);
        this.videoEl.removeEventListener('canplay', this.eventHandlers.onCanplay);
        this.videoEl.removeEventListener('play', this.eventHandlers.onPlay);
        this.videoEl.removeEventListener('pause', this.eventHandlers.onPause);
        this.videoEl.removeEventListener('seeking', this.eventHandlers.onSeeking);
        this.videoEl.removeEventListener('waiting', this.eventHandlers.onWaiting);
        this.videoEl.removeEventListener('ended', this.eventHandlers.onEnded);

        this.eventHandlers = null;
    }
}
