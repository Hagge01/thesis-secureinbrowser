

def lambda_handler(event, context):
    try:
        import com.example
    except ImportError as e:
        return {
            "errorMessage": str(e),
            "errorType": "Runtime.ImportModuleError",
            "requestId": context.aws_request_id,
            "stackTrace": []
        }

    return "Hello from Lambda!"