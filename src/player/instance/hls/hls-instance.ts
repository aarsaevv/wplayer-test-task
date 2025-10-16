import { PlaybackEvent } from '../../../api/playback-event';
import UnexpectedElementStateError from '../../../api/unexpected-element-state-error';
import { loadHlsModule } from '../../loader/hls-loader';
import VideoPlayerInstance from '../base';

export class HlsVideoPlayerInstance extends VideoPlayerInstance {
    private tech: typeof Hls;

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
            onPlay: () => {
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

        this.tech.on('hlsManifestLoading', this.eventHandlers.onManifestLoading);
        this.tech.on('hlsManifestParsed', this.eventHandlers.onManifestParsed);
        this.tech.on('hlsFragLoading', this.eventHandlers.onFragLoading);

        this.videoEl.addEventListener('play', this.eventHandlers.onPlay);
        this.videoEl.addEventListener('pause', this.eventHandlers.onPause);
        this.videoEl.addEventListener('seeking', this.eventHandlers.onSeeking);
        this.videoEl.addEventListener('ended', this.eventHandlers.onEnded);
    }
    protected unregisterListeners() {
        if (!this.videoEl) {
            return;
        }

        this.tech.off('hlsManifestLoading', this.eventHandlers.onManifestLoading);
        this.tech.off('hlsManifestParsed', this.eventHandlers.onManifestParsed);
        this.tech.off('hlsFragLoading', this.eventHandlers.onFragLoading);

        this.videoEl.removeEventListener('play', this.eventHandlers.onPlay);
        this.videoEl.removeEventListener('pause', this.eventHandlers.onPause);
        this.videoEl.removeEventListener('seeking', this.eventHandlers.onSeeking);
        this.videoEl.removeEventListener('ended', this.eventHandlers.onEnded);

        this.eventHandlers = null;
    }
}
