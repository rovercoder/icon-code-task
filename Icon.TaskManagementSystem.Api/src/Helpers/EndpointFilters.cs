using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Primitives;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace Icon.TaskManagementSystem.Api.Helpers;

public static class EndpointFilters
{
    internal sealed class IdempotencyFilter(int cacheTimeInMinutes = 60) : IEndpointFilter
    {
        public async ValueTask<object?> InvokeAsync(
            EndpointFilterInvocationContext context,
            EndpointFilterDelegate next)
        {
            // Parse the Idempotency-Key header from the request
            if (!context.HttpContext.Request.Headers.TryGetValue("Idempotency-Key", out StringValues idempotenceKeyValue) || !Guid.TryParse(idempotenceKeyValue, out Guid idempotenceKey))
            {
                return Results.BadRequest("Invalid or missing Idempotency-Key header");
            }

            IDistributedCache cache = context.HttpContext
                .RequestServices.GetRequiredService<IDistributedCache>();

            // Check if we already processed this request and return a cached response (if it exists)
            string cacheKey = await GenerateIdempotencyCacheKeyAsync(context.HttpContext, idempotenceKey);
            string? cachedResult = await cache.GetStringAsync(cacheKey);
            if (cachedResult is not null)
            {
                IdempotentResponse response = JsonSerializer.Deserialize<IdempotentResponse>(cachedResult)!;
                return new IdempotentResult(response.StatusCode, response.Value);
            }

            object? result = await next(context);

            try
            {
                if (result is not null && result is IResult && result is INestedHttpResult resultContainer)
                {
                    // Execute the request and cache the response for the specified duration
                    if (resultContainer.Result is IStatusCodeHttpResult { StatusCode: >= 200 and < 300 } statusCodeResult and IValueHttpResult valueResult)
                    {
                        int statusCode = statusCodeResult.StatusCode ?? StatusCodes.Status200OK;
                        IdempotentResponse response = new(statusCode, valueResult.Value);

                        await cache.SetStringAsync(
                            cacheKey,
                            JsonSerializer.Serialize(response),
                            new DistributedCacheEntryOptions
                            {
                                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(cacheTimeInMinutes)
                            }
                        );
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"ERROR: Failed to cache idempotent response. Idempotency-Key: {idempotenceKey}\r\n{e}");
            }
            
            return result;
        }
    }

    // We have to implement a custom result to write the status code
    internal sealed class IdempotentResult : IResult
    {
        private readonly int _statusCode;
        private readonly object? _value;

        public IdempotentResult(int statusCode, object? value)
        {
            _statusCode = statusCode;
            _value = value;
        }

        public Task ExecuteAsync(HttpContext httpContext)
        {
            httpContext.Response.StatusCode = _statusCode;

            return httpContext.Response.WriteAsJsonAsync(_value);
        }
    }

    internal sealed class IdempotentResponse
    {
        [JsonConstructor]
        public IdempotentResponse(int statusCode, object? value)
        {
            StatusCode = statusCode;
            Value = value;
        }

        public int StatusCode { get; }
        public object? Value { get; }
    }

    private static async Task<string> GenerateIdempotencyCacheKeyAsync(HttpContext context, Guid idempotencyKey)
    {
        var request = context.Request;

        // Read body
        string bodyContent;
        using (var reader = new StreamReader(request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, bufferSize: 1024, leaveOpen: true))
        {
            var position = request.Body.Position;
            request.Body.Position = 0;
            bodyContent = await reader.ReadToEndAsync();
            request.Body.Position = position; // 🔁 Reset for downstream handlers
        }

        // Build key components
        string method = request.Method.ToUpperInvariant();
        string path = request.Path.ToString();
        string query = request.QueryString.ToString();
        string body = bodyContent;
        try
        {
            body = JsonCanonicalizer.SortKeysAndMinify(bodyContent);
        }
        catch
        {
            // Ignore JSON parsing errors, use raw body
        }

        // Combine into a short, safe key
        // Format: "Idemp:{method}:{path}:{body_compressed}:{idempotencyKey}"
        return $"Idempotency_{method}:{path.Trim()}:{query.Trim()}:{Compression.BrotliCompress(body)}:{idempotencyKey}";
    }
}
