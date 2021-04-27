// libs/db/on_memory.js
exports.user_times = new Map();

exports.getUser = (user_id) => {
  return this.user_times.has(user_id)? this.user_times.get(user_id): null;
};

exports.addUser = (user_id, h) => {
  this.user_times.set(user_id, h);
};