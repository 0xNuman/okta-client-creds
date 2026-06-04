using System.Net.Http.Json;
using System.Text.Json;

namespace BookStore.Client.Api;

public class OktaTokenClient(string domain, string authServerId)
{
    private readonly string _tokenUrl = $"https://{domain}/oauth2/{authServerId}/v1/token";

    public async Task<TokenResponse> GetClientCredentialsTokenAsync(
        string clientId,
        string clientSecret,
        string scopes)
    {
        using var http = new HttpClient();

        var response = await http.PostAsync(_tokenUrl, new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["grant_type"]    = "client_credentials",
                ["client_id"]     = clientId,
                ["client_secret"] = clientSecret,
                ["scope"]         = scopes,
            }));

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException(
                $"Okta token endpoint returned {(int)response.StatusCode}: {error}");
        }

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return new TokenResponse(
            AccessToken: json.GetProperty("access_token").GetString()!,
            ExpiresIn:   json.GetProperty("expires_in").GetInt32(),
            Scope:       json.TryGetProperty("scope", out var s) ? s.GetString() ?? "" : "");
    }
}

public record TokenResponse(string AccessToken, int ExpiresIn, string Scope);
