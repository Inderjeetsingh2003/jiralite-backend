export const responseHandler = (
  ctx,
  successs,
  status,
  message,
  data = null,
  error = null
) => {
  ctx.status = status;
  ctx.body = {
    successs,
    message,
    data,
    error,
  };
};
