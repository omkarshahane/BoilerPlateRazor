using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Features.Common.Responses;

public record PaginatedList<T>
{
    public int CurrentPage { get; init; }
    public int TotalPages { get; init; }
    public int TotalItems { get; init; }

    public List<T> Result { get; init; } = new List<T>();

    public PaginatedList(List<T> items, int count, int currentPage, int pageSize)
    {
        CurrentPage = currentPage;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalItems = count;
        Result.AddRange(items);
    }

    public PaginatedList()
    {

    }
}

public static class PaginatedListHelper
{

    public const int DefaultPageSize = 15;
    public const int DefaultCurrentPage = 1;

    public static async Task<PaginatedList<TDestination>> ToPaginatedListAsync<TSource, TDestination>(this IQueryable<TSource> source, int currentPage, int pageSize, bool paging)
    {
        currentPage = currentPage > 0 ? currentPage : DefaultCurrentPage;
        pageSize = pageSize > 0 ? pageSize : DefaultPageSize;
        var count = await source.CountAsync();
        if (paging)
        {
            var items = await source.Skip((currentPage - 1) * pageSize).Take(pageSize).ToListAsync();
            var data = TypeAdapter.Adapt<List<TDestination>>(items);
            return new PaginatedList<TDestination>(data, count, currentPage, pageSize);
        }
        else
        {
            var data = TypeAdapter.Adapt<List<TDestination>>(source);
            return new PaginatedList<TDestination>(data, count, currentPage, pageSize);
        }
    }

    public static async Task<PaginatedList<TDestination>> ToPaginatedListAsync<TSource, TDestination>(this IEnumerable<TSource> source, int currentPage, int pageSize, bool paging)
    {
        currentPage = currentPage > 0 ? currentPage : DefaultCurrentPage;
        pageSize = pageSize > 0 ? pageSize : DefaultPageSize;
        var count = source.Count();
        if (paging)
        {
            var items = source.Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();
            var data = TypeAdapter.Adapt<List<TDestination>>(items);
            return new PaginatedList<TDestination>(data, count, currentPage, pageSize);
        }
        else
        {
            var data = TypeAdapter.Adapt<List<TDestination>>(source);
            return new PaginatedList<TDestination>(data, count, currentPage, pageSize);
        }
    }
}