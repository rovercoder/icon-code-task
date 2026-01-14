using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Icon.TaskManagementSystem.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TaskStatuses",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { (uint)1, "Incomplete" },
                    { (uint)2, "Completed" },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TaskStatuses",
                keyColumn: "Id",
                keyValue: (uint)1
            );

            migrationBuilder.DeleteData(
                table: "TaskStatuses",
                keyColumn: "Id",
                keyValue: (uint)2
            );
        }
    }
}
