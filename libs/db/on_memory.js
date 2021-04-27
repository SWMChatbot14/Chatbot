// libs/db/on_memory.js
exports.user_times = new Array(24, new Set());

exports.getUser = (time) => {
  return this.user_times[time].size? user_times[time]: null;
};

exports.addUser = (time, user_id) => {
  this.user_times[time].add(user_id);
};