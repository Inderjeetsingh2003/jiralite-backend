import Bluebird from "bluebird";
const { Promise } = Bluebird;


const validatorAll = (validations) => {
  return async (ctx, next) => {
    const err = await Promise.mapSeries(validations, async (validator) => {
      return await validator(ctx);
    });
 
    const error = err.filter((val) => val !== null);
    if (error.length ) {
      ctx.status = 400;
      ctx.body = { success: 0, error };
      return;
    }
    await next();
  };
};

export { validatorAll };
