function makeUsersArray() {
  return [
    {
      id: 1,
      created_ts: '2029-01-22T16:28:32.615Z',
      firstname: 'Sam',
      lastname: 'Gamgee',
      username: 'sam.gamgee@shire.com',
      password: 'secret',
    },
    {
      id: 2,
      created_ts: '2100-05-22T16:28:32.615Z',
      firstname: 'Peregrin',
      lastname: 'Took',
      username: 'peregrin.took@shire.com',
      password: 'secret',
    }
  ];
}

module.exports = {
  makeUsersArray,
};