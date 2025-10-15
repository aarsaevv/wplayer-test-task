export default abstract class VideoPlayerInstance {
    protected videoEl: HTMLVideoElement | undefined;

    public get mediaEl() {
        return this.videoEl;
    }

    public attachMedia(element: HTMLVideoElement) {
        this.videoEl = element;
    }

    public detachMedia() {
        this.videoEl = undefined;
    }

    // TODO: Добавить эмиттер
    public on() {}
    public off() {}

    public abstract init(): void;
    public abstract destroy(): void;

    public abstract load(url: string): void;

    public abstract play(): Promise<void>;
    public abstract pause(): void;

    public abstract seekTo(): Promise<void>;

    protected abstract registerListeners(): void;
    protected abstract unregisterListeners(): void;
}
