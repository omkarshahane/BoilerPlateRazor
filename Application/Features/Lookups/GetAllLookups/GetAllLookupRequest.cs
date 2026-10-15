using Ardalis.Result;
using Application.Features.Lookups.Responses;
using MediatR;
using System;
using System.Collections.Generic;

namespace Application.Features.Lookups.GetAllLookups;
public class GetAllLookupRequest : IRequest<Result<List<LookupResponse>>>
{
    public string Type { get; set; }
    public Boolean IsActive { get; set; }
}
