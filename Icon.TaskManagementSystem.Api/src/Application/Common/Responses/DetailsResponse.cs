using System.ComponentModel;

namespace Icon.TaskManagementSystem.Api.Application.Common.Responses;

public class DetailsResponse(Domain.Details details)
{
    /// <summary>
    /// The available task statuses.
    /// </summary>
    [Description("The available task statuses.")]
    public IEnumerable<TaskStatusResponse> TaskStatuses { get; init; } = details.TaskStatuses.Select(x => new TaskStatusResponse(x));
}
