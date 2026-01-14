using Icon.TaskManagementSystem.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Icon.TaskManagementSystem.Api.Helpers;

public static class AppExtensions
{
    internal static void ApplyDatabaseMigrations<DbContext>(this WebApplication app) where DbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DbContext>();

        if (dbContext == null)
        {
            Console.WriteLine("DBContext is not available.");
            return;
        }

        Console.WriteLine("Checking for pending migrations...");

        // Check and apply pending migrations
        var pendingMigrations = dbContext.Database.GetPendingMigrations();
        if (pendingMigrations.Any())
        {
            Console.WriteLine("Applying pending migrations...");
            dbContext.Database.Migrate();
            Console.WriteLine("Migrations applied successfully.");
        }
        else
        {
            Console.WriteLine("No pending migrations found.");
        }
    }
}
