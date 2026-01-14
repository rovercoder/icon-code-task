namespace Icon.TaskManagementSystem.Api.Application.Shared;

public class DetailsResponse(Domain.Details details)
{
    public IEnumerable<TaskStatusResponse> TaskStatuses { get; init; } = details.TaskStatuses.Select(x => new TaskStatusResponse(x));
}
