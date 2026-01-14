import axios, { AxiosError, type AxiosResponse } from "axios";
import { getInternalStatusFromHttpStatusCode, StatusInternal, Result } from "./result";
import { z } from "zod";

export const api = axios.create({
    baseURL: process.env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function performRequest<T>(requestPromise: Promise<AxiosResponse>, validationSchema?: z.ZodTypeAny, successMessage?: string, failureMessage?: string) {
    try {
        let result: AxiosResponse;
        try {
            result = await requestPromise;
        } catch (error: any) {
            console.error(error);
            return getResultFromAxiosError<T>(error, failureMessage);
        }
        
        if (validationSchema != null && result.status >= 0 && result.status < 400) {
            const parsedResult = validationSchema.safeParse(result.data);
            if (!parsedResult.success) {
                return Result.Failure<T>(StatusInternal.VALIDATION_FAILED, failureMessage, parsedResult.error);
            }
            return Result.Success<T>(result.data, StatusInternal.OK, successMessage);
        }

        return getResultFromAxiosResponse<T>(result, successMessage, failureMessage);
    } catch (e) {
        console.error(e);
        return Result.Failure<T>(StatusInternal.DEFAULT_ERROR, failureMessage, e);
    }
}

export function getResultFromAxiosResponse<T>(response: AxiosResponse | undefined, successMessage?: string, failureMessage?: string) {
    if (response == null) {
        return Result.Failure<T>(StatusInternal.NETWORK_ERROR, failureMessage);
    }
    const internalStatus = getInternalStatusFromHttpStatusCode(response.status);
    if (internalStatus != null) {
        if (internalStatus.code >= 0 && internalStatus.code < 400) {
            return Result.Success<T>(response.data, internalStatus, successMessage);
        }
        return Result.Failure<T>(internalStatus, failureMessage, response.data);
    }
    return Result.Failure<T>(StatusInternal.DEFAULT_ERROR, failureMessage, response.data);
};

export function getResultFromAxiosError<T>(error: AxiosError | undefined, failureMessage?: string): Result<T> {
    if (error == null || typeof error !== 'object') {
        return Result.Failure<T>(StatusInternal.DEFAULT_ERROR, failureMessage);
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Result.Failure<T>(StatusInternal.TIMEOUT, failureMessage);
    }

    if (error.request === undefined) {
        // Something wrong in request config
        return Result.Failure<T>(StatusInternal.INVALID_REQUEST, failureMessage);
    }

    if (!error.response) {
        // Network error (no response received)
        return Result.Failure<T>(StatusInternal.NETWORK_ERROR, failureMessage);
    }
    
    const internalStatus = getInternalStatusFromHttpStatusCode(error.response.status);
    if (internalStatus != null) {
        return Result.Failure<T>(internalStatus, failureMessage, error.response.data);
    }
    
    return Result.Failure<T>(StatusInternal.DEFAULT_ERROR, failureMessage);
}
