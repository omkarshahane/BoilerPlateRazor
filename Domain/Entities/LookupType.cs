using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;
public class LookupType
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public virtual ICollection<Lookup> LookupNavigations { get; set; } = new List<Lookup>();

}
