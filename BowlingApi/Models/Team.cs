using System.Collections.Generic;

namespace BowlingApi.Models;

public class Team
{
    // simple lookup table for the bowling teams (Marlins, Sharks, etc.)
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;

    // collection navigation for all bowlers on this team
    public ICollection<Bowler> Bowlers { get; set; } = new List<Bowler>();
}

