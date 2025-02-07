using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SpeechReact.Server.Models;


namespace SpeechReact.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }
        public DbSet<IdentityUser> Users { get; set; }
    }    
}
