using Icon.TaskManagementSystem.Api.Application.Shared;
using Icon.TaskManagementSystem.Api.Data;
using Icon.TaskManagementSystem.Api.Helpers;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Security.Cryptography;
using System.Text.Encodings.Web;
using System.Text.Json.Serialization;
using System.Threading;
using System.Web;

namespace Icon.TaskManagementSystem.Api.Application;

public class GetTask
{
    public sealed record Parameters
    {
        /// <summary>
        /// The identifier of the task to obtain.
        /// </summary>
        [FromRoute]
        [Required]
        [Description("The identifier of the task to obtain.")]
        public required string Id { get; init; }

        [JsonIgnore]
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true)
                && (Crypto.TryConvertFromBase64(Enums.CryptoDomain.TaskID, HttpUtility.UrlDecode(Id.Trim()), out string? result)
                    && result is not null
                    && uint.TryParse(result, out uint intResult)
                );
    }
    public sealed record CommandInternal([Required] uint Id)
    {
        public static CommandInternal From(Parameters parameters)
        {
            if (!parameters.IsValid)
                throw new InvalidDataException();

            return new CommandInternal(
                Id: uint.Parse(Crypto.ConvertFromBase64(Enums.CryptoDomain.TaskID, HttpUtility.UrlDecode(parameters.Id.Trim())))
            );
        }
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true);
    }

    /// <summary>
    /// Updates an existing task by ID.
    /// </summary>
    /// <returns>The updated task.</returns>
    private static async Task<Results<Ok<TaskResponse>, BadRequest, InternalServerError>> Query(
        [AsParameters] Parameters parameters,
        [NotNull][FromServices] DBContext dbContext,
        CancellationToken cancellationToken)
    {
        await Task.Delay(RandomNumberGenerator.GetInt32(0, 200), cancellationToken);

        ArgumentNullException.ThrowIfNull(parameters);

        if (!parameters.IsValid)
            return TypedResults.BadRequest();

        var result = await RunAsync(dbContext, CommandInternal.From(parameters), cancellationToken);

        if (!result.IsSuccess)
            return TypedResults.InternalServerError();

        var response = new TaskResponse(result.Value);

        return TypedResults.Ok(response);
    }

    public static async Task<Result<Domain.Task>> RunAsync(DBContext dbContext, CommandInternal command, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!(command?.IsValid ?? false))
                return Result<Domain.Task>.Failure("Command invalid! Validation failed!");

            var task = await dbContext.Tasks.FirstOrDefaultAsync(x => x.Id == command.Id, cancellationToken);

            if (task is null)
                return Result<Domain.Task>.Failure("Task not found!");

            return Result<Domain.Task>.Success(Domain.Task.From(task));
        }
        catch
        {
            return Result<Domain.Task>.Failure("Task could not be looked up!");
        }
    }

    public static void ConfigureEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("{id}", Query)
            .WithName("GetTask")
            .WithDescription("Finds an existing task by ID")
            .WithTags("Tasks")
            .Produces<TaskResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);
    }
}
