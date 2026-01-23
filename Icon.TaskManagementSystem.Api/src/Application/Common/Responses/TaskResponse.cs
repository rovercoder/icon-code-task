using Icon.TaskManagementSystem.Api.Helpers;
using System.ComponentModel;

namespace Icon.TaskManagementSystem.Api.Application.Common.Responses;

public class TaskResponse(Domain.Task task)
{
    /// <summary>
    /// The identifier of the task.
    /// </summary>
    [Description("The identifier of the task.")]
    public string Id { get; init; } = Crypto.ConvertToBase64(Enums.CryptoDomain.TaskID, task.Id.ToString());
    /// <summary>
    /// The title of the task.
    /// </summary>
    [Description("The title of the task.")]
    public string Title { get; init; } = task.Title;
    /// <summary>
    /// The description of the task.
    /// </summary>
    [Description("The description of the task.")]
    public string Description { get; init; } = task.Description;
    /// <summary>
    /// The current task status identifier of the task.
    /// </summary>
    [Description("The current task status identifier of the task.")]
    public string StatusId { get; init; } = Crypto.ConvertToBase64(Enums.CryptoDomain.TaskStatusID, ((uint)task.Status).ToString());
}
