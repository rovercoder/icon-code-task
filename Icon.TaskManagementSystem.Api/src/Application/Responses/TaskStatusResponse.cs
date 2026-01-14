using Icon.TaskManagementSystem.Api.Helpers;

namespace Icon.TaskManagementSystem.Api.Application.Shared;

public class TaskStatusResponse(Domain.TaskStatus taskStatus)
{
    public string Id { get; init; } = Crypto.ConvertToBase64(Enums.CryptoDomain.TaskStatusID, ((uint)taskStatus.Id).ToString());
    public string Name { get; init; } = taskStatus.Name;
}
