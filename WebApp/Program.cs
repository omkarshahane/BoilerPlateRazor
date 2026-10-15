using Application.Services;
using WebApplication.Common;
using Microsoft.AspNetCore.Builder;
using WebApplication.Configurations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Application.Extensions;
using FluentValidation;
using Application;
using Microsoft.AspNetCore.Authorization;
using WebApp.Common;

var builder = Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
// Application layer setup
builder.Services.AddApplicationSetup(builder.Configuration);

// Authn / Authrz
builder.Services.AddAuthSetup(builder.Configuration);

// In Program.cs or Startup.cs
var expiryValue = builder.Configuration.GetValue<int>("PasswordResetExpiry");

builder.Services.Configure<DataProtectionTokenProviderOptions>(options =>
{
    var expiryValue = builder.Configuration.GetValue<int>("PasswordResetExpiry");
    options.TokenLifespan = TimeSpan.FromHours(expiryValue);
});

builder.Services.AddMediatRSetup();
builder.Services.AddScoped<ILookupService, LookupService>();

// Persistence
builder.Services.AddPersistenceSetup(builder.Configuration);

// Middleware
builder.Services.AddScoped<ExceptionHandlerMiddleware>();

builder.Services.AddScoped<AuthorizationHandlerMiddleware>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<UserService>();

builder.Logging.ClearProviders();
// Add serilog
if (builder.Environment.EnvironmentName != "Testing")
{
    builder.Host.UseLoggingSetup(builder.Configuration);
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseMiddleware(typeof(ExceptionHandlerMiddleware));
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseMiddleware(typeof(AuthorizationHandlerMiddleware));
app.UseAuthorization();

app.MapRazorPages();

app.Run();
