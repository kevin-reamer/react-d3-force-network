import { Datastore } from "@google-cloud/datastore";

export const upload = async (data: any, datastore: Datastore) => {
  // The kind for the new entity
  const kind = "FNTNodes";

  // The Cloud Datastore key for the new entity
  const taskKey = datastore.key([kind]);

  // Prepares the new entity
  const task = {
    key: taskKey,
    data,
  };

  // Saves the entity
  await datastore.save(task);
  console.log(`Saved ${data.id}`);
};
