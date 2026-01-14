namespace Icon.TaskManagementSystem.Api.Domain;

public enum TaskStatusEnum
{
    Unknown = 0,
    //NotStarted,
    //InProgress,
    //Completed,
    //OnHold,
    //Cancelled
    Incomplete = 1,
    Completed = 2
}

public record TaskStatus(uint Id, string Name)
{
    public static TaskStatus From(Data.Models.TaskStatus entity)
        => new TaskStatus(
            Id: entity.Id,
            Name: entity.Name
        );
}
