using Icon.TaskManagementSystem.Api.Application.Shared;
using Icon.TaskManagementSystem.Api.Data;
using Icon.TaskManagementSystem.Api.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using System.Threading;
using System.Web;
using static Icon.TaskManagementSystem.Api.Helpers.EndpointFilters;
using static Icon.TaskManagementSystem.Api.Helpers.OpenApiAttributes;
using static Icon.TaskManagementSystem.Api.Helpers.Validation;

namespace Icon.TaskManagementSystem.Api.Application;

public class UpdateTask
{
    public sealed record Parameters
    {
        [FromRoute]
        [Required]
        public required string Id { get; init; }

        [JsonIgnore]
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true)
                && (Crypto.TryConvertFromBase64(Enums.CryptoDomain.TaskID, HttpUtility.UrlDecode(Id.Trim()), out string? result)
                    && result is not null
                    && uint.TryParse(result, out uint intResult)
                );
    }
    [OpenApiSchemaName($"{nameof(UpdateTask)}Command")]
    public sealed record Command
    {
        [TrimmedLength(2, 50)]
        public string? Title { get; init; }

        [TrimmedLength(0, 1000)]
        public string? Description { get; init; }

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
                        && intResult != (int)Domain.TaskStatusEnum.Unknown
                    )
                );
    }
    public sealed record CommandInternal([Required] uint Id, [TrimmedLength(2, 50)] string? Title, [TrimmedLength(0, 1000)] string? Description, Domain.TaskStatusEnum? Status)
    {
        public static CommandInternal From(Parameters parameters, Command command)
        {
            if (!parameters.IsValid)
                throw new InvalidDataException();

            if (!command.IsValid)
                throw new InvalidDataException();

            return new CommandInternal(
                Id: uint.Parse(Crypto.ConvertFromBase64(Enums.CryptoDomain.TaskID, HttpUtility.UrlDecode(parameters.Id.Trim()))), 
                Title: command.Title?.Trim(), 
                Description: command.Description?.Trim(), 
                Status: command.StatusId == null ? null : (Domain.TaskStatusEnum)int.Parse(Crypto.ConvertFromBase64(Enums.CryptoDomain.TaskStatusID, command.StatusId.Trim()))
            );
        }
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true)
                && Status != Domain.TaskStatusEnum.Unknown;
    }

    /// <summary>
    /// Updates an existing task by ID.
    /// </summary>
    /// <returns>The updated task.</returns>
    private static async Task<Results<Ok<TaskResponse>, BadRequest, InternalServerError>> Handle(
        [AsParameters] Parameters parameters,
        [FromBody] Command command,
        [NotNull][FromServices] DBContext dbContext,
        CancellationToken cancellationToken)
    {
        await Task.Delay(RandomNumberGenerator.GetInt32(0, 200), cancellationToken);

        ArgumentNullException.ThrowIfNull(parameters);

        ArgumentNullException.ThrowIfNull(command);

        if (!parameters.IsValid)
            return TypedResults.BadRequest();

        if (!command.IsValid)
            return TypedResults.BadRequest();

        var result = await RunAsync(dbContext, CommandInternal.From(parameters, command), cancellationToken);

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

            if (command.Title is not null)
                task.Title = command.Title.Trim();

            if (command.Description is not null)
                task.Description = command.Description.Trim();

            if (command.Status is not null)
                task.TaskStatusId = (uint)command.Status;

            var updatedTask = dbContext.Tasks.Update(task);

            await dbContext.SaveChangesAsync(cancellationToken);

            return Result<Domain.Task>.Success(Domain.Task.From(updatedTask.Entity));
        }
        catch
        {
            return Result<Domain.Task>.Failure("Task could not be updated!");
        }
    }

    public static void ConfigureEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPatch("{id}", Handle)
            .WithName("UpdateTask")
            .WithDescription("Updates an existing task by ID")
            .WithTags("Tasks")
            .Produces<TaskResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .AddEndpointFilter<IdempotencyFilter>();
    }
}
