type ServerFunction<TInput, TOutput> = ((input: TInput) => Promise<TOutput>) & {
  inputValidator: (validator: (input: TInput) => TInput) => ServerFunction<TInput, TOutput>;
  handler: (handler: (context: { data: TInput }) => Promise<TOutput> | TOutput) => ServerFunction<TInput, TOutput>;
};

export function createServerFn<TInput = never, TOutput = unknown>(): ServerFunction<TInput, TOutput> {
  let handler: ((context: { data: TInput }) => Promise<TOutput> | TOutput) | undefined;

  const serverFunction = (async (input: TInput) => {
    if (!handler) throw new Error("GitHub Pages server function has no handler.");
    return handler({ data: input });
  }) as ServerFunction<TInput, TOutput>;

  serverFunction.inputValidator = () => serverFunction;
  serverFunction.handler = (nextHandler) => {
    handler = nextHandler;
    return serverFunction;
  };

  return serverFunction;
}

export function useServerFn<TInput, TOutput>(
  serverFunction: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<TOutput> {
  return serverFunction;
}
