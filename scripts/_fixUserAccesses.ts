import { UserCollection } from "../db";

export const _fixUserAccesses = async () => {
  let users = await UserCollection.find({}).toArray();
  let i = 0;

  for (const user of users) {
    console.log(i++, users.length);
    let newAccesses = (user.accesses ?? []).map((access) =>
      access.replace("/next2", "")
    );
    await UserCollection.updateOne(
      { username: user.username },
      {
        $set: {
          accesses: newAccesses,
        },
      }
    );
  }

  return "ok";
};

_fixUserAccesses();
