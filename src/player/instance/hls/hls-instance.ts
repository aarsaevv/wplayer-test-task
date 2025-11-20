import { PlaybackState } from '../../../api/playback-state';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
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
    ON_PLAYING = 'onPlaying',
    ON_PAUSE = 'onPause',
    ON_SEEKING = 'onSeeking',
    ON_ENDED = 'onEnded',
    ON_TIMEUPDATE = 'onTimeupdate',
}

type HlsEventHandlers = Pick<VideoPlayerEventHandlers, HlsInstanceHandler>;

export class HlsVideoPlayerInstance extends VideoPlayerInstance {
    declare protected eventHandlers: HlsEventHandlers | null;

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

        this.eventHandlers = {
            onManifestLoading: () => {
                this.emit(PlaybackState.LOADING);
            },
            onManifestParsed: () => {
                this.emit('playbackState', { state: PlaybackState.READY });
            },
            onFragLoading: () => {
                this.emit('playbackState', { state: PlaybackState.BUFFERING });
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
            onEnded: () => {
                this.emit('playbackState', { state: PlaybackState.ENDED });
            },
            onTimeupdate: () => {
                this.emit('playbackState', { state: PlaybackState.TIMEUPDATE });
            },
            onError: () => {
                this.emit('error', payload);
            }
        };

        this.tech.on(HlsInstanceEvent.MANIFEST_LOADING, this.eventHandlers.onManifestLoading);
        this.tech.on(HlsInstanceEvent.MANIFEST_PARSED, this.eventHandlers.onManifestParsed);
        this.tech.on(HlsInstanceEvent.FRAG_LOADING, this.eventHandlers.onFragLoading);
        this.tech.on(HlsInstanceEvent.ERROR, this.eventHandlers.onError);

        this.videoEl.addEventListener(HlsInstanceEvent.PLAYING, this.eventHandlers.onPlaying);
        this.videoEl.addEventListener(HlsInstanceEvent.PAUSE, this.eventHandlers.onPause);
        this.videoEl.addEventListener(HlsInstanceEvent.SEEKING, this.eventHandlers.onSeeking);
        this.videoEl.addEventListener(HlsInstanceEvent.ENDED, this.eventHandlers.onEnded);
        this.videoEl.addEventListener(HlsInstanceEvent.TIMEUPDATE, this.eventHandlers.onTimeupdate);
    }
    protected unregisterListeners() {
        if (!this.videoEl || !this.eventHandlers) {
            return;
        }

        this.tech.off(HlsInstanceEvent.MANIFEST_LOADING, this.eventHandlers.onManifestLoading);
        this.tech.off(HlsInstanceEvent.MANIFEST_PARSED, this.eventHandlers.onManifestParsed);
        this.tech.off(HlsInstanceEvent.FRAG_LOADING, this.eventHandlers.onFragLoading);
        this.tech.off(HlsInstanceEvent.ERROR, this.eventHandlers.onError);

        this.videoEl.removeEventListener(HlsInstanceEvent.PLAYING, this.eventHandlers.onPlaying);
        this.videoEl.removeEventListener(HlsInstanceEvent.PAUSE, this.eventHandlers.onPause);
        this.videoEl.removeEventListener(HlsInstanceEvent.SEEKING, this.eventHandlers.onSeeking);
        this.videoEl.removeEventListener(HlsInstanceEvent.ENDED, this.eventHandlers.onEnded);
        this.videoEl.removeEventListener(HlsInstanceEvent.TIMEUPDATE, this.eventHandlers.onTimeupdate);

        this.eventHandlers = null;
    }
}
