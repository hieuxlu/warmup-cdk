import { App } from "aws-cdk-lib/core";
import { WarmupStack } from "../lib/warmup-stack";

const app = new App();

new WarmupStack(app, "WarmupStack", {
  functions: ["add-your-funtion-name"],
  concurrency: 10,
  env: {
    region: process.env.AWS_REGION,
  },
});
