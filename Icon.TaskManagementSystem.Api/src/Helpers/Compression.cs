using System.IO.Compression;
using System.Text;

namespace Icon.TaskManagementSystem.Api.Helpers;

public static class Compression
{
    public static string BrotliCompress(string input, CompressionLevel level = CompressionLevel.Optimal)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        byte[] inputBytes = Encoding.UTF8.GetBytes(input);

        using var output = new MemoryStream();
        using (var brotli = new BrotliStream(output, level))
        {
            brotli.WriteAsync(inputBytes, 0, inputBytes.Length);
        } // Ensures final block is flushed

        return Convert.ToBase64String(output.ToArray());
    }

    public static string BrotliDecompress(string base64Compressed)
    {
        if (string.IsNullOrEmpty(base64Compressed))
            return string.Empty;

        byte[] compressedBytes = Convert.FromBase64String(base64Compressed);

        using var input = new MemoryStream(compressedBytes);
        using var brotli = new BrotliStream(input, CompressionMode.Decompress);
        using var reader = new StreamReader(brotli, Encoding.UTF8);

        return reader.ReadToEnd();
    }
}
