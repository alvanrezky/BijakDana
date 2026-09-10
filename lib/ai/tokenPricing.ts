export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: "t5k", tokens: 5000, price: 5000 },
  { id: "t10k", tokens: 10000, price: 8000 },
  { id: "t25k", tokens: 25000, price: 12000 },
  { id: "t50k", tokens: 50000, price: 20000 },
  { id: "t75k", tokens: 75000, price: 27500 },
  { id: "t100k", tokens: 100000, price: 35000 },
  { id: "t125k", tokens: 125000, price: 42500 },
  { id: "t150k", tokens: 150000, price: 50000 },
  { id: "t200k", tokens: 200000, price: 62000 },
  { id: "t250k", tokens: 250000, price: 75000 },
];