interface VideoPlayerErrorPayload {}

interface NativeVideoPlayerErrorPayload extends VideoPlayerErrorPayload {}

interface HlsVideoPlayerErrorPayload extends VideoPlayerErrorPayload {
	type: unknown;
	details: unknown;
	fatal: boolean;
}

interface DashVideoPlayerErrorPayload extends VideoPlayerErrorPayload {}