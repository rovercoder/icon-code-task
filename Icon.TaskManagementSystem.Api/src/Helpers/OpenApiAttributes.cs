using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using static Icon.TaskManagementSystem.Api.Helpers.Validation;

namespace Icon.TaskManagementSystem.Api.Helpers;

public static class OpenApiAttributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct, AllowMultiple = false)]
    public class OpenApiSchemaNameAttribute(string SchemaName): Attribute
    {
        public string SchemaName { get; init; } = SchemaName;
    }

    public class OpenApiSchemaNameOpenApiSchemaTransformer : IOpenApiSchemaTransformer
    {
        public async Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext context, CancellationToken cancellationToken)
        {
            // Look for parameters or properties with [OpenApiSchemaName]
            var attributes = (context?.JsonTypeInfo?.Type?.GetCustomAttributes(typeof(OpenApiSchemaNameAttribute), false) ?? []);
            foreach (var attribute in attributes)
            {
                if (attribute is not null && attribute is OpenApiSchemaNameAttribute openApiSchemaNameAttribute)
                {
                    schema.Metadata?["x-schema-id"] = openApiSchemaNameAttribute.SchemaName;
                }
            }
        }
    }
}
