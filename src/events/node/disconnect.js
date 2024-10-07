module.exports = async (client, node, reason) => {
  client.logger.warn(`Node ${node.id} disconnected, Reason: ${JSON.stringify(reason)}`);
};
