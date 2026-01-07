export interface VideoPlayerErrorMetadata {
    type: string;
    details: string;
    fatal: boolean;
}

export interface HlsErrorMetadata extends VideoPlayerErrorMetadata {
    error?: Error;
}

export interface DashErrorMetadata extends VideoPlayerErrorMetadata {
    error?: Error;
}

export interface NativeErrorMetadata extends VideoPlayerErrorMetadata {
    code?: number;
}
