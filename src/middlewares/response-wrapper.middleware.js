function isAlreadyWrapped(payload) {
  return payload && typeof payload === 'object' && ('success' in payload) && ('data' in payload || 'message' in payload);
}

module.exports = function responseWrapper(req, res, next) {
  const oldJson = res.json.bind(res);

  res.json = (payload) => {
    if (isAlreadyWrapped(payload)) return oldJson(payload);

    const body = {
      success: true,
      data: payload,
    };

    if (res.locals && res.locals.meta) {
      body.meta = res.locals.meta;
    }

    return oldJson(body);
  };

  next();
};
