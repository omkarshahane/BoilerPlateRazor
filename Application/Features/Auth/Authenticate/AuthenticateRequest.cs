using Ardalis.Result;
using MediatR;

namespace Application.Features.Auth.Authenticate;

public record AuthenticateRequest : IRequest<Result<AuthenticateResponse>>
{
    public string Email { get; init; } = null!;

    public string Password { get; init; } = null!;
}