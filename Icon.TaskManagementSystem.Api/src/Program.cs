using Icon.TaskManagementSystem.Api.Application.Common;
using Icon.TaskManagementSystem.Api.Data;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using static Icon.TaskManagementSystem.Api.Helpers.AppExtensions;
using static Icon.TaskManagementSystem.Api.Helpers.OpenApiAttributes;
using static Icon.TaskManagementSystem.Api.Helpers.Validation;

var builder = WebApplication.CreateBuilder(args);

// Add appsettings.json
var appSettingsConfiguration = builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true);

if (args.Any(arg => arg.Equals("--localmode", StringComparison.CurrentCultureIgnoreCase)))
{
    // Add Local override for Development
    appSettingsConfiguration = appSettingsConfiguration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.Local.json", optional: true, reloadOnChange: true);
}
    
appSettingsConfiguration.AddEnvironmentVariables();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// https://localhost:7137/openapi/v1.json
builder.Services.AddOpenApi(options =>
{
    options.AddSchemaTransformer<TrimmedLengthOpenApiSchemaTransformer>();
    options.AddSchemaTransformer<OpenApiSchemaNameOpenApiSchemaTransformer>();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost30004000",
        policy => policy.WithOrigins("http://localhost:3000", "http://localhost:4000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

builder.Services.AddValidation();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;
});

builder.Services.AddDbContext<DBContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// For idempotency (POST and PATCH Requests)
//// TODO: Change for production use (This keeps items in memory)
//// https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed?view=aspnetcore-10.0
builder.Services.AddDistributedMemoryCache();

var app = builder.Build();

app.ApplyDatabaseMigrations<DBContext>();

//TODO: Re-add IsDevelopment check later for security
// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.MapOpenApi();
    app.UseCors("AllowLocalhost30004000");
//}

app.UseHttpsRedirection();

// For Idempotency Cache Key (reading and compressing request body)
app.Use((context, next) =>
{
    context.Request.EnableBuffering();
    return next();
});

app.ConfigureTasksEndpoints();

app.Run();
