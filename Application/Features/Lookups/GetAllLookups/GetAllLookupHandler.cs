using Ardalis.Result;
using Application.Extensions;
using Application.Features.Lookups.Responses;
using Infrastructure.Context;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Lookups.GetAllLookups;
public sealed class GetAllLookupHandler : IRequestHandler<GetAllLookupRequest, Result<List<LookupResponse>>>
{
    private readonly IContext _context;

    public GetAllLookupHandler(IContext context)
    {
        _context = context;
    }

    public async Task<Result<List<LookupResponse>>> Handle(GetAllLookupRequest request, CancellationToken cancellationToken)
    {
        var result = await _context.Lookups.AsNoTracking()
            .Include(x=>x.LookupTypeNavigation)
        .WhereIf(request.Type != "" && request.Type != null, a => a.LookupTypeNavigation.Name == request.Type)
         //.Where(a => a.IsActive == request.IsActive)
         .OrderBy(a => a.Name)
        .ToListAsync(cancellationToken);
        return result.Adapt<List<LookupResponse>>();

    }
}
