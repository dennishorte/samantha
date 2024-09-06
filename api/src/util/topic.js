
const Topic = {}
export default Topic


Topic.merge = function(source, into) {
  const messages = [...source.messages, ...into.messages]
  messages.sort((l, r) => l.timestamp - r.timestamp)
  into.messages = messages
}
