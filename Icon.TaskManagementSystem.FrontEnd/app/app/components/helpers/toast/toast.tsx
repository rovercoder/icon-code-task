import { Bounce, toast, ToastContainer, type Id } from "react-toastify";
import { StatusInternal, Result, type ResultJson } from "~/adapters/result";
import { fields } from "~/utils/general.utils";
import 'react-toastify/dist/ReactToastify.css';
import { Fragment } from "react/jsx-runtime";

export function Toast() {
    return <ToastContainer />
}

export const openToastDatabase: { [baseToastId: string]: number } = {};

export function showToastByResult(toastIdPrefix: string, result: Result<unknown>, options?: { onRetry?: () => void }): Id | undefined {
    if (result == null || toastIdPrefix == null || toastIdPrefix.toString().length === 0 || !(result instanceof Result)) {
        return;
    }
    return showToast(toastIdPrefix, result.toJson(), options);
}

export function showToastGroupByResults(results: { [toastIdPrefix: string]: Result<unknown> }, options?: { onRetry?: () => void }): Id[] | undefined {
    if (results == null || typeof results !== 'object' || Object.keys(results).some(toastIdPrefix => !(results[toastIdPrefix] instanceof Result))) {
        return;
    }

    const _results: { [toastIdPrefix: string]: ResultJson<unknown> } = {};
    for (const toastIdPrefix in results) {
        _results[toastIdPrefix] = results[toastIdPrefix].toJson();
    }
    return showToastsGroup(_results, options);
}

export function showToast(toastIdPrefix: string, result: ResultJson<unknown>, options?: { onRetry?: () => void }): Id | undefined {
    if (result == null || toastIdPrefix == null || toastIdPrefix.toString().length === 0) {
        return;
    }
    const toastIds = showToastsGroup({ [toastIdPrefix]: result }, options);
    if (toastIds == null || !Array.isArray(toastIds) || toastIds.length === 0) {
        return;
    }
    return toastIds[0];
}

export function showToastsGroup(results: { [toastIdPrefix: string]: ResultJson<unknown> }, options?: { onRetry?: () => void }): Id[] | undefined {
    const resultJsonFields = fields<ResultJson<unknown>>({ value: null, status: StatusInternal.DEFAULT_ERROR, isSuccess: false, isLoading: false, message: '', messageDetails: '', fullDescription: '' });
    if (results == null || typeof results !== 'object' || ![resultJsonFields.isSuccess, resultJsonFields.isLoading, resultJsonFields.fullDescription].every(propName => Object.keys(results).every(resultKey => propName in results[resultKey]))) {
        return;
    }
    let onRetry: (() => void) | undefined = undefined;
    if (options != null && typeof options === 'object') {
        if (typeof options.onRetry === 'function') {
            onRetry = options.onRetry;
        }
    }
    const openedToastIds: Id[] = [];
    const _onRetry = () => {
        for (const toastId of openedToastIds) {
            closeToastById(toastId);
        }
        onRetry?.();
    }
    for (const toastIdPrefix in results) {
        if (!(toastIdPrefix in openToastDatabase)) {
            openToastDatabase[toastIdPrefix] = 0;
        }
        const previousToastId = `${toastIdPrefix}-${openToastDatabase[toastIdPrefix]}`;
        closeToastById(previousToastId);

        openToastDatabase[toastIdPrefix] = openToastDatabase[toastIdPrefix] + 1;
        const thisToastId = `${toastIdPrefix}-${openToastDatabase[toastIdPrefix]}`;
        
        const result = results[toastIdPrefix];
        if (result.isSuccess) {
            openedToastIds.push(
                toast.success(
                    <div>
                        <span style={{whiteSpace: "pre-wrap"}}>{result.fullDescription}</span>
                    </div>, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeButton: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    toastId: thisToastId
                })
            );
        } else if (result.isLoading) {
            openedToastIds.push(
                toast.loading(
                    <div>
                        <span style={{whiteSpace: "pre-wrap"}}>{result.fullDescription}</span>
                    </div>, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeButton: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    toastId: thisToastId
                })
            );
        } else {
            openedToastIds.push(
                toast.error(
                    <div>
                        <span style={{whiteSpace: "pre-wrap"}}>{result.fullDescription}</span>
                        {
                            onRetry && 
                                <Fragment>
                                    <br />
                                    <button
                                        onClick={() => _onRetry()}
                                        style={{
                                            marginLeft: '10px',
                                            padding: '4px 8px',
                                            background: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Retry
                                    </button>
                                </Fragment>
                        }
                    </div>, {
                    position: "top-right",
                    autoClose: !onRetry ? 5000 : false,
                    hideProgressBar: false,
                    closeButton: !onRetry ? true : false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    toastId: thisToastId
                })
            );
        }
    }
    return openedToastIds;
}

export function closeToastById(toastId: Id): void {
    toast.dismiss(toastId);
}
