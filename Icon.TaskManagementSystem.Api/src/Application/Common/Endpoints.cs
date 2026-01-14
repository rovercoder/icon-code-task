namespace Icon.TaskManagementSystem.Api.Application.Common
{
    public static class Endpoints
    {
        public static IEndpointRouteBuilder ConfigureTasksEndpoints(this IEndpointRouteBuilder app)
        {
            ArgumentNullException.ThrowIfNull(app);

            var detailsGroup = app.MapGroup("details")
                //.RequireAuthorization()
                .WithTags("Details");

            GetDetailsForTasks.ConfigureEndpoint(detailsGroup);

            var tasksGroup = app.MapGroup("tasks")
                //.RequireAuthorization()
                .WithTags("Tasks");

            GetTasks.ConfigureEndpoint(tasksGroup);
            GetTask.ConfigureEndpoint(tasksGroup);
            CreateTask.ConfigureEndpoint(tasksGroup);
            UpdateTask.ConfigureEndpoint(tasksGroup);
            DeleteTask.ConfigureEndpoint(tasksGroup);

            return app;
        }
    }
}
