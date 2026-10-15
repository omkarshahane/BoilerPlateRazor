using Domain.Entities;
using Domain.Entities.Common;
using Infrastructure.Common;
using Infrastructure.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Context;

public partial class AppDbContext : DbContext, IContext
{
    private readonly ICurrentUserService _currentUserService;

    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService currentUserService)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Lookup> Lookups { get; set; }
    public virtual DbSet<LookupType> LookupTypes { get; set; }
    public virtual DbSet<Employee> Employees { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new LookupConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ChangeTracker.DetectChanges();

        var modified = ChangeTracker.Entries().Where(x => x.State == EntityState.Added || x.State == EntityState.Modified);
        var updatingUser = _currentUserService.Id;

        foreach (var item in modified)
        {
            if (item.Entity is Entity entity)
            {
                if (item.State == EntityState.Added)
                {
                    item.CurrentValues[nameof(Entity.CreatedBy)] = Convert.ToInt32(updatingUser);
                    item.CurrentValues[nameof(Entity.CreatedOn)] = DateTime.UtcNow;
                    // item.CurrentValues[nameof(Entity.IsDelete)] = false;
                }
                else if (item.State == EntityState.Modified)
                {
                    item.Property("CreatedOn").IsModified = true;
                    item.Property("CreatedBy").IsModified = true;

                    updatingUser ??= item.CurrentValues[nameof(Entity.CreatedBy)]!.ToString();
                    item.CurrentValues[nameof(Entity.ModifiedBy)] = Convert.ToInt32(updatingUser);
                    item.CurrentValues[nameof(Entity.ModifiedOn)] = DateTime.UtcNow;
                }
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    public IDbContextTransaction BeginTransaction()
    {
        return Database.BeginTransaction();
    }
}
