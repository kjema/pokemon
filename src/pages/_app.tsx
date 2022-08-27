import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import * as React from "react";
import { KyInstance } from "ky/distribution/types/ky";
import ky from "ky";

// TYPES

export type NamedAPIResource = {
  /** The name of the referenced resource */
  name: string;
  /** The URL of the referenced resource */
  url: string;
};

export type NamedAPIResourceList = {
  /** The total number of resources available from this API */
  count: number;
  /** The URL for the next page in the list */
  next: string | null;
  /** The URL for the previous page in the list */
  previous: string | null;
  /** A list of named API resources */
  results: NamedAPIResource[];
};

// CLASS

export enum Endpoints {
  Pokemon = "pokemon",
}

class PokemonClient {
  public api: KyInstance;

  constructor() {
    this.api = ky.create({ prefixUrl: "https://pokeapi.co/api/v2" });
  }

  public async listPokemons(
    offset?: number,
    limit?: number,
  ): Promise<NamedAPIResourceList> {
    return new Promise<NamedAPIResourceList>((resolve, reject) => {
      console.log(offset, limit);
      this.api
        .get(`${Endpoints.Pokemon}?offset=${offset || 0}&limit=${limit || 20}`)
        .then((response) => resolve(response.json()))
        .catch((error) => reject(error));
    });
  }
}

export const defaultContext = React.createContext<PokemonClient | undefined>(
  undefined,
);

export const usePokemonClient = () => {
  const pokemonClient = React.useContext(defaultContext);
  if (!pokemonClient) {
    throw new Error(
      "No PokemonClient set, use PokemonClientProvider to set one",
    );
  }

  return pokemonClient;
};

type PokemonClientProviderProps = {
  client: PokemonClient;
  children?: React.ReactNode;
};

export const PokemonClientProvider = ({
  client,
  children,
}: PokemonClientProviderProps): JSX.Element => {
  const Context = defaultContext;

  return <Context.Provider value={client}>{children}</Context.Provider>;
};

function MyApp({ Component, pageProps }: AppProps) {
  const [pokemonClient] = React.useState(() => new PokemonClient());
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <PokemonClientProvider client={pokemonClient}>
        <Component {...pageProps} />
      </PokemonClientProvider>
    </SWRConfig>
  );
}

export default MyApp;