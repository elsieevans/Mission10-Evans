namespace BowlingApi.Models;

public class Bowler
{
    // basic bowler info straight from the BowlingLeague database
    public int BowlerId { get; set; }
    public string BowlerFirstName { get; set; } = string.Empty;
    public string? BowlerMiddleInit { get; set; }
    public string BowlerLastName { get; set; } = string.Empty;
    public string BowlerAddress { get; set; } = string.Empty;
    public string BowlerCity { get; set; } = string.Empty;
    public string BowlerState { get; set; } = string.Empty;
    public string BowlerZip { get; set; } = string.Empty;
    public string BowlerPhoneNumber { get; set; } = string.Empty;
    public int TeamId { get; set; }

    // navigation back to the bowler's team
    public Team? Team { get; set; }
}

