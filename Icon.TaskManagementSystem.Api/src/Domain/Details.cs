namespace Icon.TaskManagementSystem.Api.Domain;

public record Details(IEnumerable<TaskStatus> TaskStatuses)
{
    public static Details From(IEnumerable<Data.Models.TaskStatus> taskStatuses)
        => new Details(
            TaskStatuses: taskStatuses.Select(x => new TaskStatus(Id: x.Id, Name: x.Name))
        );
}
