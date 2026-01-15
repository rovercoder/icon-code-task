using Icon.TaskManagementSystem.Api.Application.Shared;
using Icon.TaskManagementSystem.Api.Data;
using Icon.TaskManagementSystem.Api.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using System.Threading;
using static Icon.TaskManagementSystem.Api.Helpers.OpenApiAttributes;
using static Icon.TaskManagementSystem.Api.Helpers.Validation;

namespace Icon.TaskManagementSystem.Api.Application;

public class GetTasks
{
    [OpenApiSchemaName($"{nameof(GetTasks)}Command")]
    public sealed record Command
    {
        /// <summary>
        /// Part of the title of the tasks to filter. Must be 2–50 characters after trimming. Optional.
        /// </summary>
        [TrimmedLength(2, 50)]
        [Description("Part of the title of the tasks to filter. Must be 2–50 characters after trimming. Optional.")]
        public string? Title { get; init; }

        /// <summary>
        /// Part of the detailed description of the tasks to filter. Can be between 0 and 1000 characters long after trimming. Optional.
        /// </summary>
        [TrimmedLength(0, 1000)] 
        [Description("Part of the detailed description of the tasks to filter. Can be between 0 and 1000 characters long after trimming. Optional.")]
        public string? Description { get; init; }

        /// <summary>
        /// The current task status identifier of the tasks to filter by. Must be valid.
        /// </summary>
        [Description("The current task status identifier of the tasks to filter by. Must be valid.")]
        public string? StatusId { get; init; }

        [JsonIgnore]
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true)
                && (
                    StatusId is null
                    || (Crypto.TryConvertFromBase64(Enums.CryptoDomain.TaskStatusID, StatusId.Trim(), out string? result)
                        && result is not null
                        && int.TryParse(result, out int intResult)
                        && Enum.IsDefined(typeof(Domain.TaskStatusEnum), intResult)
                    )
                );
    }
    public sealed record CommandInternal([TrimmedLength(2, 50)] string? Title, [TrimmedLength(0, 1000)] string? Description, Domain.TaskStatusEnum? Status)
    {
        public static CommandInternal From(Command command)
        {
            if (!command.IsValid)
                throw new InvalidDataException();

            return new CommandInternal(
                Title: command.Title?.Trim(),
                Description: command.Description?.Trim(),
                Status: command.StatusId == null ? null : (Domain.TaskStatusEnum)int.Parse(Crypto.ConvertFromBase64(Enums.CryptoDomain.TaskStatusID, command.StatusId.Trim()))
            );
        }
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true);
    }

    /// <summary>
    /// Updates an existing task by ID.
    /// </summary>
    /// <returns>The updated task.</returns>
    private static async Task<Results<Ok<IEnumerable<TaskResponse>>, BadRequest, InternalServerError>> Query(
        [AsParameters] Command command,
        [NotNull][FromServices] DBContext dbContext,
        CancellationToken cancellationToken)
    {
        await Task.Delay(RandomNumberGenerator.GetInt32(0, 200), cancellationToken);

        if (!command.IsValid)
            return TypedResults.BadRequest();

        var result = await RunAsync(dbContext, CommandInternal.From(command), cancellationToken);

        if (!result.IsSuccess)
            return TypedResults.InternalServerError();

        var response = result.Value.Select(task => new TaskResponse(task));

        return TypedResults.Ok(response);
    }

    // TODO: Add pagination support
    public static async Task<Result<IEnumerable<Domain.Task>>> RunAsync(DBContext dbContext, CommandInternal command, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!(command?.IsValid ?? false))
                return Result<IEnumerable<Domain.Task>>.Failure("Command invalid! Validation failed!");

            var tasks = await dbContext.Tasks.Where(x => 
                (command.Title == null || x.Title.ToLower().Contains(command.Title.Trim().ToLower()))
                && (command.Description == null || x.Description.ToLower().Contains(command.Description.Trim().ToLower()))
                && (command.Status == null || x.TaskStatusId == (uint)command.Status)
            ).ToListAsync(cancellationToken);

            return Result<IEnumerable<Domain.Task>>.Success(tasks.Select(task => Domain.Task.From(task)));
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Result<IEnumerable<Domain.Task>>.Failure("Tasks could not be looked up!");
        }
    }

    public static void ConfigureEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("", Query)
            .WithName("GetTasks")
            .WithDescription("Finds existing tasks by criteria")
            .WithTags("Tasks")
            .Produces<IEnumerable<TaskResponse>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);
    }
}
