// libs/db/on_memory.js

/* rejects: the number user clicked 'reject' on alarm */
exports.rejects = new Map();

exports.getRejects = (con_id) => {
  return this.rejects.has(con_id)? this.rejects.get(con_id): null;
};

exports.setRejects = (con_id, r) => {
  this.rejects.set(con_id, r);
};


/* cons: Conversation ids */
exports.cons = new Array();
// initialization
for (var i=0; i<24; i++) this.cons.push(new Set());

exports.getCons = (t) => {
  return this.cons[t].size? this.cons[t]: null;
};

exports.addCon = (t, con_id) => {
  this.cons[t].add(con_id);
};