using Icon.TaskManagementSystem.Api.Application.Common.Responses;
using Icon.TaskManagementSystem.Api.Data;
using Icon.TaskManagementSystem.Api.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using System.Threading;
using static Icon.TaskManagementSystem.Api.Helpers.OpenApiAttributes;
using static Icon.TaskManagementSystem.Api.Helpers.Validation;

namespace Icon.TaskManagementSystem.Api.Application;

public class GetDetailsForTasks
{
    /// <summary>
    /// Updates an existing task by ID.
    /// </summary>
    /// <returns>The updated task.</returns>
    private static async Task<Results<Ok<DetailsResponse>, InternalServerError>> Query(
        [NotNull][FromServices] DBContext dbContext,
        CancellationToken cancellationToken)
    {
        var result = await RunAsync(dbContext, cancellationToken);

        if (!result.IsSuccess)
            return TypedResults.InternalServerError();

        var response = new DetailsResponse(result.Value);

        return TypedResults.Ok(response);
    }

    // TODO: Add pagination support
    public static async Task<Result<Domain.Details>> RunAsync(DBContext dbContext, CancellationToken cancellationToken = default)
    {
        try
        {
            var taskStatuses = await dbContext.TaskStatuses.ToListAsync(cancellationToken);

            return Result<Domain.Details>.Success(Domain.Details.From(taskStatuses));
        }
        catch
        {
            return Result<Domain.Details>.Failure("Details could not be looked up!");
        }
    }

    public static void ConfigureEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("tasks", Query)
            .WithName("GetDetails")
            .WithDescription("Retrieves details necessary for application function")
            .WithTags("Details")
            .Produces<DetailsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status500InternalServerError);
    }
}
