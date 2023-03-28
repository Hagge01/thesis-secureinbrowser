import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class HelloWorld implements RequestHandler<String, String> {

    @Override
    public String handleRequest(String input, Context context) {
        String output = "Hello, " + input + "!";
        context.getLogger().log(output);
        return output;
    }

}