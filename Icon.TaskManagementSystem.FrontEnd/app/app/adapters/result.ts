export class Result<T> {
    protected constructor(
        public readonly value: T | undefined,
        public readonly status: _StatusInternal,
        public readonly message: string | undefined,
        public readonly messageDetails: unknown | undefined,
    ) {
    }

    get isSuccess(): boolean {
        return this.status != null && this.status.code != null && this.status.code >= 0 && this.status.code < 400;
    }

    get isLoading(): boolean {
        return this.status != null && this.status.code != null && this.status.code == StatusInternal.LOADING_STATE.code;
    }

    getValue(): T {
        if (this.value === undefined) {
            throw Error('Value is not defined due to failure state.');
        }
        return this.value;
    }

    getValueOrUndefined(): T | undefined {
        return this.value;
    }

    getStatus(): _StatusInternal {
        return this.status;
    }

    getMessage(): string | undefined {
        return this.message;
    }

    getMessageDetails(): unknown | undefined {
        return this.messageDetails;
    }

    clone<Z>(value?: Z | undefined, replacements?: { status?: _StatusInternal, message?: string | undefined, messageDetails?: unknown | undefined }): Result<Z> {
        return new Result<Z>(
            value,
            replacements?.status === undefined ? this.getStatus() : replacements.status,
            replacements?.message === undefined ? this.getMessage() : replacements.message,
            replacements?.messageDetails === undefined ? this.getMessageDetails() : replacements.messageDetails
        );
    }

    static Success<T>(value: T, status: _StatusInternal = StatusInternal.OK, message?: string, messageDetails?: unknown): Result<T> {
        return new Result<T>(value, status, message, messageDetails);
    }

    static Loading<T>(message?: string, messageDetails?: unknown): Result<T> {
        return new Result<T>(undefined, StatusInternal.LOADING_STATE, message, messageDetails);
    }

    static Failure<T>(
        status: _StatusInternal = StatusInternal.DEFAULT_ERROR,
        message?: string,
        messageDetails?: unknown
    ): Result<T> {
        return new Result<T>(undefined, status, message, messageDetails);
    }

    getFullDescription(): string {
        return `${this.getMessage() ?? ''}\r\n${this.getStatus().message} (Code: ${this.getStatus().code})\r\n`+((this.getMessageDetails() == null || ['""', '\'\'', '{}'].includes(JSON.stringify(this.getMessageDetails()))) ? '' : JSON.stringify(this.getMessageDetails())).trim();
    }

    toJson(): ResultJson<T> {
        return {
            isSuccess: this.isSuccess,
            isLoading: this.isLoading,
            value: this.getValueOrUndefined(),
            status: this.getStatus(),
            message: this.getMessage(),
            messageDetails: this.getMessageDetails(),
            fullDescription: this.getFullDescription()
        };
    }
}

export interface ResultJson<T = unknown> {
    readonly isSuccess: boolean,
    readonly isLoading: boolean,
    readonly value: T | undefined,
    readonly status: _StatusInternal,
    readonly message: string | undefined,
    readonly messageDetails: unknown | undefined,
    readonly fullDescription: string
}

interface _StatusInternal {
    readonly code: number,
    readonly message: string
}

export class StatusInternal {
    static OK: _StatusInternal = { code: 0, message: 'Success.' };
    static DEFAULT_ERROR: _StatusInternal = { code: -1, message: 'Error.' };
    // Network errors
    static NETWORK_ERROR: _StatusInternal = { code: -2, message: 'Network error.' };        // No internet, DNS fail, ECONNREFUSED
    static TIMEOUT: _StatusInternal = { code: -3, message: 'Request timeout.' };              // Request timeout
    static ABORTED: _StatusInternal = { code: -4, message: 'Request aborted.' };              // Request canceled (AbortController)
    static INVALID_REQUEST: _StatusInternal = { code: -5, message: 'Invalid request.' };      // Malformed URL, config error
    // App-level logic
    static LOADING_STATE: _StatusInternal = { code: -99, message: 'Loading.' };      // Loading state
    static VALIDATION_FAILED: _StatusInternal = { code: -100, message: 'Validation failed.' };  // Client-side form validation
    static INVALID_STATE: _StatusInternal = { code: -101, message: 'Invalid state.' };  // Invalid state
}

