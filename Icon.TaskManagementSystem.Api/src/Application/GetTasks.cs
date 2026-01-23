using Icon.TaskManagementSystem.Api.Application.Common.Responses;
using Icon.TaskManagementSystem.Api.Data;
using Icon.TaskManagementSystem.Api.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.OpenApi;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using static Icon.TaskManagementSystem.Api.Helpers.OpenApiAttributes;
using static Icon.TaskManagementSystem.Api.Helpers.Validation;

namespace Icon.TaskManagementSystem.Api.Application;

public class GetTasks
{
    public sealed class CommandMultiple(List<Command> commands) : List<Command>(commands)
    {
        public static bool TryParse(string commandMultiple, out CommandMultiple commands)
        {
            commands = null!;
            try
            {
                var _commands = JsonSerializer.Deserialize<List<Command>>(commandMultiple);
                if (_commands != null)
                {
                    commands = new CommandMultiple(_commands);
                } 
                else
                {
                    return false;
                }
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
    [OpenApiSchemaName($"{nameof(GetTasks)}Command")]
    public record Command
    {
        /// <summary>
        /// Part of the title of the tasks to filter. Must be 0–50 characters. Optional.
        /// </summary>
        [Length(0, 50)]
        [Description("Part of the title of the tasks to filter. Must be 0–50 characters. Optional.")]
        [JsonPropertyName("title")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Title { get; init; }

        /// <summary>
        /// Part of the detailed description of the tasks to filter. Can be between 0 and 1000 characters long. Optional.
        /// </summary>
        [Length(0, 1000)] 
        [Description("Part of the detailed description of the tasks to filter. Can be between 0 and 1000 characters long. Optional.")]
        [JsonPropertyName("description")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Description { get; init; }

        /// <summary>
        /// The current task status identifier of the tasks to filter by. Must be valid.
        /// </summary>
        [Description("The current task status identifier of the tasks to filter by. Must be valid.")]
        [JsonPropertyName("statusId")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? StatusId { get; init; }

        /// <summary>
        /// Supporting multiple criteria instances. Can be between 1 and 20 criteria long. Optional.
        /// </summary>
        [MinLength(1)]
        [MaxLength(20)]
        [Description("Supporting multiple criteria instances. Can be between 1 and 20 criteria long. Optional.")]
        [JsonIgnore]
        public CommandMultiple? Multiple { get; init; }

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
                )
                && (
                    Multiple == null 
                    || Multiple.Count > 0
                );

        public static Command From(CommandInternal commandInternal)
        {
            if (!commandInternal.IsValid)
                throw new InvalidDataException();

            return new Command
            {
                Title = commandInternal.Title,
                Description = commandInternal.Description,
                StatusId = commandInternal.Status == null ? null : Crypto.ConvertToBase64(Enums.CryptoDomain.TaskStatusID, ((uint)commandInternal.Status).ToString())
            };
        }
    }
    public sealed record CommandInternal([TrimmedLength(2, 50)] string? Title = null, [TrimmedLength(0, 1000)] string? Description = null, Domain.TaskStatusEnum? Status = null)
    {
        public static List<(CommandInternal command, CommandInternal globalCommand)> ListFrom(Command command)
        {
            if (!command.IsValid)
                throw new InvalidDataException();

            var commandFn = (Command command) => new CommandInternal(
                Title: command.Title,
                Description: command.Description,
                Status: command.StatusId == null ? null : (Domain.TaskStatusEnum)int.Parse(Crypto.ConvertFromBase64(Enums.CryptoDomain.TaskStatusID, command.StatusId.Trim()))
            );

            var commandInternal = commandFn(command);

            if (command.Multiple != null)
                return command.Multiple.Select(commandFn).Select(_command => (command: _command, globalCommand: commandInternal)).ToList();

            return [(command: commandInternal, globalCommand: new CommandInternal())];
        }
        public bool IsValid
            => Validator.TryValidateObject(this, new ValidationContext(this), null, true);
    }

    public class TasksForCriteriaMultipleEntryResponse(CommandInternal commandInternal, CommandInternal globalCommandInternal, IEnumerable<Domain.Task> tasks)
    {
        /// <summary>
        /// The global criteria for the query result.
        /// </summary>
        [Description("The global criteria for the query result.")]
        public Command GlobalQuery { get; init; } = Command.From(globalCommandInternal);
        /// <summary>
        /// The criteria for the query result.
        /// </summary>
        [Description("The criteria for the query result.")]
        public Command Query { get; init; } = Command.From(commandInternal);
        /// <summary>
        /// The tasks matching the criteria of the query.
        /// </summary>
        [Description("The tasks matching the criteria of the query.")]
        public IEnumerable<TaskResponse> Results { get; init; } = tasks.Select(task => new TaskResponse(task));
    }

    /// <summary>
    /// Updates an existing task by ID.
    /// </summary>
    /// <returns>The updated task.</returns>
    private static async Task<Results<Ok<IEnumerable<TaskResponse>>, Ok<IEnumerable<TasksForCriteriaMultipleEntryResponse>>, BadRequest, InternalServerError>> Query(
        [AsParameters] Command command,
        [NotNull][FromServices] IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        await Task.Delay(RandomNumberGenerator.GetInt32(0, 200), cancellationToken);

        if (!command.IsValid)
            return TypedResults.BadRequest();

        var results = await Task.WhenAll(
            CommandInternal.ListFrom(command).Select(async (query) =>
            {
                using var scope = serviceProvider.CreateScope();
                return (
                    criteria: query,
                    tasksResult: await RunAsync(scope.ServiceProvider.GetRequiredService<DBContext>(), query.command, query.globalCommand, cancellationToken)
                );
            })
        );

        if (results.Any(result => !result.tasksResult.IsSuccess))
            return TypedResults.InternalServerError();

        if (command.Multiple != null)
        {
            var response = results.Select(result => new TasksForCriteriaMultipleEntryResponse(commandInternal: result.criteria.command, globalCommandInternal: result.criteria.globalCommand, tasks: result.tasksResult.Value));
            return TypedResults.Ok(response);
        } 
        else
        {
            if (results.Count() == 0)
                return TypedResults.InternalServerError();

            var response = results.First().tasksResult.Value.Select(task => new TaskResponse(task));
            return TypedResults.Ok(response);
        }
    }

    // TODO: Add pagination support
    public static async Task<Result<IEnumerable<Domain.Task>>> RunAsync(DBContext dbContext, CommandInternal command, CommandInternal? globalCommand, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!(command?.IsValid ?? false))
                return Result<IEnumerable<Domain.Task>>.Failure("Command invalid! Validation failed!");

            if (globalCommand != null && !globalCommand.IsValid)
                return Result<IEnumerable<Domain.Task>>.Failure("Global command invalid! Validation failed!");

            var tasks = await dbContext.Tasks.Where(x =>
                (command.Title == null || x.Title.ToLower().Contains(command.Title.ToLower()))
                && (command.Description == null || x.Description.ToLower().Contains(command.Description.ToLower()))
                && (command.Status == null || x.TaskStatusId == (uint)command.Status)
                && (globalCommand == null
                    || (
                        (globalCommand.Title == null || x.Title.ToLower().Contains(globalCommand.Title.ToLower()))
                        && (globalCommand.Description == null || x.Description.ToLower().Contains(globalCommand.Description.ToLower()))
                        && (globalCommand.Status == null || x.TaskStatusId == (uint)globalCommand.Status)
                    ))
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
            .Produces<IEnumerable<TasksForCriteriaMultipleEntryResponse>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);
    }
}
