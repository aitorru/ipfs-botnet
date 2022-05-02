const delay = (ms: number) => {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
};

export {delay};