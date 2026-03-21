using BookstoreApi.Models;
using Microsoft.EntityFrameworkCore;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// API + EF Core wiring
builder.Services.AddControllers();
builder.Services.AddDbContext<BookstoreContext>(options =>
{
    // Resolve the sqlite DB relative to the API project folder so `dotnet run` works
    // regardless of the current working directory.
    var dbPath = Path.GetFullPath(
        Path.Combine(builder.Environment.ContentRootPath, "..", "Bookstore.sqlite"));

    var connectionString = builder.Configuration.GetConnectionString("BookstoreConnection")
        ?? $"Data Source={dbPath}";

    options.UseSqlite(connectionString.Replace("../Bookstore.sqlite", dbPath));
});

// Allow the Vite dev server to call this API from the browser.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.MapControllers();
app.Run();
