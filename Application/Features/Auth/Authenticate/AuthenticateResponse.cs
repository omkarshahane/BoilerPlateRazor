using System;
using System.Collections.Generic;

namespace Application.Features.Auth.Authenticate;
public record AuthenticateResponse
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string? LastName { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
}
