export const useWarmup = (handler: any) => {
  return async (...args: any[]) => {
    const [event] = args;

    // Warmup check
    if (event?.preWarm) {
      console.log('Warmup event, exiting');
      return;
    }

    return handler(...args);
  };
};
