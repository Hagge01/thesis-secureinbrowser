

exports.handler = async (event, context) => {
    try {
        const path = event.path; // Convert path to lowercase for case-insensitive comparison
        const functionName = path.substring(path.lastIndexOf('/') + 1); // Extract function name from the path

        if (functionName === 'myfunction') {
            return myfunction(event, context);
        } else if (functionName === 'myfunction2') {
            return myfunction2(event, context);
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Invalid function name" }),
            };
        }
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request" }),
        };
    }
};


const myfunction = async (event, context) => {
    const key1 = event.key1;
    const key2 = event.key2;
    const key3 = event.key3;

    console.log("Key1: ", key1);
    console.log("Key2: ", key2);
    console.log("Key3: ", key3);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Keys successfully accessed in test 2myFunction1" }),
    };
};

const myfunction2 = async (event, context) => {
    const key4 = event.key4;
    const key5 = event.key5;
    const key6 = event.key6;

    console.log("Key4: ", key4);
    console.log("Key5: ", key5);
    console.log("Key6: ", key6);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Keys successfully accessed in myFunction2!" }, key4, key5, key6),
    };
};


