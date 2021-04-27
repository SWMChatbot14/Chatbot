// libs/db/on_memory.js
exports.user_times = new Array();
for (var i=0; i<24; i++) this.user_times.push(new Set());

exports.getUser = (t) => {
  return this.user_times[t].size? user_times[t]: null;
};

exports.addUser = (t, user_id) => {
  this.user_times[t].add(user_id);
};