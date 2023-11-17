import { InvocationType, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

interface IPayload {
  functions: string[];
  concurrency: number;
}

// TODO: Specify your AWS Region
const client = new LambdaClient({
  region: process.env.AWS_REGION,
});

export const handler = async (event: IPayload) => {
  console.log(event);
  const { functions, concurrency = 1 } = event || {};

  if (!functions?.length) {
    throw new Error('Function names must not be null or empty');
  }

  await Promise.all(
    functions.map(async (functionName) => {
      return Promise.all(
        Array(concurrency)
          .fill(0)
          .map(async (_, idx) => {
            const cmd = new InvokeCommand({
              FunctionName: functionName,
              Payload: JSON.stringify({ preWarm: true }),
              InvocationType: InvocationType.RequestResponse,
            });

            console.log(`Invoking function ${functionName}: ${idx}`);
            await client.send(cmd);
          }),
      );
    }),
  );
};
// https://github.com/aws-observability/aws-otel-lambda/issues/99
module.exports = { handler }
