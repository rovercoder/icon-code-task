export const noRevalidateQueryParamKey = 'noRevalidate';
export const noRevalidateQueryParamValues: [string, string] = ['true', '1'];
export const noRevalidateQueryParamFull = `${noRevalidateQueryParamKey}=${noRevalidateQueryParamValues[0]}`;

export const shouldRevalidateRouteNavigation = (params: { startsWithUrlPath: string, currentUrl: URL, nextUrl: URL, formMethod: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined, defaultShouldRevalidate: boolean }): boolean => {
    if (params == null || typeof params !== 'object') {
        return true;
    }
    
    const { startsWithUrlPath, currentUrl, nextUrl, formMethod, defaultShouldRevalidate } = params;
    
    if (currentUrl.href == nextUrl.href) {
        return defaultShouldRevalidate;
    }

    const currentPath = currentUrl.pathname;
    const nextPath = nextUrl.pathname;

    // If we're navigating within the /example route hierarchy, don't revalidate unless there's a form submission
    if (currentPath.startsWith(startsWithUrlPath) 
            && nextPath.startsWith(startsWithUrlPath) 
            && nextUrl.searchParams.has(noRevalidateQueryParamKey) 
            && noRevalidateQueryParamValues.includes(nextUrl.searchParams.get(noRevalidateQueryParamKey)?.toLowerCase() ?? '')) {
        
                // Revalidate only for form submissions
        if (formMethod) return defaultShouldRevalidate;

        // Don't revalidate when navigating between /example and /example/test/* routes
        return false;
    }

    // Default behavior for other cases
    return defaultShouldRevalidate;
};
