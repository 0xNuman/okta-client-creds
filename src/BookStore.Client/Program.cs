using BookStore.Client.Api;
using BookStore.Client.Models;
using Refit;

// ── Configuration ─────────────────────────────────────────────────────────────
var oktaDomain   = Env("OKTA_DOMAIN");
var authServerId = Environment.GetEnvironmentVariable("OKTA_AUTH_SERVER_ID") ?? "default";
var clientId     = Env("OKTA_CLIENT_ID");
var clientSecret = Env("OKTA_CLIENT_SECRET");
var apiBaseUrl   = Environment.GetEnvironmentVariable("API_BASE_URL") ?? "http://localhost:5062";

Console.WriteLine("BookStore API Client — Client Credentials Demo");
Console.WriteLine(new string('─', 50));

// ── Step 1: Acquire token ─────────────────────────────────────────────────────
Console.WriteLine("\n[1] Requesting access token from Okta...");

var tokenClient = new OktaTokenClient(oktaDomain, authServerId);
var token = await tokenClient.GetClientCredentialsTokenAsync(clientId, clientSecret, "books:read books:write");

Console.WriteLine($"    Token acquired. Expires in {token.ExpiresIn}s.");
Console.WriteLine($"    Granted scopes : {token.Scope}");
Console.WriteLine($"    Token preview  : {token.AccessToken[..Math.Min(60, token.AccessToken.Length)]}...");

// ── Step 2: Build typed API client ────────────────────────────────────────────
var httpClient = new HttpClient { BaseAddress = new Uri(apiBaseUrl) };
httpClient.DefaultRequestHeaders.Authorization =
    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.AccessToken);

var api = RestService.For<IBookStoreApi>(httpClient);

// ── Step 3: List all books ────────────────────────────────────────────────────
Console.WriteLine("\n[2] GET /api/books");
PrintBooks(await api.GetAllBooks());

// ── Step 4: Create a book ─────────────────────────────────────────────────────
Console.WriteLine("\n[3] POST /api/books");
var newBook = new CreateBookRequest(
    Title:   "The Clean Coder",
    Author:  "Robert C. Martin",
    Isbn:    "9780137081073",
    Year:    2011,
    Genre:   "Programming",
    Price:   34.99m,
    InStock: true);

var created = await api.CreateBook(newBook);
Console.WriteLine($"    Created: [{created.Id}] {created.Title}");

// ── Step 4b: List to confirm the new book appears ─────────────────────────────
Console.WriteLine("\n[3b] GET /api/books — after create");
PrintBooks(await api.GetAllBooks());

// ── Step 5: Fetch by ID ───────────────────────────────────────────────────────
Console.WriteLine($"\n[4] GET /api/books/{created.Id}");
var fetched = await api.GetBookById(created.Id);
Console.WriteLine($"    {fetched.Title} by {fetched.Author} — ${fetched.Price:F2}");

// ── Step 6: Update ────────────────────────────────────────────────────────────
Console.WriteLine($"\n[5] PUT /api/books/{created.Id}");
var updated = await api.UpdateBook(created.Id, newBook with { InStock = false });
Console.WriteLine($"    InStock is now: {updated.InStock}");

// ── Step 7: Delete ────────────────────────────────────────────────────────────
Console.WriteLine($"\n[6] DELETE /api/books/{created.Id}");
await api.DeleteBook(created.Id);
Console.WriteLine("    Deleted successfully.");

// ── Step 8: Final list ────────────────────────────────────────────────────────
Console.WriteLine("\n[7] GET /api/books — final list");
PrintBooks(await api.GetAllBooks());

Console.WriteLine("\nDemo complete.");

// ── Helpers ───────────────────────────────────────────────────────────────────
static string Env(string name) =>
    Environment.GetEnvironmentVariable(name)
    ?? throw new InvalidOperationException($"Environment variable '{name}' is not set.");

static void PrintBooks(IEnumerable<Book> books)
{
    var list = books.ToList();
    if (list.Count == 0) { Console.WriteLine("    (no books)"); return; }
    Console.WriteLine($"    {"Title",-40} {"Author",-25} {"Price",8}");
    Console.WriteLine($"    {new string('-', 75)}");
    foreach (var b in list)
        Console.WriteLine($"    {b.Title,-40} {b.Author,-25} ${b.Price,7:F2}");
}
