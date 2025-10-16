import { PlaybackEvent } from '../../../api/playback-event';
import { loadDashModule } from '../../loader/dash-loader';
import VideoPlayerInstance from '../base';

export class DashVideoPlayerInstance extends VideoPlayerInstance {
    private tech: typeof dashjs.MediaPlayerClass;

    constructor() {
        super();
    }

    public init() {
        this.tech = loadDashModule();
    }

    public destroy() {
        this.unregisterListeners();

        this.tech.destroy();

        this.detachMedia();
    }

    public load(src: string) {
        this.tech.initialize(this.videoEl, src);

        this.registerListeners();
    }

    public play(): Promise<void> {
        return this.tech.play();
    }

    public pause() {
        return this.tech.pause();
    }

    public seekTo(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    protected registerListeners() {
        this.eventHandlers = {
            onManifestLoadingStarted: () => {
                this.emit(PlaybackEvent.LOADING);
            },
            onCanPlay: () => {
                this.emit(PlaybackEvent.READY);
            },
            onPlaybackStarted: () => {
                this.emit(PlaybackEvent.PLAYING);
            },
            onPlaybackPaused: () => {
                this.emit(PlaybackEvent.PAUSED);
            },
            onPlaybackSeeking: () => {
                this.emit(PlaybackEvent.SEEKING);
            },
            onBufferStalled: () => {
                this.emit(PlaybackEvent.BUFFERING);
            },
            onPlaybackEnded: () => {
                this.emit(PlaybackEvent.ENDED);
            },
        };

        this.tech.on('manifestLoadingStarted', this.eventHandlers.onManifestLoadingStarted);
        this.tech.on('canPlay', this.eventHandlers.onCanPlay);
        this.tech.on('playbackStarted', this.eventHandlers.onPlaybackStarted);
        this.tech.on('playbackPaused', this.eventHandlers.onPlaybackPaused);
        this.tech.on('playbackSeeking', this.eventHandlers.onPlaybackSeeking);
        this.tech.on('bufferStalled', this.eventHandlers.onBufferStalled);
        this.tech.on('playbackEnded', this.eventHandlers.onPlaybackEnded);
    }

    protected unregisterListeners() {
        if (!this.eventHandlers) {
            return;
        }

        this.tech.off('manifestLoadingStarted', this.eventHandlers.onManifestLoadingStarted);
        this.tech.off('canPlay', this.eventHandlers.onCanPlay);
        this.tech.off('playbackStarted', this.eventHandlers.onPlaybackStarted);
        this.tech.off('playbackPaused', this.eventHandlers.onPlaybackPaused);
        this.tech.off('playbackSeeking', this.eventHandlers.onPlaybackSeeking);
        this.tech.off('bufferStalled', this.eventHandlers.onBufferStalled);
        this.tech.off('playbackEnded', this.eventHandlers.onPlaybackEnded);

        this.eventHandlers = null;
    }
}
