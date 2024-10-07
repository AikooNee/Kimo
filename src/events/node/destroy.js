module.exports = async (client, node) => {
  client.logger.error(`Node "${node.id}" Destroyed!`);
};
