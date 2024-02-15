//helper function - look up user
function getUserByEmail(email, usersDatabase) {
  for (const userId in usersDatabase) {
    if (usersDatabase[userId].email === email) {
      return usersDatabase[userId];
    }
  }
  return null;
}

module.exports = { getUserByEmail };
