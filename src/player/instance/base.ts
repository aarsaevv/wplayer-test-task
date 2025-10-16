import type { PlaybackEvent, PlaybackEvents } from '../../api/playback-event';
import mitt from '../event/emitter';

export default abstract class VideoPlayerInstance {
    protected videoEl: HTMLVideoElement | undefined;
    public emitter = mitt<PlaybackEvents>();

    public eventHandlers: any = {};

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

    public emit(event: PlaybackEvent) {
        this.emitter.emit('playbackEvent', event);
    }
}
