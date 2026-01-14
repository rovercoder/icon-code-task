using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Icon.TaskManagementSystem.Api.Helpers;

public static class JsonCanonicalizer
{
    public static string SortKeysAndMinify(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return json;

        // Parse as JsonNode to allow recursive mutation
        using var doc = JsonDocument.Parse(json);
        var rootElement = doc.RootElement.Clone();

        var node = JsonSerializer.Deserialize<JsonNode>(rootElement.GetRawText());

        JsonNode? sorted = SortJsonNode(node);

        // Serialize without extra spaces (minified)
        return JsonSerializer.Serialize(sorted, new JsonSerializerOptions
        {
            WriteIndented = false,
            DefaultIgnoreCondition = JsonIgnoreCondition.Never
        });
    }

    private static JsonNode? SortJsonNode(JsonNode? node)
    {
        return node switch
        {
            JsonObject obj => SortJsonObject(obj),
            JsonArray arr => SortJsonArray(arr),
            _ => node
        };
    }

    private static JsonObject SortJsonObject(JsonObject obj)
    {
        var sorted = new JsonObject();
        foreach (var kvp in obj.OrderBy(kvp => kvp.Key, StringComparer.Ordinal))
        {
            sorted[kvp.Key] = SortJsonNode(kvp.Value);
        }
        return sorted;
    }
    private static JsonArray SortJsonArray(JsonArray arr)
    {
        var sorted = new JsonArray();
        foreach (var item in arr)
        {
            sorted.Add(SortJsonNode(item));
        }
        return sorted;
    }
}
