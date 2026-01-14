using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using System.ComponentModel.DataAnnotations;

namespace Icon.TaskManagementSystem.Api.Helpers;

public static class Validation
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class TrimmedLengthAttribute(uint minimumLength, uint maximumLength) : ValidationAttribute()
    {
        public uint MinimumLength => minimumLength;
        public uint MaximumLength => maximumLength;

        public override bool IsValid(object? value)
        {
            if (value == null) return true; // Let [Required] handle nulls

            if (value is not string stringValue)
                return false;

            var trimmed = stringValue.Trim();
            if (trimmed.Length < minimumLength)
                return false;
            if (trimmed.Length > maximumLength)
                return false;

            return true;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} must be between {minimumLength} and {maximumLength} characters long after trimming.";
        }
    }

    public class TrimmedLengthOpenApiSchemaTransformer : IOpenApiSchemaTransformer
    {
        public async Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext context, CancellationToken cancellationToken)
        {
            // Look for parameters or properties with [TrimmedLength]
            var attributes = (context?.JsonPropertyInfo?.AttributeProvider?.GetCustomAttributes(typeof(TrimmedLengthAttribute), false) ?? []);
            foreach (var attribute in attributes)
            {
                if (attribute is not null && attribute is TrimmedLengthAttribute trimmedLengthAttribute)
                {
                    schema.Pattern = @$"^\s*([^\s].{{{trimmedLengthAttribute.MinimumLength},{trimmedLengthAttribute.MaximumLength}}}[^\s])\s*$";
                    //schema.Description = $"Must be between {trimmedLengthAttribute.MinimumLength} and {trimmedLengthAttribute.MaximumLength} characters long after trimming.";
                }
            }
        }
    }
}
