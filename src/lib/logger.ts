const logger = (options: unknown) => {
  return {
    log: () => {
      console.log('gae');
    },
  };
};

export default logger;
