namespace Icon.TaskManagementSystem.Api.Helpers;

public class Result
{
    public bool IsSuccess { get; }
    public string? ErrorMessage { get; }
    protected Result(bool isSuccess, string? errorMessage = null)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
    }
    public static Result Success() => new Result(true);
    public static Result Failure(string errorMessage) => new Result(false, errorMessage);
}

public class Result<TValue> : Result
{
    private readonly TValue? _value;
    public TValue Value => _value ?? throw new InvalidOperationException("No value present");
    protected Result(TValue? value, bool isSuccess, string? errorMessage = null)
        : base(isSuccess, errorMessage)
    {
        _value = value;
    }
    public static Result<TValue> Success(TValue value) => new Result<TValue>(value, true);
    public static new Result<TValue> Failure(string errorMessage) => new Result<TValue>(default, false, errorMessage);
}
