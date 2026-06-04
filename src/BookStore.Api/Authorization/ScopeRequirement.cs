using Microsoft.AspNetCore.Authorization;

namespace BookStore.Api.Authorization;

public class ScopeRequirement(string scope) : IAuthorizationRequirement
{
    public string Scope { get; } = scope;
}

public class ScopeHandler : AuthorizationHandler<ScopeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ScopeRequirement requirement)
    {
        // Okta encodes scopes as a JSON array in the JWT, which .NET expands into
        // multiple individual claims — one claim per scope value.
        // HasClaim checks all claims of the given type, so it handles both
        // the array case (multiple "scp" claims) and the space-separated string case.
        if (context.User.HasClaim("scp", requirement.Scope) ||
            context.User.HasClaim("scope", requirement.Scope))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
