using Icon.TaskManagementSystem.Api.Helpers;

namespace Icon.TaskManagementSystem.Api.Application.Shared;

public class TaskResponse(Domain.Task task)
{
    public string Id { get; init; } = Crypto.ConvertToBase64(Enums.CryptoDomain.TaskID, task.Id.ToString());
    public string Title { get; init; } = task.Title;
    public string Description { get; init; } = task.Description;
    public string StatusId { get; init; } = Crypto.ConvertToBase64(Enums.CryptoDomain.TaskStatusID, ((uint)task.Status).ToString());
}
