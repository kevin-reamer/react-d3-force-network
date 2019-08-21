import { Datastore } from "@google-cloud/datastore";

export const upload = async (data: any, datastore: Datastore) => {
  // The kind for the new entity
  const kind = "TerrorNetwork";

  // The Cloud Datastore key for the new entity
  const taskKey = datastore.key([kind, data.i]);

  // Prepares the new entity
  const task = {
    key: taskKey,
    data,
  };

  // Saves the entity
  await datastore.save(task);
  console.log(`Saved ${data.i}`);
};

export const getNodesBySearch = async (search: string, filters: any, datastore: Datastore) => {
  const queryNodes = datastore.createQuery("TerrorNetwork")
    .filter("l.n", "=", search)
    .limit(1500);

  filters = JSON.parse(filters);

  const [nodes] = await datastore.runQuery(queryNodes);

  return transformNodes(nodes, filters);
};

const transformNodes = (nodes: any, filters: any) => {
  const data: { nodes: any[], links: any[] } = {
    nodes: [],
    links: []
  };

  const nodeTypes = [
    "Biological Agent",
    "Bombing",
    "Business",
    "Chemical Agent",
    "Explosives",
    "Fire or Firebomb",
    "Firearms",
    "Knives & sharp objects",
    "Other",
    "Remote-detonated explosive",
    "Telecommunication",
    "Unknown",
  ];

  const nodeLinkTypes = [
    "Terrorist Group",
    "City"
  ];

  const linkTypes = [
    "perpetrator",
    "target city"
  ];

  const terrorGroups: string[] = [];
  const cities: string[] = [];

  nodes.forEach((node: any) => {
    let noDuplicate = false;
    let skip = false;
    if (filters.from !== undefined && filters.to !== undefined &&
      (new Date(node.d).getTime() < new Date(filters.from).getTime() ||
       new Date(node.d).getTime() > new Date(filters.to).getTime())) {
      skip = true;
    }
    if (filters.fatalities !== undefined && node.fa < filters.fatalities) {
      skip = true;
    }
    if (filters.injuries !== undefined && node.in < filters.injuries) {
      skip = true;
    }
    if (!skip) {
      data.nodes.push({id: node.i, date: node.d, type: nodeTypes[node.t], fa: node.fa, in: node.in});
      if (node.l) {
        node.l.forEach((link: any) => {
          data.links.push({source: node.i, target: link.n, type: linkTypes[link.t], date: node.d, fa: node.fa, in: node.in});

          // check for terror group duplicates
          if (link.t === 0) {
            noDuplicate = !terrorGroups.includes(link.n);
            if (noDuplicate) {
              terrorGroups.push(link.n);
            }
          } else {
            noDuplicate = !cities.includes(link.n);
            if (noDuplicate) {
              cities.push(link.n);
            }
          }

          if (noDuplicate) {
            data.nodes.push({id: link.n, description: link.n, type: nodeLinkTypes[link.t]});
          }
        });
      }
    }

  });

  return data;
};
