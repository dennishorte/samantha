const brain = require('./brain.js')


function Embedder() {}
Embedder.prototype.generate = brain.embed

module.exports = Embedder
