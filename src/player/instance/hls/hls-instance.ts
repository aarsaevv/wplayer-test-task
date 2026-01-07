import { PlaybackState } from '../../../api/playback-state';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
import type { HlsErrorMetadata } from '../../../api/error-metadata';
import { loadHlsModule } from '../../loader/hls-loader';
import VideoPlayerInstance, { type VideoPlayerEventHandlers } from '../base';

export enum HlsInstanceEvent {
    MANIFEST_LOADING = 'hlsManifestLoading',
    MANIFEST_PARSED = 'hlsManifestParsed',
    FRAG_LOADING = 'hlsFragLoading',
    ERROR = 'hlsError',
    PLAYING = 'playing',
    PAUSE = 'pause',
    SEEKING = 'seeking',
    ENDED = 'ended',
    TIMEUPDATE = 'timeupdate',
}

export enum HlsInstanceHandler {
    ON_MANIFEST_LOADING = 'onManifestLoading',
    ON_MANIFEST_PARSED = 'onManifestParsed',
    ON_FRAG_LOADING = 'onFragLoading',
    ON_ERROR = 'onError',
}

type HlsEventHandlers = Pick<VideoPlayerEventHandlers, HlsInstanceHandler>;

export class HlsVideoPlayerInstance extends VideoPlayerInstance {
    declare protected eventHandlers: HlsEventHandlers | null;
    declare protected abortController: AbortController | null;

    private tech: typeof window.Hls;

    public get buffer() {
        const bufferInfo = this.tech.mainForwardBufferInfo;
        const bufferLength = bufferInfo.len;

        return { length: bufferLength };
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

        this.abortController = new AbortController();
        const { signal } = this.abortController;

        this.eventHandlers = {
            onManifestLoading: () => {
                this.emit('playbackState', { state: PlaybackState.LOADING });
            },
            onManifestParsed: () => {
                this.emit('playbackState', { state: PlaybackState.READY });
            },
            onFragLoading: () => {
                this.emit('playbackState', { state: PlaybackState.BUFFERING });
            },
            onError: (_: string, data: any) => {
                const errorData: HlsErrorMetadata = {
                    type: data.type,
                    details: data.details,
                    fatal: data.fatal,
                    error: data.error,
                };
                this.emit('error', errorData);
            },
        };

        this.tech.on(HlsInstanceEvent.MANIFEST_LOADING, this.eventHandlers.onManifestLoading);
        this.tech.on(HlsInstanceEvent.MANIFEST_PARSED, this.eventHandlers.onManifestParsed);
        this.tech.on(HlsInstanceEvent.FRAG_LOADING, this.eventHandlers.onFragLoading);
        this.tech.on(HlsInstanceEvent.ERROR, this.eventHandlers.onError);

        this.videoEl.addEventListener(
            HlsInstanceEvent.PLAYING,
            () => this.emit('playbackState', { state: PlaybackState.PLAYING }),
            { signal }
        );
        this.videoEl.addEventListener(
            HlsInstanceEvent.PAUSE,
            () => this.emit('playbackState', { state: PlaybackState.PAUSED }),
            { signal }
        );
        this.videoEl.addEventListener(
            HlsInstanceEvent.SEEKING,
            () => this.emit('playbackState', { state: PlaybackState.SEEKING }),
            { signal }
        );
        this.videoEl.addEventListener(
            HlsInstanceEvent.ENDED,
            () => this.emit('playbackState', { state: PlaybackState.ENDED }),
            { signal }
        );
        this.videoEl.addEventListener(
            HlsInstanceEvent.TIMEUPDATE,
            () => this.emit('playbackState', { state: PlaybackState.TIMEUPDATE }),
            { signal }
        );
    }
    protected unregisterListeners() {
        if (!this.videoEl || !this.eventHandlers) {
            return;
        }

        this.abortController?.abort();

        this.tech.off(HlsInstanceEvent.MANIFEST_LOADING, this.eventHandlers.onManifestLoading);
        this.tech.off(HlsInstanceEvent.MANIFEST_PARSED, this.eventHandlers.onManifestParsed);
        this.tech.off(HlsInstanceEvent.FRAG_LOADING, this.eventHandlers.onFragLoading);
        this.tech.off(HlsInstanceEvent.ERROR, this.eventHandlers.onError);

        this.eventHandlers = null;
    }
}
