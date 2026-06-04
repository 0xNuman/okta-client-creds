namespace BookStore.Api.Models;

public class Book
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public required string Author { get; set; }
    public required string Isbn { get; set; }
    public int Year { get; set; }
    public required string Genre { get; set; }
    public decimal Price { get; set; }
    public bool InStock { get; set; } = true;
}
