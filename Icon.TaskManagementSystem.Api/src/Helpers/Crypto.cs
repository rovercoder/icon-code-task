using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using static Icon.TaskManagementSystem.Api.Helpers.Converters;

namespace Icon.TaskManagementSystem.Api.Helpers;

public class Crypto
{
    private const string Password = "hrDHqHprCdANGbDyzVFYsEkFj2j7Et6ezEUrx9M";
    private const string InitVector = "Djk2Vfu7kNRrTVBG";
    private const string SaltConst = ">}uJ{e4uf'i7Cx#N";
    private const int KeySize = 128;
    private const int Iterations = 3;

    private static string Encrypt(string textValue, string passPhrase, string saltValue, string initVector, int iterations, int keySize)
    {
        // Convert strings into byte arrays.
        // Let us assume that strings only contain ASCII codes.
        // If strings include Unicode characters, use Unicode, UTF7, or UTF8
        // encoding.
        byte[] initVectorBytes = Encoding.ASCII.GetBytes(initVector);
        byte[] saltValueBytes = Encoding.ASCII.GetBytes(saltValue);

        // Convert our plaintext into a byte array.
        // Let us assume that plaintext contains UTF8-encoded characters.
        byte[] plainTextBytes = Encoding.UTF8.GetBytes(textValue);
        
        // This key will be generated from the specified passphrase and
        // salt value. Password creation can be done in several iterations.
        // Specify the size of the key in bytes (instead of bits).
        byte[] keyBytes = Rfc2898DeriveBytes.Pbkdf2(passPhrase, saltValueBytes, iterations, HashAlgorithmName.SHA256, keySize / 8);

        byte[] cipherTextBytes;

        // Create uninitialized Aes encryption object.
        using (Aes symmetricKey = Aes.Create())
        {
            // It is reasonable to set encryption mode to Cipher Block Chaining
            // (CBC). Use default options for other symmetric key parameters.
            symmetricKey.Mode = CipherMode.CBC;
            // Generate encryptor from the existing key bytes and initialization
            // vector. Key size will be defined based on the number of the key
            // bytes.
            ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes);

            // Define memory stream which will be used to hold encrypted data.
            using MemoryStream memoryStream = new MemoryStream();
            // Define cryptographic stream (always use Write mode for encryption).
            using CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write);
            // Start encrypting.
            cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);

            // Finish encrypting.
            cryptoStream.FlushFinalBlock();
            // Convert our encrypted data from a memory stream into a byte array.
            cipherTextBytes = memoryStream.ToArray();
        } // Close both streams.

        // Convert encrypted data into a base62-encoded string.
        return cipherTextBytes.ToBase62();
    }

    private static string Decrypt(string cipherText, string passPhrase, string saltValue, string initVector, int iterations, int keySize)
    {
        // Convert strings defining encryption key characteristics into byte
        // arrays. Let us assume that strings only contain ASCII codes.
        // If strings include Unicode characters, use Unicode, UTF7, or UTF8
        // encoding.
        byte[] saltValueBytes = Encoding.ASCII.GetBytes(saltValue);
        byte[] initVectorBytes = Encoding.ASCII.GetBytes(initVector);

        // Convert our base62 ciphertext into a decoded byte array.
        byte[] cipherTextBytes = cipherText.FromBase62();

        // This key will be generated from the specified passphrase and
        // salt value. Password creation can be done in several iterations.
        // Specify the size of the key in bytes (instead of bits).
        byte[] keyBytes = Rfc2898DeriveBytes.Pbkdf2(passPhrase, saltValueBytes, iterations, HashAlgorithmName.SHA256, keySize / 8);

        byte[] plainTextBytes;
        int decryptedByteCount;

        // Create uninitialized Aes encryption object.
        using (Aes symmetricKey = Aes.Create())
        {
            // It is reasonable to set encryption mode to Cipher Block Chaining
            // (CBC). Use default options for other symmetric key parameters.
            symmetricKey.Mode = CipherMode.CBC;

            // Generate decryptor from the existing key bytes and initialization
            // vector. Key size will be defined based on the number of the key
            // bytes.
            ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes);

            // Define memory stream which will be used to hold encrypted data.
            using MemoryStream memoryStream = new MemoryStream(cipherTextBytes);
            // Define memory stream which will be used to hold encrypted data.
            using CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read);
            // Since at this point we don't know what the size of decrypted data
            // will be, allocate the buffer long enough to hold ciphertext;
            // plaintext is never longer than ciphertext.
            plainTextBytes = new byte[cipherTextBytes.Length + 1];

            // Start decrypting.
            decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
            // Close both streams.
        }

        // Convert decrypted data into a string.
        // Let us assume that the original plaintext string was UTF8-encoded.
        // Return decrypted string.
        return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
    }

    public static bool TryConvertToBase64(/*Context context, */Enums.CryptoDomain cryptoDomain, string value, out string? result)
    {
        try 
        {
            result = ConvertToBase64(/*context, */cryptoDomain, value);
            return true;
        }
        catch 
        {
            result = null;
            return false;
        }
    }

    public static string ConvertToBase64(/*Context context, */Enums.CryptoDomain cryptoDomain, string value)
    {
        return Encrypt(value, Password, GetSalt(/*context, */cryptoDomain), InitVector, Iterations, KeySize);
    }

    public static bool TryConvertFromBase64(/*Context context, */Enums.CryptoDomain cryptoDomain, string value, out string? result)
    {
        try
        {
            result = ConvertFromBase64(/*context, */cryptoDomain, value);
            return true;
        }
        catch 
        {
            result = null;
            return false;
        }
    }

    public static string ConvertFromBase64(/*Context context, */Enums.CryptoDomain cryptoDomain, string value)
    {
        return Decrypt(value, Password, GetSalt(/*context, */cryptoDomain), InitVector, Iterations, KeySize);
    }

    private static string GetSalt(/*Context context, */Enums.CryptoDomain cryptoDomain)
    {
        string presuffix = (/*(cryptoDomain != Enums.CryptoDomain.SessionID ? context.Session.ID : 0) + */(int)cryptoDomain).ToString();
        return presuffix + SaltConst + presuffix;
    }
}