export class StatusHttp {
    // === HTTP 1xx: Informational ===
    static CONTINUE: _StatusInternal = { code: 100, message: 'Continue.' };
    static SWITCHING_PROTOCOLS: _StatusInternal = { code: 101, message: 'Switching Protocols.' };
    static PROCESSING: _StatusInternal = { code: 102, message: 'Processing.' };
    static EARLY_HINTS: _StatusInternal = { code: 103, message: 'Early Hints.' };

    // === HTTP 2xx: Success ===
    static OK_HTTP: _StatusInternal = { code: 200, message: 'OK.' };
    static CREATED: _StatusInternal = { code: 201, message: 'Created.' };
    static ACCEPTED: _StatusInternal = { code: 202, message: 'Accepted.' };
    static NON_AUTHORITATIVE_INFORMATION: _StatusInternal = { code: 203, message: 'Non-Authoritative Information.' };
    static NO_CONTENT: _StatusInternal = { code: 204, message: 'No Content.' };
    static RESET_CONTENT: _StatusInternal = { code: 205, message: 'Reset Content.' };
    static PARTIAL_CONTENT: _StatusInternal = { code: 206, message: 'Partial Content.' };
    static MULTI_STATUS: _StatusInternal = { code: 207, message: 'Multi-Status.' };
    static ALREADY_REPORTED: _StatusInternal = { code: 208, message: 'Already Reported.' };
    static IM_USED: _StatusInternal = { code: 226, message: 'IM Used.' };

    // === HTTP 3xx: Redirection ===
    static MULTIPLE_CHOICES: _StatusInternal = { code: 300, message: 'Multiple Choices.' };
    static MOVED_PERMANENTLY: _StatusInternal = { code: 301, message: 'Moved Permanently.' };
    static FOUND: _StatusInternal = { code: 302, message: 'Found.' };
    static SEE_OTHER: _StatusInternal = { code: 303, message: 'See Other.' };
    static NOT_MODIFIED: _StatusInternal = { code: 304, message: 'Not Modified.' };
    static USE_PROXY: _StatusInternal = { code: 305, message: 'Use Proxy.' };
    static TEMPORARY_REDIRECT: _StatusInternal = { code: 307, message: 'Temporary Redirect.' };
    static PERMANENT_REDIRECT: _StatusInternal = { code: 308, message: 'Permanent Redirect.' };

