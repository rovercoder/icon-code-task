namespace Icon.TaskManagementSystem.Api.Domain;

public record Task(uint Id, string Title, string Description, TaskStatusEnum Status)
{
    public static Task From(Data.Models.Task entity)
        => new Task(
            Id: entity.Id,
            Title: entity.Title,
            Description: entity.Description,
            Status: Enum.IsDefined(typeof(TaskStatusEnum), (int)entity.TaskStatusId) ? (TaskStatusEnum)entity.TaskStatusId : TaskStatusEnum.Unknown
        );
}
