using BowlingApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BowlingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BowlersController : ControllerBase
{
    private readonly BowlingLeagueContext _context;

    public BowlersController(BowlingLeagueContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBowlers()
    {
        var targetTeams = new[] { "Marlins", "Sharks" };

        var bowlers = await _context.Bowlers
            .Include(b => b.Team)
            .Where(b => b.Team != null && targetTeams.Contains(b.Team.TeamName))
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

