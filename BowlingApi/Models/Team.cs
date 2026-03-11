using System.Collections.Generic;

namespace BowlingApi.Models;

public class Team
{
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;

    public ICollection<Bowler> Bowlers { get; set; } = new List<Bowler>();
}