#region Password Encryption

class Password
{
    // These constants may be changed without breaking existing hashes.
    public const int SALT_BYTES = 24;
    public const int HASH_BYTES = 18;
    public const int PBKDF2_ITERATIONS = 64000;

    // These constants define the encoding and may not be changed.
    public const int HASH_SECTIONS = 5;
    public const int HASH_ALGORITHM_INDEX = 0;
    public const int ITERATION_INDEX = 1;
    public const int HASH_SIZE_INDEX = 2;
    public const int SALT_INDEX = 3;
    public const int PBKDF2_INDEX = 4;

    public static string CreateHash(string password)
    {
        // Generate a random salt
        byte[] salt = new byte[SALT_BYTES];
        try
        {
            using (var csprng = RandomNumberGenerator.Create())
            {
                csprng.GetBytes(salt);
            }
        }
        catch (CryptographicException ex)
        {
            throw new CannotPerformOperationException("Random number generator not available.", ex);
        }
        catch (ArgumentNullException ex)
        {
            throw new CannotPerformOperationException("Invalid argument given to random number generator.", ex);
        }

        byte[] hash = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA512, PBKDF2_ITERATIONS, HASH_BYTES);

        // format: algorithm:iterations:hashSize:salt:hash
        return string.Format("sha512:{0}:{1}:{2}:{3}", PBKDF2_ITERATIONS, hash.Length, Convert.ToBase64String(salt), Convert.ToBase64String(hash));
    }

    public static bool VerifyPassword(string password, string hashSet)
    {
        char[] delimiter = { ':' };
        string[] split = hashSet.Split(delimiter);

        if (split.Length != HASH_SECTIONS)
        {
            throw new InvalidHashException("Fields are missing from the password hash.");
        }

        if (split[HASH_ALGORITHM_INDEX] != "sha512")
        {
            throw new CannotPerformOperationException("Unsupported hash type.");
        }

        int iterations;
        try
        {
            iterations = Int32.Parse(split[ITERATION_INDEX]);
        }
        catch (ArgumentNullException ex)
        {
            throw new CannotPerformOperationException("Invalid argument given to Int32.Parse", ex);
        }
        catch (FormatException ex)
        {
            throw new InvalidHashException("Could not parse the iteration count as an integer.", ex);
        }
        catch (OverflowException ex)
        {
            throw new InvalidHashException("The iteration count is too large to be represented.", ex);
        }

        if (iterations < 1)
        {
            throw new InvalidHashException("Invalid number of iterations. Must be >= 1.");
        }

        byte[] salt;
        try
        {
            salt = Convert.FromBase64String(split[SALT_INDEX]);
        }
        catch (ArgumentNullException ex)
        {
            throw new CannotPerformOperationException("Invalid argument given to Convert.FromBase64String", ex);
        }
        catch (FormatException ex)
        {
            throw new InvalidHashException("Base64 decoding of salt failed.", ex);
        }

        byte[] hash;
        try
        {
            hash = Convert.FromBase64String(split[PBKDF2_INDEX]);
        }
        catch (ArgumentNullException ex)
        {
            throw new CannotPerformOperationException("Invalid argument given to Convert.FromBase64String", ex);
        }
        catch (FormatException ex)
        {
            throw new InvalidHashException("Base64 decoding of pbkdf2 output failed.", ex);
        }

        int storedHashSize;
        try
        {
            storedHashSize = Int32.Parse(split[HASH_SIZE_INDEX]);
        }
        catch (ArgumentNullException ex)
        {
            throw new CannotPerformOperationException("Invalid argument given to Int32.Parse", ex);
        }
        catch (FormatException ex)
        {
            throw new InvalidHashException("Could not parse the hash size as an integer.", ex);
        }
        catch (OverflowException ex)
        {
            throw new InvalidHashException("The hash size is too large to be represented.", ex);
        }

        if (storedHashSize != hash.Length)
        {
            throw new InvalidHashException("Hash length doesn't match stored hash length.");
        }

        byte[] testHash = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA512, iterations, hash.Length);
        return SlowEquals(hash, testHash);
    }

    private static bool SlowEquals(byte[] a, byte[] b)
    {
        uint diff = (uint)a.Length ^ (uint)b.Length;
        for (int i = 0; i < a.Length && i < b.Length; i++)
        {
            diff |= (uint)(a[i] ^ b[i]);
        }
        return diff == 0;
    }

    class InvalidHashException : Exception
    {
        public InvalidHashException() { }
        public InvalidHashException(string message)
            : base(message) { }
        public InvalidHashException(string message, Exception inner)
            : base(message, inner) { }
    }

    class CannotPerformOperationException : Exception
    {
        public CannotPerformOperationException() { }
        public CannotPerformOperationException(string message)
            : base(message) { }
        public CannotPerformOperationException(string message, Exception inner)
            : base(message, inner) { }
    }
}

#endregion
