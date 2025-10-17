import { PlaybackEvent } from '../../../api/playback-event';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
import { loadHlsModule } from '../../loader/hls-loader';
import VideoPlayerInstance, { type VideoPlayerEventHandlers } from '../base';

export enum HlsInstanceEvent {
    MANIFEST_LOADING = 'hlsManifestLoading',
    MANIFEST_PARSED = 'hlsManifestParsed',
    FRAG_LOADING = 'hlsFragLoading',
    PLAYING = 'playing',
    PAUSE = 'pause',
    SEEKING = 'seeking',
    ENDED = 'ended',
}

export enum HlsInstanceHandler {
    ON_MANIFEST_LOADING = 'onManifestLoading',
    ON_MANIFEST_PARSED = 'onManifestParsed',
    ON_FRAG_LOADING = 'onFragLoading',
    ON_PLAYING = 'onPlaying',
    ON_PAUSE = 'onPause',
    ON_SEEKING = 'onSeeking',
    ON_ENDED = 'onEnded',
}

type HlsEventHandlers = Pick<VideoPlayerEventHandlers, HlsInstanceHandler>;

export class HlsVideoPlayerInstance extends VideoPlayerInstance {
    declare protected eventHandlers: HlsEventHandlers | null;

    private tech: typeof Hls;

    public get buffer() {
        const bufferInfo = this.tech.mainForwardBufferInfo;
        const bufferLength = bufferInfo.len;

        return { length: bufferLength };
    }

    constructor() {
        super();
    }

    public init() {
        this.tech = loadHlsModule();
    }

    public destroy() {
        this.unregisterListeners();
        this.tech.stopLoad();
        this.tech.detachMedia();

        this.tech.destroy();

        this.detachMedia();
    }

    public load(src: string) {
        if (!this.videoEl) {
            throw new UnexpectedElementStateError('videoEl');
        }

        this.tech.loadSource(src);

        super.attachMedia(this.videoEl);
        this.tech.attachMedia(this.videoEl);

        this.registerListeners();
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
            onManifestLoading: () => {
                this.emit(PlaybackEvent.LOADING);
            },
            onManifestParsed: () => {
                this.emit(PlaybackEvent.READY);
            },
            onFragLoading: () => {
                this.emit(PlaybackEvent.BUFFERING);
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
            onEnded: () => {
                this.emit(PlaybackEvent.ENDED);
            },
        };

        this.tech.on(HlsInstanceEvent.MANIFEST_LOADING, this.eventHandlers.onManifestLoading);
        this.tech.on(HlsInstanceEvent.MANIFEST_PARSED, this.eventHandlers.onManifestParsed);
        this.tech.on(HlsInstanceEvent.FRAG_LOADING, this.eventHandlers.onFragLoading);

        this.videoEl.addEventListener(HlsInstanceEvent.PLAYING, this.eventHandlers.onPlaying);
        this.videoEl.addEventListener(HlsInstanceEvent.PAUSE, this.eventHandlers.onPause);
        this.videoEl.addEventListener(HlsInstanceEvent.SEEKING, this.eventHandlers.onSeeking);
        this.videoEl.addEventListener(HlsInstanceEvent.ENDED, this.eventHandlers.onEnded);
    }
    protected unregisterListeners() {
        if (!this.videoEl || !this.eventHandlers) {
            return;
        }

        this.tech.off(HlsInstanceEvent.MANIFEST_LOADING, this.eventHandlers.onManifestLoading);
        this.tech.off(HlsInstanceEvent.MANIFEST_PARSED, this.eventHandlers.onManifestParsed);
        this.tech.off(HlsInstanceEvent.FRAG_LOADING, this.eventHandlers.onFragLoading);

        this.videoEl.removeEventListener(HlsInstanceEvent.PLAYING, this.eventHandlers.onPlaying);
        this.videoEl.removeEventListener(HlsInstanceEvent.PAUSE, this.eventHandlers.onPause);
        this.videoEl.removeEventListener(HlsInstanceEvent.SEEKING, this.eventHandlers.onSeeking);
        this.videoEl.removeEventListener(HlsInstanceEvent.ENDED, this.eventHandlers.onEnded);

        this.eventHandlers = null;
    }
}
