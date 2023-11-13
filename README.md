# Getting Started

This is a sample project for deploying a Lambda Warmup function using CDK.

## Source code structure
| File | Description |
| ---- | ----------- |
| `bin/warmup.ts` | CDK app for Warmup Stack |
| `lib/warmup-stack.ts` | Create a Warmup Lambda function and EventBridge Scheduled Rule for your specific function names and concurrency level. |
| `src/warmup.handler.ts` | Warmup function handler, which invokes specified Lambda function in parallel at configured concurrency level, received from EventBridge events. |
| `src/warmup.middleware.ts` | Use this middleware to exit your function earlier when Lambda event has `prewarm` flag |

## Useful commands
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