    // === HTTP 4xx: Client Errors ===
    static BAD_REQUEST: _StatusInternal = { code: 400, message: 'Bad Request.' };
    static UNAUTHORIZED: _StatusInternal = { code: 401, message: 'Unauthorized.' };
    static PAYMENT_REQUIRED: _StatusInternal = { code: 402, message: 'Payment Required.' };
    static FORBIDDEN: _StatusInternal = { code: 403, message: 'Forbidden.' };
    static NOT_FOUND: _StatusInternal = { code: 404, message: 'Not Found.' };
    static METHOD_NOT_ALLOWED: _StatusInternal = { code: 405, message: 'Method Not Allowed.' };
    static NOT_ACCEPTABLE: _StatusInternal = { code: 406, message: 'Not Acceptable.' };
    static PROXY_AUTHENTICATION_REQUIRED: _StatusInternal = { code: 407, message: 'Proxy Authentication Required.' };
    static REQUEST_TIMEOUT_HTTP: _StatusInternal = { code: 408, message: 'Request Timeout.' };
    static CONFLICT: _StatusInternal = { code: 409, message: 'Conflict.' };
    static GONE: _StatusInternal = { code: 410, message: 'Gone.' };
    static LENGTH_REQUIRED: _StatusInternal = { code: 411, message: 'Length Required.' };
    static PRECONDITION_FAILED: _StatusInternal = { code: 412, message: 'Precondition Failed.' };
    static PAYLOAD_TOO_LARGE: _StatusInternal = { code: 413, message: 'Payload Too Large.' };
    static URI_TOO_LONG: _StatusInternal = { code: 414, message: 'URI Too Long.' };
    static UNSUPPORTED_MEDIA_TYPE: _StatusInternal = { code: 415, message: 'Unsupported Media Type.' };
    static RANGE_NOT_SATISFIABLE: _StatusInternal = { code: 416, message: 'Range Not Satisfiable.' };
    static EXPECTATION_FAILED: _StatusInternal = { code: 417, message: 'Expectation Failed.' };
    static IM_A_TEAPOT: _StatusInternal = { code: 418, message: "I'm a teapot." };
    static MISDIRECTED_REQUEST: _StatusInternal = { code: 421, message: 'Misdirected Request.' };
    static UNPROCESSABLE_ENTITY: _StatusInternal = { code: 422, message: 'Unprocessable Entity.' };
    static LOCKED: _StatusInternal = { code: 423, message: 'Locked.' };
    static FAILED_DEPENDENCY: _StatusInternal = { code: 424, message: 'Failed Dependency.' };
    static TOO_EARLY: _StatusInternal = { code: 425, message: 'Too Early.' };
    static UPGRADE_REQUIRED: _StatusInternal = { code: 426, message: 'Upgrade Required.' };
    static PRECONDITION_REQUIRED: _StatusInternal = { code: 428, message: 'Precondition Required.' };
    static TOO_MANY_REQUESTS: _StatusInternal = { code: 429, message: 'Too Many Requests.' };
    static REQUEST_HEADER_FIELDS_TOO_LARGE: _StatusInternal = { code: 431, message: 'Request Header Fields Too Large.' };
    static UNAVAILABLE_FOR_LEGAL_REASONS: _StatusInternal = { code: 451, message: 'Unavailable For Legal Reasons.' };

    // === HTTP 5xx: Server Errors ===
    static INTERNAL_SERVER_ERROR: _StatusInternal = { code: 500, message: 'Internal Server Error.' };
    static NOT_IMPLEMENTED: _StatusInternal = { code: 501, message: 'Not Implemented.' };
    static BAD_GATEWAY: _StatusInternal = { code: 502, message: 'Bad Gateway.' };
    static SERVICE_UNAVAILABLE: _StatusInternal = { code: 503, message: 'Service Unavailable.' };
    static GATEWAY_TIMEOUT: _StatusInternal = { code: 504, message: 'Gateway Timeout.' };
    static HTTP_VERSION_NOT_SUPPORTED: _StatusInternal = { code: 505, message: 'HTTP Version Not Supported.' };
    static VARIANT_ALSO_NEGOTIATES: _StatusInternal = { code: 506, message: 'Variant Also Negotiates.' };
    static INSUFFICIENT_STORAGE: _StatusInternal = { code: 507, message: 'Insufficient Storage.' };
    static LOOP_DETECTED: _StatusInternal = { code: 508, message: 'Loop Detected.' };
    static BANDWIDTH_LIMIT_EXCEEDED: _StatusInternal = { code: 509, message: 'Bandwidth Limit Exceeded.' };
    static NOT_EXTENDED: _StatusInternal = { code: 510, message: 'Not Extended.' };
    static NETWORK_AUTHENTICATION_REQUIRED: _StatusInternal = { code: 511, message: 'Network Authentication Required.' };
}

// Utility function to get all HTTP status entries
export const getAllHttpStatuses = (): _StatusInternal[] => {
    const statuses: _StatusInternal[] = [];
    const props = Object.getOwnPropertyDescriptors(StatusHttp);

    for (const key in props) {
        if (props[key].value && typeof props[key].value === 'object' && 'code' in props[key].value && 'message' in props[key].value) {
            const entry = props[key].value as _StatusInternal;
            statuses.push(entry);
        }
    }

    // Optional: sort by code for consistency
    return statuses.sort((a, b) => a.code - b.code);
};

// Usage
export const HTTP_STATUSES = getAllHttpStatuses();

export const getInternalStatusFromHttpStatusCode = (httpStatusCode: number): _StatusInternal | undefined => {
    const internalStatus = HTTP_STATUSES.find(x => x.code == httpStatusCode);
    return internalStatus;
};
