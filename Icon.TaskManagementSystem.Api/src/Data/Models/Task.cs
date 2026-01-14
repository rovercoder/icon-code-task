using System.ComponentModel.DataAnnotations;

namespace Icon.TaskManagementSystem.Api.Data.Models
{
    public class Task
    {
        public uint Id { get; set; } = 0;
        [Required, MinLength(2), MaxLength(50)]
        public string Title { get; set; } = string.Empty;
        [MinLength(0), MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        [Required]
        public uint TaskStatusId { get; set; } = (uint)Domain.TaskStatusEnum.Incomplete;
        
        public virtual TaskStatus TaskStatus { get; set; } = null!;
    }
}
