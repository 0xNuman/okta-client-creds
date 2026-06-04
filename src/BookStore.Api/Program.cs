using BookStore.Api.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var okta = builder.Configuration.GetSection("Okta");
var authority = $"https://{okta["Domain"]}/oauth2/{okta["AuthorizationServerId"]}";
var audience = okta["Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false; // Keep JWT claim names as-is (scp, sub, etc.)
        options.Authority = authority;
        options.Audience = audience;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            NameClaimType = "name",
        };
    });

builder.Services.AddSingleton<IAuthorizationHandler, ScopeHandler>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("books:read", policy =>
        policy.Requirements.Add(new ScopeRequirement("books:read")))
    .AddPolicy("books:write", policy =>
        policy.Requirements.Add(new ScopeRequirement("books:write")));

builder.Services.AddControllers();

builder.Services.AddCors(opts =>
    opts.AddPolicy("SpaPolicy", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

var app = builder.Build();

app.UseCors("SpaPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();
