using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Context;

public interface IContext : IAsyncDisposable, IDisposable
{
    public DbSet<User> Users { get; }
    public DbSet<Lookup> Lookups { get; }
    public DbSet<LookupType> LookupTypes { get; }
    public DbSet<Employee> Employees { get; set; }
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    IDbContextTransaction BeginTransaction();
}