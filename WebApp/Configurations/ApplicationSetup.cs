using Application.MappingConfig;
using Application.Services;
using Infrastructure.Common;
using Infrastructure.Context;
using FastExpressionCompiler;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace WebApplication.Configurations;

public static class ApplicationSetup
{
    public static IServiceCollection AddApplicationSetup(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IContext, AppDbContext>();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppIdentityDbContext>(options => options.UseSqlServer(connectionString!));

        // Identity Setup
        services.TryAddScoped<AppIdentityDbContext>();

        services.AddDefaultIdentity<IdentityUser>(opt =>
        {
            opt.Lockout.AllowedForNewUsers = false;
            opt.Password.RequireUppercase = false;
        })
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<AppIdentityDbContext>()
                .AddDefaultTokenProviders();


        //NewId.SetProcessIdProvider(new CurrentProcessIdProvider());
        ApplyAllMappingConfigFromAssembly();
        TypeAdapterConfig.GlobalSettings.Compiler = exp => exp.CompileFast();

        // register services

        services.TryAddScoped<ICloudUtilities, CloudUtilities>();
        services.TryAddScoped<ICurrentUserService, CurrentUserService>();
        
        services.TryAddScoped<OtpService>();

        var apiKey = configuration.GetSection("SendGridSettings:ApiKey").Value!;

        //services.TryAddScoped<IMailService, SendGridService>();
        services.AddTransient<IMailService>(s => new SendGridService(apiKey, configuration));

        return services;
    }


    private static IEnumerable<Type> GetTypesWithInterface<TInterface>(Assembly asm)
    {
        var it = typeof(TInterface);
        return asm.GetTypes().Where(x => it.IsAssignableFrom(x) && x is { IsInterface: false, IsAbstract: false });
    }


    private static void ApplyAllMappingConfigFromAssembly()
    {
        var mappers = GetTypesWithInterface<IMappingConfig>(typeof(IMappingConfig).Assembly);
        foreach (var mapperType in mappers)
        {
            var instance = (IMappingConfig)Activator.CreateInstance(mapperType)!;
            instance.ApplyConfig();
        }
    }

}