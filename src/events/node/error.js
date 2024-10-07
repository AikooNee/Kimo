module.exports = async (client, node, error) => {
  client.logger.error(`Node ${node.id} encountered an error: ${error}`);
};
