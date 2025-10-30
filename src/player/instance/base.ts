import type { BufferInfo } from '../../api/buffer-info';
import type { EmitterEvent } from '../../api/event';
import type { PlaybackState } from '../../api/playback-state';
import mitt from '../../helpers/emitter';

export type VideoPlayerEventHandlers = {
    // common
    onPlaying: () => void;
    onPause: () => void;
    onSeeking: () => void;
    onEnded: () => void;
    // native
    onLoadstart: () => void;
    onCanplay: () => void;
    onWaiting: () => void;
    onTimeupdate: () => void;
    // dash
    onManifestLoadingStarted: () => void;
    onCanPlay: () => void;
    onPlaybackPlaying: () => void;
    onPlaybackPaused: () => void;
    onPlaybackSeeking: () => void;
    onFragmentLoadingStarted: () => void;
    onPlaybackEnded: () => void;
    onPlaybackTimeUpdated: () => void;
    // hls
    onManifestLoading: () => void;
    onManifestParsed: () => void;
    onFragLoading: () => void;
};

export default abstract class VideoPlayerInstance {
    protected videoEl: HTMLVideoElement | undefined;
    public emitter = mitt<EmitterEvent>();

    protected eventHandlers: Partial<VideoPlayerEventHandlers> | null = null;

    public get buffer(): BufferInfo {
        return { length: 0 };
    }

    public attachMedia(element: HTMLVideoElement) {
        this.videoEl = element;
    }

    public detachMedia() {
        this.videoEl = undefined;
    }

    public abstract init(): void;
    public abstract destroy(): void;

    public abstract load(src: string): void;

    public abstract play(): Promise<void>;
    public abstract pause(): void;

    public abstract seekTo(): Promise<void>;

    protected abstract registerListeners(): void;
    protected abstract unregisterListeners(): void;

    public emit(state: PlaybackState) {
        this.emitter.emit('playbackState', state);
    }
}
