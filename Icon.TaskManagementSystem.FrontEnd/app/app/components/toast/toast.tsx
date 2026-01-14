import { Bounce, toast, ToastContainer, type Id } from "react-toastify";
import { StatusInternal, Result, type ResultJson } from "~/adapters/result";
import { fields } from "~/utils/general.utils";
import 'react-toastify/dist/ReactToastify.css';

export function Toast() {
    return <ToastContainer />
}

export const openToastDatabase: { [baseToastId: string]: number } = {};

export function showToastByResult(result: Result<unknown>, toastId: string, options?: { onRetry?: () => void }): Id | undefined {
    if (result == null || !(result instanceof Result)) {
        return;
    }
    return showToast(result.toJson(), toastId, options);
}

export function showToastGroupByResults(results: { [toastId: string]: Result<unknown> }, options?: { onRetry?: () => void }): Id[] | undefined {
    if (results == null || typeof results !== 'object' || Object.keys(results).some(toastId => !(results[toastId] instanceof Result))) {
        return;
    }

    const _results: { [toastId: string]: ResultJson<unknown> } = {};
    for (const toastId in results) {
        _results[toastId] = results[toastId].toJson();
    }
    return showToastsGroup(_results, options);
}

export function showToast(result: ResultJson<unknown>, toastId: string, options?: { onRetry?: () => void }): Id | undefined {
    const toastIds = showToastsGroup({ [toastId]: result }, options);
    if (toastIds == null || !Array.isArray(toastIds) || toastIds.length === 0) {
        return;
    }
    return toastIds[0];
}

export function showToastsGroup(results: { [toastId: string]: ResultJson<unknown> }, options?: { onRetry?: () => void }): Id[] | undefined {
    const resultJsonFields = fields<ResultJson<unknown>>({ value: null, status: StatusInternal.DEFAULT_ERROR, isSuccess: false, isLoading: false, message: '', messageDetails: '', fullDescription: '' });
    if (results == null || typeof results !== 'object' || ![resultJsonFields.isSuccess, resultJsonFields.fullDescription].every(propName => Object.keys(results).every(resultKey => propName in results[resultKey]))) {
        return;
    }
    let onRetry: (() => void) | undefined = undefined;
    if (options != null && typeof options === 'object') {
        if (typeof options.onRetry === 'function') {
            onRetry = options.onRetry;
        }
    }
    const toastIds: Id[] = [];
    const _onRetry = () => {
        for (const toastId of toastIds) {
            closeToastById(toastId);
        }
        onRetry?.();
    }
    for (const resultKey in results) {
        if (!(resultKey in openToastDatabase)) {
            openToastDatabase[resultKey] = 0;
        }
        const previousToastId = `${resultKey}-${openToastDatabase[resultKey]}`;
        closeToastById(previousToastId);

        openToastDatabase[resultKey] = openToastDatabase[resultKey] + 1;
        const thisToastId = `${resultKey}-${openToastDatabase[resultKey]}`;
        
        const result = results[resultKey];
        if (result.isSuccess) {
            toastIds.push(
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
            toastIds.push(
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
            toastIds.push(
                toast.error(
                    <div>
                        <span style={{whiteSpace: "pre-wrap"}}>{result.fullDescription}</span>
                        {
                            onRetry && 
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
    return toastIds;
}

export function closeToastById(toastId: Id): void {
    toast.dismiss(toastId);
}
