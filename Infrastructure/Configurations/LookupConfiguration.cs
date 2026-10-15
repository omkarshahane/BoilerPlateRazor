using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;
public partial class LookupConfiguration : IEntityTypeConfiguration<Lookup>
{
    public void Configure(EntityTypeBuilder<Lookup> builder)
    {
        builder.HasOne(x=> x.LookupTypeNavigation).WithMany(x=>x.LookupNavigations).HasForeignKey(x=>x.TypeId);
    }
}
