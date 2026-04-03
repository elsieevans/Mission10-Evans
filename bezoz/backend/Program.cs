using BookstoreApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Register services: controllers (your API classes) + EF Core DB context.
builder.Services.AddControllers();
builder.Services.AddDbContext<BookstoreContext>(options =>
{
    // Dev: ../Bookstore.sqlite (repo layout). Published: same folder as the app (CopyToPublishDirectory).
    var dbPath = ResolveBookstoreSqlitePath(builder.Environment.ContentRootPath);
    var connectionString = builder.Configuration.GetConnectionString("BookstoreConnection")
        ?? $"Data Source={dbPath}";
    connectionString = connectionString.Replace("../Bookstore.sqlite", dbPath, StringComparison.OrdinalIgnoreCase);

    options.UseSqlite(connectionString);
});

// CORS: origins must not have a trailing slash (browser sends Origin without it; policy must match exactly).
var corsOriginsRaw = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"];
var corsOrigins = corsOriginsRaw
    .Select(o => (o ?? "").Trim().TrimEnd('/'))
    .Where(o => o.Length > 0)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();
if (corsOrigins.Length == 0)
    corsOrigins = ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.MapControllers();
app.Run();

static string ResolveBookstoreSqlitePath(string contentRoot)
{
    var nextToApp = Path.GetFullPath(Path.Combine(contentRoot, "Bookstore.sqlite"));
    if (File.Exists(nextToApp))
        return nextToApp;

    return Path.GetFullPath(Path.Combine(contentRoot, "..", "Bookstore.sqlite"));
}
