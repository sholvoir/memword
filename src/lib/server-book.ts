import { getJson, getText } from "@sholvoir/generic/http";

const BASE_URL = "https://www.micinfotech.com/vocabulary";

export const book_get = (name: string) => getText(`${BASE_URL}/${name}.txt`);

export const checksum_get = () =>
   getJson<Record<string, { disc: string; checksum: string }>>(
      `${BASE_URL}/checksum.json`,
   );

export const lemmatization_get = () =>
   getText(`${BASE_URL}/lemmatization.yaml`);
