using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;
public class Lookup
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int TypeId { get; set; }
    public LookupType? LookupTypeNavigation { get; set; }

}
