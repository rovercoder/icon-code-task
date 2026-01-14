using System.ComponentModel.DataAnnotations;

namespace Icon.TaskManagementSystem.Api.Data.Models
{
    public class TaskStatus
    {
        public uint Id { get; set; } = 0;
        [Required, MinLength(2), MaxLength(20)]
        public string Name { get; set; } = string.Empty;

        public virtual ICollection<Task> Tasks { get; } = null!;
    }
}
