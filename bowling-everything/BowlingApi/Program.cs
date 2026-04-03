using BowlingApi.Models;
using Microsoft.EntityFrameworkCore;

// bootstraps the web API (this is the newer minimal hosting style in .NET)
var builder = WebApplication.CreateBuilder(args);

// register MVC-style controllers so I can use attribute-routed controllers
builder.Services.AddControllers();

// hook up my EF Core context to the local SQLite bowling database
builder.Services.AddDbContext<BowlingLeagueContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BowlingConnection")));

// allow my React dev server to call this API from localhost:5173
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

// keep HTTPS redirection on even though this is just a class assignment
app.UseHttpsRedirection();

// enable the CORS policy I set up above
app.UseCors("AllowReact");

// map controller endpoints like /api/bowlers
app.MapControllers();

app.Run();
