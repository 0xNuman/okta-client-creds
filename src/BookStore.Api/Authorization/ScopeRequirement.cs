using Microsoft.AspNetCore.Authorization;

namespace BookStore.Api.Authorization;

public class ScopeRequirement(string scope) : IAuthorizationRequirement
{
    public string Scope { get; } = scope;
}
