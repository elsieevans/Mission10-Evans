using BowlingApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BowlingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BowlersController : ControllerBase
{
    // inject the EF Core context so I can query the bowling database
    private readonly BowlingLeagueContext _context;

    public BowlersController(BowlingLeagueContext context)
    {
        _context = context;
    }

    // simple GET endpoint that the React app calls to grab bowler info
    [HttpGet]
    public async Task<IActionResult> GetBowlers()
    {
        // only want bowlers from the Marlins and Sharks teams for this assignment
        var targetTeams = new[] { "Marlins", "Sharks" };

        var bowlers = await _context.Bowlers
            // eager load the related Team so I can read TeamName
            .Include(b => b.Team)
            // filter down to just Marlins and Sharks
            .Where(b => b.Team != null && targetTeams.Contains(b.Team.TeamName))
            // shape the data into a simpler object that the frontend expects
            .Select(b => new
            {
                firstName = b.BowlerFirstName,
                middleInit = b.BowlerMiddleInit,
                lastName = b.BowlerLastName,
                teamName = b.Team!.TeamName,
                address = b.BowlerAddress,
                city = b.BowlerCity,
                state = b.BowlerState,
                zip = b.BowlerZip,
                phoneNumber = b.BowlerPhoneNumber
            })
            .ToListAsync();

        return Ok(bowlers);
    }
}

