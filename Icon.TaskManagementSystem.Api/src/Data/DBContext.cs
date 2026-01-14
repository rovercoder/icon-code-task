using Microsoft.EntityFrameworkCore;

namespace Icon.TaskManagementSystem.Api.Data;

public class DBContext(DbContextOptions<DBContext> options) : DbContext(options)
{
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<Models.TaskStatus> TaskStatuses { get; set; }
}
