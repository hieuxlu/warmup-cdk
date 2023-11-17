import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as events from 'aws-cdk-lib/aws-events'
import { Schedule } from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import path from 'path'

export interface IWarmupStackProps extends StackProps {
  functions: string[]
  concurrency?: number
}

export interface IWarmupDetail {
  functions: string[]
  concurrency?: number
}

export class WarmupStack extends Stack {
  warmupFuntion: lambda.IFunction

  constructor(scope: Construct, id: string, props: IWarmupStackProps) {
    super(scope, id, props)
    const handler = new NodejsFunction(this, 'warmup-function', {
      entry: path.join(__dirname, '../src/warmup.handler.ts'),
      functionName: 'warmup-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: Duration.seconds(60),
      memorySize: 512,
      tracing: lambda.Tracing.ACTIVE,
      adotInstrumentation: {
        execWrapper: lambda.AdotLambdaExecWrapper.REGULAR_HANDLER,
        layerVersion: lambda.AdotLayerVersion.fromJavaScriptSdkLayerVersion(
          lambda.AdotLambdaLayerJavaScriptSdkVersion.LATEST,
        ),
      },
      bundling: {
        minify: false,
        format: OutputFormat.CJS,
        externalModules: [],
        define: {
          'process.env.AWS_REGION': `"${process.env.AWS_REGION}"`
        }
      },
    })

    new LogGroup(this, 'WarmupFunctionLogGroup', {
      logGroupName: '/aws/lambda/' + handler.functionName,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    this.warmupFuntion = handler
    const names = props.functions

    new events.Rule(this, 'WarmupScheduledEvent', {
      // It is also possible to use Schedule.rate({minutes: 5}), 
      // but using cron is more preditable in the AWS console
      schedule: Schedule.cron({
        minute: '1/5',
      }),
      targets: [
        new targets.LambdaFunction(handler, {
          event: events.RuleTargetInput.fromObject({
            functions: names,
            concurrency: props.concurrency,
          }),
        }),
      ],
    })

    props.functions.map((func) => {
      const lambdaFunc = lambda.Function.fromFunctionName(this, func, func)
      lambdaFunc.grantInvoke(handler)
    })
  }
}
