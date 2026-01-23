using Icon.TaskManagementSystem.Api.Application.Common.Responses;
using Icon.TaskManagementSystem.Api.Data;
using Icon.TaskManagementSystem.Api.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using System.Threading;
using static Icon.TaskManagementSystem.Api.Helpers.EndpointFilters;
using static Icon.TaskManagementSystem.Api.Helpers.OpenApiAttributes;
using static Icon.TaskManagementSystem.Api.Helpers.Validation;

namespace Icon.TaskManagementSystem.Api.Application;

public class CreateTask
{
    [OpenApiSchemaName($"{nameof(CreateTask)}Command")]
    public sealed record Command
    {
        /// <summary>
        /// The title of the task. Must be 2–50 characters after trimming.
        /// </summary>
        [Required]
        [TrimmedLength(2, 50)]
        [Description("The title of the task. Must be 2–50 characters after trimming.")]
        public required string Title { get; init; }

        /// <summary>
        /// A detailed description of the task. Can be between 0 and 1000 characters long after trimming.
        /// </summary>
        [Required]
        [TrimmedLength(0, 1000)]
        [Description("A detailed description of the task. Can be between 0 and 1000 characters long after trimming.")]
        public required string Description { get; init; }

        /// <summary>
        /// The current task status identifier of the task. Must be valid.
        /// </summary>
        [Required]
        [Description("The current task status identifier of the task. Must be valid.")]
        public required string StatusId { get; init; }

        [JsonIgnore]
        public bool IsValid 
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true)
                && Crypto.TryConvertFromBase64(Enums.CryptoDomain.TaskStatusID, StatusId.Trim(), out string? result)
                && result is not null 
                && int.TryParse(result, out int intResult) 
                && Enum.IsDefined(typeof(Domain.TaskStatusEnum), intResult)
                && intResult != (int)Domain.TaskStatusEnum.Unknown;
    }
    public sealed record CommandInternal([Required][TrimmedLength(2, 50)] string Title, [Required][TrimmedLength(0, 1000)] string Description, [Required] Domain.TaskStatusEnum Status)
    {
        public static CommandInternal From(Command command)
        {
            if (!command.IsValid)
                throw new InvalidDataException();

            return new CommandInternal(command.Title.Trim(), command.Description.Trim(), (Domain.TaskStatusEnum)int.Parse(Crypto.ConvertFromBase64(Enums.CryptoDomain.TaskStatusID, command.StatusId.Trim())));
        }
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true)
                && Status != Domain.TaskStatusEnum.Unknown;
    }

    /// <summary>
    /// Creates a new task.
    /// </summary>
    /// <returns>The created task.</returns>
    private static async Task<Results<CreatedAtRoute<TaskResponse>, BadRequest, InternalServerError>> Handle(
        [FromBody] Command command,
        [NotNull][FromServices] DBContext dbContext,
        CancellationToken cancellationToken)
    {
        await Task.Delay(RandomNumberGenerator.GetInt32(0, 200), cancellationToken);

        ArgumentNullException.ThrowIfNull(command);

        if (!command.IsValid)
            return TypedResults.BadRequest();

        var result = await RunAsync(dbContext, CommandInternal.From(command), cancellationToken);

        if (!result.IsSuccess)
            return TypedResults.InternalServerError();

        var response = new TaskResponse(result.Value);

        return TypedResults.CreatedAtRoute(response, routeName: "GetTask", routeValues: new { id = response.Id });
    }

    public static async Task<Result<Domain.Task>> RunAsync(DBContext dbContext, CommandInternal command, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!(command?.IsValid ?? false))
                return Result<Domain.Task>.Failure("Command invalid! Validation failed!");

            var task = await dbContext.Tasks.AddAsync(new Data.Models.Task
            {
                Title = command.Title.Trim(),
                Description = command.Description.Trim(),
                TaskStatusId = (uint)command.Status
            }, cancellationToken);

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result<Domain.Task>.Success(Domain.Task.From(task.Entity));
        }
        catch
        {
            return Result<Domain.Task>.Failure("Task could not be created!");
        }
    }

    public static void ConfigureEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("", Handle)
            .WithName("CreateTask")
            .WithDescription("Creates a new task")
            .WithTags("Tasks")
            .Produces<TaskResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .AddEndpointFilter<IdempotencyFilter>();
    }
}
