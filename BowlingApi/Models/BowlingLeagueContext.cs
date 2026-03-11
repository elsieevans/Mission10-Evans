using Microsoft.EntityFrameworkCore;

namespace BowlingApi.Models;

public partial class BowlingLeagueContext : DbContext
{
    // parameterless constructor is here mostly for tooling; the app uses the one below
    public BowlingLeagueContext()
    {
    }

    public BowlingLeagueContext(DbContextOptions<BowlingLeagueContext> options)
        : base(options)
    {
    }

    // main tables I care about for this mission
    public DbSet<Bowler> Bowlers { get; set; } = null!;
    public DbSet<Team> Teams { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlite("Data Source=BowlingLeague.sqlite");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bowler>(entity =>
        {
            entity.HasKey(e => e.BowlerId);

            entity.ToTable("Bowlers");

            entity.Property(e => e.BowlerId).HasColumnName("BowlerID");
            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.BowlerFirstName).HasMaxLength(50);
            entity.Property(e => e.BowlerLastName).HasMaxLength(50);
            entity.Property(e => e.BowlerMiddleInit).HasMaxLength(1);
            entity.Property(e => e.BowlerAddress).HasMaxLength(100);
            entity.Property(e => e.BowlerCity).HasMaxLength(50);
            entity.Property(e => e.BowlerState).HasMaxLength(2);
            entity.Property(e => e.BowlerZip).HasMaxLength(10);
            entity.Property(e => e.BowlerPhoneNumber).HasMaxLength(20);

            // each bowler belongs to one team (TeamId foreign key)
            entity.HasOne(e => e.Team)
                .WithMany(t => t.Bowlers)
                .HasForeignKey(e => e.TeamId);
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.TeamId);

            entity.ToTable("Teams");

            entity.Property(e => e.TeamId).HasColumnName("TeamID");
            entity.Property(e => e.TeamName).HasMaxLength(50);
        });
    }
}
