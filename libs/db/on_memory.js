// libs/db/on_memory.js
exports.user_times = new Array();
for (var i=0; i<24; i++) this.user_times.push(new Set());

exports.getCons = (t) => {
  return this.user_times[t].size? this.user_times[t]: null;
};

exports.addCon = (t, con_id) => {
  this.user_times[t].add(con_id);
};