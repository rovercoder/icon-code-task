using Icon.TaskManagementSystem.Api.Helpers;
using System.ComponentModel;

namespace Icon.TaskManagementSystem.Api.Application.Common.Responses;

public class TaskStatusResponse(Domain.TaskStatus taskStatus)
{
    /// <summary>
    /// The identifier of the task status.
    /// </summary>
    [Description("The identifier of the task status.")]
    public string Id { get; init; } = Crypto.ConvertToBase64(Enums.CryptoDomain.TaskStatusID, ((uint)taskStatus.Id).ToString());
    /// <summary>
    /// The name of the task status.
    /// </summary>
    [Description("The name of the task status.")]
    public string Name { get; init; } = taskStatus.Name;
}
